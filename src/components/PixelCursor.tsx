import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { CursorPath, Point } from "../lib/cursor";
import { CURSOR_BITMAP, CURSOR_DURATION_MS, cursorPath, cursorRuns } from "../lib/cursor";

/** Size of one bitmap pixel on the stage. */
const PIXEL = 5;

const RUNS = cursorRuns(CURSOR_BITMAP);
const WIDTH = Math.max(...CURSOR_BITMAP.map((row) => row.length));
const HEIGHT = CURSOR_BITMAP.length;

interface PixelCursorProps {
  /** Id of the timeline item to click (`data-item-id` on its row). */
  targetId: string;
  /** How far into the trip to start, so the click still lands on time. */
  lateMs: number;
  onDone: () => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Where to click: the target row's title, relative to the layer, in unscaled
 * stage pixels (the board may be CSS-scaled).
 */
function measureTarget(layer: HTMLElement, targetId: string): Point | null {
  const rows = layer.parentElement?.querySelectorAll<HTMLElement>("[data-item-id]") ?? [];
  const row = Array.from(rows).find((el) => el.dataset.itemId === targetId);
  const title = row?.querySelector(".tl__title") ?? row;
  if (title === undefined || title === null) return null;

  const box = layer.getBoundingClientRect();
  const scale = layer.offsetWidth > 0 ? box.width / layer.offsetWidth : 1;
  const rect = title.getBoundingClientRect();
  return {
    x: (rect.left - box.left + Math.min(rect.width, 160) * 0.6) / scale,
    y: (rect.top - box.top + rect.height / 2) / scale,
  };
}

/** Re-aim only when the title moved noticeably, so re-renders stay cheap. */
function moved(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5;
}

/**
 * A pixel-art mouse that glides in, clicks the item that is about to start
 * (right as it starts) and leaves the board again. Purely decorative; calls
 * `onDone` when finished.
 */
export function PixelCursor({ targetId, lateMs, onDone }: PixelCursorProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<CursorPath | null>(null);
  const started = path !== null;

  // Plan the trip once; enter and exit stay fixed from then on.
  useLayoutEffect(() => {
    const layer = layerRef.current;
    const target = layer === null || prefersReducedMotion() ? null : measureTarget(layer, targetId);
    if (layer === null || target === null) onDone();
    else setPath(cursorPath(target, { width: layer.offsetWidth, height: layer.offsetHeight }));
  }, [targetId, onDone]);

  // Every render (each clock tick) re-aims the click: when the item starts,
  // its row grows and the title shifts. The keyframes follow the new vars live.
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (layer === null || path === null) return;
    const target = measureTarget(layer, targetId);
    if (target !== null && moved(target, path.click)) setPath({ ...path, click: target });
  });

  // A timer instead of `animationend`, so a hidden tab can't leave it stuck.
  useEffect(() => {
    if (!started) return;
    const id = window.setTimeout(onDone, Math.max(0, CURSOR_DURATION_MS - lateMs));
    return () => window.clearTimeout(id);
  }, [started, lateMs, onDone]);

  const style =
    path === null
      ? undefined
      : ({
          "--enter-x": `${path.enter.x}px`,
          "--enter-y": `${path.enter.y}px`,
          "--click-x": `${path.click.x}px`,
          "--click-y": `${path.click.y}px`,
          "--exit-x": `${path.exit.x}px`,
          "--exit-y": `${path.exit.y}px`,
          "--cursor-ms": `${CURSOR_DURATION_MS}ms`,
          "--cursor-late": `${-lateMs}ms`,
        } as CSSProperties);

  return (
    <div ref={layerRef} className="pixel-cursor-layer" style={style} aria-hidden="true">
      {path !== null && (
        <>
          <span className="pixel-cursor__click" />
          <svg
            className="pixel-cursor"
            width={WIDTH * PIXEL}
            height={HEIGHT * PIXEL}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            shapeRendering="crispEdges"
          >
            {RUNS.map((run, i) => (
              <rect
                key={i}
                className={`pixel-cursor__${run.fill}`}
                x={run.x}
                y={run.y}
                width={run.width}
                height={1}
              />
            ))}
          </svg>
        </>
      )}
    </div>
  );
}
