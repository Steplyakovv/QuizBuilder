import { pieceEdges, piecePathD } from './puzzle-shape';

describe('pieceEdges', () => {
  it('gives outer border pieces a flat (0) edge on the grid boundary', () => {
    // 2x2 grid: piece 0 = (row0,col0) is top-left, so its top and left are flat.
    const topLeft = pieceEdges(0, 2, 2);
    expect(topLeft.top).toBe(0);
    expect(topLeft.left).toBe(0);

    const bottomRight = pieceEdges(3, 2, 2);
    expect(bottomRight.bottom).toBe(0);
    expect(bottomRight.right).toBe(0);
  });

  it('makes shared internal edges sign-opposite between neighbours', () => {
    // 2x2 grid: piece 0 (row0,col0) and piece 1 (row0,col1) share a vertical edge.
    const left = pieceEdges(0, 2, 2);
    const right = pieceEdges(1, 2, 2);
    expect(left.right).toBe(-right.left);
    expect(left.right).not.toBe(0);

    // piece 0 (row0,col0) and piece 2 (row1,col0) share a horizontal edge.
    const top = pieceEdges(0, 2, 2);
    const bottom = pieceEdges(2, 2, 2);
    expect(top.bottom).toBe(-bottom.top);
    expect(top.bottom).not.toBe(0);
  });

  it('gives every edge of a 1x1 puzzle a flat border', () => {
    const only = pieceEdges(0, 1, 1);
    expect(only).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('gives a 1-row strip flat top/bottom borders but tabbed internal vertical edges', () => {
    // puzzleGridSize's prime-number fallback (e.g. 3 pieces -> 1x3).
    const middle = pieceEdges(1, 1, 3);
    expect(middle.top).toBe(0);
    expect(middle.bottom).toBe(0);
    expect(middle.left).not.toBe(0);
    expect(middle.right).not.toBe(0);
  });
});

describe('piecePathD', () => {
  it('produces a closed path starting at the core square corner', () => {
    const d = piecePathD({ top: 0, right: 0, bottom: 0, left: 0 }, 90, 18);
    expect(d.startsWith('M 18,18')).toBe(true);
    expect(d.trim().endsWith('Z')).toBe(true);
  });

  it('includes curve commands only for tab/blank edges, not flat ones', () => {
    const flat = piecePathD({ top: 0, right: 0, bottom: 0, left: 0 }, 90, 18);
    expect(flat).not.toContain('C ');

    const tabbed = piecePathD({ top: 1, right: -1, bottom: 1, left: -1 }, 90, 18);
    expect(tabbed).toContain('C ');
  });

  it('handles the degenerate 1x1 grid (all-flat edges) without throwing', () => {
    expect(() => piecePathD(pieceEdges(0, 1, 1), 90, 18)).not.toThrow();
  });
});
