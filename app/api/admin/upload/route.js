import { createHash } from "node:crypto";
import { isAuthorizedAdminRequest } from "@/lib/adminCatalog";

const imageKitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;

export const runtime = "nodejs";

export async function POST(request) {
  if (!isAuthorizedAdminRequest(request)) {
    return new Response(JSON.stringify({ error: "Administrator authentication is required." }), { status: 401 });
  }
  if (!imageKitPrivateKey) {
    return new Response(JSON.stringify({ error: "IMAGEKIT_PRIVATE_KEY not configured" }), { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "/sidra-store/products";

    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only image files can be uploaded." }), { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Images must be 10 MB or smaller." }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const originalName = file.name || "upload";
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const digest = createHash("sha1").update(originalName + Date.now()).digest("hex").slice(0, 8);
    const baseName = originalName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const fileName = `${baseName}-${digest}.${extension}`;

    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([fileBuffer]), fileName);
    uploadFormData.append("fileName", fileName);
    uploadFormData.append("folder", folder);
    uploadFormData.append("useUniqueFileName", "false");
    uploadFormData.append("overwriteFile", "true");
    uploadFormData.append("tags", "sidra-store,admin-upload");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${imageKitPrivateKey}:`).toString("base64")}` },
      body: uploadFormData,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(`ImageKit upload failed (${response.status}): ${JSON.stringify(payload)}`);
    }

    return new Response(JSON.stringify({ url: payload.url, fileName: payload.name }), { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message || "Upload failed" }), { status: 500 });
  }
}
