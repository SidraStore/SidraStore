import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import Particles from "./Particles";

// The bottles (with their names) are part of the photo itself.
export default function OudhCollection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {/* mobile: photo on top, cropped to the bottle row */}
      <SmartImage
        src="/images/sidraouthcollection.png"
        alt="Sidra Oudh collection"
        tone="from-ink via-[#2a1a0e] to-[#4a2f18]"
        imgClassName="h-full w-full object-cover object-[82%_center]"
        className="h-[210px] w-full sm:h-[290px] lg:hidden"
      >
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />
      </SmartImage>

      {/* desktop: photo is the section background */}
      <SmartImage
        src="/images/sidraouthcollection.png"
        tone="from-ink via-[#2a1a0e] to-[#4a2f18]"
        imgClassName="h-full w-full animate-kenburns object-cover object-center"
        className="absolute inset-0 -z-20 hidden lg:block"
      />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-ink/75 via-transparent to-transparent lg:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-24 bg-gradient-to-t from-ink/50 to-transparent lg:block" />
      <Particles />

      <div className="container-site flex items-center pb-14 pt-6 lg:h-[33.5vw] lg:max-h-[560px] lg:min-h-[440px] lg:py-0">
        <Reveal from="left" className="max-w-[420px]">
          <h2 className="font-serif text-5xl font-semibold leading-[1.1] lg:text-[clamp(40px,3.9vw,56px)]">
            Sidra Oudh
            <br />
            Collection
          </h2>
          <p className="mt-5 text-lg font-semibold text-gold-light">
            Rare. Refined. Long Lasting.
          </p>
          <p className="mt-4 max-w-[360px] text-base leading-relaxed text-stone-300">
            Experience the richness of premium oudh fragrances, inspired by
            timeless traditions.
          </p>
          <a href="#" className="btn-gold mt-9">
            Explore Oudh
          </a>
        </Reveal>
      </div>
    </section>
  );
}
