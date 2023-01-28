import { filterMap } from '../src/utils';

describe('filterMap', () => {
  it('returns filtered array from map', () => {
    const map = new Map<number, { name: string }>();
    map.set(1, { name: 'alice' });
    map.set(2, { name: 'bob' });
    let filtered: { name: string }[];
    filtered = filterMap(map, a => a.name === 'alice');
    expect(filtered).toEqual([{ name: 'alice' }]);
    filtered = filterMap(map, a => a.name === 'bob');
    expect(filtered).toEqual([{ name: 'bob' }]);
    filtered = filterMap(map, a => a.name === 'charles');
    expect(filtered).toEqual([]);
  });
});
