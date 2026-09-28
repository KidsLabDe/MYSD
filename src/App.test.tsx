import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import App from "./App";
import { NowPanel } from "./components/NowPanel";
import { buildTimeline, parseTime } from "./lib/schedule";
import type { AgendaItem } from "./types";

// Day 1 (Mon 28 Sep 2026), inside "Ideenfindung (2/2)" (10:15–11:15), so the
// live clock, current item and next item are all deterministic.
const DAY1_MORNING = new Date(2026, 8, 28, 10, 45, 0);

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(DAY1_MORNING);
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
    expect(within(panel).getByText("Ideenfindung (2/2)")).toBeInTheDocument();
  });

  it("should preview the next item", () => {
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText(/Als Nächstes/i)).toBeInTheDocument();
    expect(within(panel).getByText("Teamfindung")).toBeInTheDocument();
  });

  it("should list every item of today's plan in the timeline", () => {
    render(<App />);
    for (const title of ["Begrüßung & Einführung", "Mittagspause", "Zwischenpräsentation"]) {
      expect(screen.getAllByText(title).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should mark the running timeline row as the current step", () => {
    render(<App />);
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Ideenfindung (2/2)");
  });

  it("should count finished items in the timeline heading", () => {
    render(<App />);
    expect(screen.getByText("5 von 10 erledigt")).toBeInTheDocument();
  });

  it("should say which event day it is", () => {
    render(<App />);
    expect(screen.getByText("Tag 1 von 3")).toBeInTheDocument();
  });

  it("should show the next day's plan on the next day", () => {
    vi.setSystemTime(new Date(2026, 8, 29, 9, 0, 0));
    render(<App />);
    expect(screen.getByText("Tag 2 von 3")).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Arbeitsphase");
  });

  it("should expose the remaining time as a progressbar", () => {
    render(<App />);
    const ring = screen.getByRole("progressbar", { name: "Verbleibende Zeit" });
    // 30 of 60 min elapsed → 50 %.
    expect(ring).toHaveAttribute("aria-valuenow", "50");
  });

  it("should switch to Endspurt in the last five minutes", () => {
    vi.setSystemTime(new Date(2026, 8, 28, 11, 12, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText("Endspurt")).toBeInTheDocument();
    expect(within(panel).queryByText(/Jetzt läuft/i)).not.toBeInTheDocument();
  });

  it("should celebrate the end of a day and announce tomorrow, without a progressbar", () => {
    vi.setSystemTime(new Date(2026, 8, 28, 17, 30, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText("Geschafft!")).toBeInTheDocument();
    expect(within(panel).getByText("Morgen geht’s um 08:00 weiter.")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("should say goodbye after the last day", () => {
    vi.setSystemTime(new Date(2026, 8, 30, 15, 0, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText(/Der Hackday ist zu Ende/)).toBeInTheDocument();
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
