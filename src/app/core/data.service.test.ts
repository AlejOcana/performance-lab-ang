import { describe, expect, it } from 'vitest';
import { DataService, mulberry32 } from './data.service';

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});

describe('DataService.generate', () => {
  const service = new DataService();

  it('generates exactly the requested number of transactions', () => {
    expect(service.generate(1000).length).toBe(1000);
    expect(service.generate(37).length).toBe(37);
  });

  it('is deterministic for the same seed and size', () => {
    expect(service.generate(500, 42)).toEqual(service.generate(500, 42));
  });

  it('produces valid, well-formed transactions', () => {
    const items = service.generate(500);
    for (const t of items) {
      expect(t.id).toMatch(/^TXN-\d+$/);
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.customer).toContain(' ');
      expect(t.email).toContain('@');
      expect(t.amount).toBeGreaterThanOrEqual(5);
      expect(t.amount).toBeLessThanOrEqual(1500);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.city.length).toBeGreaterThan(0);
    }
  });

  it('covers multiple statuses and categories', () => {
    const items = service.generate(1000);
    const statuses = new Set(items.map((t) => t.status));
    const categories = new Set(items.map((t) => t.category));
    expect(statuses.size).toBeGreaterThan(1);
    expect(categories.size).toBeGreaterThan(1);
  });
});
