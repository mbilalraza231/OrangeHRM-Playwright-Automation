import { test, expect } from '../../fixtures/test-fixtures';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 03-personal-details.spec.ts
 *
 * Fills and saves the Personal Details form (Nationality, Marital Status, Gender)
 * for the employee created in 02-create-employee.spec.ts.
 *
 * Reads employee data from test-data/runtime-state.json.
 * Navigates to the employee via the Employee List search → Edit flow.
 * Uses PersonalDetailsPage POM for interaction.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

const nationality   = 'Pakistani';
const maritalStatus = 'Single';

test.use({ storageState: 'playwright/.auth/user.json' });

test('4. Fill and save Personal Details, then verify success toast', async ({ employeePage, personalDetailsPage }) => {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const employee = state.employee;

  // 1. Navigate to the employee's Personal Details via the List → Edit flow
  await employeePage.navigateToList();
  await employeePage.verifyTableLoaded();
  await employeePage.searchEmployee(employee.firstName);

  const matchingRow = employeePage.tableRows
    .filter({ hasText: employee.firstName })
    .first();

  await expect(matchingRow).toBeVisible();
  await matchingRow.locator('.bi-pencil-fill').click();

  // Redirect to Personal Details after clicking Edit
  await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
  await expect(personalDetailsPage.heading).toBeVisible();

  // 2. Wait for the form to be hydrated with employee data before filling
  await expect(personalDetailsPage.firstNameInput)
    .toHaveValue(employee.firstName, { timeout: 15000 });

  // 3. Fill Nationality, Marital Status and Gender dropdowns using POM
  await personalDetailsPage.selectNationality(nationality);
  await personalDetailsPage.selectMaritalStatus(maritalStatus);
  await personalDetailsPage.selectGender('Male');

  // Verify dropdown selections in UI before save
  await expect(personalDetailsPage.nationalityDropdown).toContainText(nationality);
  await expect(personalDetailsPage.maritalStatusDropdown).toContainText(maritalStatus);

  // 4. Save and verify toast
  await personalDetailsPage.saveForm();
});
