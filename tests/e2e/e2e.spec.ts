import { test, expect } from '../../fixtures/test-fixtures';
import { generateEmployee } from '../../utils/test-data-generator';
import users from '../../test-data/users.json';

// This test intentionally performs its own login.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('End-to-End Business Workflows', () => {

  test('admin can execute the complete employee lifecycle and logout', async ({
    loginPage,
    dashboardPage,
    employeePage,
    leavePage,
    page,
  }) => {

    const employee = generateEmployee();

    const updatedMiddleName = 'EditedMiddle';

    // Personal Details test data
    const nationality = 'Pakistani';
    const maritalStatus = 'Single';

    // ─────────────────────────────────────────────────────────────
    // 1. LOGIN
    // ─────────────────────────────────────────────────────────────

    await test.step('1. Login with valid Admin credentials', async () => {
      await loginPage.goto();

      await expect(page).toHaveURL(/auth\/login/);
      await expect(loginPage.loginHeading).toBeVisible();

      await loginPage.login(
        users.admin.username,
        users.admin.password
      );

      // Verify login actually succeeded
      await expect(page).toHaveURL(/dashboard/);
      await expect(dashboardPage.heading).toBeVisible();
    });


    // ─────────────────────────────────────────────────────────────
    // 2. DASHBOARD
    // ─────────────────────────────────────────────────────────────

    await test.step('2. Verify Dashboard', async () => {

      await dashboardPage.verifyDashboard();

      await expect(page).toHaveURL(/dashboard/);

      await expect(dashboardPage.heading).toBeVisible();
    });


    // ─────────────────────────────────────────────────────────────
    // 3. CREATE EMPLOYEE
    // ─────────────────────────────────────────────────────────────

    await test.step('3. Create a new employee with unique data', async () => {

      await employeePage.navigateToAdd();

      await expect(page).toHaveURL(/addEmployee/);
      await expect(
        page.getByRole('heading', { name: 'Add Employee' })
      ).toBeVisible();

      // Fill employee name fields
      await employeePage.firstNameInput.fill(employee.firstName);
      if (employee.middleName) {
        await employeePage.middleNameInput.fill(employee.middleName);
      }
      await employeePage.lastNameInput.fill(employee.lastName);

      // Assert field values BEFORE clicking Save (correct order)
      await expect(page.getByPlaceholder('First Name')).toHaveValue(employee.firstName);
      await expect(page.getByPlaceholder('Last Name')).toHaveValue(employee.lastName);

      // Wait for the POST API response in parallel with the Save click
      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/pim/employees') && res.request().method() === 'POST',
          { timeout: 30000 }
        ),
        employeePage.saveButton.click(),
      ]);

      // Confirm server accepted the save (2xx)
      expect(response.ok()).toBeTruthy();

      // Now assert redirect
      await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
      await expect(
        page.getByRole('heading', { name: 'Personal Details' })
      ).toBeVisible();
    });


    // ─────────────────────────────────────────────────────────────
    // 4. VERIFY CREATED EMPLOYEE
    // ─────────────────────────────────────────────────────────────

    await test.step('4. Verify employee data was actually saved', async () => {

      const firstNameInput =
        page.getByPlaceholder('First Name');

      const middleNameInput =
        page.getByPlaceholder('Middle Name');

      const lastNameInput =
        page.getByPlaceholder('Last Name');

      await expect(firstNameInput)
        .toHaveValue(employee.firstName);

      if (employee.middleName) {
        await expect(middleNameInput)
          .toHaveValue(employee.middleName);
      }

      await expect(lastNameInput)
        .toHaveValue(employee.lastName);
    });


    // ─────────────────────────────────────────────────────────────
    // 5. PERSONAL DETAILS
    // ─────────────────────────────────────────────────────────────

    await test.step('5. Fill additional Personal Details', async () => {
      // 1. Nationality custom dropdown
      const nationalityDropdown = page
        .locator('.oxd-input-group', { hasText: 'Nationality' })
        .locator('.oxd-select-wrapper');

      await nationalityDropdown.click();
      await page.locator('.oxd-select-dropdown').getByText(nationality, { exact: true }).click();

      // 2. Marital Status custom dropdown
      const maritalStatusDropdown = page
        .locator('.oxd-input-group', { hasText: 'Marital Status' })
        .locator('.oxd-select-wrapper');

      await maritalStatusDropdown.click();
      await page.locator('.oxd-select-dropdown').getByText(maritalStatus, { exact: true }).click();

      // 3. Gender Radio Button (anchored regex to prevent matching Fe[male])
      const maleRadioWrapper = page.locator('.oxd-radio-wrapper', { hasText: /^Male$/ });
      await maleRadioWrapper.click();

      // Verify selected values
      await expect(nationalityDropdown).toContainText(nationality);
      await expect(maritalStatusDropdown).toContainText(maritalStatus);
      await expect(maleRadioWrapper.locator('input')).toBeChecked();
    });


    // ─────────────────────────────────────────────────────────────
    // 6. SAVE PERSONAL DETAILS
    // ─────────────────────────────────────────────────────────────

    await test.step('6. Save Personal Details and verify persistence', async () => {
      const personalDetailsForm = page.locator('form').first();

      await personalDetailsForm
        .getByRole('button', { name: 'Save' })
        .click();

      await expect(
        page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
      ).toBeVisible({ timeout: 15000 });
    });


    // ─────────────────────────────────────────────────────────────
    // 7. EDIT EMPLOYEE — Search → Find Row → Click Edit → Edit Middle Name
    // ─────────────────────────────────────────────────────────────

    await test.step('7. Search employee, click Edit, update Middle Name', async () => {
      // Go to Employee List
      await employeePage.navigateToList();
      await employeePage.verifyTableLoaded();

      // Search by first name → see "(1) Record Found" row
      await employeePage.searchEmployee(employee.firstName);

      const matchingRow = employeePage.tableRows
        .filter({ hasText: employee.firstName })
        .first();

      await expect(matchingRow).toBeVisible();

      // Assert the row shows the employee's name
      await expect(matchingRow).toContainText(employee.firstName);
      await expect(matchingRow).toContainText(employee.lastName);

      // Click the Edit (pencil) button on the right side of the row
      await matchingRow.locator('.bi-pencil-fill').click();

      // Should navigate to Personal Details page
      await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

      // Wait for form to hydrate before editing
      await expect(page.getByPlaceholder('First Name'))
        .toHaveValue(employee.firstName, { timeout: 15000 });

      // Edit the Middle Name field (top name form section)
      const middleNameInput = page.getByPlaceholder('Middle Name');
      await middleNameInput.clear();
      await middleNameInput.fill(updatedMiddleName);
      await expect(middleNameInput).toHaveValue(updatedMiddleName);

      // Save using the first form's Save button (employee name section)
      const nameForm = page.locator('form').first();
      await nameForm.getByRole('button', { name: 'Save' }).click();

      await expect(
        page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
      ).toBeVisible({ timeout: 15000 });
    });


    // ─────────────────────────────────────────────────────────────
    // 8. VERIFY EDIT PERSISTENCE — Search again → Click Edit → Assert value
    // ─────────────────────────────────────────────────────────────

    await test.step('8. Verify Middle Name persisted after navigating away', async () => {
      // Navigate away to Employee List to prove data was saved to the database
      await employeePage.navigateToList();
      await employeePage.verifyTableLoaded();

      // Search again
      await employeePage.searchEmployee(employee.firstName);

      const matchingRow = employeePage.tableRows
        .filter({ hasText: employee.firstName })
        .first();

      await expect(matchingRow).toBeVisible();

      // Click Edit to open Personal Details
      await matchingRow.locator('.bi-pencil-fill').click();
      await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

      // Wait for hydration — then assert the updated Middle Name is still there
      await expect(page.getByPlaceholder('First Name')).toHaveValue(employee.firstName, { timeout: 15000 });
      await expect(page.getByPlaceholder('Middle Name')).toHaveValue(updatedMiddleName, { timeout: 15000 });
    });


    // ─────────────────────────────────────────────────────────────
    // 9. LEAVE MODULE
    // ─────────────────────────────────────────────────────────────

    await test.step('9. Verify Leave module', async () => {

      await leavePage.navigateToList();

      await leavePage.verifyLeaveListLoaded();

      await leavePage.navigateToApply();

      await leavePage.verifyApplyLeaveFormLoaded();
    });


    // ─────────────────────────────────────────────────────────────
    // 10. LOGOUT
    // ─────────────────────────────────────────────────────────────

    await test.step('10. Logout and verify session termination', async () => {

      // Return somewhere where the top-bar logout control is available.
      await dashboardPage.goto();

      await dashboardPage.logout();

      await expect(page).toHaveURL(/auth\/login/);

      await expect(loginPage.loginHeading)
        .toBeVisible();

      // Verify authenticated page is no longer accessible.
      await page.goto('/web/index.php/dashboard/index');

      await expect(page).toHaveURL(/auth\/login/);
    });

  });

});