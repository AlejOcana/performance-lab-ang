import { Component, inject, OnInit, effect } from '@angular/core';
import { DashboardStore } from '../../../core/stores/dashboard.store';
import { MetricsGridComponent } from '../../../core/components/metrics-grid.component';
import { FilterBarComponent } from '../../../core/components/filter-bar.component';
import { ChartsComponent } from '../../../shared/components/charts/charts.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-unoptimized-dashboard',
  standalone: true,
  imports: [MetricsGridComponent, FilterBarComponent, ChartsComponent, DecimalPipe],
  template: `
    @if (store.isLoading()) {
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    } @else {
      <app-metrics-grid [metrics]="store.metrics()" />
      
      <app-charts 
        [chartData]="store.chartData()" 
        [transactions]="store.filteredTransactions()"
      />

      <app-filter-bar 
        [filters]="store.filters()"
        [totalResults]="store.filteredTransactions().length"
        (filtersChange)="onFiltersChange($event)"
      />

      <div class="table-container">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            @for (txn of store.filteredTransactions(); track txn.id) {
              <tr>
                <td class="id">{{ txn.id }}</td>
                <td class="date">{{ txn.date }}</td>
                <td class="customer">{{ txn.customer }}</td>
                <td class="description">{{ txn.description }}</td>
                <td class="amount">\${{ txn.amount | number:'1.2-2' }}</td>
                <td>
                  <span class="status-badge" [class]="txn.status">{{ txn.status }}</span>
                </td>
                <td class="category">{{ txn.category }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 16rem;
    }
    .spinner {
      width: 2rem;
      height: 2rem;
      border: 4px solid var(--color-primary);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading p {
      color: var(--color-muted);
    }
    .table-container {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      max-width: 80rem;
      margin-left: auto;
      margin-right: auto;
    }
    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }
    .transactions-table th,
    .transactions-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }
    .transactions-table th {
      background: var(--color-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--color-muted);
    }
    .transactions-table tr:last-child td {
      border-bottom: none;
    }
    .transactions-table tr:hover {
      background: var(--color-secondary);
    }
    .id {
      font-family: var(--font-mono);
      font-size: 0.875rem;
    }
    .date {
      font-size: 0.875rem;
      color: var(--color-muted);
    }
    .customer {
      font-weight: 500;
    }
    .description {
      font-size: 0.875rem;
      color: var(--color-muted);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .amount {
      font-family: var(--font-mono);
      font-weight: 600;
    }
    .category {
      font-size: 0.75rem;
      text-transform: capitalize;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-badge.completed {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .status-badge.pending {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    .status-badge.failed {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .status-badge.refunded {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }
  `]
})
export class UnoptimizedDashboardComponent {
  store = inject(DashboardStore);

  onFiltersChange(filters: any): void {
    this.store.setFilters(filters);
  }
}