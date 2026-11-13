import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageExtensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError && userError.name !== "AuthSessionMissingError") {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (!process.env.IMAGEKIT_PRIVATE_KEY) return NextResponse.json({ error: "Return image uploads are not configured." }, { status: 500 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "Select an image to upload." }, { status: 400 });
    if (!allowedImageTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
    if (file.size > maxImageSize) return NextResponse.json({ error: "Return images must be 5 MB or smaller." }, { status: 400 });

    const originalName = file.name || "return-evidence";
    const extension = imageExtensions[file.type];
    const digest = createHash("sha1").update(`${user.id}:${originalName}:${Date.now()}`).digest("hex").slice(0, 10);
    const baseName = originalName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "return-evidence";
    const fileName = `${baseName}-${digest}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([fileBuffer], { type: file.type }), fileName);
    uploadFormData.append("fileName", fileName);
    uploadFormData.append("folder", `/sidra-store/returns/${user.id}`);
    uploadFormData.append("useUniqueFileName", "false");
    uploadFormData.append("overwriteFile", "false");
    uploadFormData.append("tags", "sidra-store,return-evidence");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}` },
      body: uploadFormData,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(`Image upload failed (${response.status}).`);
    return NextResponse.json({ url: payload.url });
  } catch (error) {
    console.error("[account/returns/upload] Return image upload failed", error);
    return NextResponse.json({ error: error.message || "Unable to upload the return image." }, { status: 500 });
  }
}
