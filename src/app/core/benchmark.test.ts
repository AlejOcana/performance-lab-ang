import { describe, expect, it } from 'vitest';
import { formatBytes, formatMs } from './benchmark';

describe('formatMs', () => {
  it('formats milliseconds under 1s', () => {
    expect(formatMs(450)).toBe('450 ms');
    expect(formatMs(1250.7)).toBe('1.25 s');
  });
});

describe('formatBytes', () => {
  it('formats KB and MB', () => {
    expect(formatBytes(0)).toBe('0 KB');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1536 * 1024)).toBe('1.5 MB');
  });
});
