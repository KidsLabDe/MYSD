import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import rawData from "./data/hackday.json";
import { NowPanel } from "./components/NowPanel";
import { buildTimeline, parseTime } from "./lib/schedule";
import type { UiVariant } from "./lib/uiChoice";
import { makeChoice } from "./lib/uiChoice";
import type { AgendaItem, HackdayData } from "./types";

// Day 1 (Mon 28 Sep 2026), inside "Ideenfindung (2/2)" (10:15–11:15), so the
// live clock, current item and next item are all deterministic.
const DAY1_MORNING = new Date(2026, 8, 28, 10, 45, 0);
const { days } = rawData as HackdayData;

/** Stores a UI choice as if picked on `at`, so the board skips the picker. */
function storeChoice(ui: UiVariant, at: Date = DAY1_MORNING) {
  window.localStorage.setItem("mys-ui", JSON.stringify(makeChoice(ui, days, at)));
}

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(DAY1_MORNING);
    storeChoice("modern");
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
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
    vi.setSystemTime(new Date(2026, 8, 29, 10, 30, 0));
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
    expect(within(panel).getByText("Morgen geht’s um 10:00 weiter.")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("should not flag real time as a test time", () => {
    render(<App />);
    expect(screen.queryByText("Testzeit")).not.toBeInTheDocument();
  });

  it("should run from the date and time given in the URL, flagged as a test time", () => {
    window.history.pushState({}, "", "/?date=2026-09-29&time=14:50");
    try {
      render(<App />);
      expect(screen.getByLabelText("Aktuelle Uhrzeit")).toHaveTextContent("14:50");
      expect(screen.getByText("Testzeit")).toBeInTheDocument();
      expect(screen.getByText("Tag 2 von 3")).toBeInTheDocument();
    } finally {
      window.history.pushState({}, "", "/");
    }
  });

  it("should start the next day fresh in the morning instead of showing Geschafft", () => {
    window.history.pushState({}, "", "/?date=2026-09-29&time=7:00");
    try {
      render(<App />);
      const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
      expect(within(panel).getByText("Gleich geht’s los")).toBeInTheDocument();
      expect(within(panel).getByRole("heading", { level: 1 })).toHaveTextContent("Arbeitsphase");
      expect(within(panel).queryByText("Geschafft!")).not.toBeInTheDocument();
      expect(screen.getByText("0 von 4 erledigt")).toBeInTheDocument();
    } finally {
      window.history.pushState({}, "", "/");
    }
  });

  it("should show the important messages in the ticker", () => {
    render(<App />);
    const ticker = screen.getByRole("complementary", { name: "Hinweise" });
    // Role queries skip the aria-hidden marquee, so each message is read once.
    const items = within(ticker).getAllByRole("listitem");
    const messages = (rawData as HackdayData).messages ?? [];
    expect(items.map((item) => item.textContent)).toEqual(messages);
  });

  it("should not show the pixel mouse when the board loads mid-phase", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".pixel-cursor")).toBeNull();
  });

  it("should send the pixel mouse to the next item so it clicks right at the change", () => {
    vi.setSystemTime(new Date(2026, 8, 28, 11, 14, 57));
    const { container } = render(<App />);
    expect(container.querySelector(".pixel-cursor")).toBeNull();

    // Two seconds before 11:15 the mouse is on its way; Teamfindung hasn't started yet.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelector(".pixel-cursor")).not.toBeNull();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Ideenfindung (2/2)");

    // The click lands at 11:15:00 on the dot, together with the switch.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Teamfindung");

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(container.querySelector(".pixel-cursor")).toBeNull();
  });

  it("should jump to the next phase on a presenter click, with the mouse clicking it", () => {
    const { container } = render(<App />);
    fireEvent.keyDown(window, { key: "PageDown" });
    expect(container.querySelector(".pixel-cursor")).not.toBeNull();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Ideenfindung (2/2)");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Teamfindung");
    // Only the switch moved: Teamfindung starts now but still ends as planned.
    expect(within(current).getByText("10:45")).toBeInTheDocument();
    expect(screen.getByText("Maximal 4 Teilnehmerinnen pro Gruppe.")).toBeInTheDocument();
  });

  it("should go back to the previous phase on a presenter back click", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Ideenfindung (2/2)");
    // Back to the plan: it runs until 11:15 again (29:54 left, rounded up).
    expect(current).toHaveTextContent("noch 30 Min");
  });

  it("should say goodbye after the last day", () => {
    vi.setSystemTime(new Date(2026, 8, 30, 19, 30, 0));
    render(<App />);
    const panel = screen.getByRole("region", { name: /Aktueller Programmpunkt/i });
    expect(within(panel).getByText(/Der Hackday ist zu Ende/)).toBeInTheDocument();
  });
});

