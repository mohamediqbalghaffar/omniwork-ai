import { test, expect } from '@playwright/test';

test.describe('Workspace Page E2E', () => {
  test('navigates to workspace, performs AI request, and applies formula', async ({ page }) => {
    await page.goto('/');

    // 1. Click Excel launcher
    const excelCard = page.getByRole('button', { name: /excel|ئێکسێل/i });
    await excelCard.click();

    // 2. Verify workspace loaded
    await expect(page.locator('.spreadsheet-container')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();

    // 3. Type request in AI sidebar
    const textarea = page.locator('aside textarea');
    await textarea.fill('Sum of column A');

    // 4. Click Proceed
    const proceedBtn = page.getByRole('button', { name: /جێبەجێکردن|proceed/i });
    await proceedBtn.click();

    // 5. Result box should populate with formula
    const applyBtn = page.getByRole('button', { name: /جێبەجێکردن لە خانەدا|apply to cell/i });
    await expect(applyBtn).toBeVisible({ timeout: 10000 });

    // 6. Click apply
    await applyBtn.click();
  });
});
