import { expect, test } from '@playwright/test';

test('runs a benchmark and shows the measured comparison', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '1,000 rows' }).click();
  await page.getByRole('button', { name: /Run benchmark/ }).click();

  await expect(page.locator('.metric-row', { hasText: 'Initial render' })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.metric-row', { hasText: 'DOM nodes created' })).toBeVisible();
  await expect(page.locator('.metric-row', { hasText: 'Scroll FPS' })).toBeVisible();
  await expect(page.locator('.metric-row', { hasText: 'Memory delta' })).toBeVisible();

  // both implementations measured
  await expect(page.locator('.bar-line')).toHaveCount(8); // 4 metrics × 2 implementations

  // methodology is disclosed
  await expect(page.getByText('Methodology:')).toBeVisible();
});

test('benchmark at 10K shows a large DOM-node difference', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '10,000 rows' }).click();
  await page.getByRole('button', { name: /Run benchmark/ }).click();

  await expect(page.getByText('DOM nodes created')).toBeVisible({ timeout: 60_000 });
  const values = await page
    .locator('.metric-row', { hasText: 'DOM nodes created' })
    .locator('.bar-val')
    .allTextContents();
  const unoptimized = parseInt(values[0].replace(/\D/g, ''), 10);
  const optimized = parseInt(values[1].replace(/\D/g, ''), 10);
  expect(unoptimized).toBeGreaterThan(50_000); // full render
  expect(optimized).toBeLessThan(5_000); // virtualized
});
