import { Injectable } from '@angular/core';
import type {
  Transaction,
  TransactionCategory,
  TransactionStatus,
  FilterState,
  ChartDataPoint,
  MetricsSummary,
} from '../models/transaction.model';

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Oliver', 'Sophia', 'William',
  'Isabella', 'Noah', 'Mia', 'Liam', 'Charlotte', 'Benjamin',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
];

const CITIES: Array<{ city: string; country: string }> = [
  { city: 'New York', country: 'USA' },
  { city: 'Los Angeles', country: 'USA' },
  { city: 'Chicago', country: 'USA' },
  { city: 'Houston', country: 'USA' },
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
  { city: 'Vancouver', country: 'Canada' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'Mexico City', country: 'Mexico' },
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Stockholm', country: 'Sweden' },
];

const CATEGORIES: TransactionCategory[] = [
  'electronics', 'clothing', 'food', 'transport', 'utilities', 'entertainment', 'healthcare', 'other',
];

const STATUSES: TransactionStatus[] = ['completed', 'pending', 'failed', 'refunded'];

const PAYMENT_METHODS: Transaction['paymentMethod'][] = [
  'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet',
];

const CATEGORY_DESCRIPTIONS: Record<TransactionCategory, string[]> = {
  electronics: [
    'MacBook Pro 16-inch', 'iPhone 15 Pro', 'Samsung 4K TV', 'Sony Noise-Canceling Headphones',
    'iPad Air', 'Gaming Console', 'Wireless Earbuds', 'Smart Watch',
  ],
  clothing: [
    'Designer Jacket', 'Running Shoes', 'Winter Coat', 'Business Suit',
    'Athletic Wear Set', 'Designer Handbag', 'Luxury Watch', 'Silk Shirt',
  ],
  food: [
    'Gourmet Restaurant Order', 'Weekly Grocery Delivery', 'Catering Service', 'Wine Subscription Box',
    'Organic Meal Kit', 'Premium Coffee Beans', 'Specialty Chocolate Box', 'Holiday Dinner Package',
  ],
  transport: [
    'Flight Ticket - International', 'Train Pass - Monthly', 'Car Rental - Premium', 'Uber Business Trip',
    'Metro Annual Pass', 'Taxi Service - Airport', 'Fuel Delivery', 'Parking Subscription',
  ],
  utilities: [
    'Electricity Bill', 'Internet Service - Annual', 'Water Bill - Quarterly', 'Gas Service',
    'Insurance Premium', 'Phone Plan - Unlimited', 'Cloud Storage Subscription', 'Security System',
  ],
  entertainment: [
    'Concert Tickets - VIP', 'Streaming Service - Annual', 'Gaming Subscription', 'Movie Premiere Tickets',
    'Sports Event Pass', 'Museum Membership', 'Theater Season Tickets', 'Book Bundle - Premium',
  ],
  healthcare: [
    'Doctor Consultation', 'Dental Checkup', 'Prescription Medication', 'Physical Therapy Session',
    'Eye Exam + Glasses', 'Mental Health Session', 'Health Insurance Premium', 'Vitamin Subscription',
  ],
  other: [
    'Miscellaneous Purchase', 'Gift Card - Generic', 'Donation - Charity', 'Service Fee',
    'Consulting Service', 'Professional Service', 'Subscription Renewal', 'One-time Fee',
  ],
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private seed = 42;

  private seededRandom(): () => number {
    return () => {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    };
  }

  private pickRandom<T>(arr: T[], rand: () => number): T {
    return arr[Math.floor(rand() * arr.length)];
  }

  generateTransactions(count: number = 5000): Transaction[] {
    const random = this.seededRandom();
    const transactions: Transaction[] = [];
    const baseDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    for (let i = 0; i < count; i++) {
      const category = this.pickRandom(CATEGORIES, random);
      const descriptions = CATEGORY_DESCRIPTIONS[category];
      const firstName = this.pickRandom(FIRST_NAMES, random);
      const lastName = this.pickRandom(LAST_NAMES, random);
      const location = this.pickRandom(CITIES, random);

      const dateRange = endDate.getTime() - baseDate.getTime();
      const randomDate = new Date(baseDate.getTime() + random() * dateRange);

      let amount: number;
      switch (category) {
        case 'electronics':
          amount = 100 + random() * 2000;
          break;
        case 'entertainment':
          amount = 20 + random() * 500;
          break;
        case 'food':
          amount = 10 + random() * 200;
          break;
        case 'healthcare':
          amount = 50 + random() * 800;
          break;
        default:
          amount = 20 + random() * 300;
      }

      const statusRand = random();
      let status: TransactionStatus;
      if (statusRand < 0.78) status = 'completed';
      else if (statusRand < 0.92) status = 'pending';
      else if (statusRand < 0.97) status = 'failed';
      else status = 'refunded';

      transactions.push({
        id: `TXN-${String(i + 1).padStart(6, '0')}`,
        date: randomDate.toISOString().split('T')[0],
        customer: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        amount: Math.round(amount * 100) / 100,
        status,
        category,
        city: location.city,
        country: location.country,
        paymentMethod: this.pickRandom(PAYMENT_METHODS, random),
        description: this.pickRandom(descriptions, random),
      });
    }

    return transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  applyFilters(transactions: Transaction[], filters: FilterState): Transaction[] {
    return transactions.filter((txn) => {
      if (
        filters.search &&
        !txn.customer.toLowerCase().includes(filters.search.toLowerCase()) &&
        !txn.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !txn.description.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.status !== 'all' && txn.status !== filters.status) {
        return false;
      }

      if (filters.category !== 'all' && txn.category !== filters.category) {
        return false;
      }

      if (filters.dateRange.start) {
        const filterStart = new Date(filters.dateRange.start);
        const txnDate = new Date(txn.date);
        if (txnDate < filterStart) return false;
      }

      if (filters.dateRange.end) {
        const filterEnd = new Date(filters.dateRange.end);
        const txnDate = new Date(txn.date);
        if (txnDate > filterEnd) return false;
      }

      if (filters.amountMin && txn.amount < filters.amountMin) {
        return false;
      }

      if (filters.amountMax && txn.amount > filters.amountMax) {
        return false;
      }

      return true;
    });
  }

  calculateMetrics(transactions: Transaction[]): MetricsSummary {
    const total = transactions.length;
    if (total === 0) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        successRate: 0,
        pendingCount: 0,
        failedCount: 0,
      };
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completed = transactions.filter((t) => t.status === 'completed').length;
    const pendingCount = transactions.filter((t) => t.status === 'pending').length;
    const failedCount = transactions.filter((t) => t.status === 'failed').length;

    return {
      totalRevenue,
      totalTransactions: total,
      averageTransaction: totalRevenue / total,
      successRate: (completed / total) * 100,
      pendingCount,
      failedCount,
    };
  }

  aggregateByDate(transactions: Transaction[], days: number = 30): ChartDataPoint[] {
    const grouped: Record<string, ChartDataPoint> = {};
    const recentTxns = transactions.slice(0, days * 150);

    recentTxns.forEach((txn) => {
      if (!grouped[txn.date]) {
        grouped[txn.date] = { date: txn.date, revenue: 0, transactions: 0 };
      }
      grouped[txn.date].revenue += txn.amount;
      if (txn.status === 'completed') {
        grouped[txn.date].transactions += 1;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);
  }

  getDefaultFilters(): FilterState {
    return {
      search: '',
      status: 'all',
      category: 'all',
      dateRange: { start: '', end: '' },
      amountMin: 0,
      amountMax: 0,
    };
  }
}