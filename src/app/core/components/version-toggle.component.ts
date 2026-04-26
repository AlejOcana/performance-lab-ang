import { Component, inject } from '@angular/core';
import { VersionService } from '../../core/services/version.service';

@Component({
  selector: 'app-version-toggle',
  standalone: true,
  template: `
    <div class="version-toggle">
      <button 
        class="toggle-btn unopt"
        [class.active]="versionService.version() === 'unoptimized'"
        (click)="versionService.setVersion('unoptimized')"
      >
        Unoptimized
      </button>
      <button 
        class="toggle-btn opt"
        [class.active]="versionService.version() === 'optimized'"
        (click)="versionService.setVersion('optimized')"
      >
        Optimized
      </button>
    </div>
  `,
  styles: [`
    .version-toggle {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--color-secondary);
      border-radius: var(--radius-md);
      padding: 0.25rem;
    }
    .toggle-btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      background: transparent;
      color: var(--color-muted);
      border: none;
    }
    .toggle-btn:hover {
      color: var(--color-foreground);
    }
    .toggle-btn.unopt.active {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }
    .toggle-btn.opt.active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
  `]
})
export class VersionToggleComponent {
  versionService = inject(VersionService);
}