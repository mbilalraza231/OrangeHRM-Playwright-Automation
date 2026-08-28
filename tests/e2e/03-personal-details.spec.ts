import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { EmployeePage } from '../../pages/EmployeePage';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 03-personal-details.spec.ts
 *
 * Fills the Personal Details form (Nationality, Marital Status, Gender)
 * for the employee created in 02-create-employee.spec.ts, then saves.
 *
 * Reads employee data from test-data/runtime-state.json.
 * Navigates to the employee via the Employee List search → Edit flow.
 * Uses a shared page so test 4 (fill) and test 5 (save) share the form.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

const nationality   = 'Pakistani';
const maritalStatus = 'Single';

let page:         Page;
let context:      BrowserContext;
let employeePage: EmployeePage;
let employee:     EmployeeData;

test.describe.serial('Personal Details', () => {

  test.beforeAll(async ({ browser }) => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee = state.employee;

    context      = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page         = await context.newPage();
    employeePage = new EmployeePage(page);

    // Navigate to the employee's Personal Details via the List → Edit flow
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();
    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // Wait for the form to be hydrated with employee data
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 15000 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 4 — Fill Nationality, Marital Status, Gender dropdowns
  // ─────────────────────────────────────────────────────────────────────────
  test('4. Fill Nationality, Marital Status and Gender in Personal Details', async () => {
    // Nationality custom dropdown
    const nationalityDropdown = page
      .locator('.oxd-input-group', { hasText: 'Nationality' })
      .locator('.oxd-select-wrapper');

    await nationalityDropdown.click();
    await page.locator('.oxd-select-dropdown')
      .getByText(nationality, { exact: true })
      .click();

    // Marital Status custom dropdown
    const maritalStatusDropdown = page
      .locator('.oxd-input-group', { hasText: 'Marital Status' })
      .locator('.oxd-select-wrapper');

    await maritalStatusDropdown.click();
    await page.locator('.oxd-select-dropdown')
      .getByText(maritalStatus, { exact: true })
      .click();

    // Gender radio — anchored regex prevents matching "Female"
    const maleRadioWrapper = page.locator('.oxd-radio-wrapper', { hasText: /^Male$/ });
    await maleRadioWrapper.click();

    // Assertions
    await expect(nationalityDropdown).toContainText(nationality);
    await expect(maritalStatusDropdown).toContainText(maritalStatus);
    await expect(maleRadioWrapper.locator('input')).toBeChecked();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 5 — Save the Personal Details form and verify success toast
  // ─────────────────────────────────────────────────────────────────────────
  test('5. Save Personal Details and verify success toast', async () => {
    const personalDetailsForm = page.locator('form').first();

    await personalDetailsForm
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
  });

});
