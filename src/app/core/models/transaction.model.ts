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
  date: string;
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
  dateRange: {
    start: string;
    end: string;
  };
  amountMin: number;
  amountMax: number;
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
  pendingCount: number;
  failedCount: number;
}

export type Version = 'optimized' | 'unoptimized';