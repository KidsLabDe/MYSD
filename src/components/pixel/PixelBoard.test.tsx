import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { useBoardModel } from "../../hooks/useBoardModel";
import type { HackdayData } from "../../types";
import { PixelBoard } from "./PixelBoard";

const data: HackdayData = {
  title: "Make Your School · Testschule",
  boardTitle: "MYS Hackday",
  days: [
    {
      date: "2026-09-28",
      schedule: [
        { id: "a", start: "09:00", end: "10:00", title: "Kick-off", kind: "talk" },
        { id: "b", start: "10:00", end: "11:30", title: "Phase 1", kind: "phase" },
        { id: "c", start: "11:30", end: "12:30", title: "Mittagessen", kind: "meal" },
      ],
    },
  ],
};

const MID_PHASE = new Date(2026, 8, 28, 11, 0, 0);

function Harness({ now }: { now: Date }) {
  const board = useBoardModel(data, now, null, true);
  return <PixelBoard board={board} onToggleUi={() => {}} />;
}

const calendar = (c: HTMLElement) => c.querySelector("#l-cal")?.textContent ?? "";
const monitor = (c: HTMLElement) => c.querySelector("#l-pc")?.textContent ?? "";

describe("PixelBoard", () => {
  beforeEach(() => {
    // Only the date is fake: the scene's animation frames keep running.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(MID_PHASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should list the day's items with the board title and school in the calendar", () => {
    const { container } = render(<Harness now={MID_PHASE} />);
    const text = calendar(container);
    for (const title of ["Kick-off", "Phase 1", "Mittagessen", "MYS HACKDAY"]) {
      expect(text).toContain(title);
    }
    expect(text).toContain("28.09.2026 · Testschule");
  });

  it("should show the running item and its countdown on the monitor", () => {
    const { container } = render(<Harness now={MID_PHASE} />);
    expect(monitor(container)).toContain("PHASE 1");
    expect(monitor(container)).toContain("00:30:00");
    expect(monitor(container)).toContain("NÄCHSTE > MITTAGESSEN · 11:30");
  });

  it("should move the monitor to the next item on a presenter click", () => {
    const { container, rerender } = render(<Harness now={MID_PHASE} />);
    expect(monitor(container)).not.toContain("NÄCHSTE > ENDE");
    fireEvent.keyDown(window, { key: "PageDown" });
    // The switch lands on the next tick of the board clock.
    const later = new Date(MID_PHASE.getTime() + 3000);
    vi.setSystemTime(later);
    act(() => rerender(<Harness now={later} />));
    // Mittagessen runs now (until 12:30 as planned), the last item of the day.
    expect(monitor(container)).toContain("NÄCHSTE > ENDE · 12:30");
    expect(monitor(container)).toContain("01:29:57");
  });

  it("should offer the switch back to the Modern UI", () => {
    const { getByRole } = render(<Harness now={MID_PHASE} />);
    expect(getByRole("button", { name: "Zur Modern-Ansicht wechseln" })).toBeInTheDocument();
  });

  it("should remove the scene when it unmounts", () => {
    const { container, unmount } = render(<Harness now={MID_PHASE} />);
    const stage = container.querySelector("#l-cal");
    unmount();
    expect(stage?.isConnected).toBe(false);
  });
});
