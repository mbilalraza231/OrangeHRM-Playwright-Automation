import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage — Page Object for the OrangeHRM login screen.
 *
 * Encapsulates all locators and actions for the login page so
 * test files only describe WHAT is being tested, not HOW the page works.
 *
 * Locator priority (as recommended by Playwright):
 *   getByRole > getByLabel > getByPlaceholder > getByText > locator()
 *
 * Note: OrangeHRM login form uses placeholder attributes, not <label for="">
 * elements, so getByPlaceholder() is the correct strategy here.
 */
export class LoginPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;
  readonly errorMessage: Locator;
  readonly requiredMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput  = page.getByPlaceholder('Username');
    this.passwordInput  = page.getByPlaceholder('Password');
    this.loginButton    = page.getByRole('button', { name: 'Login' });
    this.loginHeading   = page.getByRole('heading', { name: 'Login' });
    this.errorMessage   = page.getByText('Invalid credentials');
    this.requiredMessage = page.getByText('Required');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the login page. */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'networkidle', timeout: 60000 });
  }

  /**
   * Fill credentials and click Login.
   * Does not assert the result — let the calling test decide what to verify.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Assert the login page is fully loaded. */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/OrangeHRM/);
    await expect(this.loginHeading).toBeVisible();
  }
}
