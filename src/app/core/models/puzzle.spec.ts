import { puzzleGridSize } from './puzzle';

describe('puzzleGridSize', () => {
  it('finds a perfect square split', () => {
    expect(puzzleGridSize(9)).toEqual({ rows: 3, columns: 3 });
    expect(puzzleGridSize(16)).toEqual({ rows: 4, columns: 4 });
  });

  it('finds the factor pair closest to a square for a non-square count', () => {
    expect(puzzleGridSize(12)).toEqual({ rows: 3, columns: 4 });
    expect(puzzleGridSize(6)).toEqual({ rows: 2, columns: 3 });
  });

  it('falls back to a 1-row strip for a prime count', () => {
    expect(puzzleGridSize(7)).toEqual({ rows: 1, columns: 7 });
  });

  it('handles the degenerate 1-piece case', () => {
    expect(puzzleGridSize(1)).toEqual({ rows: 1, columns: 1 });
  });

  it('clamps non-positive or fractional input to a sane minimum', () => {
    expect(puzzleGridSize(0)).toEqual({ rows: 1, columns: 1 });
    expect(puzzleGridSize(4.7)).toEqual({ rows: 2, columns: 2 });
  });
});
