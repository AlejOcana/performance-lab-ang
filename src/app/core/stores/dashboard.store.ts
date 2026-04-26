import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import type {
  Transaction,
  FilterState,
  ChartDataPoint,
  MetricsSummary,
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private dataService = inject(DataService);
  
  readonly transactions = signal<Transaction[]>([]);
  readonly filteredTransactions = signal<Transaction[]>([]);
  readonly chartData = signal<ChartDataPoint[]>([]);
  readonly isLoading = signal<boolean>(false);
  
  readonly filters = signal<FilterState>(this.dataService.getDefaultFilters());
  
  readonly metrics = computed<MetricsSummary>(() => {
    const filtered = this.filteredTransactions();
    return this.dataService.calculateMetrics(filtered);
  });

  setFilters(newFilters: Partial<FilterState>): void {
    this.filters.update(f => ({ ...f, ...newFilters }));
    this.applyCurrentFilters();
  }

  applyCurrentFilters(): void {
    const currentFilters = this.filters();
    const filtered = this.dataService.applyFilters(this.transactions(), currentFilters);
    const chartData = this.dataService.aggregateByDate(filtered, 30);
    
    this.filteredTransactions.set(filtered);
    this.chartData.set(chartData);
  }

  initializeData(): void {
    this.isLoading.set(true);
    
    const transactions = this.dataService.generateTransactions(5000);
    const currentFilters = this.filters();
    const filtered = this.dataService.applyFilters(transactions, currentFilters);
    const chartData = this.dataService.aggregateByDate(transactions, 30);
    
    this.transactions.set(transactions);
    this.filteredTransactions.set(filtered);
    this.chartData.set(chartData);
    this.isLoading.set(false);
  }

  getMetrics(): MetricsSummary {
    return this.metrics();
  }
}