import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Technique {
  title: string;
  problem: string;
  solution: string;
  code: string;
  impact: string;
}

@Component({
  selector: 'pl-techniques',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-head">
      <h1>Techniques</h1>
      <p>
        Every optimization applied in this lab, with the actual code from this repository and why it
        matters. No theory — each one is exercised by the Benchmark tab.
      </p>
    </div>

    <div class="tech-grid">
      @for (t of techniques; track t.title) {
        <article class="card">
          <h2 class="tech-title">{{ t.title }}</h2>
          <p class="tech-problem"><b>Problem.</b> {{ t.problem }}</p>
          <p class="tech-solution"><b>Solution.</b> {{ t.solution }}</p>
          <pre class="tech-code"><code>{{ t.code }}</code></pre>
          <p class="tech-impact">{{ t.impact }}</p>
        </article>
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

      .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(21rem, 1fr));
        gap: 1rem;
      }
      .card {
        background: var(--bg-1);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 1.3rem 1.4rem;
        display: flex;
        flex-direction: column;
      }
      .tech-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.02rem;
        margin-bottom: 0.7rem;
      }
      .tech-problem, .tech-solution { font-size: 0.85rem; color: var(--text-mid); margin-bottom: 0.5rem; }
      .tech-problem b, .tech-solution b { color: var(--text-hi); font-weight: 600; }
      .tech-code {
        margin: 0.6rem 0;
        background: var(--bg-0);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 0.75rem 0.9rem;
        font-family: var(--font-mono);
        font-size: 0.72rem;
        line-height: 1.55;
        color: var(--accent-soft);
        overflow-x: auto;
        white-space: pre;
      }
      .tech-impact {
        margin-top: auto;
        padding-top: 0.7rem;
        border-top: 1px solid var(--line);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--text-low);
      }
    `,
  ],
})
export class Techniques {
  readonly techniques: Technique[] = [
    {
      title: 'Virtual scrolling',
      problem:
        'Rendering 50,000 table rows creates ~500,000 DOM nodes. The tab freezes for seconds and scrolling drops to single-digit FPS.',
      solution:
        'Angular CDK renders only the rows visible in the viewport (plus a small buffer). The scroll container is fixed-height; rows are recycled as you scroll.',
      code: `<cdk-virtual-scroll-viewport [itemSize]="44">
  <table>
    <tbody>
      <tr *cdkVirtualFor="let t of rows(); track t.id">…</tr>
    </tbody>
  </table>
</cdk-virtual-scroll-viewport>`,
      impact: 'Benchmark: DOM nodes drop from hundreds of thousands to a few hundred. Scroll stays at 60 fps.',
    },
    {
      title: '@defer — lazy loading',
      problem:
        'Everything in the initial bundle ships to the user up front, even sections they may never scroll to.',
      solution:
        'Angular @defer blocks tell the compiler to split the component into a separate chunk and load it on demand, when it approaches the viewport.',
      code: `@defer (on viewport; prefetch on idle) {
  <pl-heavy-section />
} @placeholder {
  <div class="skeleton"></div>
}`,
      impact: 'Smaller initial bundle, faster first paint. The heavy work loads only when needed.',
    },
    {
      title: 'Signals + computed',
      problem:
        'Derived state recomputed on every change detection cycle, and every consumer re-evaluates whether or not inputs changed.',
      solution:
        'signal() for state, computed() for derived values. Computeds are memoized: they recompute only when their dependencies change, and consumers skip entirely when the value is identical.',
      code: `readonly filtered = computed(() => {
  const { search, status, category } = this.filters();
  // runs only when filters or data change
  return this.transactions().filter(…);
});`,
      impact: 'Filtering 50K rows happens once per filter change — not once per component check.',
    },
    {
      title: 'Zoneless change detection',
      problem:
        'Zone.js patches every async API and triggers full-app change detection after any event, whether or not anything changed.',
      solution:
        'Angular 21 runs zoneless: signals notify exact consumers, and CD is scheduled per-component graph instead of globally. No Zone.js payload either.',
      code: `// main.ts — no zone.js at all
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});`,
      impact: 'Less framework overhead per update, smaller bundle, and updates scale with the size of the change — not the size of the app.',
    },
    {
      title: 'track in @for',
      problem:
        'Default diffing treats rows by identity; re-rendering a list can destroy and recreate DOM nodes that never changed.',
      solution:
        'A stable track key tells Angular exactly which DOM node maps to which item, so updates move and patch instead of tearing down.',
      code: `@for (t of rows(); track t.id) {
  <pl-row [txn]="t" />
}`,
      impact: 'Filter changes reuse existing rows — visible in the profiler as patch, not rebuild.',
    },
    {
      title: 'Bundle discipline',
      problem:
        'Chart libraries alone can add 70–100 KB gzipped — for three charts on a dashboard.',
      solution:
        'The charts here are hand-rolled SVG components: a line, a bar and a donut, ~150 lines total, theme-aware via CSS variables.',
      code: `<svg viewBox="0 0 560 160">
  <polyline [attr.points]="linePoints()" fill="none"
            stroke="var(--accent)" stroke-width="2" />
</svg>`,
      impact: 'Zero chart-library dependencies. The whole app ships in a single lean bundle.',
    },
  ];
}
