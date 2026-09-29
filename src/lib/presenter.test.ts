import { describe, expect, it } from "vitest";
import type { AgendaItem } from "../types";
import {
  EXTRA_SECONDS,
  applyAdjustments,
  dueClick,
  pendingAdjustment,
  planStep,
  presenterStep,
} from "./presenter";
import { buildTimeline } from "./schedule";

const at = (hh: number, mm: number, ss = 0) => hh * 3600 + mm * 60 + ss;

const PLAN: AgendaItem[] = [
  { id: "work", start: "10:00", end: "11:00", title: "Arbeitsphase", kind: "phase" },
  { id: "lunch", start: "11:00", end: "12:00", title: "Mittagspause", kind: "meal" },
  { id: "talk", start: "12:30", end: "13:00", title: "Präsentation", kind: "talk" },
];

const byId = (items: readonly AgendaItem[], id: string) => items.find((i) => i.id === id);
const currentAt = (items: readonly AgendaItem[], seconds: number) =>
  buildTimeline(items, seconds).current?.id ?? null;

describe("presenterStep", () => {
  it("should map a presenter's forward keys to next", () => {
    expect(presenterStep("ArrowRight")).toBe("next");
    expect(presenterStep("PageDown")).toBe("next");
  });

  it("should map a presenter's back keys to prev", () => {
    expect(presenterStep("ArrowLeft")).toBe("prev");
    expect(presenterStep("PageUp")).toBe("prev");
  });

  it("should ignore other keys", () => {
    expect(presenterStep("a")).toBeNull();
  });
});

describe("planStep: next", () => {
  // Pressed at 10:40:00.3 → the switch lands two whole seconds after the next tick.
  const pressed = at(10, 40) + 0.3;
  const switchAt = at(10, 40, 3);

  it("should end the running item and start the next one at the switch moment", () => {
    expect(planStep(PLAN, [], "next", pressed)).toEqual({
      at: switchAt,
      target: "lunch",
      changes: [
        { id: "work", end: switchAt },
        { id: "lunch", start: switchAt },
      ],
    });
  });

  it("should keep the next item's end and every later item as planned", () => {
    const step = planStep(PLAN, [], "next", pressed);
    const items = applyAdjustments(PLAN, step ? [step] : [], switchAt);
    expect(byId(items, "lunch")).toMatchObject({ start: "10:40", end: "12:00" });
    expect(byId(items, "work")).toMatchObject({ start: "10:00", end: "10:40" });
    expect(byId(items, "talk")).toEqual(PLAN[2]);
  });

  it("should switch exactly at the switch moment, not before", () => {
    const step = planStep(PLAN, [], "next", pressed);
    const adjs = step ? [step] : [];
    expect(currentAt(applyAdjustments(PLAN, adjs, switchAt - 1), switchAt - 1)).toBe("work");
    expect(currentAt(applyAdjustments(PLAN, adjs, switchAt), switchAt)).toBe("lunch");
  });

  it("should pull the next item forward during a gap", () => {
    const step = planStep(PLAN, [], "next", at(12, 10));
    expect(step?.target).toBe("talk");
    expect(step?.changes).toEqual([{ id: "talk", start: at(12, 10, 2) }]);
  });

  it("should do nothing after the last item", () => {
    expect(planStep(PLAN, [], "next", at(13, 30))).toBeNull();
  });

  it("should ignore presses while a switch is still on its way", () => {
    const step = planStep(PLAN, [], "next", pressed);
    expect(planStep(PLAN, step ? [step] : [], "next", pressed + 1)).toBeNull();
  });
});

describe("planStep: prev", () => {
  it("should undo an early switch while the original end is still ahead", () => {
    const skip = planStep(PLAN, [], "next", at(10, 40));
    const adjs = skip ? [skip] : [];
    const back = planStep(PLAN, adjs, "prev", at(10, 45));
    expect(back?.target).toBe("work");

    const items = applyAdjustments(PLAN, back ? [...adjs, back] : adjs, at(10, 46));
    expect(byId(items, "work")).toMatchObject({ start: "10:00", end: "11:00" });
    expect(byId(items, "lunch")).toMatchObject({ start: "11:00", end: "12:00" });
    expect(currentAt(items, at(10, 46))).toBe("work");
  });

  it("should give the previous item extra minutes once its planned end is past", () => {
    const back = planStep(PLAN, [], "prev", at(11, 20));
    const switchAt = at(11, 20, 2);
    expect(back).toEqual({
      at: switchAt,
      target: "work",
      changes: [
        { id: "work", end: switchAt + EXTRA_SECONDS },
        { id: "lunch", start: switchAt + EXTRA_SECONDS },
      ],
    });
  });

  it("should never squeeze the following item below a minute", () => {
    const back = planStep(PLAN, [], "prev", at(11, 57));
    expect(back?.changes).toEqual([
      { id: "work", end: at(11, 59) },
      { id: "lunch", start: at(11, 59) },
    ]);
  });

  it("should resume the last item after the day is over", () => {
    const back = planStep(PLAN, [], "prev", at(13, 30));
    expect(back?.target).toBe("talk");
    expect(back?.changes).toEqual([{ id: "talk", end: at(13, 30, 2) + EXTRA_SECONDS }]);
  });

  it("should do nothing before the first item has run", () => {
    expect(planStep(PLAN, [], "prev", at(9, 0))).toBeNull();
    expect(planStep(PLAN, [], "prev", at(10, 30))).toBeNull();
  });
});

describe("pendingAdjustment", () => {
  it("should return the switch that hasn't happened yet", () => {
    const step = planStep(PLAN, [], "next", at(10, 40));
    const adjs = step ? [step] : [];
    expect(pendingAdjustment(adjs, at(10, 40, 1))).toBe(step);
    expect(pendingAdjustment(adjs, at(10, 40, 2))).toBeNull();
  });
});

describe("applyAdjustments", () => {
  it("should not touch the source items", () => {
    const step = planStep(PLAN, [], "next", at(10, 40));
    applyAdjustments(PLAN, step ? [step] : [], at(11, 0));
    expect(PLAN[0]).toEqual({
      id: "work",
      start: "10:00",
      end: "11:00",
      title: "Arbeitsphase",
      kind: "phase",
    });
  });
});

describe("dueClick", () => {
  it("should aim at the item starting on its own two seconds ahead", () => {
    const tl = buildTimeline(PLAN, at(10, 59, 58));
    expect(dueClick(tl, null, at(10, 59, 58))).toEqual({
      id: "lunch",
      key: `lunch@${at(11, 0)}`,
      lateMs: 0,
    });
  });

  it("should aim at the target of a presenter step on its way", () => {
    const step = planStep(PLAN, [], "prev", at(11, 20));
    const now = at(11, 20);
    expect(dueClick(buildTimeline(PLAN, now), step, now)).toEqual({
      id: "work",
      key: `work@${at(11, 20, 2)}`,
      lateMs: 0,
    });
  });

  it("should use the same key for a pulled-forward item once it is the next one", () => {
    const step = planStep(PLAN, [], "next", at(10, 40));
    const items = applyAdjustments(PLAN, step ? [step] : [], at(10, 40, 1));
    expect(dueClick(buildTimeline(items, at(10, 40, 1)), step, at(10, 40, 1))?.key).toBe(
      `lunch@${at(10, 40, 2)}`,
    );
  });
});
