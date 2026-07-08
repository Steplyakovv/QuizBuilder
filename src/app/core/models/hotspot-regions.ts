import { createId } from '../utils/id';
import { HotspotRegion } from './quiz.models';

const DEFAULT_SIZE = 20;

export function addRegion(regions: HotspotRegion[], x: number, y: number): HotspotRegion[] {
  const half = DEFAULT_SIZE / 2;
  const region: HotspotRegion = {
    id: createId(),
    x: Math.min(Math.max(x - half, 0), 100 - DEFAULT_SIZE),
    y: Math.min(Math.max(y - half, 0), 100 - DEFAULT_SIZE),
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
  };
  return [...regions, region];
}

export function removeRegion(regions: HotspotRegion[], regionId: string): HotspotRegion[] {
  return regions.filter((region) => region.id !== regionId);
}

export function updateRegionSize(
  regions: HotspotRegion[],
  regionId: string,
  field: 'width' | 'height',
  value: number,
): HotspotRegion[] {
  const clamped = Math.min(Math.max(value, 1), 100);
  return regions.map((region) =>
    region.id === regionId ? { ...region, [field]: clamped } : region,
  );
}
