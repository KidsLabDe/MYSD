import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { useBoardModel } from "../../hooks/useBoardModel";
import type { HackdayData } from "../../types";
import { PixelBoard } from "./PixelBoard";
import { digitPath } from "./scene/tear";

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
/** Fill of the current page on the tear-off pad */
const padFill = (c: HTMLElement) =>
  c.querySelector("#l-tear rect[x='2'][y='7']")?.getAttribute("fill") ?? null;
const padDigits = (c: HTMLElement) =>
  c.querySelector("#l-tear path[transform='translate(2 7)']")?.getAttribute("d") ?? null;
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

  it("should move the monitor to the next item on an arrow key", () => {
    const { container, rerender } = render(<Harness now={MID_PHASE} />);
    expect(monitor(container)).not.toContain("NÄCHSTE > ENDE");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    // The switch lands on the next tick of the board clock.
    const later = new Date(MID_PHASE.getTime() + 3000);
    vi.setSystemTime(later);
    act(() => rerender(<Harness now={later} />));
    // Mittagessen runs now (until 12:30 as planned), the last item of the day.
    expect(monitor(container)).toContain("NÄCHSTE > ENDE · 12:30");
    expect(monitor(container)).toContain("01:29:57");
  });

  it("should tear one calendar page per presenter click and leave the plan alone", async () => {
    const { container, rerender } = render(<Harness now={MID_PHASE} />);
    fireEvent.keyDown(window, { key: "PageDown" });
    fireEvent.keyDown(window, { key: "PageDown", repeat: true });
    fireEvent.keyDown(window, { key: "PageUp" });
    // Two presses (the held key doesn't count): the pad shows day 3, two pages are torn.
    await waitFor(() => expect(padDigits(container)).toBe(digitPath(3)));
    expect(container.querySelectorAll("#l-tear svg[viewBox='0 0 9 12']")).toHaveLength(2);
    const later = new Date(MID_PHASE.getTime() + 3000);
    vi.setSystemTime(later);
    act(() => rerender(<Harness now={later} />));
    // Phase 1 keeps running: the clicks never reached the plan.
    await waitFor(() => expect(monitor(container)).toContain("00:29:57"));
    expect(monitor(container)).toContain("PHASE 1");
  });

  it("should flip the pad to a blue page after one presenter click", async () => {
    const { container } = render(<Harness now={MID_PHASE} />);
    await waitFor(() => expect(padFill(container)).toBe("#F4F2EC"));
    fireEvent.keyDown(window, { key: "PageDown" });
    await waitFor(() => expect(padFill(container)).toBe("#3D8FD1"));
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
