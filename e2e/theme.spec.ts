import { expect, test } from '@playwright/test';

test('theme toggle switches and persists across reloads', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');

  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);

  await page.reload();
  expect(await html.getAttribute('data-theme')).toBe(after);
});
