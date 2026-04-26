import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon.component';
import type { FilterState, TransactionStatus, TransactionCategory } from '../models/transaction.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule, IconComponent, CommonModule, DecimalPipe],
  template: `
    <div class="filter-bar">
      <div class="filter-row">
        <div class="search-wrapper">
          <app-icon name="search" size="4" class="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, ID, or description..."
            [ngModel]="filters.search"
            (ngModelChange)="onSearchChange($event)"
            class="search-input"
          />
        </div>

        <div class="filter-controls">
          <select
            [ngModel]="filters.status"
            (ngModelChange)="onStatusChange($event)"
            class="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            [ngModel]="filters.category"
            (ngModelChange)="onCategoryChange($event)"
            class="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Other</option>
          </select>

          <button
            (click)="toggleExpanded()"
            class="filter-button"
            [class.active]="isExpanded || activeFiltersCount > 2"
          >
            <app-icon name="filter" size="4" />
            <span class="hidden md:inline">More</span>
            <span *ngIf="activeFiltersCount > 0" class="badge">{{ activeFiltersCount }}</span>
          </button>

          <button
            *ngIf="activeFiltersCount > 0"
            (click)="clearFilters()"
            class="clear-button"
          >
            <app-icon name="x" size="4" />
            Clear
          </button>
        </div>
      </div>

      <div *ngIf="isExpanded" class="filter-expanded">
        <div class="filter-group">
          <label class="filter-label">Start Date</label>
          <input
            type="date"
            [ngModel]="filters.dateRange.start"
            (ngModelChange)="onDateRangeChange('start', $event)"
            class="filter-date"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">End Date</label>
          <input
            type="date"
            [ngModel]="filters.dateRange.end"
            (ngModelChange)="onDateRangeChange('end', $event)"
            class="filter-date"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Min Amount ($)</label>
          <input
            type="number"
            placeholder="0"
            [ngModel]="filters.amountMin || ''"
            (ngModelChange)="onAmountMinChange($event)"
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Max Amount ($)</label>
          <input
            type="number"
            placeholder="No limit"
            [ngModel]="filters.amountMax || ''"
            (ngModelChange)="onAmountMaxChange($event)"
            class="filter-input"
          />
        </div>
      </div>

      <div class="filter-results">
        Showing <span>{{ totalResults | number }}</span> transactions
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      margin-bottom: 1rem;
      max-width: 80rem;
      margin-left: auto;
      margin-right: auto;
    }
    .filter-row {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .filter-row {
        flex-direction: row;
        align-items: center;
      }
    }
    .search-wrapper {
      position: relative;
      flex: 1;
      width: 100%;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted);
    }
    .search-input {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      background: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-foreground);
      font-size: 0.875rem;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .filter-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .filter-select,
    .filter-button,
    .clear-button {
      padding: 0.5rem 0.75rem;
      background: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-foreground);
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .filter-button {
      transition: all 0.2s;
    }
    .filter-button.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
    .filter-select:focus,
    .filter-button:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .badge {
      background: white;
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
    }
    .clear-button {
      background: transparent;
      color: var(--color-muted);
      border: none;
    }
    .clear-button:hover {
      color: #ef4444;
    }
    .filter-expanded {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
    @media (min-width: 768px) {
      .filter-expanded {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .filter-group {
      display: flex;
      flex-direction: column;
    }
    .filter-label {
      font-size: 0.75rem;
      color: var(--color-muted);
      margin-bottom: 0.25rem;
    }
    .filter-date,
    .filter-input {
      padding: 0.5rem 0.75rem;
      background: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-foreground);
      font-size: 0.875rem;
    }
    .filter-date:focus,
    .filter-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    .filter-results {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--color-muted);
    }
    .filter-results span {
      color: var(--color-foreground);
      font-weight: 500;
    }
    @media (min-width: 768px) {
      .hidden\\:md:inline {
        display: inline;
      }
    }
  `]
})
export class FilterBarComponent {
  @Input() filters: FilterState = {
    search: '',
    status: 'all',
    category: 'all',
    dateRange: { start: '', end: '' },
    amountMin: 0,
    amountMax: 0,
  };
  @Input() totalResults: number = 0;
  @Output() filtersChange = new EventEmitter<Partial<FilterState>>();

  isExpanded = false;

  get activeFiltersCount(): number {
    return [
      this.filters.search,
      this.filters.status !== 'all',
      this.filters.category !== 'all',
      this.filters.dateRange.start,
      this.filters.dateRange.end,
      this.filters.amountMin > 0,
      this.filters.amountMax > 0,
    ].filter(Boolean).length;
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onSearchChange(value: string): void {
    this.filtersChange.emit({ search: value });
  }

  onStatusChange(value: TransactionStatus | 'all'): void {
    this.filtersChange.emit({ status: value });
  }

  onCategoryChange(value: TransactionCategory | 'all'): void {
    this.filtersChange.emit({ category: value });
  }

  onDateRangeChange(field: 'start' | 'end', value: string): void {
    this.filtersChange.emit({
      dateRange: { ...this.filters.dateRange, [field]: value },
    });
  }

  onAmountMinChange(value: number): void {
    this.filtersChange.emit({ amountMin: value || 0 });
  }

  onAmountMaxChange(value: number): void {
    this.filtersChange.emit({ amountMax: value || 0 });
  }

  clearFilters(): void {
    this.filtersChange.emit({
      search: '',
      status: 'all',
      category: 'all',
      dateRange: { start: '', end: '' },
      amountMin: 0,
      amountMax: 0,
    });
  }
}