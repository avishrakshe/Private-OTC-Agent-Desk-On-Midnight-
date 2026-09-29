import { useVideoConfig } from 'remotion';

/**
 * Layout for both formats. Scenes position things relative to the centre in "units", where one
 * unit is 1px at 1080 short-side, and use `spread` for horizontal distances so the landscape
 * layout compresses gracefully into the square.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const isSquare = width / height < 1.3;
  const u = Math.min(width, height) / 1080;
  return {
    width,
    height,
    isSquare,
    u,
    /** Horizontal distance multiplier. */
    spread: isSquare ? 0.56 : 1,
    /** Headline font size. */
    headline: (isSquare ? 74 : 92) * u,
  };
};
