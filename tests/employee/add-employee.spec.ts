import { test, expect } from '../../fixtures/test-fixtures';
import { generateEmployee } from '../../utils/test-data-generator';

/**
 * Add Employee Tests
 *
 * Each test is independent — generates its own unique employee data
 * so tests don't depend on each other's results.
 */
test.describe('Add Employee', () => {

  test('admin can add a new employee successfully and verify record in employee list', async ({ employeePage, page }) => {
    const employee = generateEmployee();

    await employeePage.navigateToAdd();
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();

    await employeePage.firstNameInput.fill(employee.firstName);
    await expect(employeePage.firstNameInput).toHaveValue(employee.firstName);

    if (employee.middleName) {
      await employeePage.middleNameInput.fill(employee.middleName);
      await expect(employeePage.middleNameInput).toHaveValue(employee.middleName);
    }

    await employeePage.lastNameInput.fill(employee.lastName);
    await expect(employeePage.lastNameInput).toHaveValue(employee.lastName);

    const employeeId = await employeePage.employeeIdInput.inputValue();
    expect(employeeId.length).toBeGreaterThan(0);

    await employeePage.saveButton.click();
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();

    // Level 3 Business Verification: search the list to confirm the record was saved
    await employeePage.navigateToList();
    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows.filter({ hasText: employee.firstName }).first();
    await expect(matchingRow).toBeVisible();
  });

  test('add employee form shows required validation for empty fields', async ({ page }) => {
    await page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Required').first()).toBeVisible();
  });

  test('add employee form displays all expected UI fields, hints, and action buttons', async ({ employeePage }) => {
    await employeePage.navigateToAdd();

    await expect(employeePage.imageHintText).toBeVisible();

    await expect(employeePage.firstNameInput).toBeVisible();
    await expect(employeePage.middleNameInput).toBeVisible();
    await expect(employeePage.lastNameInput).toBeVisible();

    await expect(employeePage.employeeIdInput).toBeVisible();
    const idVal = await employeePage.employeeIdInput.inputValue();
    expect(idVal.length).toBeGreaterThan(0);

    await expect(employeePage.createLoginDetailsSwitch).toBeVisible();

    await expect(employeePage.cancelButton).toBeVisible();
    await expect(employeePage.saveButton).toBeVisible();

    await expect(employeePage.requiredFooter).toBeVisible();
  });

});
