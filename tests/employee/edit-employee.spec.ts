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

  test('admin can edit an employee detail and verify persistence after save', async ({ employeePage, page }) => {
    // ── Step 1: Create a unique employee to edit ───────────────────────────
    const employee = generateEmployee();
    await employeePage.navigateToAdd();
    await employeePage.addEmployee(employee);

    // ── Wait for redirect to Personal Details page ─────────────────────────
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // ── Step 2: Edit the Middle Name field on Personal Details form ────────
    const updatedMiddleName = 'EditedMiddle';
    const middleNameInput = page.getByPlaceholder('Middle Name');
    await middleNameInput.click();
    await middleNameInput.fill(updatedMiddleName);
    await expect(middleNameInput).toHaveValue(updatedMiddleName);

    // ── Step 3: Save Personal Details section ──────────────────────────────
    const personalDetailsForm = page.locator('form').first();
    const saveResponsePromise = page.waitForResponse(
      res => res.url().includes('personal-details') && res.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    await personalDetailsForm.getByRole('button', { name: 'Save' }).click();
    await saveResponsePromise;

    // ── Step 4: Level 3 Business Verification — Reload & assert persistence ─
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // Wait for form data hydration by checking first name loaded
    await expect(page.getByPlaceholder('First Name')).toHaveValue(employee.firstName, { timeout: 15000 });
    // Verify edited middle name persisted
    await expect(page.getByPlaceholder('Middle Name')).toHaveValue(updatedMiddleName, { timeout: 15000 });

    console.log(`Verified edited field persisted successfully: ${updatedMiddleName}`);
  });

  test('admin can navigate to edit employee page from the employee list', async ({ employeePage, page }) => {
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    const firstRow = employeePage.tableRows.first();
    await firstRow.locator('.bi-pencil-fill').click();

    await expect(page).toHaveURL(/viewPersonalDetails/);

    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  });

});
