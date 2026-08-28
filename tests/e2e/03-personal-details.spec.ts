import { test, expect } from '../../fixtures/test-fixtures';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 03-personal-details.spec.ts — Fills and saves Personal Details (Nationality, Marital Status, Gender)
 * for the employee created in 02-create-employee.spec.ts.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

const nationality   = 'Pakistani';
const maritalStatus = 'Single';

test.use({ storageState: 'playwright/.auth/user.json' });

test('4. Fill and save Personal Details, then verify success toast', async ({ employeePage, personalDetailsPage }) => {
  const state    = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  const employee = state.employee;

  await employeePage.navigateToList();
  await employeePage.verifyTableLoaded();
  await employeePage.searchEmployee(employee.firstName);

  const matchingRow = employeePage.tableRows.filter({ hasText: employee.firstName }).first();
  await expect(matchingRow).toBeVisible();
  await matchingRow.locator('.bi-pencil-fill').click();

  await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
  await expect(personalDetailsPage.heading).toBeVisible();
  await expect(personalDetailsPage.firstNameInput).toHaveValue(employee.firstName, { timeout: 15000 });

  await personalDetailsPage.selectNationality(nationality);
  await personalDetailsPage.selectMaritalStatus(maritalStatus);
  await personalDetailsPage.selectGender('Male');

  await expect(personalDetailsPage.nationalityDropdown).toContainText(nationality);
  await expect(personalDetailsPage.maritalStatusDropdown).toContainText(maritalStatus);

  await personalDetailsPage.saveForm();
});
