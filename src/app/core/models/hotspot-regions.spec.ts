import { addRegion, removeRegion, updateRegionSize } from './hotspot-regions';

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
