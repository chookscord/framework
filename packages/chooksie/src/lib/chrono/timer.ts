import { TimeFormat, formatTime } from './format';

// @Choooks22: Probably unnecessary to lock timers.
const timerKey = Symbol('timer');
export interface TimerData {
  [timerKey]: number;
}

/**
 * Creates a new timer.
 */
export function startTimer(): TimerData {
  const now = Date.now();
  return { [timerKey]: now };
}

/**
 * Gets the time elapsed from a timer.
 */
export function endTimer(timer: TimerData, format?: TimeFormat): string {
  const end = Date.now() - timer[timerKey];
  return formatTime(end, format);
}

/**
 * Creates a timer and returns a function to get the time elapsed.
 */
export function createTimer(): (format?: TimeFormat) => string {
  const timer = startTimer();
  return format => endTimer(timer, format);
}
