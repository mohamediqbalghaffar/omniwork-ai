import { test, expect } from '@playwright/test';

test.describe('Dashboard Page E2E', () => {
  test('renders dashboard elements with proper title and app launcher cards', async ({ page }) => {
    // Navigates to app in dev or preview mode
    await page.goto('/');

    // Check titlebar presence
    const titleBar = page.locator('header');
    await expect(titleBar).toBeVisible();

    // Check Excel card
    const excelCard = page.getByRole('button', { name: /excel|ئێکسێل/i });
    await expect(excelCard).toBeVisible();

    // Check status bar
    const statusBar = page.locator('footer');
    await expect(statusBar).toBeVisible();
  });

  test('toggles language between Kurdish and English', async ({ page }) => {
    await page.goto('/');

    const enBtn = page.getByRole('button', { name: 'EN' });
    const ckbBtn = page.getByRole('button', { name: 'کو' });

    await expect(enBtn).toBeVisible();
    await expect(ckbBtn).toBeVisible();

    // Switch to English
    await enBtn.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // Switch back to Kurdish
    await ckbBtn.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
