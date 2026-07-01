import { createId } from './id';

describe('createId', () => {
  it('returns a well-formed UUID', () => {
    expect(createId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('returns a different value on each call', () => {
    expect(createId()).not.toBe(createId());
  });
});
