/** Factor pair closest to a square (e.g. 9 -> 3x3, 12 -> 3x4, 7 (prime) -> 1x7). */
export function puzzleGridSize(pieceCount: number): { rows: number; columns: number } {
  const n = Math.max(1, Math.floor(pieceCount));
  let best = { rows: 1, columns: n };
  for (let rows = 1; rows * rows <= n; rows++) {
    if (n % rows === 0) {
      best = { rows, columns: n / rows };
    }
  }
  return best;
}
