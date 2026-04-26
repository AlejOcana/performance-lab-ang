import { Component, inject, OnInit, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionService } from './core/services/version.service';
import { DashboardStore } from './core/stores/dashboard.store';
import { DashboardLayoutComponent } from './core/components/dashboard-layout.component';
import { UnoptimizedDashboardComponent } from './sections/dashboard/unoptimized/unoptimized-dashboard.component';
import { OptimizedDashboardComponent } from './sections/dashboard/optimized/optimized-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent, 
    UnoptimizedDashboardComponent, 
    OptimizedDashboardComponent,
  ],
  template: `
    <app-dashboard-layout>
      @if (versionService.version() === 'optimized') {
        <app-optimized-dashboard />
      } @else {
        <app-unoptimized-dashboard />
      }
    </app-dashboard-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App implements OnInit {
  versionService = inject(VersionService);
  private store = inject(DashboardStore);

  ngOnInit(): void {
    this.store.initializeData();
  }
}