import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [IconComponent, CommonModule, DecimalPipe],
  template: `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="chart-bar" size="4" />
          <span class="metric-label">Total Revenue</span>
        </div>
        <div class="metric-value">\${{ metrics.totalRevenue | number:'1.2-2' }}</div>
        <div class="metric-subtitle">All time</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="activity" size="4" />
          <span class="metric-label">Transactions</span>
        </div>
        <div class="metric-value">{{ metrics.totalTransactions | number }}</div>
        <div class="metric-subtitle">Total count</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="zap" size="4" />
          <span class="metric-label">Avg Transaction</span>
        </div>
        <div class="metric-value">\${{ metrics.averageTransaction | number:'1.2-2' }}</div>
        <div class="metric-subtitle">Per transaction</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="trending-down" size="4" />
          <span class="metric-label">Success Rate</span>
        </div>
        <div class="metric-value" [class.success]="metrics.successRate > 75" [class.warning]="metrics.successRate <= 75">
          {{ metrics.successRate | number:'1.1-1' }}%
        </div>
        <div class="metric-subtitle">{{ metrics.successRate > 75 ? 'Above target' : 'Below target' }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="zap" size="4" />
          <span class="metric-label">Pending</span>
        </div>
        <div class="metric-value">{{ metrics.pendingCount | number }}</div>
        <div class="metric-subtitle">In progress</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <app-icon name="activity" size="4" />
          <span class="metric-label">Failed</span>
        </div>
        <div class="metric-value error">{{ metrics.failedCount | number }}</div>
        <div class="metric-subtitle">Need review</div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      max-width: 80rem;
      margin-left: auto;
      margin-right: auto;
    }
    @media (min-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }
    .metric-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .metric-label {
      font-size: 0.75rem;
      color: var(--color-muted);
    }
    .metric-value {
      font-size: 1.25rem;
      font-weight: 600;
      font-family: var(--font-mono);
    }
    .metric-value.success {
      color: var(--color-accent);
    }
    .metric-value.warning {
      color: var(--color-warning);
    }
    .metric-value.error {
      color: var(--color-error);
    }
    .metric-subtitle {
      font-size: 0.75rem;
      color: var(--color-muted);
      margin-top: 0.25rem;
    }
    @media (min-width: 768px) {
      .metric-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class MetricsGridComponent {
  @Input() metrics = {
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    successRate: 0,
    pendingCount: 0,
    failedCount: 0,
  };
}