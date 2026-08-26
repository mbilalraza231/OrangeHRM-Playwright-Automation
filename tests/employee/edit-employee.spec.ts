import { test, expect } from '../../fixtures/test-fixtures';
import { generateEmployee } from '../../utils/test-data-generator';

/**
 * Edit Employee Tests — Phase 6 (CRUD)
 *
 * Flow: Add a unique employee → Navigate to their profile → Edit → Save → Verify
 *
 * Each test creates its own employee to remain independent.
 * Edits a "safe" field (Nickname) that doesn't affect other system features.
 */
test.describe('Edit Employee', () => {

  test('admin can edit an employee nickname and save successfully', async ({ employeePage, page }) => {
    // ── Step 1: Create a unique employee to edit ───────────────────────────
    const employee = generateEmployee();
    await employeePage.navigateToAdd();
    await employeePage.addEmployee(employee);

    // ── Wait for redirect to Personal Details page ─────────────────────────
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });

    // ── Step 2: Edit the Nickname field on the Personal Details page ───────
    // ✅ getByRole() — locate the Nickname input by its label text nearby
    // OrangeHRM Personal Details has a "Nickname" text input
    const nicknameInput = page.locator('input.oxd-input').nth(4); // Nickname is typically the 5th input
    await nicknameInput.clear();
    await nicknameInput.fill('AutoNick');

    // ✅ getByRole() — Save button in the Personal Details form
    await page.getByRole('button', { name: 'Save' }).first().click();

    // ✅ assertions — success toast notification
    // OrangeHRM shows a green success toast after saving
    await expect(page.locator('.oxd-toast--success')).toBeVisible({ timeout: 10000 });
  });

  test('admin can navigate to edit employee page from the employee list', async ({ employeePage, page }) => {
    // ── Navigate to list and find first employee ───────────────────────────
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    // ✅ Phase 7 — parent/child locator: find row, then edit button within it
    // The pencil icon (.bi-pencil-fill) is inside an action button in each row
    const firstRow = employeePage.tableRows.first();
    await firstRow.locator('.bi-pencil-fill').click();

    // ✅ URL assertion — navigated to personal details edit page
    await expect(page).toHaveURL(/viewPersonalDetails/);

    // ✅ getByRole() — Personal Details heading confirms correct page
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  });

});
