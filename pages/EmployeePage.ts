import { Page, Locator, expect } from '@playwright/test';

/** EmployeePage — Page Object for the OrangeHRM PIM (Employee Management) module. */
export class EmployeePage {
  readonly page: Page;
  readonly saveButton: Locator;
  readonly searchButton: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeNameSearchInput: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveButton              = page.getByRole('button', { name: 'Save' });
    this.searchButton            = page.getByRole('button', { name: 'Search' });
    this.firstNameInput          = page.getByPlaceholder('First Name');
    this.middleNameInput         = page.getByPlaceholder('Middle Name');
    this.lastNameInput           = page.getByPlaceholder('Last Name');
    this.employeeNameSearchInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).getByPlaceholder('Type for hints...');
    this.tableBody               = page.locator('.oxd-table-body');
    this.tableRows               = page.locator('.oxd-table-body .oxd-table-row');
  }

  async navigateToList(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/viewEmployeeList/);
    await this.tableBody.waitFor({ state: 'visible', timeout: 15000 });
  }

  async navigateToAdd(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async searchEmployee(name: string): Promise<void> {
    await this.employeeNameSearchInput.fill(name);
    await this.searchButton.click();
  }

  async verifyTableLoaded(): Promise<void> {
    await expect(this.tableBody).toBeVisible({ timeout: 15000 });
    expect(await this.tableRows.count()).toBeGreaterThan(0);
  }
}
