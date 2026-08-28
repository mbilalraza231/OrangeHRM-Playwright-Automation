import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { EmployeePage } from '../../pages/EmployeePage';
import { generateEmployee } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 02-create-employee.spec.ts
 *
 * Creates a new employee and verifies the name fields are saved.
 * Uses a shared page (via beforeAll) so test 3 can assert on the
 * Personal Details page that test 2 landed on after saving.
 *
 * Writes the generated employee object to test-data/runtime-state.json
 * so downstream spec files can reference the same employee.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

let page:        Page;
let context:     BrowserContext;
let employeePage: EmployeePage;
let employee:    ReturnType<typeof generateEmployee>;

test.describe.serial('Create Employee', () => {

  test.beforeAll(async ({ browser }) => {
    context      = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page         = await context.newPage();
    employeePage = new EmployeePage(page);
    employee     = generateEmployee();

    // Persist employee data so later spec files can use the same employee
    fs.writeFileSync(STATE_FILE, JSON.stringify({ employee }, null, 2));
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 2 — Fill Add Employee form and save
  // ─────────────────────────────────────────────────────────────────────────
  test('2. Create a new employee with unique data', async () => {
    await employeePage.navigateToAdd();

    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();

    // Fill name fields
    await employeePage.firstNameInput.fill(employee.firstName);
    if (employee.middleName) {
      await employeePage.middleNameInput.fill(employee.middleName);
    }
    await employeePage.lastNameInput.fill(employee.lastName);

    // Assert values before saving
    await expect(page.getByPlaceholder('First Name')).toHaveValue(employee.firstName);
    await expect(page.getByPlaceholder('Last Name')).toHaveValue(employee.lastName);

    // Save — wait for the POST response in parallel with the click
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/pim/employees') && res.request().method() === 'POST',
        { timeout: 30000 }
      ),
      employeePage.saveButton.click(),
    ]);

    expect(response.ok()).toBeTruthy();

    // Redirect to Personal Details after a successful save
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 3 — Assert name fields on the Personal Details page (same shared page)
  // ─────────────────────────────────────────────────────────────────────────
  test('3. Verify employee name fields are populated on Personal Details page', async () => {
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 10000 });

    if (employee.middleName) {
      await expect(page.getByPlaceholder('Middle Name'))
        .toHaveValue(employee.middleName);
    }

    await expect(page.getByPlaceholder('Last Name'))
      .toHaveValue(employee.lastName);
  });

});
