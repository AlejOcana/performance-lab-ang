import { test, expect } from '@playwright/test';

test.describe('Performance Lab Angular Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Performance Lab');
  });

  test('should display version indicator', async ({ page }) => {
    const versionIndicator = page.locator('text=UNOPTIMIZED').or(page.locator('text=OPTIMIZED'));
    await expect(versionIndicator).toBeVisible();
  });

  test('should show metrics cards', async ({ page }) => {
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    await expect(page.locator('text=Avg Transaction')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await expect(page.locator('text=Revenue Over Time')).toBeVisible();
    await expect(page.locator('text=Transaction Volume')).toBeVisible();
    await expect(page.locator('text=Revenue by Category')).toBeVisible();
    await expect(page.locator('text=Transaction Status')).toBeVisible();
  });

  test('should display transaction table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
  });

  test('should show filter bar', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should toggle version to optimized', async ({ page }) => {
    const optimizeButton = page.locator('button:has-text("Optimized")');
    await optimizeButton.click();

    await expect(page.locator('text=OPTIMIZED')).toBeVisible();
  });

  test('should show metrics comparison panel', async ({ page }) => {
    const metricsButton = page.locator('button:has-text("Show Metrics")');
    await metricsButton.click();

    await expect(page.locator('text=Performance Metrics Comparison')).toBeVisible();
  });

  test('should hide metrics panel when closed', async ({ page }) => {
    const metricsButton = page.locator('button:has-text("Show Metrics")');
    await metricsButton.click();
    await expect(page.locator('text=Performance Metrics Comparison')).toBeVisible();

    const hideButton = page.locator('button:has-text("Hide Metrics")');
    await hideButton.click();

    await expect(page.locator('text=Performance Metrics Comparison')).not.toBeVisible();
  });

  test('should filter transactions by search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill('John');
    await page.waitForTimeout(500);

    const resultsText = page.locator('text=/Showing \\d+.*transactions/');
    await expect(resultsText).toBeVisible();
  });

  test('should filter transactions by status', async ({ page }) => {
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('completed');

    const resultsText = page.locator('text=/Showing \\d+.*transactions/');
    await expect(resultsText).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Optimized Dashboard', () => {
  test('should load optimized version', async ({ page }) => {
    await page.goto('/');
    const optimizeButton = page.locator('button:has-text("Optimized")');
    await optimizeButton.click();

    await expect(page.locator('text=OPTIMIZED')).toBeVisible();
  });

  test('should show virtualized table indicator', async ({ page }) => {
    await page.goto('/');
    const optimizeButton = page.locator('button:has-text("Optimized")');
    await optimizeButton.click();

    await expect(page.locator('text=Virtualized list')).toBeVisible();
  });

  test('should display metrics with improvements', async ({ page }) => {
    await page.goto('/');
    const metricsButton = page.locator('button:has-text("Show Metrics")');
    await metricsButton.click();

    await expect(page.locator('text=-60%')).toBeVisible();
    await expect(page.locator('text=-99%')).toBeVisible();
  });
});

test.describe('Unoptimized Dashboard', () => {
  test('should load unoptimized version by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=UNOPTIMIZED')).toBeVisible();
  });

  test('should show unoptimized metrics', async ({ page }) => {
    await page.goto('/');
    const metricsButton = page.locator('button:has-text("Show Metrics")');
    await metricsButton.click();

    await expect(page.locator('text=5,000+')).toBeVisible();
    await expect(page.locator('text=~340ms')).toBeVisible();
  });
});