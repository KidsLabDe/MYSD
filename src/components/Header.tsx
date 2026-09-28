import type { Theme } from "../hooks/useTheme";
import { BRAND } from "../lib/brand";
import { MoonIcon, SunIcon } from "./icons";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

/** Sticky top bar with the KidsLab-styled logo and the light/dark toggle. */
export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="logo" href="/" aria-label="MYS Dashboard Startseite">
          <span className="logo__mark">K</span>
          <span className="logo__text">
            <span className="logo__title">
              MYS <span>Dashboard</span>
            </span>
            <span className="logo__sub">powered by {BRAND.name}</span>
          </span>
        </a>

        <span className="header__spacer" />

        <span className="header__badge">Make Your School · Hackdays 2026</span>

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
          title={theme === "dark" ? "Helles Design" : "Dunkles Design"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
