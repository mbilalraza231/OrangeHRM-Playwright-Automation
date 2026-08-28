import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { EmployeePage } from '../../pages/EmployeePage';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 04-edit-employee.spec.ts
 *
 * Searches for the employee created in 02, opens their Personal Details,
 * edits the Middle Name, saves, then navigates away and re-opens to verify
 * the change was persisted in the database.
 *
 * Reads employee data from test-data/runtime-state.json.
 * Uses a shared page so test 6 (edit) and test 7 (verify persistence) share state.
 */

const STATE_FILE    = path.join(__dirname, '../../test-data/runtime-state.json');
const UPDATED_MIDDLE = 'EditedMiddle';

let page:         Page;
let context:      BrowserContext;
let employeePage: EmployeePage;
let employee:     EmployeeData;

test.describe.serial('Edit Employee', () => {

  test.beforeAll(async ({ browser }) => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee = state.employee;

    context      = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page         = await context.newPage();
    employeePage = new EmployeePage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 6 — Search, open Edit, update Middle Name, save
  // ─────────────────────────────────────────────────────────────────────────
  test('6. Search employee, click Edit, update Middle Name and save', async () => {
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();
    await expect(matchingRow).toContainText(employee.firstName);
    await expect(matchingRow).toContainText(employee.lastName);

    // Open Edit (pencil icon)
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // Wait for API to hydrate the form
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 15000 });

    // Edit the Middle Name field
    const middleNameInput = page.getByPlaceholder('Middle Name');
    await middleNameInput.clear();
    await middleNameInput.fill(UPDATED_MIDDLE);
    await expect(middleNameInput).toHaveValue(UPDATED_MIDDLE);

    // Save using the first form's Save button (name section)
    const nameForm = page.locator('form').first();
    await nameForm.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Verify Middle Name on the same page after save
    await expect(page.getByPlaceholder('Middle Name'))
      .toHaveValue(UPDATED_MIDDLE, { timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 7 — Navigate away, re-open, assert Middle Name persisted in DB
  // ─────────────────────────────────────────────────────────────────────────
  test('7. Verify Middle Name persisted after navigating away and reopening', async () => {
    // Navigate away to prove data was saved to the database
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();

    // Open Edit again from a fresh load
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // Assert both values persisted in the database
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 15000 });
    await expect(page.getByPlaceholder('Middle Name'))
      .toHaveValue(UPDATED_MIDDLE, { timeout: 15000 });
  });

});
