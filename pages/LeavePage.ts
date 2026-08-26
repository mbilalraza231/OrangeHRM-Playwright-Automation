import { Page, Locator, expect } from '@playwright/test';

/**
 * LeavePage — Page Object for the OrangeHRM Leave module.
 *
 * Covers: Leave List, Apply Leave form verification.
 */
export class LeavePage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly leaveListHeading: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly searchButton: Locator;
  readonly applyButton: Locator;
  readonly leaveTypeDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.leaveListHeading  = page.getByRole('heading', { name: 'Leave List' });
    this.tableBody         = page.locator('.oxd-table-body');
    this.tableRows         = page.locator('.oxd-table-body .oxd-table-row');
    this.searchButton      = page.getByRole('button', { name: 'Search' });
    this.applyButton       = page.locator('button[type="submit"], button:has-text("Apply")').first();
    this.leaveTypeDropdown = page.locator('.oxd-select-text').first();
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

  // ── Verification ──────────────────────────────────────────────────────────

  /** Assert the Leave List page is loaded. */
  async verifyLeaveListLoaded(): Promise<void> {
    await expect(this.leaveListHeading).toBeVisible();
    // Verify that either the table body or the container card is present (works if database has 0 leaves)
    await expect(this.page.locator('.oxd-table, .orangehrm-paper-container').first()).toBeVisible();
  }

  /** Assert the Apply Leave form is loaded. */
  async verifyApplyLeaveFormLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/applyLeave/);
    await expect(this.page.getByRole('heading', { name: 'Apply Leave' })).toBeVisible();
    // In OrangeHRM demo, if the user has 0 balance, it shows the form container / notice card
    await expect(this.page.locator('.orangehrm-card-container, .oxd-form, button[type="submit"]').first()).toBeVisible();
  }
}
