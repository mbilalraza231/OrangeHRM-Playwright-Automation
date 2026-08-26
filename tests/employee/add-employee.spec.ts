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

  test('admin can add a new employee successfully', async ({ employeePage, page }) => {
    // Generate a unique employee for this test run
    const employee = generateEmployee();

    // ✅ Navigate to Add Employee page
    await employeePage.navigateToAdd();

    // ✅ Verify the Add Employee form is loaded
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();

    // ✅ getByPlaceholder() — fill First Name, Last Name via POM
    // ✅ fill() — type into input fields
    await employeePage.addEmployee(employee);

    // ✅ automatic waiting — Playwright waits for the redirect after save
    // After save, OrangeHRM redirects to the Personal Details page
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });

    // ✅ getByRole() — verify we're on the personal details page
    await expect(
      page.getByRole('heading', { name: 'Personal Details' })
    ).toBeVisible();

    console.log(`Created employee: ${employee.firstName} ${employee.lastName}`);
  });

  test('add employee form shows required validation for empty fields', async ({ page }) => {
    await page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });

    // ✅ getByRole() — click Save without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();

    // ✅ getByText() — required validation messages
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
