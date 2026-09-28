import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import App from "./App";
import { NowPanel } from "./components/NowPanel";
import { buildTimeline, parseTime } from "./lib/schedule";
import type { AgendaItem } from "./types";

// A fixed moment inside "Phase 1 · Prototyp bauen" (10:30–12:30), so the live
// clock, current item and next item are all deterministic.
const NOON_ISH = new Date(2026, 8, 28, 10, 45, 0);

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOON_ISH);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show the current time in the header", () => {
    render(<App />);
    const clock = screen.getByLabelText("Aktuelle Uhrzeit");
    expect(clock).toHaveTextContent("10:45");
  });

  it("should highlight the item running right now", () => {
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText(/Jetzt läuft/i)).toBeInTheDocument();
    expect(within(panel).getByText("Phase 1 · Prototyp bauen")).toBeInTheDocument();
  });

  it("should preview the next item", () => {
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText(/Als Nächstes/i)).toBeInTheDocument();
    expect(within(panel).getByText("Mittagessen")).toBeInTheDocument();
  });

  it("should list every scheduled item in the timeline", () => {
    render(<App />);
    for (const title of ["Ankommen & Begrüßung", "Mittagessen", "Abschlusspräsentationen"]) {
      expect(screen.getAllByText(title).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should mark the running timeline row as the current step", () => {
    render(<App />);
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Phase 1 · Prototyp bauen");
  });

  it("should count finished items in the timeline heading", () => {
    render(<App />);
    expect(screen.getByText("3 von 9 erledigt")).toBeInTheDocument();
  });

  it("should expose the remaining time as a progressbar", () => {
    render(<App />);
    const ring = screen.getByRole("progressbar", { name: "Verbleibende Zeit" });
    // 15 of 120 min elapsed → 13 %.
    expect(ring).toHaveAttribute("aria-valuenow", "13");
  });

  it("should switch to Endspurt in the last five minutes", () => {
    vi.setSystemTime(new Date(2026, 8, 28, 12, 26, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText("Endspurt")).toBeInTheDocument();
    expect(within(panel).queryByText(/Jetzt läuft/i)).not.toBeInTheDocument();
  });

  it("should celebrate once the day is over, without a progressbar", () => {
    vi.setSystemTime(new Date(2026, 8, 28, 17, 30, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText("Geschafft!")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("NowPanel", () => {
  const gapSchedule: AgendaItem[] = [
    { id: "a", start: "10:00", end: "11:00", title: "Phase 1", kind: "phase" },
    { id: "b", start: "11:30", end: "12:00", title: "Präsentation", kind: "talk" },
  ];

  it("should announce the next item during a gap", () => {
    const now = parseTime("11:15") * 60;
    render(<NowPanel timeline={buildTimeline(gapSchedule, now)} nowSeconds={now} />);
    expect(screen.getByText("Kurze Pause")).toBeInTheDocument();
    expect(screen.getByText("Weiter geht’s mit")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Präsentation");
  });
});
