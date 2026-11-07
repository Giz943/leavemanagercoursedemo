import { describe, expect, it } from 'vitest';
import { isCalendarDate } from './calendar-date.ts';

describe('isCalendarDate', () => {
  it('accepts a valid YYYY-MM-DD date', () => {
    expect(isCalendarDate('2026-03-15')).toBe(true);
  });

  it('accepts 29 February in a leap year', () => {
    expect(isCalendarDate('2028-02-29')).toBe(true);
  });

  it('rejects 29 February in a non-leap year', () => {
    expect(isCalendarDate('2026-02-29')).toBe(false);
  });

  it('rejects days that do not exist', () => {
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-04-31')).toBe(false);
    expect(isCalendarDate('2026-13-01')).toBe(false);
    expect(isCalendarDate('2026-00-10')).toBe(false);
    expect(isCalendarDate('2026-01-00')).toBe(false);
  });

  it('rejects malformed values', () => {
    for (const value of ['', '2026-3-15', '15-03-2026', '2026/03/15', '2026-03-15T00:00', ' 2026-03-15', 'abcd-ef-gh']) {
      expect(isCalendarDate(value), value).toBe(false);
    }
  });

  it('treats century leap-year rules correctly', () => {
    expect(isCalendarDate('2000-02-29')).toBe(true);
    expect(isCalendarDate('2100-02-29')).toBe(false);
  });
});
