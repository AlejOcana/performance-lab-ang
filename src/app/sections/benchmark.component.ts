import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DataService } from '../core/data.service';
import { domNodeCount, formatBytes, formatMs, heapUsed, measureScrollFps, nextPaint } from '../core/benchmark';
import type { BenchmarkMetric, BenchmarkResult, Transaction } from '../core/models';

type Step = 'idle' | 'unoptimized' | 'optimized' | 'done';

@Component({
  selector: 'pl-benchmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="page-head">
      <h1>Benchmark</h1>
      <p>
        Renders the same dataset through two implementations and measures render time, DOM nodes,
        scroll FPS and memory. Everything runs in your browser, right now — no recorded numbers.
      </p>
    </div>

    <div class="card controls">
      <div class="sizes" role="group" aria-label="Dataset size">
        <span class="field-label">Dataset</span>
        @for (s of sizes; track s) {
          <button
            type="button"
            class="size-btn"
            [class.size-btn--on]="size() === s"
            [disabled]="running()"
            (click)="size.set(s)"
          >
            {{ s.toLocaleString('en-US') }} rows
          </button>
        }
      </div>
      <button type="button" class="btn-run" (click)="run()" [disabled]="running()">
        @if (running()) {
          <span class="spinner"></span> {{ stepLabel() }}
        } @else {
          ▶ Run benchmark
        }
      </button>
    </div>

    @if (size() >= 50000 && running()) {
      <p class="warn-note">
        ⚠ Rendering {{ size().toLocaleString('en-US') }} rows without virtualization may freeze this tab
        for a few seconds. That is exactly the problem virtual scrolling solves.
      </p>
    }

    <!-- Measurement stage: the two implementations render here while being measured -->
    <div class="card stage" [class.stage--active]="running()">
      @if (running()) {
        <div class="stage-label mono">measuring: {{ step() }} implementation</div>
        @if (showUnoptimized()) {
          <div class="viewport viewport--full" #unoptViewport>
            <table class="tx-table">
              <thead class="tx-head">
                <tr>
                  <th>ID</th><th>Date</th><th>Customer</th><th>Description</th>
                  <th>Amount</th><th>Status</th><th>Category</th>
                </tr>
              </thead>
              <tbody>
                @for (t of benchData(); track $index) {
                  <tr [style.height.px]="rowHeight">
                    <td class="mono">{{ t.id }}</td>
                    <td class="dim">{{ t.date }}</td>
                    <td>{{ t.customer }}</td>
                    <td class="dim desc">{{ t.description }}</td>
                    <td class="mono">{{ t.amount | number: '1.2-2' }} €</td>
                    <td class="dim cap">{{ t.status }}</td>
                    <td class="dim cap">{{ t.category }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (showOptimized()) {
          <div class="viewport" id="optViewport" (scroll)="onOptScroll($event)">
            <div [style.height.px]="benchTotalHeight()">
              <table class="tx-table" [style.margin-top.px]="benchWindowOffset()">
                <thead class="tx-head">
                  <tr>
                    <th>ID</th><th>Date</th><th>Customer</th><th>Description</th>
                    <th>Amount</th><th>Status</th><th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of benchVisibleRows(); track t.id) {
                    <tr [style.height.px]="rowHeight">
                      <td class="mono">{{ t.id }}</td>
                      <td class="dim">{{ t.date }}</td>
                      <td>{{ t.customer }}</td>
                      <td class="dim desc">{{ t.description }}</td>
                      <td class="mono">{{ t.amount | number: '1.2-2' }} €</td>
                      <td class="dim cap">{{ t.status }}</td>
                      <td class="dim cap">{{ t.category }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else if (result()) {
        <div class="results">
          <div class="results-head">
            <span class="mono">dataset: {{ result()!.size.toLocaleString('en-US') }} rows</span>
            <span class="mono">{{ result()!.ranAt | date: 'HH:mm:ss' }}</span>
          </div>
          @for (m of result()!.metrics; track m.key) {
            <div class="metric-row">
              <div class="metric-name">
                {{ m.label }}
                <span class="metric-unit">{{ m.lowerIsBetter ? 'lower is better' : 'higher is better' }}</span>
              </div>
              <div class="metric-bars">
                <div class="bar-line">
                  <span class="bar-tag">unopt</span>
                  <div class="bar-track">
                    <div class="bar-fill bar-fill--bad" [style.width.%]="pct(m, 'unoptimized')"></div>
                  </div>
                  <span class="bar-val">{{ format(m, 'unoptimized') }}</span>
                </div>
                <div class="bar-line">
                  <span class="bar-tag">opt</span>
                  <div class="bar-track">
                    <div class="bar-fill bar-fill--good" [style.width.%]="pct(m, 'optimized')"></div>
                  </div>
                  <span class="bar-val">{{ format(m, 'optimized') }}</span>
                </div>
              </div>
            </div>
          }
          <p class="methodology">
            Methodology: render time measured from data write to second animation frame; DOM nodes counted
            via <span class="mono">document.querySelectorAll('*')</span> delta; FPS sampled with
            requestAnimationFrame during a scripted 1.5 s scroll; memory via
            <span class="mono">performance.memory</span> (Chromium only). Single-run numbers vary between
            machines — the magnitude of the difference is the signal, not the decimals.
          </p>
        </div>
      } @else {
        <div class="empty">
          <h3>Run your first benchmark</h3>
          <p>
            Pick a dataset size and hit run. The lab renders an unoptimized table (every row in the DOM)
            and a virtualized one, and measures both.
          </p>
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
      .page-head p { color: var(--text-low); margin-top: 0.3rem; font-size: 0.92rem; max-width: 44rem; }

      .card {
        background: var(--bg-1);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 1.2rem 1.3rem;
      }
      .controls { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
      .sizes { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
      .field-label {
        font-family: var(--font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-low);
        margin-right: 0.3rem;
      }
      .size-btn {
        padding: 0.42rem 0.9rem;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        font-family: var(--font-mono);
        font-size: 0.76rem;
        color: var(--text-mid);
        transition: all 0.18s var(--ease-out);
      }
      .size-btn:hover:not(:disabled) { color: var(--text-hi); border-color: var(--accent-deep); }
      .size-btn--on { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
      .size-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .btn-run {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        margin-left: auto;
        padding: 0.65rem 1.4rem;
        border-radius: 10px;
        background: var(--accent);
        color: var(--bg-0);
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 0.9rem;
        transition: background-color 0.2s var(--ease-out), opacity 0.2s;
      }
      .btn-run:hover:not(:disabled) { background: var(--accent-soft); }
      .btn-run:disabled { opacity: 0.6; cursor: wait; }

      .spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .warn-note {
        color: var(--warn);
        font-size: 0.84rem;
        border: 1px solid rgba(251, 191, 36, 0.35);
        background: rgba(251, 191, 36, 0.07);
        border-radius: 10px;
        padding: 0.6rem 0.9rem;
        margin-bottom: 0.9rem;
      }

      .stage { min-height: 12rem; }
      .stage--active { border-color: var(--accent-deep); }
      .stage-label {
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 0.8rem;
      }
      .viewport { height: 22rem; border: 1px solid var(--line); border-radius: 10px; overflow: auto; }
      .viewport--full { max-height: 22rem; }
      .tx-table { width: 100%; border-collapse: collapse; }
      .tx-head th {
        position: sticky; top: 0; z-index: 1;
        background: var(--bg-2);
        text-align: left;
        padding: 0 0.9rem; height: 2.3rem;
        font-family: var(--font-mono); font-size: 0.62rem;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--text-low);
        border-bottom: 1px solid var(--line-strong);
      }
      .tx-table td { padding: 0 0.9rem; border-bottom: 1px solid var(--line); font-size: 0.82rem; white-space: nowrap; }
      .dim { color: var(--text-low); }
      .desc { max-width: 13rem; overflow: hidden; text-overflow: ellipsis; }
      .cap { text-transform: capitalize; }

      .results-head {
        display: flex; justify-content: space-between;
        font-size: 0.74rem; color: var(--text-low);
        margin-bottom: 1rem;
      }
      .metric-row {
        display: grid;
        grid-template-columns: 11rem 1fr;
        gap: 1rem;
        align-items: center;
        padding-block: 0.7rem;
        border-top: 1px solid var(--line);
      }
      .metric-row:first-of-type { border-top: none; }
      .metric-name { font-family: var(--font-display); font-weight: 600; font-size: 0.9rem; }
      .metric-unit { display: block; font-family: var(--font-mono); font-size: 0.64rem; font-weight: 400; color: var(--text-low); }
      .metric-bars { display: flex; flex-direction: column; gap: 0.35rem; }
      .bar-line { display: flex; align-items: center; gap: 0.6rem; }
      .bar-tag { font-family: var(--font-mono); font-size: 0.64rem; color: var(--text-low); width: 2.6rem; }
      .bar-track { flex: 1; height: 10px; border-radius: 999px; background: var(--bg-2); overflow: hidden; }
      .bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s var(--ease-out); }
      .bar-fill--bad { background: linear-gradient(90deg, var(--danger), #fb923c); }
      .bar-fill--good { background: linear-gradient(90deg, var(--accent-deep), var(--accent)); }
      .bar-val { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-mid); min-width: 4.5rem; text-align: right; }

      .methodology {
        margin-top: 1rem;
        font-size: 0.76rem;
        color: var(--text-low);
        border-top: 1px solid var(--line);
        padding-top: 0.8rem;
        line-height: 1.6;
      }

      .empty { text-align: center; padding: 2.5rem 1rem; }
      .empty h3 { font-family: var(--font-display); font-weight: 700; margin-bottom: 0.4rem; }
      .empty p { color: var(--text-low); font-size: 0.88rem; max-width: 32rem; margin-inline: auto; }

      @media (max-width: 720px) {
        .metric-row { grid-template-columns: 1fr; gap: 0.4rem; }
        .btn-run { margin-left: 0; width: 100%; }
      }
    `,
  ],
})
export class Benchmark {
  private readonly dataService = inject(DataService);

  readonly sizes = [1000, 10000, 50000];
  readonly size = signal(10000);
  readonly running = signal(false);
  readonly step = signal<'unoptimized' | 'optimized'>('unoptimized');
  readonly showUnoptimized = signal(false);
  readonly showOptimized = signal(false);
  readonly benchData = signal<Transaction[]>([]);
  readonly result = signal<BenchmarkResult | null>(null);

  readonly rowHeight = 44;

  /* ---- hand-rolled virtual scrolling for the optimized phase ---- */
  readonly benchScrollTop = signal(0);
  private readonly benchViewportHeight = 352; // 22rem
  private readonly benchBuffer = 4;

  readonly benchTotalHeight = computed(() => this.benchData().length * this.rowHeight);
  readonly benchWindowStart = computed(() =>
    Math.max(0, Math.floor(this.benchScrollTop() / this.rowHeight) - this.benchBuffer),
  );
  readonly benchVisibleRows = computed(() => {
    const rows = this.benchData();
    const start = this.benchWindowStart();
    const count = Math.ceil(this.benchViewportHeight / this.rowHeight) + this.benchBuffer * 2;
    return rows.slice(start, start + count);
  });
  readonly benchWindowOffset = computed(() => this.benchWindowStart() * this.rowHeight);

  onOptScroll(e: Event): void {
    this.benchScrollTop.set((e.target as HTMLElement).scrollTop);
  }
  private stepLabelMap: Record<string, string> = {
    unoptimized: 'unoptimized (full DOM)',
    optimized: 'optimized (virtual scroll)',
  };
  stepLabel(): string {
    return `measuring ${this.stepLabelMap[this.step()]}`;
  }

  format(m: BenchmarkMetric, version: 'unoptimized' | 'optimized'): string {
    const v = version === 'unoptimized' ? m.unoptimized : m.optimized;
    switch (m.key) {
      case 'renderTime':
        return formatMs(v);
      case 'domNodes':
        return v.toLocaleString('en-US');
      case 'scrollFps':
        return `${v} fps`;
      case 'memoryDelta':
        return v === -1 ? 'n/a' : formatBytes(v);
    }
  }

  /** Relative width for the comparison bars (0–100). */
  pct(m: BenchmarkMetric, version: 'unoptimized' | 'optimized'): number {
    const v = version === 'unoptimized' ? m.unoptimized : m.optimized;
    const max = Math.max(m.unoptimized, m.optimized, 1);
    return Math.max((v / max) * 100, 1.5);
  }

  async run(): Promise<void> {
    if (this.running()) return;
    this.running.set(true);
    this.result.set(null);

    const size = this.size();
    const data = this.dataService.generate(size, 42);
    const memAvailable = heapUsed() !== null;

    const unopt = await this.measureImplementation(data, 'unoptimized');
    const opt = await this.measureImplementation(data, 'optimized');

    const metrics: BenchmarkMetric[] = [
      {
        key: 'renderTime',
        label: 'Initial render',
        unoptimized: unopt.renderTime,
        optimized: opt.renderTime,
        unit: 'ms',
        lowerIsBetter: true,
      },
      {
        key: 'domNodes',
        label: 'DOM nodes created',
        unoptimized: unopt.domNodes,
        optimized: opt.domNodes,
        unit: 'nodes',
        lowerIsBetter: true,
      },
      {
        key: 'scrollFps',
        label: 'Scroll FPS',
        unoptimized: unopt.fps,
        optimized: opt.fps,
        unit: 'fps',
        lowerIsBetter: false,
      },
      {
        key: 'memoryDelta',
        label: 'Memory delta',
        unoptimized: memAvailable ? unopt.memory ?? -1 : -1,
        optimized: memAvailable ? opt.memory ?? -1 : -1,
        unit: 'bytes',
        lowerIsBetter: true,
      },
    ];

    this.showUnoptimized.set(false);
    this.showOptimized.set(false);
    this.benchData.set([]);
    this.result.set({
      size,
      ranAt: new Date().toISOString(),
      metrics,
      unoptimizedSupported: true,
    });
    this.running.set(false);
  }

  private async measureImplementation(
    data: Transaction[],
    which: 'unoptimized' | 'optimized',
  ): Promise<{ renderTime: number; domNodes: number; fps: number; memory: number | null }> {
    this.step.set(which);
    this.showUnoptimized.set(which === 'unoptimized');
    this.showOptimized.set(which === 'optimized');
    this.benchData.set([]);
    await nextPaint();

    const memBefore = heapUsed();
    const nodesBefore = domNodeCount();
    const t0 = performance.now();
    this.benchData.set(data);
    await nextPaint();
    const renderTime = performance.now() - t0;
    const domNodes = domNodeCount() - nodesBefore;
    const memory = memBefore !== null && heapUsed() !== null ? heapUsed()! - memBefore : null;

    await nextPaint();
    const viewport = which === 'unoptimized'
      ? (document.querySelector('.viewport--full') as HTMLElement | null)
      : (document.querySelector('#optViewport') as HTMLElement | null);

    let fps = 60;
    if (viewport) {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      if (maxScroll > 10) {
        fps = await measureScrollFps(1500, (progress) => {
          viewport.scrollTop = progress * maxScroll;
        });
      }
    }

    // clear the stage before the next phase
    this.benchData.set([]);
    await nextPaint();

    return { renderTime, domNodes, fps, memory };
  }
}
