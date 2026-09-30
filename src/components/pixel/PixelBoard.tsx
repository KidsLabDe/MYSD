import { useEffect, useMemo, useRef } from "react";
import type { BoardModel } from "../../hooks/useBoardModel";
import { calendarSubline, pixelPhase } from "../../lib/pixelPhase";
import ort from "../../data/ort.json";
import { UiSwitch } from "../UiSwitch";
import { PixelScene, type SceneInput } from "./scene/engine";
import "./pixel.css";

interface PixelBoardProps {
  board: BoardModel;
  onToggleUi: () => void;
}

/**
 * The Pixel UI: the lo-fi pixel-art room (desk with CRT countdown, wall
 * calendar a character ticks off, window with blinds and live weather).
 * It renders the same `BoardModel` as Modern; the scene only animates
 * towards the state the model computes.
 */
export function PixelBoard({ board, onToggleUi }: PixelBoardProps) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<PixelScene | null>(null);
  const { data, now, timeline, date } = board;

  const input = useMemo<SceneInput>(
    () => ({
      now: now.getTime(),
      phase: pixelPhase(timeline),
      items: timeline.entries.map(({ item }) => ({
        start: item.start,
        end: item.end,
        title: item.title,
      })),
      title: data.boardTitle,
      subline: date === null ? "" : calendarSubline(date, data.title),
      date,
    }),
    [now, timeline, date, data.boardTitle, data.title],
  );

  useEffect(() => {
    if (host.current === null) return;
    const created = new PixelScene(host.current, {
      latitude: ort.latitude,
      longitude: ort.longitude,
      poster: ort.poster,
      params: new URLSearchParams(window.location.search),
    });
    scene.current = created;
    return () => {
      created.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    scene.current?.update(input);
  }, [input]);

  return (
    <div className="pixel-board" ref={host}>
      <div className="pixel-board__switch">
        <UiSwitch ui="pixel" onToggle={onToggleUi} />
      </div>
    </div>
  );
}
