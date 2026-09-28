import { useEffect, useState } from "react";
import { boardScale } from "../lib/board";

function currentScale(): number {
  if (typeof window === "undefined") return 1;
  return boardScale(window.innerWidth, window.innerHeight);
}

/**
 * Scale factor for the fixed 1920×1080 board stage, kept in sync with the
 * viewport. The CSS only applies it in board mode (wide screens), so on
 * phones the value is simply unused.
 */
export function useBoardScale(): number {
  const [scale, setScale] = useState(currentScale);

  useEffect(() => {
    const onResize = () => setScale(currentScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}
