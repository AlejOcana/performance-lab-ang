/** Domain model for the transaction dashboard benchmark. */

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export type TransactionCategory =
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'other';

export interface Transaction {
  id: string;
  date: string; // ISO date
  customer: string;
  email: string;
  amount: number;
  status: TransactionStatus;
  category: TransactionCategory;
  city: string;
  country: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
  description: string;
}

export interface FilterState {
  search: string;
  status: TransactionStatus | 'all';
  category: TransactionCategory | 'all';
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface MetricsSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  successRate: number;
}

export type Version = 'optimized' | 'unoptimized';

/** One measured dimension of a benchmark run. */
export interface BenchmarkMetric {
  key: 'renderTime' | 'domNodes' | 'scrollFps' | 'memoryDelta';
  label: string;
  unoptimized: number;
  optimized: number;
  unit: string;
  /** true when lower is better (render time, DOM nodes, memory) */
  lowerIsBetter: boolean;
}

export interface BenchmarkResult {
  size: number;
  ranAt: string;
  metrics: BenchmarkMetric[];
  unoptimizedSupported: boolean;
}
