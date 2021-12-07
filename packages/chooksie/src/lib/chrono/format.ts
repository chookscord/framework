export const enum Time {
  Ms = 1,
  Second = Ms * 1000,
  Minute = Second * 60,
  Hour = Minute * 60,
  Day = Hour * 24,
}

export type TimeFormat = 'long' | 'short' | 's' | 'ms';
type TimeInterval = [number, string];

const INTERVALS: TimeInterval[] = [
  [Time.Ms, 'ms'],
  [Time.Second, 's'],
  [Time.Minute, 'm'],
  [Time.Hour, 'h'],
  [Time.Day, 'd'],
];

/**
 * Converts a timestamp to a short string with a suffix.
 *
 * @param interval Size of interval in ms.
 * @param suffix String to append after the value.
 * @param time The timestamp to convert.
 * @param current Current formatted string. Defaults to `''`.
 *
 * @returns A tuple of the time difference and the new formatted string.
 * @example
 * const ONE_SEC_MS = 1_000;
 * const [diff, formatted] = formatTimeInterval(ONE_SEC_MS, 's', 2434, '');
 * console.log(diff, formatted); // 434, '2s'
 */
export function formatTimeInterval(
  interval: number,
  suffix: string,
  time: number,
  current = '',
): TimeInterval {
  if (time < interval) {
    return [time, current];
  }

  const count = Math.floor(time / interval);
  const diff = time - interval * count;

  return [diff, current + count + suffix];
}

/**
 * Converts a timestamp to a human readable string.
 *
 * @param time The timestamp to convert.
 * @param format Specifies how long the formatted string should be. Defaults to `'short'`.
 *
 * @returns The formatted string.
 */
// eslint-disable-next-line complexity
export function formatTime(time: number, format: TimeFormat = 'short'): string {
  if (isNaN(time) || time < 0) {
    return 'Invalid Time';
  } else if (time === 0) {
    return 'Now';
  }

  switch (format) {
    case 'ms': return `${time}ms`;
    case 's': return `${time / 1000}s`;
  }

  let timeData: TimeInterval = [time, ''];
  const canSkip = format === 'short'
    ? () => timeData[1].length > 0
    : () => false; // we can't skip if format is long

  // Go from largest (day) to smallest (ms)
  for (let i = INTERVALS.length - 1; !canSkip() && i--;) {
    timeData = formatTimeInterval(...INTERVALS[i], ...timeData);
  }

  return timeData[1];
}
