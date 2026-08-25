# Performance Lab Angular — Frontend Optimization, Measured

> An interactive Angular 21 lab that doesn't just *claim* frontend optimization — it renders two implementations of the same dashboard in your browser and **measures the difference live**: render time, DOM nodes, scroll FPS and memory.

**Live:** https://performance-lab.alejocana.es

---

## The problem

"Optimized" claims in portfolios are usually unverifiable. This lab makes every claim falsifiable: pick a dataset size (1K / 10K / 50K rows), hit run, and watch the same data render through an unoptimized implementation (every row in the DOM) and an optimized one (virtual scrolling) — with real numbers from your own machine.

Typical results at 10,000 rows (Chrome, mid-range laptop):

| Metric | Unoptimized | Optimized |
|---|---|---|
| Initial render | ~1.0 s | ~200 ms |
| DOM nodes created | ~80,000 | ~300 (visible rows only) |
| Scroll FPS | ~10 fps | 60 fps |
| Memory delta | ~6 MB | <100 KB |

Your numbers will differ — the *magnitude* of the difference is the signal.

## The three views

### Benchmark
Renders both implementations sequentially, measures each (render time from data write to second animation frame, DOM node delta, rAF-sampled scroll FPS, heap delta), and shows a side-by-side comparison. Includes a methodology note — single-run numbers vary, and the lab says so.

### Dashboard
The actual product: KPI metrics, hand-rolled SVG charts (line, bar, donut — zero chart libraries), search and filters over the full dataset. Toggle between implementations and feel the difference; the unoptimized version renders all 10K+ rows into the DOM.

### Techniques
Every optimization applied in the lab, each with the real code from this repository, the problem it solves, and its measured impact: virtual scrolling (CDK), `@defer` lazy loading, signals + `computed`, zoneless change detection, `track` in `@for`, and bundle discipline (why there is no chart library here).

## Engineering highlights

- **Angular 21, zoneless** — no Zone.js; signals drive exact, per-consumer updates
- **Virtual scrolling** with Angular CDK — 50K rows at interactive framerates
- **`@defer` lazy loading** and the new control flow (`@if`/`@for`/`@switch`) throughout
- **Seeded deterministic data** — `mulberry32` PRNG, so every benchmark run is reproducible
- **Hand-rolled SVG charts** — a line, a bar and a donut in ~150 lines instead of a 70 KB chart library. A performance lab that ships a heavy chart library would be a contradiction
- **Dark & light theme** with system detection, no-flash boot and persistence
- **Honest methodology** — the lab documents how it measures and warns that single-run numbers vary

## Running it

```bash
pnpm install
pnpm start        # dev server at http://localhost:4200
pnpm test         # unit tests (Vitest)
pnpm build        # production build
```

## Project structure

```
src/app/
├── core/
│   ├── models.ts              # domain model + benchmark metric types
│   ├── data.service.ts        # seeded synthetic transaction generator (mulberry32)
│   ├── benchmark.ts           # measurement helpers: render timing, DOM count, FPS, memory
│   └── dashboard.store.ts     # signal store: dataset, filters, computed metrics/charts
├── sections/
│   ├── benchmark.component.ts # sequential measurement of both implementations
│   ├── dashboard.component.ts # metrics + SVG charts + filters + dual-implementation table
│   └── techniques.component.ts# optimization cards with real code from this repo
└── styles.scss                # design tokens (dark + light)
```

## Design decisions & trade-offs

- **Angular, not React.** The entire point of this lab is demonstrating Angular-specific optimization — CDK virtual scrolling, `@defer`, signals, zoneless change detection. A React rewrite would prove nothing.
- **The "unoptimized" version is not a strawman.** It is what a straightforward Angular implementation looks like: render the filtered list, no virtualization, template helper methods. That is the baseline most real dashboards ship with.
- **No chart library.** Three SVG components cover the need at zero bundle cost. If the requirements grew (tooltips, zoom, animations), Chart.js would earn its place — documented as a conscious trade-off, not dogma.
- **FPS measurement is rAF-sampled.** Scripted scrolling over a fixed window; simple and honest about its limits (documented in the methodology note).
- **Memory metrics are Chromium-only.** `performance.memory` is non-standard; the lab shows "n/a" elsewhere instead of faking it.

## Testing

Unit tests (Vitest) cover the deterministic core: the seeded generator (shape, validity, determinism) and the formatting helpers.

## License

MIT
