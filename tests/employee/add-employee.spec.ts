import { test, expect } from '../../fixtures/test-fixtures';
import { generateEmployee } from '../../utils/test-data-generator';

/**
 * Add Employee Tests — Phase 6 (CRUD)
 *
 * Each test is INDEPENDENT — generates its own unique employee data
 * so tests don't depend on each other's results.
 *
 * IMPORTANT: The OrangeHRM demo database is periodically refreshed,
 * so timestamp-based unique names are used to avoid conflicts.
 */
test.describe('Add Employee', () => {

  test('admin can add a new employee successfully and verify record in employee list', async ({ employeePage, page }) => {
    // 1. Generate unique test data
    const employee = generateEmployee();

    // 2. Open Add Employee page & assert form loaded
    await employeePage.navigateToAdd();
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();

    // 3. Fill fields and assert input values
    await employeePage.firstNameInput.fill(employee.firstName);
    await expect(employeePage.firstNameInput).toHaveValue(employee.firstName);

    if (employee.middleName) {
      await employeePage.middleNameInput.fill(employee.middleName);
      await expect(employeePage.middleNameInput).toHaveValue(employee.middleName);
    }

    await employeePage.lastNameInput.fill(employee.lastName);
    await expect(employeePage.lastNameInput).toHaveValue(employee.lastName);

    // 4. Capture and assert Employee ID exists
    const employeeId = await employeePage.employeeIdInput.inputValue();
    expect(employeeId.length).toBeGreaterThan(0);

    // 5. Save and assert redirection to Personal Details
    await employeePage.saveButton.click();
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // 6. Level 3 Business Verification: Navigate to Employee List and search for created employee
    await employeePage.navigateToList();
    await employeePage.searchEmployee(employee.firstName);

    // 7. Assert employee record appears in the search results table
    const matchingRow = employeePage.tableRows.filter({ hasText: employee.firstName }).first();
    await expect(matchingRow).toBeVisible();

    console.log(`Verified employee created and found in list: ${employee.firstName} ${employee.lastName} (ID: ${employeeId})`);
  });

  test('add employee form shows required validation for empty fields', async ({ page }) => {
    await page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Required').first()).toBeVisible();
  });

  test('add employee form displays all expected UI fields, hints, and action buttons', async ({ employeePage, page }) => {
    await employeePage.navigateToAdd();

    // 1. Image upload text / dimensions hint
    await expect(employeePage.imageHintText).toBeVisible();

    // 2. Full Name inputs
    await expect(employeePage.firstNameInput).toBeVisible();
    await expect(employeePage.middleNameInput).toBeVisible();
    await expect(employeePage.lastNameInput).toBeVisible();

    // 3. Employee ID input (auto-populated by OrangeHRM)
    await expect(employeePage.employeeIdInput).toBeVisible();
    const idVal = await employeePage.employeeIdInput.inputValue();
    expect(idVal.length).toBeGreaterThan(0);

    // 4. Create Login Details switch toggle
    await expect(employeePage.createLoginDetailsSwitch).toBeVisible();

    // 5. Action Buttons (Cancel & Save)
    await expect(employeePage.cancelButton).toBeVisible();
    await expect(employeePage.saveButton).toBeVisible();

    // 6. Required indicators / footer note
    await expect(employeePage.requiredFooter).toBeVisible();
  });

});
