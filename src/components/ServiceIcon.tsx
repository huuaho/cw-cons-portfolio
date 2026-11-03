// The icons the client can choose for a service in Pages CMS (keep in step with .pages.yml).
import { Bath, Building2, Drill, Hammer, HardHat, House, PaintRoller, Ruler, Shovel, Wrench } from "lucide-react";
import type { ServiceIconName } from "@/lib/content";

const ICONS = {
  house: House,
  ruler: Ruler,
  bath: Bath,
  "hard-hat": HardHat,
  shovel: Shovel,
  building: Building2,
  hammer: Hammer,
  "paint-roller": PaintRoller,
  wrench: Wrench,
  drill: Drill,
} satisfies Record<ServiceIconName, unknown>;

export default function ServiceIcon({ name }: { name: ServiceIconName }) {
  const Icon = ICONS[name] ?? Hammer;
  return (
    <span className="service-icon" aria-hidden="true">
      <Icon strokeWidth={1.5} />
    </span>
  );
}
