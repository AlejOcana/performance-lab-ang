# Performance Lab — Architecture

How the lab is built, how it measures, and why.

---

## 1. Overview

A single-page Angular 21 application (zoneless, standalone, signals) with three views driven by a `signal`-based tab switcher — no router, no NgModules, no state library.

```
App (shell: topbar, tabs, theme)
├── Benchmark   — sequential measurement of both implementations
├── Dashboard   — metrics + SVG charts + filters + dual-implementation table
└── Techniques  — optimization cards with real code
```

Core layer (pure, testable):

```
core/
├── models.ts           # Transaction, FilterState, BenchmarkMetric, …
├── data.service.ts     # seeded generator (mulberry32 PRNG)
├── benchmark.ts        # measurement helpers (pure where possible)
└── dashboard.store.ts  # signal store: data, filters, computed metrics/charts
```

## 2. The two implementations

Both render the same columns from the same filtered dataset — the difference is purely *how* rows reach the DOM.

| | Unoptimized | Optimized |
|---|---|---|
| Rendering | `@for` over the **entire** filtered array | `*cdkVirtualFor` over a fixed-height viewport |
| DOM size | O(n) — 10K rows ≈ 80K nodes | O(visible) — a few hundred nodes |
| Derived state | Template helper methods (`expensiveLabel`, `expensiveSummary`, `expensiveAmount`) recomputed per row per CD cycle | Raw fields; formatting delegated to `DecimalPipe` (pure, memoized per value) |
| Track strategy | `track $index` (worst case: no DOM reuse on reorder) | `track t.id` (stable identity, DOM reuse) |

The unoptimized version is deliberately *not* a strawman: it is what a straightforward Angular implementation looks like, and the baseline most real dashboards ship with.

## 3. How measurement works

`benchmark.ts` + `Benchmark` component:

| Metric | Method |
|---|---|
| Initial render | `performance.now()` around the data write, resolved after two animation frames (`nextPaint`) — guarantees Angular has flushed the DOM |
| DOM nodes | `document.querySelectorAll('*').length` delta before/after render |
| Scroll FPS | `requestAnimationFrame` sampling during a scripted 1.5 s scroll (`scrollTop` driven), frames/second |
| Memory delta | `performance.memory.usedJSHeapSize` delta (Chromium-only; `n/a` elsewhere) |

Sequence per run: clear stage → render unoptimized → measure → clear → render optimized → measure → emit `BenchmarkResult`. The stage is emptied between phases so each measurement starts from a clean DOM.

Known limits, stated in the UI: single-run numbers vary across machines and sessions; GC noise affects memory deltas; `performance.memory` is non-standard. The lab reports magnitude, not laboratory precision.

## 4. State model

`DashboardStore` (signals, no NgRx):

```
transactions  = signal<Transaction[]>        // dataset (1K/10K/50K)
filters       = signal<FilterState>          // search, status, category
filtered      = computed<Transaction[]>      // memoized filtering
metrics       = computed<MetricsSummary>     // revenue, counts, rates
chartData     = computed<ChartDataPoint[]>   // per-day aggregation
categoryShare = computed<{category,count}[]>
```

`computed` memoization is the optimization story for derived state: filtering 50K rows happens once per filter change, not once per component check.

## 5. Zoneless change detection

The app boots with `provideZonelessChangeDetection()` — no Zone.js. Consequences:

- No global CD after every async event; signal writes schedule targeted updates
- `OnPush` + signals: components re-render only when inputs or read signals change
- Smaller bundle (no zone.js) and updates that scale with the change, not the app

One framework-level lesson learned while building this lab (documented for future readers): SVG attribute bindings (`[attr.*]`) inside child components created under a `@switch` block did not apply in this Angular version — static attributes rendered but bound ones never did, with no console error. The fix was inlining the SVG charts into the parent template, whose update pass demonstrably runs. A reminder that "it compiles" is not "it works": visual verification caught what the compiler didn't.

## 6. Data generation

`DataService.generate(count, seed)` uses `mulberry32` — a seedable PRNG — so the dataset is **deterministic**: the same seed and size always produce the same transactions. Benchmarks are reproducible and unit-testable. Names, cities, categories, statuses and amounts are sampled from realistic pools; dates spread over 90 days.

## 7. Testing

Vitest covers the deterministic core: PRNG determinism and range, generator shape/validity/coverage, and formatting helpers. UI measurement is inherently environment-dependent and is verified visually instead.

## 8. Extension points

- **More techniques**: image lazy-loading, route-level code splitting, web workers for filtering — each is one card + one demo
- **Persisted benchmarks**: runs are plain JSON; a `localStorage` history would enable before/after comparisons across machines
- **Real backend**: the generator is the only mock; a paginated API would slot behind the same store interface