describe("UI choice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(DAY1_MORNING);
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("should ask for a UI on the first visit", () => {
    render(<App />);
    expect(screen.getByText("Wie soll das Board aussehen?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Modern/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pixel/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("Aktuelle Uhrzeit")).not.toBeInTheDocument();
  });

  it("should show the Modern board once Modern is picked, and keep it on reload", () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Modern/ }));
    expect(screen.getByRole("region", { name: /Aktueller Programmpunkt/i })).toBeInTheDocument();

    unmount();
    render(<App />);
    expect(screen.queryByText("Wie soll das Board aussehen?")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Aktueller Programmpunkt/i })).toBeInTheDocument();
  });

  it("should show the Pixel board once Pixel is picked", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Pixel/ }));
    expect(screen.queryByText("Wie soll das Board aussehen?")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Aktueller Programmpunkt/i })).not.toBeInTheDocument();
    expect(screen.getByText("Ideenfindung (2/2)")).toBeInTheDocument();
  });

  it("should ask again once the event the choice was made for is over", () => {
    storeChoice("pixel");
    vi.setSystemTime(new Date(2026, 9, 1, 8, 0, 0));
    render(<App />);
    expect(screen.getByText("Wie soll das Board aussehen?")).toBeInTheDocument();
  });

  it("should ask again when the choice was made for another event", () => {
    window.localStorage.setItem(
      "mys-ui",
      JSON.stringify({ ui: "pixel", event: "2026-06-01/2026-06-03", until: "2026-12-31" }),
    );
    render(<App />);
    expect(screen.getByText("Wie soll das Board aussehen?")).toBeInTheDocument();
  });

  it("should ignore presenter clicks while the picker is shown", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "PageDown" });
    fireEvent.click(screen.getByRole("button", { name: /Modern/ }));
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Ideenfindung (2/2)");
  });

  it("should switch between Modern and Pixel from the header, like the theme toggle", () => {
    storeChoice("modern");
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Zur Pixel-Ansicht wechseln" }));
    expect(screen.queryByRole("region", { name: /Aktueller Programmpunkt/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zur Modern-Ansicht wechseln" }));
    expect(screen.getByRole("region", { name: /Aktueller Programmpunkt/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zur Pixel-Ansicht wechseln" }));
    unmount();
    render(<App />);
    expect(screen.getByRole("button", { name: "Zur Modern-Ansicht wechseln" })).toBeInTheDocument();
  });

  it("should let the switch leave a UI forced via ?ui=", () => {
    window.history.pushState({}, "", "/?ui=modern");
    try {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: "Zur Pixel-Ansicht wechseln" }));
      expect(screen.getByRole("button", { name: "Zur Modern-Ansicht wechseln" })).toBeInTheDocument();
    } finally {
      window.history.pushState({}, "", "/");
    }
  });

  it("should use the UI given as ?ui= without asking or storing it", () => {
    window.history.pushState({}, "", "/?ui=modern");
    try {
      render(<App />);
      expect(screen.getByRole("region", { name: /Aktueller Programmpunkt/i })).toBeInTheDocument();
      expect(window.localStorage.getItem("mys-ui")).toBeNull();
    } finally {
      window.history.pushState({}, "", "/");
    }
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
