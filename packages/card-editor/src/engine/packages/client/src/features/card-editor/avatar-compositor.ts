/**
 * Pure geometry for the Avatar Studio compositor, ported from the SillyTavern Bulk Combine
 * AvatarCompositorMath (same offset and layout semantics) so it stays testable without a canvas.
 *
 * Offsets: `x`/`y` pan in percent of the cell (±100), `scale` is zoom in percent over the cover
 * fit (100 = exactly cover the cell). The floor is the per-cell contain fit, so a whole image can
 * always be shown letterboxed. Offsets are keyed by character id by the caller (the ST version
 * keyed them by index, which shifted crops whenever sources were reordered).
 */

export type CompositorLayoutMethod = "square" | "portrait" | "best-fit";
export type CompositorPortraitAspect = "2:3" | "3:4" | "9:16";

export interface CompositorLayout {
  method: CompositorLayoutMethod;
  aspect: CompositorPortraitAspect;
  /** 0 = automatic. */
  columns: number;
  gap: number;
  /** Export scale on the 512×768 base. */
  resolution: 1 | 2 | 4;
}

export interface CompositorOffset {
  x: number;
  y: number;
  scale: number;
}

export interface CompositorCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const COMPOSITOR_BASE_WIDTH = 512;
export const COMPOSITOR_BASE_HEIGHT = 768;
export const COMPOSITOR_SCALE_MAX = 200;
export const COMPOSITOR_DEFAULT_SCALE_FLOOR = 50;
export const COMPOSITOR_WHEEL_STEP = 5;
const OFFSET_LIMIT = 100;
const PORTRAIT_ASPECTS: Record<CompositorPortraitAspect, number> = { "2:3": 2 / 3, "3:4": 3 / 4, "9:16": 9 / 16 };

export const DEFAULT_COMPOSITOR_LAYOUT: CompositorLayout = {
  method: "portrait",
  aspect: "3:4",
  columns: 0,
  gap: 8,
  resolution: 2,
};

export const DEFAULT_OFFSET: CompositorOffset = { x: 0, y: 0, scale: 100 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeOffset(offset: Partial<CompositorOffset> | undefined, floor = COMPOSITOR_DEFAULT_SCALE_FLOOR) {
  const minScale = floor > 0 ? floor : COMPOSITOR_DEFAULT_SCALE_FLOOR;
  return {
    x: clamp(Number.isFinite(offset?.x) ? offset!.x! : 0, -OFFSET_LIMIT, OFFSET_LIMIT),
    y: clamp(Number.isFinite(offset?.y) ? offset!.y! : 0, -OFFSET_LIMIT, OFFSET_LIMIT),
    scale: clamp(Number.isFinite(offset?.scale) ? offset!.scale! : 100, minScale, COMPOSITOR_SCALE_MAX),
  };
}

/** The cols × rows shape whose rows/cols ratio best matches k; ties keep the fewest columns. */
export function resolveGridShape(count: number, k: number): { cols: number; rows: number } {
  const n = Math.floor(count);
  if (!(n > 0)) return { cols: 1, rows: 1 };
  const target = k > 0 && Number.isFinite(k) ? k : 1;
  let best = { cols: 1, rows: n };
  let bestDiff = Infinity;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const diff = Math.abs(rows / cols - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = { cols, rows };
    }
  }
  return best;
}

function shapedCells(
  count: number,
  width: number,
  height: number,
  gap: number,
  cols: number,
  rows: number,
): CompositorCell[] {
  // A gap may never swallow a cell: shrink it until every cell keeps at least 1 px.
  const maxGapCols = cols > 1 ? (width - cols) / (cols - 1) : gap;
  const maxGapRows = rows > 1 ? (height - rows) / (rows - 1) : gap;
  const effectiveGap = Math.min(Math.max(0, gap), Math.max(0, Math.floor(Math.min(maxGapCols, maxGapRows))));
  const w = (width - effectiveGap * (cols - 1)) / cols;
  const h = (height - effectiveGap * (rows - 1)) / rows;
  if (w <= 0 || h <= 0) return [];
  return Array.from({ length: count }, (_, index) => ({
    x: (index % cols) * (w + effectiveGap),
    y: Math.floor(index / cols) * (h + effectiveGap),
    w,
    h,
  }));
}

