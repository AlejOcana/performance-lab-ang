# Performance Lab Angular

A high-performance Angular 21 dashboard demonstrating frontend optimization techniques. This project showcases the difference between unoptimized and optimized implementations of a data-intensive dashboard with virtual scrolling and lazy loading.

## Features

- **Version Toggle**: Switch between unoptimized and optimized implementations
- **6 Key Metrics**: Real-time KPI cards (Revenue, Transactions, Avg Value, Conversion Rate, New Users, Active Sessions)
- **4 Interactive Charts**: Line charts, bar chart, and doughnut chart using Chart.js
- **Data Table**: Virtual scrolling with Angular CDK for handling large datasets
- **Responsive Design**: Mobile-first with breakpoints for all screen sizes

## Demo

Compare two implementations:
- **Unoptimized**: Standard Angular rendering with full table
- **Optimized**: Virtual scrolling, lazy loading with `@defer`, and optimized change detection

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

Open [http://localhost:4200](http://localhost:4200)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Development server (localhost:4200) |
| `pnpm run build` | Production build |
| `pnpm run test:unit` | Run unit tests (Vitest) |
| `pnpm run test:e2e` | Run E2E tests (Playwright) |

## Tech Stack

- **Framework**: Angular 21 (standalone components, signals)
- **Language**: TypeScript
- **Styling**: SCSS with CSS variables
- **Charts**: Chart.js
- **Virtualization**: Angular CDK
- **Testing**: Vitest + Playwright

## Architecture

- **Signals**: Reactive state management with Angular signals
- **Standalone Components**: Modern Angular architecture without NgModules
- **Control Flow**: Angular 17+ `@if`/`@for` syntax
- **Lazy Loading**: `@defer` blocks for optimized bundle loading

## License

MIT