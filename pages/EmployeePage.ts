import { Page, Locator, expect } from '@playwright/test';
import { EmployeeData } from '../utils/test-data-generator';

/**
 * EmployeePage — Page Object for OrangeHRM PIM (Employee Management) module.
 *
 * Covers: Employee List, Search, Add Employee, Edit Employee.
 * Keep methods focused on page-specific behaviour.
 * The test should contain the business intent.
 */
export class EmployeePage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly addButton: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly saveButton: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeNameSearchInput: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly successToast: Locator;
  readonly noRecordsMessage: Locator;
  readonly cancelButton: Locator;
  readonly employeeIdInput: Locator;
  readonly createLoginDetailsSwitch: Locator;
  readonly imageHintText: Locator;
  readonly requiredFooter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton               = page.getByRole('button', { name: 'Add' });
    this.searchButton            = page.getByRole('button', { name: 'Search' });
    this.resetButton             = page.getByRole('button', { name: 'Reset' });
    this.saveButton              = page.getByRole('button', { name: 'Save' });
    this.cancelButton            = page.getByRole('button', { name: 'Cancel' });
    this.firstNameInput          = page.getByPlaceholder('First Name');
    this.middleNameInput         = page.getByPlaceholder('Middle Name');
    this.lastNameInput           = page.getByPlaceholder('Last Name');
    // Employee name search uses a custom typeahead autocomplete
    this.employeeNameSearchInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).getByPlaceholder('Type for hints...');
    this.employeeIdInput         = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
    this.createLoginDetailsSwitch= page.locator('.oxd-switch-input');
    this.imageHintText           = page.getByText(/Accepts jpg/i);
    this.requiredFooter          = page.getByText(/Required/i).first();
    this.tableBody               = page.locator('.oxd-table-body');
    this.tableRows               = page.locator('.oxd-table-body .oxd-table-row');
    this.successToast            = page.locator('.oxd-toast--success');
    this.noRecordsMessage        = page.getByText('No Records Found').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Navigate to the Employee List page and wait for table data to load. */
  async navigateToList(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/viewEmployeeList/);
    // Wait for the table body — confirms the API-fetched data has rendered
    await this.tableBody.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Navigate to the Add Employee page. */
  async navigateToAdd(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    // Wait for the form to be interactive, not just the HTML shell
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  // ── Search ────────────────────────────────────────────────────────────────

  /**
   * Search the employee list by employee name.
   * The search input uses a typeahead — it shows suggestions as you type.
   * Playwright auto-waits for the input to be interactive.
   */
  async searchEmployee(name: string): Promise<void> {
    await this.employeeNameSearchInput.fill(name);
    await this.searchButton.click();
  }

  /** Reset the search form. */
  async resetSearch(): Promise<void> {
    await this.resetButton.click();
  }

  // ── Add ───────────────────────────────────────────────────────────────────

  /**
   * Fill and submit the Add Employee form.
   * OrangeHRM auto-generates an Employee ID.
   * After save, OrangeHRM redirects to Personal Details page.
   */
  async addEmployee(employee: EmployeeData): Promise<void> {
    await this.firstNameInput.fill(employee.firstName);
    if (employee.middleName) {
      await this.middleNameInput.fill(employee.middleName);
    }
    await this.lastNameInput.fill(employee.lastName);

    // Click Save and wait for the employee creation API response
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/pim/employees') &&
          res.request().method() === 'POST' &&
          res.status() === 200,
        { timeout: 30000 }
      ),
      this.saveButton.click()
    ]);

    // Wait for any post‑save navigation / spinner to finish
    await this.page.waitForLoadState('networkidle');
  }

  // ── Table helpers ─────────────────────────────────────────────────────────

  /** Returns a table row that contains the given text. */
  getRowByText(text: string): Locator {
    return this.tableRows.filter({ hasText: text });
  }

  /**
   * Click the Edit (pencil) icon in a specific table row.
   * OrangeHRM renders action icon buttons at the end of each row.
   * The pencil icon uses the CSS class 'bi-pencil-fill'.
   */
  async clickEditInRow(rowText: string): Promise<void> {
    const row = this.getRowByText(rowText);
    await row.locator('.bi-pencil-fill').click();
  }

  /** Count the number of visible employee rows in the table. */
  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  // ── Verification ──────────────────────────────────────────────────────────

  /** Assert the employee table is visible with at least one row. */
  async verifyTableLoaded(): Promise<void> {
    await expect(this.tableBody).toBeVisible({ timeout: 15000 });
    const count = await this.getRowCount();
    expect(count).toBeGreaterThan(0);
  }

  /** Assert a success toast notification is visible. */
  async verifySuccess(): Promise<void> {
    await expect(this.successToast).toBeVisible();
  }
}
