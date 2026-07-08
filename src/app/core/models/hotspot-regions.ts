import { createId } from '../utils/id';
import { HotspotRegion } from './quiz.models';

const DEFAULT_SIZE = 20;
const MIN_SIZE = 2;
const DECIMALS = 2;

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function round(value: number): number {
  const factor = 10 ** DECIMALS;
  return Math.round(value * factor) / factor;
}

export function addRegion(regions: HotspotRegion[], x: number, y: number): HotspotRegion[] {
  const half = DEFAULT_SIZE / 2;
  const region: HotspotRegion = {
    id: createId(),
    x: round(Math.min(Math.max(x - half, 0), 100 - DEFAULT_SIZE)),
    y: round(Math.min(Math.max(y - half, 0), 100 - DEFAULT_SIZE)),
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
  const clamped = round(Math.min(Math.max(value, 1), 100));
  return regions.map((region) =>
    region.id === regionId ? { ...region, [field]: clamped } : region,
  );
}

export function moveRegion(region: HotspotRegion, dx: number, dy: number): HotspotRegion {
  return {
    ...region,
    x: round(Math.min(Math.max(region.x + dx, 0), 100 - region.width)),
    y: round(Math.min(Math.max(region.y + dy, 0), 100 - region.height)),
  };
}

export function resizeRegion(
  region: HotspotRegion,
  handle: ResizeHandle,
  dx: number,
  dy: number,
): HotspotRegion {
  let { x, y, width, height } = region;

  if (handle.includes('e')) {
    width = Math.min(Math.max(width + dx, MIN_SIZE), 100 - x);
  }
  if (handle.includes('w')) {
    const right = x + width;
    x = Math.min(Math.max(x + dx, 0), right - MIN_SIZE);
    width = right - x;
  }
  if (handle.includes('s')) {
    height = Math.min(Math.max(height + dy, MIN_SIZE), 100 - y);
  }
  if (handle.includes('n')) {
    const bottom = y + height;
    y = Math.min(Math.max(y + dy, 0), bottom - MIN_SIZE);
    height = bottom - y;
  }

  return { ...region, x: round(x), y: round(y), width: round(width), height: round(height) };
}
