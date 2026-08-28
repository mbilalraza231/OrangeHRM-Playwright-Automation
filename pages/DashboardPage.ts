import { Page, Locator, expect } from '@playwright/test';

/** DashboardPage — Page Object for the OrangeHRM Dashboard. */
export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sidebarMenuItems: Locator;
  readonly userDropdown: Locator;
  readonly topbarBrand: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading          = page.getByRole('heading', { name: 'Dashboard' });
    this.sidebarMenuItems = page.locator('.oxd-main-menu-item--name');
    this.userDropdown     = page.locator('.oxd-userdropdown-tab');
    this.topbarBrand      = page.locator('.oxd-topbar-header-breadcrumb');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
  }

  async verifyDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.heading).toBeVisible();
    await expect(this.sidebarMenuItems.first()).toBeVisible();
  }

  async openUserDropdown(): Promise<void> {
    await this.userDropdown.click();
  }

  async logout(): Promise<void> {
    await this.openUserDropdown();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
