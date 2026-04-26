import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <div class="metric-card">
      <div class="metric-header">
        <app-icon [name]="icon" [size]="size" />
        <span class="metric-label">{{ label }}</span>
      </div>
      <div class="metric-value">{{ value }}</div>
      <div *ngIf="change" class="metric-change" [ngClass]="changeType">
        {{ change }}
      </div>
    </div>
  `,
  styles: [`
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
      font-size: 1.5rem;
      font-weight: 600;
      font-family: var(--font-mono);
    }
    .metric-change {
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .metric-change.positive {
      color: var(--color-accent);
    }
    .metric-change.negative {
      color: var(--color-error);
    }
  `]
})
export class MetricCardComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() icon: string = 'activity';
  @Input() size: string = '4';
  @Input() change: string = '';
  @Input() changeType: 'positive' | 'negative' | '' = '';
}