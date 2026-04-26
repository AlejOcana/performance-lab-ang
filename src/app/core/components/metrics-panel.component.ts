import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface MetricData {
  label: string;
  value: string;
  improvement?: string;
}

@Component({
  selector: 'app-metrics-panel',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="metrics-panel-wrapper">
      <button (click)="onToggleClick()" class="toggle-button">
        <app-icon name="chart-bar" size="4" />
        {{ isOpen ? 'Hide Comparison' : 'Show Metrics Comparison' }}
        <app-icon name="chevron-up" size="4" [class.rotate-180]="!isOpen" />
      </button>

      <div class="metrics-panel" [class.open]="isOpen">
        <div class="panel-content">
          <div class="panel-header">
            <h3 class="panel-title">Performance Metrics Comparison</h3>
            <div class="legend">
              <span class="legend-item">
                <span class="dot yellow"></span>
                <span>Before</span>
              </span>
              <span class="legend-item">
                <span class="dot green"></span>
                <span>After</span>
              </span>
            </div>
          </div>

          <div class="metrics-grid">
          @for (metric of unoptimizedMetrics; track metric.label; let i = $index) {
            <div class="metric-card">
              <div class="metric-header">
                <app-icon [name]="metric.icon" size="3.5" />
                <span class="metric-label">{{ metric.label }}</span>
              </div>
              <div class="metric-values">
                <div class="metric-row">
                  <span class="metric-label-small">Before</span>
                  <span class="metric-value yellow">{{ metric.value }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label-small">After</span>
                  <span class="metric-value green">{{ optimizedMetrics[i].value }}</span>
                </div>
                @if (optimizedMetrics[i].improvement) {
                  <div class="improvement">{{ optimizedMetrics[i].improvement }}</div>
                }
              </div>
            </div>
          }
        </div>

        <div class="optimizations">
          <span class="optimization-label">Optimizations:</span>
          <span class="optimization-tag">✓ Dynamic imports</span>
          <span class="optimization-tag">✓ List virtualization</span>
          <span class="optimization-tag">✓ Debounced search</span>
          <span class="optimization-tag">✓ OnPush change detection</span>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-panel-wrapper {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 40;
    }
    .toggle-button {
      position: absolute;
      top: -2.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(to right, #059669, #10b981);
      color: white;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      white-space: nowrap;
    }
    @media (min-width: 768px) {
      .toggle-button {
        font-size: 0.875rem;
      }
    }
    .toggle-button:hover {
      background: linear-gradient(to right, #10b981, #34d399);
    }
    .toggle-button app-icon:last-child {
      transition: transform 0.2s;
    }
    .toggle-button app-icon:last-child:not(.rotate-180) {
      transform: rotate(180deg);
    }
    .metrics-panel {
      background: var(--color-card);
      border-top: 2px solid rgba(16, 185, 129, 0.5);
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: all 0.3s ease-out;
    }
    .metrics-panel.open {
      max-height: 20rem;
      opacity: 1;
    }
    .panel-content {
      max-width: 80rem;
      margin: 0 auto;
      padding: 1rem;
      padding-bottom: 1.5rem;
    }
    @media (min-width: 768px) {
      .panel-content {
        padding-bottom: 1rem;
      }
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .panel-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-foreground);
      margin: 0;
    }
    .legend {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-muted);
    }
    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }
    .dot.yellow { background: #fbbf24; }
    .dot.green { background: #34d399; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
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
      background: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 0.75rem;
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
    .metric-label-small {
      font-size: 0.625rem;
      color: rgba(251, 191, 36, 0.7);
    }
    .metric-values {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
    }
    .metric-value {
      font-size: 0.875rem;
      font-family: var(--font-mono);
      font-weight: 600;
    }
    .metric-value.yellow { color: #fbbf24; }
    .metric-value.green { color: #34d399; }
    .improvement {
      font-size: 0.75rem;
      color: #34d399;
      font-weight: 500;
      text-align: right;
    }
    .optimizations {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
    .optimization-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-muted);
    }
    .optimization-tag {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
  `]
})
export class MetricsPanelComponent {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  unoptimizedMetrics = [
    { label: 'Bundle', value: '~450KB', icon: 'chart-bar' },
    { label: 'DOM Nodes', value: '5,000+', icon: 'activity' },
    { label: 'Filter', value: '~340ms', icon: 'zap' },
    { label: 'Re-renders', value: '50+', icon: 'trending-down' },
    { label: 'LCP', value: '~4.2s', icon: 'zap' },
    { label: 'TBT', value: '~1.8s', icon: 'trending-down' },
  ];

  optimizedMetrics = [
    { label: 'Bundle', value: '~180KB', icon: 'chart-bar', improvement: '-60%' },
    { label: 'DOM Nodes', value: '20-30', icon: 'activity', improvement: '-99%' },
    { label: 'Filter', value: '~45ms', icon: 'zap', improvement: '-87%' },
    { label: 'Re-renders', value: '1-2', icon: 'trending-down', improvement: '-98%' },
    { label: 'LCP', value: '~2.1s', icon: 'zap', improvement: '-50%' },
    { label: 'TBT', value: '~210ms', icon: 'trending-down', improvement: '-88%' },
  ];

  onToggleClick(): void {
    this.toggle.emit();
  }
}