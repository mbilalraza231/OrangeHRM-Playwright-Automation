import { Page, Locator, expect } from '@playwright/test';

/** LoginPage — Page Object for the OrangeHRM login screen. */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;
  readonly errorMessage: Locator;
  readonly requiredMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput   = page.getByPlaceholder('Username');
    this.passwordInput   = page.getByPlaceholder('Password');
    this.loginButton     = page.getByRole('button', { name: 'Login' });
    this.loginHeading    = page.getByRole('heading', { name: 'Login' });
    this.errorMessage    = page.getByText('Invalid credentials');
    this.requiredMessage = page.getByText('Required');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await expect(this.loginHeading).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/OrangeHRM/);
    await expect(this.loginHeading).toBeVisible();
  }
}
