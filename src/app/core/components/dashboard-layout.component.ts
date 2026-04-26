import { Component, inject, signal } from '@angular/core';
import { VersionService } from '../services/version.service';
import { VersionToggleComponent } from './version-toggle.component';
import { MetricsPanelComponent } from './metrics-panel.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [VersionToggleComponent, MetricsPanelComponent],
  template: `
    <div class="layout" [class.unoptimized]="versionService.version() === 'unoptimized'">
      <header class="header">
        <div class="header-content">
          <div class="header-title">
            <div class="title-row">
              <h1>Performance Lab</h1>
              <span class="author">by Alejandro Ocaña Garcia</span>
            </div>
            <p class="subtitle">Frontend Optimization Case Study</p>
          </div>

          <div class="header-actions">
            <span 
              class="version-badge"
              [class.optimized]="versionService.version() === 'optimized'"
            >
              {{ versionService.version() === 'optimized' ? 'OPTIMIZED' : 'UNOPTIMIZED' }}
            </span>

            <button 
              class="metrics-button"
              (click)="toggleMetrics()"
              title="Toggle metrics panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            <div class="version-toggle-wrapper">
              <app-version-toggle />
            </div>
          </div>
        </div>
      </header>

      <main class="main">
        <ng-content></ng-content>
      </main>

      <footer class="footer">
        <p>Performance Lab — Demonstrating frontend optimization techniques</p>
      </footer>

      <app-metrics-panel 
        [isOpen]="metricsOpen()"
        (toggle)="toggleMetrics()"
      />
    </div>
  `,
  styles: [`
    .layout {
      background: var(--color-background);
      position: relative;
      min-height: 100vh;
    }
    .header {
      background: var(--color-card);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .header-content {
      max-width: 80rem;
      margin: 0 auto;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .header-content {
        padding: 1rem 1.5rem;
      }
    }
    .header-title {
      min-width: 0;
      flex: 1;
    }
    .header-title .title-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .header-title h1 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      white-space: nowrap;
    }
    @media (min-width: 768px) {
      .header-title h1 {
        font-size: 1.25rem;
      }
    }
    .header-title .author {
      font-size: 0.75rem;
      color: var(--color-muted);
      display: none;
    }
    @media (min-width: 768px) {
      .header-title .author {
        display: inline;
      }
    }
    .header-title .subtitle {
      font-size: 0.75rem;
      color: var(--color-muted);
      margin: 0;
      display: none;
    }
    @media (min-width: 768px) {
      .header-title .subtitle {
        display: block;
      }
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    @media (min-width: 768px) {
      .header-actions {
        gap: 1rem;
      }
    }
    .version-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.625rem;
      border-radius: var(--radius-sm);
      border: 1px solid;
    }
    @media (min-width: 768px) {
      .version-badge {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
      }
    }
    .version-badge:not(.optimized) {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }
    .version-badge.optimized {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.3);
      color: #10b981;
    }
    .metrics-button {
      padding: 0.375rem;
      background: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metrics-button:hover {
      background: var(--color-border);
    }
    @media (min-width: 768px) {
      .metrics-button {
        padding: 0.5rem;
      }
    }
    .version-toggle-wrapper {
      display: block;
    }
    @media (min-width: 768px) {
      .version-toggle-wrapper {
        display: block;
      }
    }
    .main {
      max-width: 80rem;
      margin: 0 auto;
      padding: 1rem 1rem;
      padding-bottom: 4rem;
    }
    @media (min-width: 768px) {
      .main {
        padding: 1.5rem 1.5rem;
      }
    }
    .footer {
      background: var(--color-card);
      border-top: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      text-align: center;
    }
    @media (min-width: 768px) {
      .footer {
        padding: 0.75rem 1.5rem;
      }
    }
    .footer p {
      font-size: 0.75rem;
      color: var(--color-muted);
      margin: 0;
    }
    @media (min-width: 768px) {
      .footer p {
        font-size: 0.875rem;
      }
    }
  `]
})
export class DashboardLayoutComponent {
  versionService = inject(VersionService);
  metricsOpen = signal(false);

  toggleMetrics(): void {
    this.metricsOpen.update(v => !v);
  }
}