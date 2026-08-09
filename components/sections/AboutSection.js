import Image from "next/image";
import { publications } from "@/data/publications";

/* Shared by the classic page and the game's About panel — one source. */
export default function AboutSection() {
  return (
    <div className="flex flex-col gap-10 md:flex-row md:items-start">
      <div className="relative w-40 shrink-0 overflow-hidden rounded-[3px] border border-ink/25 bg-cream sm:w-48">
        <Image
          src="/profile.webp"
          alt="Portrait of Rohith Varma Vegesna"
          width={192}
          height={192}
        />
      </div>
      <div className="max-w-2xl space-y-4 leading-relaxed text-ink">
        <p>
          I lead engineering on 7-Eleven&apos;s DEX/FuelControl platform:
          secure, IoT-driven fuel-station automation covering EMV payment
          processing at the dispenser and edge-to-cloud connectivity across
          major fuel retail brands. My team owns the path a fuel transaction
          takes from pump hardware to AWS — and I own the delivery and
          architecture that keep it running.
        </p>
        <p>
          Away from the forecourt I research and publish —{" "}
          {publications.length} peer-reviewed works on federated learning, LLM
          and edge deployment, and cloud-native architecture — founded
          SevenlyTravel, a travel-booking platform, and build hardware:
          PXE-boot fleet imaging rigs, custom USB-HID devices, and an
          extensive home lab.
        </p>
      </div>
    </div>
  );
}
