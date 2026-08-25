import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Benchmark } from './sections/benchmark.component';
import { Dashboard } from './sections/dashboard.component';
import { Techniques } from './sections/techniques.component';

type View = 'benchmark' | 'dashboard' | 'techniques';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Benchmark, Dashboard, Techniques],
  template: `
    <div class="app-bg" aria-hidden="true"></div>
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="logo">
          <svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M10 50 L26 22 L38 40 L54 12" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="54" cy="12" r="5" fill="var(--accent-soft)" />
          </svg>
          <span>Performance<b>Lab</b></span>
          <span class="version">Angular 21</span>
        </div>

        <div class="topbar-right">
          <span class="zone-chip mono">ZONELESS</span>
          <button
            type="button"
            class="theme-toggle"
            (click)="toggleTheme()"
            [attr.aria-label]="theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            [title]="theme() === 'dark' ? 'Light mode' : 'Dark mode'"
          >
            @if (theme() === 'dark') {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
              </svg>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            }
          </button>
        </div>

        <nav class="tabs" aria-label="Sections">
          @for (t of tabs; track t.id) {
            <button
              type="button"
              class="tab"
              [class.tab--active]="view() === t.id"
              (click)="view.set(t.id)"
              [attr.aria-current]="view() === t.id ? 'page' : undefined"
            >
              {{ t.label }}
            </button>
          }
        </nav>
      </div>
    </header>

    <main class="container main">
      @switch (view()) {
        @case ('benchmark') { <pl-benchmark /> }
        @case ('dashboard') { <pl-dashboard /> }
        @case ('techniques') { <pl-techniques /> }
      }
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <span class="mono">Angular 21 · zoneless · signals · CDK virtual scrolling</span>
        <span class="mono">Built by AlejOcana</span>
      </div>
    </footer>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--topbar-bg, rgba(10, 14, 19, 0.82));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--line);
      }
      :root[data-theme='light'] .topbar { background: rgba(246, 248, 251, 0.85); }

      .topbar-inner {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        height: 3.75rem;
        flex-wrap: wrap;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.05rem;
      }
      .logo b { color: var(--accent); font-weight: 700; }
      .logo-mark { width: 24px; height: 24px; }
      .version {
        font-family: var(--font-mono);
        font-size: 0.6rem;
        color: var(--text-low);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 0.1rem 0.45rem;
      }
      .topbar-right { display: flex; align-items: center; gap: 0.55rem; margin-left: auto; }
      .zone-chip {
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: var(--accent);
        border: 1px solid var(--accent-deep);
        background: var(--accent-dim);
        border-radius: 999px;
        padding: 0.28rem 0.65rem;
      }
      .theme-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 1px solid var(--line-strong);
        border-radius: 50%;
        color: var(--text-mid);
        transition: all 0.2s var(--ease-out);
      }
      .theme-toggle:hover { color: var(--accent); border-color: var(--accent-deep); transform: rotate(15deg); }
      .theme-toggle:active { transform: scale(0.9); }

      .tabs {
        display: flex;
        gap: 0.25rem;
        background: var(--bg-1);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 0.25rem;
      }
      .tab {
        padding: 0.42rem 1.05rem;
        border-radius: 999px;
        font-size: 0.86rem;
        font-weight: 500;
        color: var(--text-mid);
        transition: all 0.2s var(--ease-out);
      }
      .tab:hover { color: var(--text-hi); }
      .tab--active { background: var(--accent-dim); color: var(--accent); }

      .main { padding-block: 1.75rem 3rem; }

      .footer { border-top: 1px solid var(--line); padding-block: 1.2rem; }
      .footer-inner {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        font-size: 0.68rem;
        color: var(--text-low);
      }

      @media (max-width: 640px) {
        .topbar-inner { height: auto; padding-block: 0.7rem; row-gap: 0.6rem; }
        .tabs { order: 3; width: 100%; justify-content: space-between; }
        .tab { flex: 1; text-align: center; padding-inline: 0.5rem; }
      }
    `,
  ],
})
export class App {
  readonly tabs = [
    { id: 'benchmark', label: 'Benchmark' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'techniques', label: 'Techniques' },
  ] as const;

  readonly view = signal<View>('benchmark');
  readonly theme = signal<'dark' | 'light'>(
    typeof document !== 'undefined' && document.documentElement.dataset['theme'] === 'light'
      ? 'light'
      : 'dark',
  );

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('perf-lab.theme', next);
    } catch {
      /* private mode */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'light' ? '#f6f8fb' : '#0a0e13');
    this.theme.set(next);
  }
}