/** Cell rectangles for `count` images. `imageAspects` (width / height) drive best-fit. */
export function computeLayoutCells(
  layout: CompositorLayout,
  count: number,
  width: number,
  height: number,
  imageAspects: readonly (number | null)[] = [],
): CompositorCell[] {
  const n = Math.floor(count);
  if (!(n > 0) || !(width > 0) || !(height > 0)) return [];
  if (layout.columns >= 1) {
    const cols = Math.min(layout.columns, n);
    return shapedCells(n, width, height, layout.gap, cols, Math.ceil(n / cols));
  }
  const canvasRatio = height / width;
  let k = canvasRatio;
  if (layout.method === "portrait") k = PORTRAIT_ASPECTS[layout.aspect] * canvasRatio;
  else if (layout.method === "best-fit") {
    const usable = imageAspects.filter((value): value is number => typeof value === "number" && value > 0);
    if (usable.length > 0)
      k = Math.exp(usable.reduce((sum, value) => sum + Math.log(value), 0) / usable.length) * canvasRatio;
  }
  const { cols, rows } = resolveGridShape(n, k);
  return shapedCells(n, width, height, layout.gap, cols, rows);
}

/** The contain-fit zoom (whole image visible), rounded up so integer steps never crop. */
export function cellMinScale(cell: CompositorCell, imageWidth: number, imageHeight: number): number {
  if (!(imageWidth > 0) || !(imageHeight > 0) || !(cell.w > 0) || !(cell.h > 0)) return COMPOSITOR_DEFAULT_SCALE_FLOOR;
  const wide = cell.w / imageWidth;
  const high = cell.h / imageHeight;
  return Math.ceil((100 * Math.min(wide, high)) / Math.max(wide, high));
}

export function cellCoverDraw(
  cell: CompositorCell,
  imageWidth: number,
  imageHeight: number,
  offset: Partial<CompositorOffset> | undefined,
): { dx: number; dy: number; dw: number; dh: number } | null {
  if (!(imageWidth > 0) || !(imageHeight > 0) || !(cell.w > 0) || !(cell.h > 0)) return null;
  const o = normalizeOffset(offset, cellMinScale(cell, imageWidth, imageHeight));
  const scale = Math.max(cell.w / imageWidth, cell.h / imageHeight) * (o.scale / 100);
  const dw = imageWidth * scale;
  const dh = imageHeight * scale;
  return {
    dx: cell.x + (cell.w - dw) / 2 + (o.x / 100) * cell.w,
    dy: cell.y + (cell.h - dh) / 2 + (o.y / 100) * cell.h,
    dw,
    dh,
  };
}

export function panOffset(
  offset: CompositorOffset,
  dxPercent: number,
  dyPercent: number,
  floor: number,
): CompositorOffset {
  return normalizeOffset({ ...offset, x: offset.x + dxPercent, y: offset.y + dyPercent }, floor);
}

export function zoomOffset(offset: CompositorOffset, delta: number, floor: number): CompositorOffset {
  return normalizeOffset({ ...offset, scale: offset.scale + delta }, floor);
}

/** Pinch zoom proportional to the finger-distance ratio. */
export function pinchScale(startScale: number, startDistance: number, distance: number, floor: number): number {
  if (!(startDistance > 0) || !(distance > 0)) return startScale;
  return clamp(startScale * (distance / startDistance), floor, COMPOSITOR_SCALE_MAX);
}

export function hitTestCell(cells: readonly CompositorCell[], x: number, y: number): number {
  return cells.findIndex((cell) => x >= cell.x && x < cell.x + cell.w && y >= cell.y && y < cell.y + cell.h);
}

export function exportSize(layout: CompositorLayout): { width: number; height: number } {
  return { width: COMPOSITOR_BASE_WIDTH * layout.resolution, height: COMPOSITOR_BASE_HEIGHT * layout.resolution };
}
