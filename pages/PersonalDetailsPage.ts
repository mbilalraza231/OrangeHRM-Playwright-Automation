import { Page, Locator, expect } from '@playwright/test';

/**
 * PersonalDetailsPage — Page Object for the Employee Personal Details screen.
 *
 * Handles locators and form submission forNationality, Marital Status, Gender, etc.
 */
export class PersonalDetailsPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;

  // Custom Form Dropdowns & Radio Buttons
  readonly nationalityDropdown: Locator;
  readonly maritalStatusDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Personal Details' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    
    // Save button on the main personal details form section (the first form on the page)
    this.saveButton = page.locator('form').first().getByRole('button', { name: 'Save' });

    // Custom dropdown selectors inside the form groups
    this.nationalityDropdown = page
      .locator('.oxd-input-group', { hasText: 'Nationality' })
      .locator('.oxd-select-text');

    this.maritalStatusDropdown = page
      .locator('.oxd-input-group', { hasText: 'Marital Status' })
      .locator('.oxd-select-text');
  }

  /**
   * Fill the nationality dropdown.
   */
  async selectNationality(nationality: string): Promise<void> {
    await this.nationalityDropdown.click();
    await this.page.locator('.oxd-select-dropdown')
      .getByText(nationality, { exact: true })
      .click();
  }

  /**
   * Fill the marital status dropdown.
   */
  async selectMaritalStatus(maritalStatus: string): Promise<void> {
    await this.maritalStatusDropdown.click();
    await this.page.locator('.oxd-select-dropdown')
      .getByText(maritalStatus, { exact: true })
      .click();
  }

  /**
   * Select a gender option.
   */
  async selectGender(gender: 'Male' | 'Female'): Promise<void> {
    const radioWrapper = this.page.locator('.oxd-radio-wrapper', { hasText: new RegExp(`^${gender}$`) });
    await radioWrapper.click();
  }

  /**
   * Click the Save button and wait for the success toast.
   */
  async saveForm(): Promise<void> {
    await this.saveButton.click();
    await expect(
      this.page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
  }
}
