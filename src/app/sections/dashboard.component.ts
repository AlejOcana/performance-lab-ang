import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardStore } from '../core/dashboard.store';
import type { FilterState, Transaction, Version } from '../core/models';

const STATUS_COLORS: Record<string, string> = {
  completed: 'var(--ok)',
  pending: 'var(--warn)',
  failed: 'var(--danger)',
  refunded: '#a78bfa',
};

const PALETTE = ['#22d3ee', '#5eead4', '#818cf8', '#f472b6', '#fbbf24', '#4ade80', '#f87171', '#94a3b8'];

@Component({
  selector: 'pl-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="page-head">
      <h1>Dashboard</h1>
      <p>
        Same data, same features — two implementations. Toggle the version and feel the difference;
        the <b>Benchmark</b> tab measures it.
      </p>
    </div>

    <div class="version-toggle" role="tablist" aria-label="Implementation version">
      <button
        type="button" role="tab" class="vt-btn"
        [class.vt-btn--active]="version() === 'unoptimized'"
        [attr.aria-selected]="version() === 'unoptimized'"
        (click)="version.set('unoptimized')"
      >Unoptimized</button>
      <button
        type="button" role="tab" class="vt-btn"
        [class.vt-btn--active]="version() === 'optimized'"
        [attr.aria-selected]="version() === 'optimized'"
        (click)="version.set('optimized')"
      >Optimized</button>
      <span class="vt-note" [class.vt-note--bad]="version() === 'unoptimized'">
        @if (version() === 'unoptimized') {
          rendering all {{ store.filtered().length }} rows into the DOM
        } @else {
          virtual scroll — only visible rows exist
        }
      </span>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Revenue</span>
        <span class="metric-value">{{ store.metrics().totalRevenue | number: '1.0-0' }}<small> €</small></span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Transactions</span>
        <span class="metric-value">{{ store.metrics().totalTransactions }}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Avg transaction</span>
        <span class="metric-value">{{ store.metrics().averageTransaction | number: '1.2-2' }}<small> €</small></span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Success rate</span>
        <span class="metric-value">{{ store.metrics().successRate | number: '1.1-1' }}<small>%</small></span>
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <h2 class="card-title">Revenue by day</h2>
        <svg viewBox="0 0 560 160" width="100%" height="160" preserveAspectRatio="none" role="img" aria-label="Revenue over time">
          <line x1="0" [attr.y1]="138" [attr.x2]="560" [attr.y2]="138" stroke="var(--line-strong)" />
          <polygon [attr.points]="areaPoints()" fill="var(--accent-dim)" />
          <polyline [attr.points]="linePoints()" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="card">
        <h2 class="card-title">Transactions per day</h2>
        <svg viewBox="0 0 560 160" width="100%" height="160" preserveAspectRatio="none" role="img" aria-label="Transactions per day">
          @for (b of bars(); track $index) {
            <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.bw" [attr.height]="b.bh" rx="2" fill="var(--accent)" opacity="0.75" />
          }
        </svg>
      </div>
      <div class="card">
        <h2 class="card-title">Categories</h2>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Category share">
            <circle cx="60" cy="60" r="52.5" fill="none" stroke="var(--bg-2)" stroke-width="15" />
            @for (seg of segments(); track seg.category) {
              <circle
                cx="60" cy="60" r="52.5" fill="none"
                [attr.stroke]="seg.color" stroke-width="15"
                [attr.stroke-dasharray]="seg.dash" [attr.stroke-dashoffset]="seg.offset"
                transform="rotate(-90 60 60)"
              />
            }
            <text x="50%" y="48%" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="20" fill="var(--text-hi)">{{ donutTotal() }}</text>
            <text x="50%" y="62%" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1" fill="var(--text-low)">ITEMS</text>
          </svg>
          <div class="legend">
            @for (seg of segments(); track seg.category) {
              <div class="legend-item">
                <span class="swatch" [style.background]="seg.color"></span>
                <span class="legend-label">{{ seg.category }}</span>
                <span class="legend-num">{{ seg.count }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="filters">
        <input
          type="search" class="input"
          placeholder="Search customer, description, ID…"
          [value]="filters().search"
          (input)="onSearch($event)"
          aria-label="Search transactions"
        />
        <select class="select" [value]="filters().status" (change)="onStatus($event)" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select class="select" [value]="filters().category" (change)="onCategory($event)" aria-label="Filter by category">
          <option value="all">All categories</option>
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
        <span class="filters-count mono">{{ store.filtered().length }} results</span>
      </div>

      @if (version() === 'optimized') {
        <div class="table-viewport" (scroll)="onTableScroll($event)">
          <div [style.height.px]="spacerHeight()">
            <table
              class="tx-table tx-table--fixed"
              [style.transform]="'translateY(' + contentOffset() + 'px)'"
            >
              <colgroup>
                <col style="width: 11%" /><col style="width: 10%" /><col style="width: 16%" />
                <col style="width: 27%" /><col style="width: 12%" /><col style="width: 12%" />
                <col style="width: 12%" />
              </colgroup>
              <thead class="tx-head">
                <tr>
                  <th>ID</th><th>Date</th><th>Customer</th><th>Description</th>
                  <th>Amount</th><th>Status</th><th>Category</th>
                </tr>
              </thead>
              <tbody>
                @for (t of visibleRows(); track t.id) {
                  <tr [style.height.px]="rowHeight">
                    <td class="mono">{{ t.id }}</td>
                    <td class="dim">{{ t.date }}</td>
                    <td class="strong">{{ t.customer }}</td>
                    <td class="dim desc">{{ t.description }}</td>
                    <td class="mono amount">{{ t.amount | number: '1.2-2' }} €</td>
                    <td><span class="status" [style.color]="statusColor(t.status)">● {{ t.status }}</span></td>
                    <td class="dim cap">{{ t.category }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="table-viewport table-viewport--full">
          <table class="tx-table tx-table--fixed">
            <colgroup>
              <col style="width: 11%" /><col style="width: 10%" /><col style="width: 16%" />
              <col style="width: 27%" /><col style="width: 12%" /><col style="width: 12%" />
              <col style="width: 12%" />
            </colgroup>
            <thead class="tx-head">
              <tr>
                <th>ID</th><th>Date</th><th>Customer</th><th>Description</th>
                <th>Amount</th><th>Status</th><th>Category</th>
              </tr>
            </thead>
            <tbody>
              @for (t of store.filtered(); track $index) {
                <tr [style.height.px]="rowHeight">
                  <td class="mono">{{ expensiveLabel(t) }}</td>
                  <td class="dim">{{ t.date }}</td>
                  <td class="strong">{{ t.customer }}</td>
                  <td class="dim desc">{{ expensiveSummary(t) }}</td>
                  <td class="mono amount">{{ expensiveAmount(t) }}</td>
                  <td><span class="status" [style.color]="statusColor(t.status)">● {{ t.status }}</span></td>
                  <td class="dim cap">{{ t.category }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }

      .page-head { margin-bottom: 1.25rem; }
      .page-head h1 {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: clamp(1.5rem, 3vw, 2rem);
        letter-spacing: -0.02em;
      }
      .page-head p { color: var(--text-low); margin-top: 0.3rem; font-size: 0.92rem; }
      .page-head b { color: var(--text-mid); }

      .version-toggle {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }
      .vt-btn {
        padding: 0.5rem 1.1rem;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 0.86rem;
        color: var(--text-mid);
        transition: all 0.2s var(--ease-out);
      }
      .vt-btn:hover { color: var(--text-hi); }
      .vt-btn--active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
      .vt-note { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-low); margin-left: 0.4rem; }
      .vt-note--bad { color: var(--warn); }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.9rem;
        margin-bottom: 0.9rem;
      }
      .metric-card {
        background: var(--bg-1);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 0.95rem 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .metric-label {
        font-family: var(--font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-low);
      }
      .metric-value {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.35rem;
        font-variant-numeric: tabular-nums;
      }
      .metric-value small { font-size: 0.75rem; color: var(--text-low); font-weight: 400; }

      .charts-row {
        display: grid;
        grid-template-columns: 1.4fr 1.4fr 1fr;
        gap: 0.9rem;
        margin-bottom: 0.9rem;
      }
      .card {
        background: var(--bg-1);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 1.1rem 1.2rem;
        min-width: 0;
      }
      .card-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.8rem;
      }
      .donut-wrap { display: flex; align-items: center; gap: 1rem; }
      .legend { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; flex: 1; }
      .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.76rem; color: var(--text-mid); }
      .swatch { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
      .legend-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }
      .legend-num { margin-left: auto; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-low); }

      .filters {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;
      }
      .input, .select {
        background: var(--bg-0);
        border: 1px solid var(--line-strong);
        border-radius: 10px;
        padding: 0.5rem 0.75rem;
        color: var(--text-hi);
        font-size: 0.86rem;
      }
      .input { flex: 1; min-width: 12rem; }
      .input:focus, .select:focus { outline: none; border-color: var(--accent); }
      .filters-count { margin-left: auto; font-size: 0.72rem; color: var(--text-low); }

      .table-viewport {
        height: 30rem;
        border: 1px solid var(--line);
        border-radius: 10px;
        overflow: auto;
        overflow-anchor: none;
      }
      .table-viewport--full { max-height: 30rem; }
      .tx-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .tx-head th {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--bg-2);
        text-align: left;
        padding: 0 1rem;
        height: 2.4rem;
        font-family: var(--font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-low);
        border-bottom: 1px solid var(--line-strong);
      }
      .tx-table td {
        padding: 0 1rem;
        border-bottom: 1px solid var(--line);
        font-size: 0.84rem;
        white-space: nowrap;
      }
      .tx-table tbody tr:hover { background: var(--accent-dim); }
      .dim { color: var(--text-low); }
      .strong { font-weight: 500; }
      .amount { font-weight: 600; }
      .desc { max-width: 14rem; overflow: hidden; text-overflow: ellipsis; }
      .cap { text-transform: capitalize; }
      .status { font-family: var(--font-mono); font-size: 0.72rem; }

      @media (max-width: 960px) {
        .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        .charts-row { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Dashboard implements OnInit {
  readonly store = inject(DashboardStore);
  readonly version = signal<Version>('optimized');
  readonly rowHeight = 44;
  readonly categories: Transaction['category'][] = [
    'electronics', 'clothing', 'food', 'transport', 'utilities', 'entertainment', 'healthcare', 'other',
  ];
  readonly filters = computed(() => this.store.filters());

  /* ---- Hand-rolled virtual scrolling (signal-driven, zoneless-native) ----
     The spacer height is capped and the window maps proportionally, so the
     scrollbar thumb stays grabbable even with 50K rows (a 440K px track would
     make it sub-pixel). */
  readonly scrollTop = signal(0);
  private readonly viewportHeight = 480;
  private readonly buffer = 4;
  private readonly spacerCap = 20000;

  readonly totalHeight = computed(() => this.store.filtered().length * this.rowHeight);
  readonly spacerHeight = computed(() => Math.min(this.totalHeight(), this.spacerCap));
  readonly progress = computed(() => {
    const max = this.spacerHeight() - this.viewportHeight;
    return max > 0 ? Math.min(this.scrollTop() / max, 1) : 0;
  });
  readonly visibleRows = computed(() => {
    const rows = this.store.filtered();
    const visibleCount = Math.ceil(this.viewportHeight / this.rowHeight);
    const maxStart = Math.max(rows.length - visibleCount, 0);
    const start = Math.round(this.progress() * maxStart);
    return rows.slice(start, start + visibleCount + this.buffer);
  });
  /** The rendered chunk is positioned at the current scroll offset so it is always in view. */
  readonly contentOffset = computed(() => this.scrollTop());

  onTableScroll(e: Event): void {
    this.scrollTop.set((e.target as HTMLElement).scrollTop);
  }

  private readonly palette = PALETTE;

  /** Line chart geometry */
  readonly linePoints = computed(() => {
    const data = this.store.chartData();
    if (data.length === 0) return '';
    const max = Math.max(...data.map((d) => d.revenue), 1);
    const step = 560 / Math.max(data.length - 1, 1);
    return data.map((d, i) => `${i * step},${12 + (1 - d.revenue / max) * 118}`).join(' ');
  });

  readonly areaPoints = computed(() => {
    const pts = this.linePoints();
    return pts ? `0,138 ${pts} 560,138` : '';
  });

  /** Bar chart geometry */
  readonly bars = computed(() => {
    const data = this.store.chartData();
    if (data.length === 0) return [];
    const max = Math.max(...data.map((d) => d.transactions), 1);
    const bw = 560 / data.length;
    return data.map((d, i) => {
      const bh = (d.transactions / max) * 140;
      return { x: i * bw + 1, y: 160 - bh, bw: Math.max(bw - 2, 1), bh };
    });
  });

  /** Donut geometry */
  readonly donutTotal = computed(() => this.store.categoryShare().reduce((s, d) => s + d.count, 0));

  readonly segments = computed(() => {
    const data = this.store.categoryShare();
    const total = this.donutTotal() || 1;
    const c = 2 * Math.PI * 52.5;
    let offset = 0;
    return data.map((d, i) => {
      const dash = (d.count / total) * c;
      const seg = {
        category: d.category,
        count: d.count,
        color: this.palette[i % this.palette.length],
        dash: `${Math.max(dash - 2, 0)} ${c - dash + 2}`,
        offset: -offset,
      };
      offset += dash;
      return seg;
    });
  });

  ngOnInit(): void {
    if (this.store.transactions().length === 0) {
      this.store.load(10000);
    }
  }

  onSearch(e: Event): void {
    this.patch({ ...this.filters(), search: (e.target as HTMLInputElement).value });
  }
  onStatus(e: Event): void {
    this.patch({ ...this.filters(), status: (e.target as HTMLSelectElement).value as FilterState['status'] });
  }
  onCategory(e: Event): void {
    this.patch({ ...this.filters(), category: (e.target as HTMLSelectElement).value as FilterState['category'] });
  }
  private patch(f: FilterState): void {
    this.store.setFilters(f);
  }

  /** Deliberately inefficient template helpers — recomputed for every row on every CD cycle. */
  expensiveLabel(t: Transaction): string {
    return `TXN-${t.id.slice(-6).padStart(6, '0')}`;
  }
  expensiveSummary(t: Transaction): string {
    return `${t.description} — ${t.paymentMethod.replace('_', ' ')} (${t.city})`;
  }
  expensiveAmount(t: Transaction): string {
    return `${t.amount.toFixed(2)} €`;
  }
  statusColor(status: string): string {
    return STATUS_COLORS[status] ?? 'var(--text-low)';
  }
}
