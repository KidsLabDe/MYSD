import type { CSSProperties } from "react";
import type { BoardModel } from "../../hooks/useBoardModel";
import "./pixel.css";

interface PixelBoardProps {
  board: BoardModel;
  scale: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Pixel UI: a pixel-art board on the same `BoardModel` as Modern.
 * Placeholder until the design handoff lands; it only proves the wiring.
 */
export function PixelBoard({ board, scale }: PixelBoardProps) {
  const { now, timeline } = board;
  return (
    <div className="board pixel-board" style={{ "--board-scale": scale } as CSSProperties}>
      <h1 className="pixel-board__title">{board.data.boardTitle}</h1>
      <p className="pixel-board__clock" aria-label="Aktuelle Uhrzeit">
        {pad(now.getHours())}:{pad(now.getMinutes())}
      </p>
      <p className="pixel-board__now">{timeline.current?.title ?? timeline.next?.title ?? "—"}</p>
      <p className="pixel-board__hint">Pixel-UI folgt – hier kommt das Design aus dem Handoff hin.</p>
    </div>
  );
}
