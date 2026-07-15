/**
 * Jigsaw piece outline geometry: which edges have a tab/blank (vs. a flat border edge), and the
 * SVG path tracing a piece's silhouette. Framework-free so it's usable identically by the runner
 * (clip-path per piece) and the editor preview (an overlay of the real cut lines).
 */

/** Shared by the editor preview and the runner so both render pieces at the same scale. */
export const PUZZLE_PIECE_SIZE = 90;
/** Bleed around each piece so tabs have room to bulge into the neighbouring cell - also the max
 *  bump depth in piecePathD, so tabs exactly fill the allowance without clipping. */
export const PUZZLE_TAB_MARGIN = 18;

export type EdgeSign = -1 | 0 | 1;

export interface PieceEdges {
  top: EdgeSign;
  right: EdgeSign;
  bottom: EdgeSign;
  left: EdgeSign;
}

type Point = [number, number];

const HORIZONTAL_SALT = 17;
const VERTICAL_SALT = 31;

function hash(a: number, b: number, salt: number): number {
  let h = (a * 374761393 + b * 668265263 + salt * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function edgeSign(a: number, b: number, salt: number): 1 | -1 {
  return hash(a, b, salt) % 2 === 0 ? 1 : -1;
}

function negate(sign: 1 | -1): 1 | -1 {
  return sign === 1 ? -1 : 1;
}

/**
 * Edges for the piece at pieceIndex's row-major position. Internal edges are derived from a hash
 * shared with the neighbouring piece, with opposite sign: a tab is a bulge out of one piece and
 * into the other, so it's positive from the bulging piece's own outward-normal convention and
 * negative from the receiving piece's.
 */
export function pieceEdges(pieceIndex: number, rows: number, columns: number): PieceEdges {
  const row = Math.floor(pieceIndex / columns);
  const col = pieceIndex % columns;
  return {
    top: row === 0 ? 0 : negate(edgeSign(row - 1, col, HORIZONTAL_SALT)),
    bottom: row === rows - 1 ? 0 : edgeSign(row, col, HORIZONTAL_SALT),
    left: col === 0 ? 0 : negate(edgeSign(row, col - 1, VERTICAL_SALT)),
    right: col === columns - 1 ? 0 : edgeSign(row, col, VERTICAL_SALT),
  };
}

// Knot t-fractions (position along the edge) and n-fractions (perpendicular depth) tracing a
// neck-in, shoulder-out, apex bump, mirrored - the classic wider-head-than-neck jigsaw tab
// profile. Index 0 and 8 are the edge's own corners (n=0); 1..7 form the bump.
const T_FRACTIONS = [0, 0.35, 0.3, 0.22, 0.5, 0.78, 0.7, 0.65, 1];
const N_FRACTIONS = [0, 0, 0.35, 0.65, 1, 0.65, 0.35, 0, 0];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** `normal` is pre-scaled to the desired bump depth (e.g. `[0, -margin]`), not a unit vector. */
function edgeKnots(start: Point, end: Point, normal: Point, sign: EdgeSign): Point[] {
  if (sign === 0) {
    return [start, end];
  }
  const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const dir: Point = [(end[0] - start[0]) / length, (end[1] - start[1]) / length];
  return T_FRACTIONS.map((t, i) => {
    const n = N_FRACTIONS[i] * sign;
    return [
      start[0] + dir[0] * t * length + normal[0] * n,
      start[1] + dir[1] * t * length + normal[1] * n,
    ] as Point;
  });
}

/** Straight segments for flat edges; smooth Catmull-Rom-derived cubic Beziers for tab/blank edges. */
function pointsToPathCommands(points: Point[]): string {
  if (points.length === 2) {
    return `L ${round(points[1][0])},${round(points[1][1])}`;
  }
  let out = `L ${round(points[1][0])},${round(points[1][1])}`;
  for (let j = 1; j <= 6; j++) {
    const p0 = points[j];
    const p1 = points[j + 1];
    const prev = points[j - 1];
    const next = points[j + 2];
    const cp1: Point = [p0[0] + (p1[0] - prev[0]) / 6, p0[1] + (p1[1] - prev[1]) / 6];
    const cp2: Point = [p1[0] - (next[0] - p0[0]) / 6, p1[1] - (next[1] - p0[1]) / 6];
    out += ` C ${round(cp1[0])},${round(cp1[1])} ${round(cp2[0])},${round(cp2[1])} ${round(p1[0])},${round(p1[1])}`;
  }
  out += ` L ${round(points[8][0])},${round(points[8][1])}`;
  return out;
}

const HOLE_SALT = 53;

/**
 * Deterministically picks which `holeCount` cells (of `totalCells`) are holes, given only the
 * question's own fields - no persisted selection needed, since the editor preview, runner and
 * scoring all call this with the same (pieceCount, holeCount) and agree.
 */
export function selectedHoleIndices(totalCells: number, holeCount: number): number[] {
  const n = Math.max(1, Math.floor(totalCells));
  const count = Math.min(Math.max(1, Math.floor(holeCount)), n);
  return Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => hash(a, count, HOLE_SALT) - hash(b, count, HOLE_SALT) || a - b)
    .slice(0, count)
    .sort((a, b) => a - b);
}

/**
 * SVG path `d` tracing a piece's outline clockwise (top, right, bottom, left) in a
 * [0, coreSize + 2*margin] box, with the core coreSize x coreSize square centred in it. `margin`
 * doubles as the max bump depth, so tabs exactly fill the bleed allowance around the piece.
 */
export function piecePathD(edges: PieceEdges, coreSize: number, margin: number): string {
  const tl: Point = [margin, margin];
  const tr: Point = [margin + coreSize, margin];
  const br: Point = [margin + coreSize, margin + coreSize];
  const bl: Point = [margin, margin + coreSize];

  const sides: [Point, Point, Point, EdgeSign][] = [
    [tl, tr, [0, -margin], edges.top],
    [tr, br, [margin, 0], edges.right],
    [br, bl, [0, margin], edges.bottom],
    [bl, tl, [-margin, 0], edges.left],
  ];

  let d = `M ${round(tl[0])},${round(tl[1])}`;
  for (const [start, end, normal, sign] of sides) {
    d += ' ' + pointsToPathCommands(edgeKnots(start, end, normal, sign));
  }
  return d + ' Z';
}
