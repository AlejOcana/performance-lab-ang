import { TestBed } from '@angular/core/testing';
import { DataService } from './src/app/core/services/data.service';
import { DashboardStore } from './src/app/core/stores/dashboard.store';
import type { Transaction, FilterState } from './src/app/core/models/transaction.model';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateTransactions', () => {
    it('should generate the specified number of transactions', () => {
      const transactions = service.generateTransactions(100);
      expect(transactions.length).toBe(100);
    });

    it('should generate transactions with all required fields', () => {
      const transactions = service.generateTransactions(10);
      const txn = transactions[0];

      expect(txn).toHaveProperty('id');
      expect(txn).toHaveProperty('date');
      expect(txn).toHaveProperty('customer');
      expect(txn).toHaveProperty('email');
      expect(txn).toHaveProperty('amount');
      expect(txn).toHaveProperty('status');
      expect(txn).toHaveProperty('category');
      expect(txn).toHaveProperty('city');
      expect(txn).toHaveProperty('country');
      expect(txn).toHaveProperty('paymentMethod');
      expect(txn).toHaveProperty('description');
    });

    it('should generate valid transaction IDs', () => {
      const transactions = service.generateTransactions(10);
      transactions.forEach((txn) => {
        expect(txn.id).toMatch(/^TXN-\d{6}$/);
      });
    });

    it('should generate valid status values', () => {
      const transactions = service.generateTransactions(100);
      const validStatuses = ['completed', 'pending', 'failed', 'refunded'];

      transactions.forEach((txn) => {
        expect(validStatuses).toContain(txn.status);
      });
    });

    it('should generate transactions with amounts greater than 0', () => {
      const transactions = service.generateTransactions(50);
      transactions.forEach((txn) => {
        expect(txn.amount).toBeGreaterThan(0);
      });
    });

    it('should sort transactions by date descending', () => {
      const transactions = service.generateTransactions(50);
      for (let i = 1; i < transactions.length; i++) {
        const prevDate = new Date(transactions[i - 1].date);
        const currDate = new Date(transactions[i].date);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });
  });

  describe('applyFilters', () => {
    let transactions: Transaction[];

    beforeEach(() => {
      transactions = service.generateTransactions(100);
    });

    it('should return all transactions when no filters are applied', () => {
      const filters = service.getDefaultFilters();
      const filtered = service.applyFilters(transactions, filters);
      expect(filtered.length).toBe(transactions.length);
    });

    it('should filter by search term in customer name', () => {
      const firstCustomer = transactions[0].customer;
      const searchTerm = firstCustomer.split(' ')[0];

      const filtered = service.applyFilters(transactions, {
        ...service.getDefaultFilters(),
        search: searchTerm,
      });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThan(transactions.length);
    });

    it('should filter by status', () => {
      const filtered = service.applyFilters(transactions, {
        ...service.getDefaultFilters(),
        status: 'completed',
      });

      filtered.forEach((txn) => {
        expect(txn.status).toBe('completed');
      });
    });

    it('should filter by category', () => {
      const filtered = service.applyFilters(transactions, {
        ...service.getDefaultFilters(),
        category: 'electronics',
      });

      filtered.forEach((txn) => {
        expect(txn.category).toBe('electronics');
      });
    });

    it('should filter by amount range', () => {
      const filtered = service.applyFilters(transactions, {
        ...service.getDefaultFilters(),
        amountMin: 100,
        amountMax: 500,
      });

      filtered.forEach((txn) => {
        expect(txn.amount).toBeGreaterThanOrEqual(100);
        expect(txn.amount).toBeLessThanOrEqual(500);
      });
    });

    it('should combine multiple filters', () => {
      const filters: FilterState = {
        search: '',
        status: 'completed',
        category: 'electronics',
        dateRange: { start: '', end: '' },
        amountMin: 0,
        amountMax: 0,
      };

      const filtered = service.applyFilters(transactions, filters);

      filtered.forEach((txn) => {
        expect(txn.status).toBe('completed');
        expect(txn.category).toBe('electronics');
      });
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate total revenue correctly', () => {
      const transactions = service.generateTransactions(50);
      const metrics = service.calculateMetrics(transactions);

      const expectedRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(metrics.totalRevenue).toBeCloseTo(expectedRevenue, 2);
    });

    it('should calculate total transactions count', () => {
      const transactions = service.generateTransactions(50);
      const metrics = service.calculateMetrics(transactions);

      expect(metrics.totalTransactions).toBe(transactions.length);
    });

    it('should calculate average transaction value', () => {
      const transactions = service.generateTransactions(50);
      const metrics = service.calculateMetrics(transactions);

      const expectedAvg = metrics.totalRevenue / transactions.length;
      expect(metrics.averageTransaction).toBeCloseTo(expectedAvg, 2);
    });

    it('should calculate success rate correctly', () => {
      const transactions = service.generateTransactions(100);
      const metrics = service.calculateMetrics(transactions);

      const completedCount = transactions.filter(t => t.status === 'completed').length;
      const expectedRate = (completedCount / transactions.length) * 100;

      expect(metrics.successRate).toBeCloseTo(expectedRate, 1);
    });

    it('should handle empty transactions array', () => {
      const metrics = service.calculateMetrics([]);

      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.totalTransactions).toBe(0);
      expect(metrics.averageTransaction).toBe(0);
      expect(metrics.successRate).toBe(0);
    });
  });

  describe('aggregateByDate', () => {
    it('should return data for the specified number of days', () => {
      const transactions = service.generateTransactions(500);
      const chartData = service.aggregateByDate(transactions, 30);

      expect(chartData.length).toBeLessThanOrEqual(30);
    });

    it('should include revenue for each date', () => {
      const transactions = service.generateTransactions(500);
      const chartData = service.aggregateByDate(transactions, 30);

      chartData.forEach((data) => {
        expect(data).toHaveProperty('date');
        expect(data).toHaveProperty('revenue');
        expect(data).toHaveProperty('transactions');
      });
    });

    it('should sort data by date ascending', () => {
      const transactions = service.generateTransactions(500);
      const chartData = service.aggregateByDate(transactions, 30);

      for (let i = 1; i < chartData.length; i++) {
        const prevDate = new Date(chartData[i - 1].date);
        const currDate = new Date(chartData[i].date);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });
  });
});