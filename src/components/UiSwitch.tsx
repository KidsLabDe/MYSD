import type { UiVariant } from "../lib/uiChoice";
import { ModernIcon, PixelIcon } from "./icons";

interface UiSwitchProps {
  /** The UI shown right now; the button switches to the other one. */
  ui: UiVariant;
  onToggle: () => void;
}

/** Icon button that flips between the Modern and Pixel UI, like the theme toggle. */
export function UiSwitch({ ui, onToggle }: UiSwitchProps) {
  const label = ui === "pixel" ? "Zur Modern-Ansicht wechseln" : "Zur Pixel-Ansicht wechseln";
  return (
    <button type="button" className="icon-btn" onClick={onToggle} aria-label={label} title={label}>
      {ui === "pixel" ? <ModernIcon size={22} /> : <PixelIcon size={22} />}
    </button>
  );
}
