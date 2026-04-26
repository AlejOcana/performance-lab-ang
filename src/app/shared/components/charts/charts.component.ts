import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import type { ChartDataPoint, Transaction } from '../../../core/models/transaction.model';

Chart.register(...registerables);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">Revenue Over Time</h3>
        <div class="chart-container">
          <canvas #revenueChart></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Transaction Volume</h3>
        <div class="chart-container">
          <canvas #volumeChart></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Revenue by Category</h3>
        <div class="chart-container">
          <canvas #categoryChart></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Transaction Status</h3>
        <div class="chart-container">
          <canvas #statusChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
      width: 100%;
    }
    @media (min-width: 768px) {
      .charts-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .chart-card {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      min-width: 0;
    }
    .chart-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }
    .chart-container {
      height: 12rem;
      position: relative;
    }
  `]
})
export class ChartsComponent implements OnChanges, AfterViewInit {
  @Input() chartData: ChartDataPoint[] = [];
  @Input() transactions: Transaction[] = [];

  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  private revenueChart?: Chart;
  private volumeChart?: Chart;
  private categoryChart?: Chart;
  private statusChart?: Chart;

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.revenueChart && this.volumeChart && this.categoryChart && this.statusChart) {
      this.updateCharts();
    }
  }

  private createCharts(): void {
    if (this.revenueChartRef?.nativeElement) {
      this.revenueChart = new Chart(this.revenueChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.chartData.map(d => this.formatDate(d.date)),
          datasets: [{
            data: this.chartData.map(d => d.revenue),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
          }]
        },
        options: this.getLineChartOptions('Revenue')
      });
    }

    if (this.volumeChartRef?.nativeElement) {
      this.volumeChart = new Chart(this.volumeChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.chartData.map(d => this.formatDate(d.date)),
          datasets: [{
            data: this.chartData.map(d => d.transactions),
            backgroundColor: '#10b981',
            borderRadius: 4,
          }]
        },
        options: this.getBarChartOptions()
      });
    }

    if (this.categoryChartRef?.nativeElement) {
      const categoryData = this.getCategoryData();
      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: categoryData.map(d => d.name),
          datasets: [{
            data: categoryData.map(d => d.value),
            backgroundColor: COLORS,
            borderWidth: 0,
          }]
        },
        options: this.getPieChartOptions()
      });
    }

    if (this.statusChartRef?.nativeElement) {
      const statusData = this.getStatusData();
      this.statusChart = new Chart(this.statusChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: statusData.map(d => d.name),
          datasets: [{
            data: statusData.map(d => d.value),
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 0,
          }]
        },
        options: this.getPieChartOptions()
      });
    }
  }

  private updateCharts(): void {
    if (this.revenueChart) {
      this.revenueChart.data.labels = this.chartData.map(d => this.formatDate(d.date));
      this.revenueChart.data.datasets[0].data = this.chartData.map(d => d.revenue);
      this.revenueChart.update();
    }

    if (this.volumeChart) {
      this.volumeChart.data.labels = this.chartData.map(d => this.formatDate(d.date));
      this.volumeChart.data.datasets[0].data = this.chartData.map(d => d.transactions);
      this.volumeChart.update();
    }

    if (this.categoryChart) {
      const categoryData = this.getCategoryData();
      this.categoryChart.data.labels = categoryData.map(d => d.name);
      this.categoryChart.data.datasets[0].data = categoryData.map(d => d.value);
      this.categoryChart.update();
    }

    if (this.statusChart) {
      const statusData = this.getStatusData();
      this.statusChart.data.labels = statusData.map(d => d.name);
      this.statusChart.data.datasets[0].data = statusData.map(d => d.value);
      this.statusChart.update();
    }
  }

  private getLineChartOptions(label: string): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1e2e',
          borderColor: '#2a2a3e',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `$${ctx.parsed.y?.toFixed(2) ?? 0}`
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: { color: '#6b7280', font: { size: 10 } }
        },
        y: {
          display: true,
          grid: { color: '#2a2a3e' },
          ticks: { color: '#6b7280', font: { size: 10 }, callback: (v) => `$${(+v/1000).toFixed(0)}k` }
        }
      }
    };
  }

  private getBarChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1e2e',
          borderColor: '#2a2a3e',
          borderWidth: 1,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: { color: '#6b7280', font: { size: 10 } }
        },
        y: {
          display: true,
          grid: { color: '#2a2a3e' },
          ticks: { color: '#6b7280', font: { size: 10 } }
        }
      }
    };
  }

  private getPieChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: '#1e1e2e',
          borderColor: '#2a2a3e',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `${ctx.label}: $${ctx.parsed.toFixed(2)}`
          }
        }
      }
    };
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  private getCategoryData(): Array<{name: string; value: number}> {
    const grouped: Record<string, number> = {};
    this.transactions.forEach(txn => {
      if (!grouped[txn.category]) grouped[txn.category] = 0;
      grouped[txn.category] += txn.amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }

  private getStatusData(): Array<{name: string; value: number}> {
    const grouped: Record<string, number> = { completed: 0, pending: 0, failed: 0, refunded: 0 };
    this.transactions.forEach(txn => {
      grouped[txn.status] = (grouped[txn.status] || 0) + 1;
    });
    return [
      { name: 'Completed', value: grouped['completed'] },
      { name: 'Pending', value: grouped['pending'] },
      { name: 'Failed', value: grouped['failed'] },
      { name: 'Refunded', value: grouped['refunded'] }
    ];
  }
}