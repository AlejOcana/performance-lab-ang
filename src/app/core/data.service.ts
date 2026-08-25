/** Seeded synthetic transaction generator — deterministic, so benchmarks are reproducible. */
import { Injectable } from '@angular/core';
import type { Transaction, TransactionCategory, TransactionStatus } from './models';

/** mulberry32 — small, fast, seedable PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Emma', 'Oliver',
  'Sophia', 'Isabella', 'Noah', 'Mia', 'Liam', 'Charlotte', 'Benjamin', 'Amelia',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
];

const CITIES: Array<{ city: string; country: string }> = [
  { city: 'New York', country: 'USA' },
  { city: 'Los Angeles', country: 'USA' },
  { city: 'Chicago', country: 'USA' },
  { city: 'Miami', country: 'USA' },
  { city: 'London', country: 'UK' },
  { city: 'Manchester', country: 'UK' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Munich', country: 'Germany' },
  { city: 'Paris', country: 'France' },
  { city: 'Madrid', country: 'Spain' },
  { city: 'Barcelona', country: 'Spain' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Stockholm', country: 'Sweden' },
];

const CATEGORIES: TransactionCategory[] = [
  'electronics', 'clothing', 'food', 'transport', 'utilities', 'entertainment', 'healthcare', 'other',
];

const STATUSES: TransactionStatus[] = ['completed', 'completed', 'completed', 'pending', 'failed', 'refunded'];

const PAYMENT_METHODS: Transaction['paymentMethod'][] = [
  'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet',
];

const DESCRIPTIONS: Record<TransactionCategory, string[]> = {
  electronics: ['MacBook Pro 16"', 'iPhone 15 Pro', '4K UHD TV', 'Noise-canceling headphones', 'Mechanical keyboard'],
  clothing: ['Winter jacket', 'Running shoes', 'Wool sweater', 'Leather boots', 'Sports kit'],
  food: ['Weekly grocery order', 'Restaurant gift card', 'Coffee subscription', 'Catering service'],
  transport: ['Flight MAD→BER', 'Monthly metro pass', 'Airport taxi', 'Train ticket', 'Car rental'],
  utilities: ['Electricity bill', 'Fiber internet', 'Mobile plan', 'Water bill'],
  entertainment: ['Concert tickets', 'Streaming plan', 'Museum pass', 'Videogame'],
  healthcare: ['Dental cleaning', 'Physio session', 'Pharmacy order', 'Health insurance'],
  other: ['Consulting fee', 'Online course', 'Donation', 'Gift card'],
};

@Injectable({ providedIn: 'root' })
export class DataService {
  /** Generates `count` deterministic transactions spread over ~90 days. */
  generate(count: number, seed = 42): Transaction[] {
    const rand = mulberry32(seed);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const items: Transaction[] = new Array(count);

    for (let i = 0; i < count; i++) {
      const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
      const customer = `${first} ${last}`;
      const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
      const descriptions = DESCRIPTIONS[category];
      const place = CITIES[Math.floor(rand() * CITIES.length)];
      const date = new Date(now - Math.floor(rand() * 90) * day - Math.floor(rand() * day));

      items[i] = {
        id: `TXN-${String(100000 + i)}`,
        date: date.toISOString().slice(0, 10),
        customer,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        amount: Math.round((5 + rand() * 1495) * 100) / 100,
        status: STATUSES[Math.floor(rand() * STATUSES.length)],
        category,
        city: place.city,
        country: place.country,
        paymentMethod: PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)],
        description: descriptions[Math.floor(rand() * descriptions.length)],
      };
    }
    return items;
  }
}
