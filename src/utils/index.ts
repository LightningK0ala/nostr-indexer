export const filterMap = <K, V>(
  map: Map<K, V>,
  filterFn: (value: V) => any
) => {
  return Array.from(map.values()).filter(filterFn);
};

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}

export function dateToSeconds(date?: Date) {
  if (!date) return false
  return date.getTime() / 1000
}
