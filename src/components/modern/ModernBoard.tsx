import type { CSSProperties } from "react";
import type { BoardModel } from "../../hooks/useBoardModel";
import type { Theme } from "../../hooks/useTheme";
import { Header } from "../Header";
import { NowPanel } from "../NowPanel";
import { PixelCursor } from "../PixelCursor";
import { Ticker } from "../Ticker";
import { Timeline } from "../Timeline";

interface ModernBoardProps {
  board: BoardModel;
  scale: number;
  theme: Theme;
  onToggleTheme: () => void;
}

/** The Modern UI: KidsLab-styled board with hero, Tagesplan and ticker. */
export function ModernBoard({ board, scale, theme, onToggleTheme }: ModernBoardProps) {
  const { data, timeline, plan, click } = board;
  return (
    <div className="board" style={{ "--board-scale": scale } as CSSProperties}>
      <Header
        title={data.boardTitle}
        now={board.now}
        testTime={board.testTime}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="board__main">
        <NowPanel
          timeline={timeline}
          nowSeconds={board.nowSeconds}
          resumeLead={board.resumeLead}
          dayName={board.dayName}
        />
        <Timeline
          entries={plan.timeline.entries}
          remainingSeconds={plan.timeline.remainingSeconds}
          dayLabel={plan.label}
          preview={plan.preview}
        />
      </main>

      <Ticker messages={data.messages ?? []} />

      {click !== null && (
        <PixelCursor
          key={click.key}
          targetId={click.id}
          lateMs={click.lateMs}
          onDone={board.clearClick}
        />
      )}
    </div>
  );
}
