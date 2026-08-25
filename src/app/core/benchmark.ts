/** Benchmark measurement helpers — render time, DOM nodes, scroll FPS, memory delta. */

export interface MemoryInfo {
  usedJSHeapSize: number;
}

/** Chrome-only API; returns undefined elsewhere. */
export function heapUsed(): number | null {
  const perf = performance as unknown as { memory?: MemoryInfo };
  return perf.memory?.usedJSHeapSize ?? null;
}

export function domNodeCount(): number {
  return document.querySelectorAll('*').length;
}

/**
 * Samples frames-per-second while `scrollFn` drives scrolling, for `durationMs`.
 * Returns the average FPS over the sampling window.
 */
export function measureScrollFps(durationMs: number, scrollFn: (progress: number) => void): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    let frames = 0;
    const tick = (now: number) => {
      frames++;
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      scrollFn(progress);
      if (elapsed < durationMs) {
        requestAnimationFrame(tick);
      } else {
        resolve(Math.round((frames / durationMs) * 1000));
      }
    };
    requestAnimationFrame(tick);
  });
}

/** Waits two animation frames — enough for Angular to flush the DOM after a signal write. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  const kb = bytes / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}
