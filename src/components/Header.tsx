import kidslabLogo from "../assets/kidslab-logo.png";
import type { Theme } from "../hooks/useTheme";
import { MoonIcon, SunIcon } from "./icons";

interface HeaderProps {
  /** Board name next to the logo (`boardTitle` in `hackday.json`). */
  title: string;
  now: Date;
  /** True when the clock runs from the `?date=&time=` debug params. */
  testTime: boolean;
  theme: Theme;
  onToggleTheme: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Top bar: logo with the board name, a large live clock, and the light/dark toggle. */
export function Header({ title, now, testTime, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">
        <img className="logo__img" src={kidslabLogo} alt="KidsLab" />
        <span className="logo__title">{title}</span>
      </div>

      <span className="header__spacer" />

      {testTime && (
        <span className="test-badge" title="Uhrzeit aus den URL-Parametern ?date= / ?time=">
          Testzeit
        </span>
      )}

      <time className="clock" dateTime={now.toISOString()} aria-label="Aktuelle Uhrzeit">
        {pad(now.getHours())}:{pad(now.getMinutes())}
        <span className="clock__sec">:{pad(now.getSeconds())}</span>
      </time>

      <button
        type="button"
        className="icon-btn"
        onClick={onToggleTheme}
        aria-label="Farbschema wechseln"
        title="Farbschema wechseln"
      >
        {theme === "dark" ? <SunIcon size={22} /> : <MoonIcon size={22} />}
      </button>
    </header>
  );
}
