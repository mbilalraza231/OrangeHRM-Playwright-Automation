import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { LoginPage }     from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { EmployeePage }  from '../../pages/EmployeePage';
import { LeavePage }     from '../../pages/LeavePage';
import { generateEmployee } from '../../utils/test-data-generator';

/**
 * OrangeHRM — End-to-End Business Workflow
 *
 * Strategy: test.describe.serial + ONE shared page (via beforeAll browser fixture).
 *
 * Why one shared page?
 *   With test.describe.serial each test() normally gets its OWN fresh `page`
 *   from the fixture, so page state (URL, form data, etc.) is lost between
 *   tests.  By creating a single BrowserContext + Page in beforeAll and
 *   instantiating all Page Objects against it, every test in this describe
 *   block shares the same browser tab and carries state forward naturally.
 *
 * Benefits:
 *   • Each test appears as an individual row in the HTML report (pass/fail).
 *   • Failing test N automatically skips N+1..end (serial behaviour).
 *   • The browser stays open for the full suite — exactly like the old monolith.
 */

// ─── Shared state (populated in beforeAll) ────────────────────────────────────
let page:          Page;
let context:       BrowserContext;
let loginPage:     LoginPage;
let dashboardPage: DashboardPage;
let employeePage:  EmployeePage;
let leavePage:     LeavePage;
let employee:      ReturnType<typeof generateEmployee>;

const updatedMiddleName = 'EditedMiddle';
const nationality       = 'Pakistani';
const maritalStatus     = 'Single';
// ─────────────────────────────────────────────────────────────────────────────

test.describe.serial('OrangeHRM E2E — Full Business Workflow', () => {

  // One browser context + one page shared by every test below
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    page = await context.newPage();

    // All page objects share the SAME page instance
    loginPage     = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    employeePage  = new EmployeePage(page);
    leavePage     = new LeavePage(page);

    // Generate once — all tests use the same employee object
    employee = generateEmployee();
  });

  test.afterAll(async () => {
    await context.close();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 1. DASHBOARD
  // ───────────────────────────────────────────────────────────────────────────
  test('1. Verify Dashboard is accessible after login', async () => {
    await dashboardPage.goto();
    await dashboardPage.verifyDashboard();

    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.heading).toBeVisible();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 2. CREATE EMPLOYEE
  // ───────────────────────────────────────────────────────────────────────────
  test('2. Create a new employee with unique data', async () => {
    await employeePage.navigateToAdd();

    await expect(page).toHaveURL(/addEmployee/);
    await expect(
      page.getByRole('heading', { name: 'Add Employee' })
    ).toBeVisible();

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

    // Server must accept the request
    expect(response.ok()).toBeTruthy();

    // Redirect to Personal Details after a successful save
    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(
      page.getByRole('heading', { name: 'Personal Details' })
    ).toBeVisible();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 3. VERIFY EMPLOYEE DATA SAVED
  // Shared page is still on viewPersonalDetails from test 2 — no navigation needed
  // ───────────────────────────────────────────────────────────────────────────
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


  // ───────────────────────────────────────────────────────────────────────────
  // 4. FILL PERSONAL DETAILS
  // Still on viewPersonalDetails — continue filling the form
  // ───────────────────────────────────────────────────────────────────────────
  test('4. Fill Nationality, Marital Status and Gender in Personal Details', async () => {
    // Nationality custom dropdown
    const nationalityDropdown = page
      .locator('.oxd-input-group', { hasText: 'Nationality' })
      .locator('.oxd-select-wrapper');

    await nationalityDropdown.click();
    await page
      .locator('.oxd-select-dropdown')
      .getByText(nationality, { exact: true })
      .click();

    // Marital Status custom dropdown
    const maritalStatusDropdown = page
      .locator('.oxd-input-group', { hasText: 'Marital Status' })
      .locator('.oxd-select-wrapper');

    await maritalStatusDropdown.click();
    await page
      .locator('.oxd-select-dropdown')
      .getByText(maritalStatus, { exact: true })
      .click();

    // Gender radio — anchored regex prevents matching "Female"
    const maleRadioWrapper = page.locator('.oxd-radio-wrapper', { hasText: /^Male$/ });
    await maleRadioWrapper.click();

    // Assert selections reflected in the UI
    await expect(nationalityDropdown).toContainText(nationality);
    await expect(maritalStatusDropdown).toContainText(maritalStatus);
    await expect(maleRadioWrapper.locator('input')).toBeChecked();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 5. SAVE PERSONAL DETAILS
  // ───────────────────────────────────────────────────────────────────────────
  test('5. Save Personal Details and verify success toast', async () => {
    const personalDetailsForm = page.locator('form').first();

    await personalDetailsForm
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 6. EDIT EMPLOYEE — Update Middle Name
  // ───────────────────────────────────────────────────────────────────────────
  test('6. Search employee, click Edit, update Middle Name and save', async () => {
    // Navigate to Employee List
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    // Search by first name
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
    await expect(
      page.getByRole('heading', { name: 'Personal Details' })
    ).toBeVisible();

    // Wait for API to hydrate the form
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 15000 });

    // Edit the Middle Name field
    const middleNameInput = page.getByPlaceholder('Middle Name');
    await middleNameInput.clear();
    await middleNameInput.fill(updatedMiddleName);
    await expect(middleNameInput).toHaveValue(updatedMiddleName);

    // Save using the first form's Save button (employee name section)
    const nameForm = page.locator('form').first();
    await nameForm.getByRole('button', { name: 'Save' }).click();

    // Wait for save to complete
    await expect(
      page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Verify Middle Name on the same page after save
    await expect(page.getByPlaceholder('Middle Name'))
      .toHaveValue(updatedMiddleName, { timeout: 10000 });
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 7. VERIFY EDIT PERSISTENCE — Navigate away, search again, assert value
  // ───────────────────────────────────────────────────────────────────────────
  test('7. Verify Middle Name persisted after navigating away and reopening', async () => {
    // Navigate away to prove data is saved to the database
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();

    // Open Edit again
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Personal Details' })
    ).toBeVisible();

    // Assert both First Name and updated Middle Name persisted in the DB
    await expect(page.getByPlaceholder('First Name'))
      .toHaveValue(employee.firstName, { timeout: 15000 });
    await expect(page.getByPlaceholder('Middle Name'))
      .toHaveValue(updatedMiddleName, { timeout: 15000 });
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 8. LEAVE LIST
  // ───────────────────────────────────────────────────────────────────────────
  test('8. Verify Leave List page loads correctly', async () => {
    await leavePage.navigateToList();
    await leavePage.verifyLeaveListLoaded();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 9. APPLY LEAVE FORM
  // ───────────────────────────────────────────────────────────────────────────
  test('9. Verify Apply Leave form loads correctly', async () => {
    await leavePage.navigateToApply();
    await leavePage.verifyApplyLeaveFormLoaded();
  });


  // ───────────────────────────────────────────────────────────────────────────
  // 10. LOGOUT
  // ───────────────────────────────────────────────────────────────────────────
  test('10. Logout and verify session is fully terminated', async () => {
    // Go somewhere that has the top-bar logout control
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Must land on the login page
    await expect(page).toHaveURL(/auth\/login/);
    await expect(loginPage.loginHeading).toBeVisible();

    // Verify protected pages are no longer accessible
    await page.goto('/web/index.php/dashboard/index');
    await expect(page).toHaveURL(/auth\/login/);
  });

});