import {
  addRegion,
  moveRegion,
  removeRegion,
  resizeRegion,
  updateRegionSize,
} from './hotspot-regions';

describe('addRegion', () => {
  it('adds a region centered on the given point with a default size', () => {
    const regions = addRegion([], 50, 50);
    expect(regions).toHaveLength(1);
    expect(regions[0].width).toBe(20);
    expect(regions[0].height).toBe(20);
    expect(regions[0].x).toBe(40);
    expect(regions[0].y).toBe(40);
  });

  it('clamps the region so it stays within the image bounds', () => {
    const regions = addRegion([], 0, 100);
    expect(regions[0].x).toBe(0);
    expect(regions[0].y).toBe(80);
  });
});

describe('removeRegion', () => {
  it('removes the region with the given id', () => {
    const regions = addRegion(addRegion([], 10, 10), 90, 90);
    const [first] = regions;

    const result = removeRegion(regions, first.id);

    expect(result).toHaveLength(1);
    expect(result.find((region) => region.id === first.id)).toBeUndefined();
  });
});

describe('updateRegionSize', () => {
  it('updates the given dimension on the matching region', () => {
    const regions = addRegion([], 50, 50);

    const result = updateRegionSize(regions, regions[0].id, 'width', 40);

    expect(result[0].width).toBe(40);
    expect(result[0].height).toBe(20);
  });

  it('clamps the value between 1 and 100', () => {
    const regions = addRegion([], 50, 50);

    expect(updateRegionSize(regions, regions[0].id, 'width', 0)[0].width).toBe(1);
    expect(updateRegionSize(regions, regions[0].id, 'width', 500)[0].width).toBe(100);
  });
});

describe('moveRegion', () => {
  it('shifts x and y by the given delta', () => {
    const region = { id: 'r1', x: 20, y: 30, width: 20, height: 20 };

    expect(moveRegion(region, 10, -5)).toEqual({ id: 'r1', x: 30, y: 25, width: 20, height: 20 });
  });

  it('clamps so the region stays within the image bounds', () => {
    const region = { id: 'r1', x: 5, y: 90, width: 20, height: 20 };

    const result = moveRegion(region, -50, 50);

    expect(result.x).toBe(0);
    expect(result.y).toBe(80);
  });
});

describe('resizeRegion', () => {
  it('grows the right edge without moving the left edge', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'e', 10, 0);

    expect(result).toEqual({ id: 'r1', x: 20, y: 20, width: 30, height: 20 });
  });

  it('moves the left edge and adjusts width, keeping the right edge fixed', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'w', -5, 0);

    expect(result.x).toBe(15);
    expect(result.width).toBe(25);
  });

  it('moves the top edge and adjusts height, keeping the bottom edge fixed', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'n', 0, 5);

    expect(result.y).toBe(25);
    expect(result.height).toBe(15);
  });

  it('grows the bottom edge without moving the top edge', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 's', 0, 10);

    expect(result).toEqual({ id: 'r1', x: 20, y: 20, width: 20, height: 30 });
  });

  it('resizes both dimensions for a corner handle', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'se', 10, 10);

    expect(result).toEqual({ id: 'r1', x: 20, y: 20, width: 30, height: 30 });
  });

  it('never shrinks below the minimum size', () => {
    const region = { id: 'r1', x: 20, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'e', -100, 0);

    expect(result.width).toBe(2);
  });

  it('never grows past the image bounds', () => {
    const region = { id: 'r1', x: 80, y: 20, width: 20, height: 20 };

    const result = resizeRegion(region, 'e', 100, 0);

    expect(result.width).toBe(20);
  });
});
