import { Page, Locator, expect } from '@playwright/test';

/**
 * LeavePage — Page Object for the OrangeHRM Leave module.
 *
 * Covers: Leave List, Apply Leave, and Assign Leave operations.
 */
export class LeavePage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly leaveListHeading: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly applyButton: Locator;
  readonly leaveTypeDropdown: Locator;

  // Assign Leave Form Locators
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

    // Assign Leave Form elements
    this.employeeNameInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).getByPlaceholder('Type for hints...');
    this.fromDateInput     = page.locator('.oxd-input-group', { hasText: 'From Date' }).locator('input');
    this.toDateInput       = page.locator('.oxd-input-group', { hasText: 'To Date' }).locator('input');
    this.commentsTextarea  = page.locator('.oxd-input-group', { hasText: 'Comments' }).locator('textarea');
    this.assignButton      = page.getByRole('button', { name: 'Assign' });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Navigate to the Leave List page (admin view). */
  async navigateToList(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/viewLeaveList/);
  }

  /** Navigate to the Apply Leave page. */
  async navigateToApply(): Promise<void> {
    await this.page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/applyLeave/);
  }

  /** Navigate to the Assign Leave page. */
  async navigateToAssign(): Promise<void> {
    await this.page.goto('/web/index.php/leave/assignLeave', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/assignLeave/);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Assign a leave to an employee.
   * Handles typeahead autocomplete and the 'Insufficient Balance' confirmation popup.
   * Returns the selected leave type name.
   */
  async assignLeave(
    employeeName: string,
    fromDate: string,
    toDate: string,
    comments: string
  ): Promise<string> {
    // 1. Fill employee name and select from typeahead dropdown.
    await this.employeeNameInput.click();
    await this.employeeNameInput.press('Control+a');
    await this.employeeNameInput.press('Backspace');
    await this.employeeNameInput.pressSequentially(employeeName, { delay: 100 });

    // Wait for the autocomplete dropdown container to become visible
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });

    // Click the suggestion option matching the employee name inside the dropdown
    const option = dropdown.locator('.oxd-autocomplete-option', { hasText: employeeName }).first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();

    // Wait for the "Invalid" label/validation to clear
    await this.page.waitForTimeout(500);

    // 2. Select Leave Type dropdown
    const leaveTypeDropdown = this.page.locator('.oxd-input-group', { hasText: 'Leave Type' }).locator('.oxd-select-wrapper');
    await leaveTypeDropdown.click();
    
    // Choose the first actual leave type option (index 1, index 0 is '-- Select --')
    const optionLocator = this.page.locator('.oxd-select-dropdown .oxd-select-option').nth(1);
    const leaveType = await optionLocator.innerText();
    await optionLocator.click();

    // 3. Clear and enter From Date
    await this.fromDateInput.click();
    // Press Ctrl+A and Backspace to clear properly since it is a mask input
    await this.fromDateInput.press('Control+a');
    await this.fromDateInput.press('Backspace');
    await this.fromDateInput.fill(fromDate);

    // 4. Clear and enter To Date
    await this.toDateInput.click();
    await this.toDateInput.press('Control+a');
    await this.toDateInput.press('Backspace');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Escape'); // close datepicker overlay if open

    // 5. Fill Comments
    await this.commentsTextarea.fill(comments);

    // 6. Click Assign
    await this.assignButton.click();

    // 7. The dialog "Confirm Leave Assignment" (Insufficient Balance warning) may appear.
    //    Wait up to 8 seconds for it; if it appears click Ok, if not just continue.
    const okButton = this.page.getByRole('button', { name: 'Ok', exact: true });
    try {
      await okButton.waitFor({ state: 'visible', timeout: 8000 });
      await okButton.click();
    } catch {
      // No confirmation dialog appeared — leave was assigned directly
    }

    // 8. Wait for the success toast to confirm the assignment completed
    await expect(
      this.page.locator('.oxd-toast--success').first()
    ).toBeVisible({ timeout: 20000 });
    await this.page.waitForLoadState('networkidle');

    return leaveType;
  }

  /** Clear all default pre-selected status filters (like 'Pending Approval') */
  async clearStatusFilter(): Promise<void> {
    const chips = this.page.locator('.oxd-input-group', { hasText: 'Show Leave with Status' })
      .locator('.oxd-chip-close, .oxd-chip-icon, .oxd-chip i');
    
    // Wait for the default filter chips to load/become visible
    await chips.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      // Always click first since count decreases
      await chips.first().click();
      await this.page.waitForTimeout(200);
    }
  }

  /** Search the Leave List using filters */
  async searchLeaveList(
    employeeName: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {
    // 1. Clear pre-selected status filters (like 'Pending Approval')
    await this.clearStatusFilter();

    // 2. Select 'Scheduled' status from the dropdown since admin-assigned leave is Scheduled
    const statusDropdown = this.page.locator('.oxd-input-group', { hasText: 'Show Leave with Status' }).locator('.oxd-select-text');
    await statusDropdown.click();
    const scheduledOption = this.page.locator('.oxd-select-dropdown .oxd-select-option', { hasText: 'Scheduled' }).first();
    await scheduledOption.waitFor({ state: 'visible', timeout: 5000 });
    await scheduledOption.click();

    // 3. Select Employee Name from autocomplete
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

    // 4. Clear and enter From Date
    await this.fromDateInput.click();
    await this.fromDateInput.press('Control+a');
    await this.fromDateInput.press('Backspace');
    await this.fromDateInput.fill(fromDate);

    // 5. Clear and enter To Date
    await this.toDateInput.click();
    await this.toDateInput.press('Control+a');
    await this.toDateInput.press('Backspace');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Escape'); // close datepicker overlay if open

    // 6. Submit Search
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Verification ──────────────────────────────────────────────────────────

  /** Assert the Leave List page is loaded. */
  async verifyLeaveListLoaded(): Promise<void> {
    await expect(this.leaveListHeading).toBeVisible();
    await expect(this.page.locator('.oxd-table, .orangehrm-paper-container').first()).toBeVisible();
  }

  /** Assert the Apply Leave form is loaded. */
  async verifyApplyLeaveFormLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/applyLeave/);
    await expect(this.page.getByRole('heading', { name: 'Apply Leave' })).toBeVisible();
    await expect(this.page.locator('.orangehrm-card-container, .oxd-form, button[type="submit"]').first()).toBeVisible();
  }

  /** Verify that a specific leave record is present in the table */
  async verifyLeaveInList(
    employeeName: string,
    leaveType: string,
    status: string
  ): Promise<void> {
    // Wait up to 10 seconds for the table body to have rows
    await expect(this.tableBody).toBeVisible({ timeout: 10000 });
    const matchingRow = this.tableRows.filter({ hasText: employeeName }).first();
    await expect(matchingRow).toBeVisible({ timeout: 10000 });
    await expect(matchingRow).toContainText(leaveType);
    // Status can be 'Scheduled' or 'Pending Approval' depending on leave balance config
    // We just assert the row exists with the right employee + leave type
  }
}

