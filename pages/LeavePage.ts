import { Page, Locator, expect } from '@playwright/test';

/** LeavePage — Page Object for the OrangeHRM Leave module. */
export class LeavePage {
  readonly page: Page;
  readonly leaveListHeading: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly applyButton: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly commentsTextarea: Locator;
  readonly assignButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.leaveListHeading  = page.getByRole('heading', { name: 'Leave List' });
    this.tableBody         = page.locator('.oxd-table-body');
    this.tableRows         = page.locator('.oxd-table-body .oxd-table-row');
    this.searchButton      = page.getByRole('button', { name: 'Search' });
    this.resetButton       = page.getByRole('button', { name: 'Reset' });
    this.applyButton       = page.locator('button[type="submit"], button:has-text("Apply")').first();
    this.leaveTypeDropdown = page.locator('.oxd-select-text').first();
    this.employeeNameInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).getByPlaceholder('Type for hints...');
    this.fromDateInput     = page.locator('.oxd-input-group', { hasText: 'From Date' }).locator('input');
    this.toDateInput       = page.locator('.oxd-input-group', { hasText: 'To Date' }).locator('input');
    this.commentsTextarea  = page.locator('.oxd-input-group', { hasText: 'Comments' }).locator('textarea');
    this.assignButton      = page.getByRole('button', { name: 'Assign' });
  }

  async navigateToList(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/viewLeaveList/);
    await this.leaveListHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async navigateToApply(): Promise<void> {
    await this.page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/applyLeave/);
    await this.page.getByRole('heading', { name: 'Apply Leave' }).waitFor({ state: 'visible', timeout: 15000 });
  }

  async navigateToAssign(): Promise<void> {
    await this.page.goto('/web/index.php/leave/assignLeave', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/assignLeave/);
    await this.employeeNameInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async assignLeave(
    employeeName: string,
    fromDate: string,
    toDate: string,
    comments: string
  ): Promise<string> {
    await this.employeeNameInput.click();
    await this.employeeNameInput.press('Control+a');
    await this.employeeNameInput.press('Backspace');
    await this.employeeNameInput.pressSequentially(employeeName, { delay: 100 });

    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });

    const option = dropdown.locator('.oxd-autocomplete-option', { hasText: employeeName }).first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();

    await this.page.waitForTimeout(500);

    const leaveTypeDropdown = this.page.locator('.oxd-input-group', { hasText: 'Leave Type' }).locator('.oxd-select-wrapper');
    await leaveTypeDropdown.click();

    const optionLocator = this.page.locator('.oxd-select-dropdown .oxd-select-option').nth(1);
    const leaveType = await optionLocator.innerText();
    await optionLocator.click();

    await this.fromDateInput.click();
    await this.fromDateInput.press('Control+a');
    await this.fromDateInput.press('Backspace');
    await this.fromDateInput.fill(fromDate);

    await this.toDateInput.click();
    await this.toDateInput.press('Control+a');
    await this.toDateInput.press('Backspace');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Escape');

    await this.commentsTextarea.fill(comments);
    await this.assignButton.click();

    const okButton = this.page.getByRole('button', { name: 'Ok', exact: true });
    try {
      await okButton.waitFor({ state: 'visible', timeout: 8000 });
      await okButton.click();
    } catch {
      // No confirmation dialog — leave was assigned directly
    }

    await expect(
      this.page.locator('.oxd-toast--success').first()
    ).toBeVisible({ timeout: 20000 });
    await this.page.waitForLoadState('networkidle');

    return leaveType;
  }

  async clearStatusFilter(): Promise<void> {
    const chips = this.page.locator('.oxd-input-group', { hasText: 'Show Leave with Status' })
      .locator('.oxd-chip-close, .oxd-chip-icon, .oxd-chip i');

    await chips.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      await chips.first().click();
      await this.page.waitForTimeout(200);
    }
  }

  async searchLeaveList(
    employeeName: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {
    await this.clearStatusFilter();

    const statusDropdown = this.page.locator('.oxd-input-group', { hasText: 'Show Leave with Status' }).locator('.oxd-select-text');
    await statusDropdown.click();
    const scheduledOption = this.page.locator('.oxd-select-dropdown .oxd-select-option', { hasText: 'Scheduled' }).first();
    await scheduledOption.waitFor({ state: 'visible', timeout: 5000 });
    await scheduledOption.click();

    await this.employeeNameInput.click();
    await this.employeeNameInput.press('Control+a');
    await this.employeeNameInput.press('Backspace');
    await this.employeeNameInput.pressSequentially(employeeName, { delay: 100 });

    const searchDropdown = this.page.locator('.oxd-autocomplete-dropdown');
    await searchDropdown.waitFor({ state: 'visible', timeout: 15000 });

    const option = searchDropdown.locator('.oxd-autocomplete-option', { hasText: employeeName }).first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
    await this.page.waitForTimeout(500);

    await this.fromDateInput.click();
    await this.fromDateInput.press('Control+a');
    await this.fromDateInput.press('Backspace');
    await this.fromDateInput.fill(fromDate);

    await this.toDateInput.click();
    await this.toDateInput.press('Control+a');
    await this.toDateInput.press('Backspace');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Escape');

    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLeaveListLoaded(): Promise<void> {
    await expect(this.leaveListHeading).toBeVisible();
    await expect(this.page.locator('.oxd-table, .orangehrm-paper-container').first()).toBeVisible();
  }

  async verifyApplyLeaveFormLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/applyLeave/);
    await expect(this.page.getByRole('heading', { name: 'Apply Leave' })).toBeVisible();
    await expect(this.page.locator('.orangehrm-card-container, .oxd-form, button[type="submit"]').first()).toBeVisible();
  }

  async verifyLeaveInList(
    employeeName: string,
    leaveType: string,
    status: string
  ): Promise<void> {
    await expect(this.tableBody).toBeVisible({ timeout: 10000 });
    const matchingRow = this.tableRows.filter({ hasText: employeeName }).first();
    await expect(matchingRow).toBeVisible({ timeout: 10000 });
    await expect(matchingRow).toContainText(leaveType);
  }
}
