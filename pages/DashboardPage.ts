import { Page, Locator, expect } from '@playwright/test';

/**
 * DashboardPage — Page Object for the OrangeHRM Dashboard.
 *
 * After login, this is the first screen the user sees.
 * It contains widgets and a sidebar navigation menu.
 */
export class DashboardPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly sidebarMenuItems: Locator;
  readonly userDropdown: Locator;
  readonly topbarBrand: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading         = page.getByRole('heading', { name: 'Dashboard' });
    this.sidebarMenuItems = page.locator('.oxd-main-menu-item--name');
    this.userDropdown    = page.locator('.oxd-userdropdown-tab');
    this.topbarBrand     = page.locator('.oxd-topbar-header-breadcrumb');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate directly to the dashboard (requires authentication). */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Core dashboard verification.
   * Checks URL, heading, and that the sidebar is present.
   */
  async verifyDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.heading).toBeVisible();
    await expect(this.sidebarMenuItems.first()).toBeVisible();
  }

  /** Click the user dropdown in the top-right corner. */
  async openUserDropdown(): Promise<void> {
    await this.userDropdown.click();
  }

  /** Logout via the user dropdown menu. */
  async logout(): Promise<void> {
    await this.openUserDropdown();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
