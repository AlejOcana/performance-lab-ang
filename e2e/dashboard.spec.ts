import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await expect(page.locator('.filters-count')).toContainText('10000 results', {
    timeout: 20_000,
  });
});

test('renders KPI metrics with real values', async ({ page }) => {
  const revenue = page.locator('.metric-value').first();
  await expect(revenue).not.toHaveText(/^0/);
  await expect(page.locator('.metric-card')).toHaveCount(4);
});

test('optimized virtual table renders a window of rows — never the full dataset', async ({ page }) => {
  const rows = page.locator('.table-viewport tbody tr');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(100); // 10K rows must NOT all be in the DOM
});

test('scrolling moves the virtual window and keeps rows visible', async ({ page }) => {
  const vp = page.locator('.table-viewport');
  const firstBefore = await vp.locator('tbody tr td').first().textContent();

  await vp.evaluate((el) => {
    el.scrollTop = 20000;
  });
  await page.waitForTimeout(400);

  const firstAfter = await vp.locator('tbody tr td').first().textContent();
  expect(firstAfter).not.toBe(firstBefore);

  // the first row must be INSIDE the viewport (not rendered off-screen)
  const rowBox = await vp.locator('tbody tr').first().boundingBox();
  const vpBox = await vp.boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.y).toBeGreaterThanOrEqual(vpBox!.y);
  expect(rowBox!.y).toBeLessThan(vpBox!.y + vpBox!.height);
});

test('column positions stay stable while scrolling', async ({ page }) => {
  const ths = page.locator('.tx-head th');
  const before = await ths.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().x)),
  );

  const vp = page.locator('.table-viewport');
  await vp.evaluate((el) => {
    el.scrollTop = 30000;
  });
  await page.waitForTimeout(400);

  const after = await ths.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().x)),
  );
  expect(after).toEqual(before);
});

test('search filter reduces results and updates the table', async ({ page }) => {
  await page.getByLabel('Search transactions').fill('MacBook');
  await page.waitForTimeout(400);
  const counter = await page.locator('.filters-count').textContent();
  expect(counter).not.toContain('10000 results');
  const rows = page.locator('.table-viewport tbody tr');
  await expect(rows.first()).toBeVisible();
});

test('unoptimized version renders rows as well', async ({ page }) => {
  await page.getByRole('tab', { name: 'Unoptimized' }).click();
  const rows = page.locator('.table-viewport--full tbody tr');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThan(50); // full rendering: many rows in the DOM
});
