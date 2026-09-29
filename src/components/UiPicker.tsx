import type { UiVariant } from "../lib/uiChoice";
import "./picker.css";

interface UiPickerProps {
  /** Board name, e.g. "MYS Hackday". */
  title: string;
  onChoose: (ui: UiVariant) => void;
}

const OPTIONS: readonly { ui: UiVariant; label: string; hint: string }[] = [
  { ui: "modern", label: "Modern", hint: "Klar und ruhig, im KidsLab-Look." },
  { ui: "pixel", label: "Pixel", hint: "Retro im Pixel-Art-Stil." },
];

/** First-visit choice between the two board UIs; it holds for the current event. */
export function UiPicker({ title, onChoose }: UiPickerProps) {
  return (
    <main className="picker">
      <h1 className="picker__title">{title}</h1>
      <p className="picker__lead">Wie soll das Board aussehen?</p>
      <div className="picker__options">
        {OPTIONS.map(({ ui, label, hint }) => (
          <button
            key={ui}
            type="button"
            className={`picker__option picker__option--${ui}`}
            onClick={() => onChoose(ui)}
          >
            <span className="picker__label">{label}</span>
            <span className="picker__hint">{hint}</span>
          </button>
        ))}
      </div>
      <p className="picker__note">Die Auswahl gilt bis zum Ende dieses Hackdays.</p>
    </main>
  );
}
