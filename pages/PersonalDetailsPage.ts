import { Page, Locator, expect } from '@playwright/test';

/** PersonalDetailsPage — Page Object for the Employee Personal Details screen. */
export class PersonalDetailsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly saveButton: Locator;
  readonly nationalityDropdown: Locator;
  readonly maritalStatusDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading             = page.getByRole('heading', { name: 'Personal Details' });
    this.firstNameInput      = page.getByPlaceholder('First Name');
    this.middleNameInput     = page.getByPlaceholder('Middle Name');
    this.saveButton          = page.locator('form').first().getByRole('button', { name: 'Save' });
    this.nationalityDropdown = page.locator('.oxd-input-group', { hasText: 'Nationality' }).locator('.oxd-select-text');
    this.maritalStatusDropdown = page.locator('.oxd-input-group', { hasText: 'Marital Status' }).locator('.oxd-select-text');
  }

  async selectNationality(nationality: string): Promise<void> {
    await this.nationalityDropdown.click();
    await this.page.locator('.oxd-select-dropdown')
      .getByText(nationality, { exact: true })
      .click();
  }

  async selectMaritalStatus(maritalStatus: string): Promise<void> {
    await this.maritalStatusDropdown.click();
    await this.page.locator('.oxd-select-dropdown')
      .getByText(maritalStatus, { exact: true })
      .click();
  }

  async selectGender(gender: 'Male' | 'Female'): Promise<void> {
    const radioWrapper = this.page.locator('.oxd-radio-wrapper', { hasText: new RegExp(`^${gender}$`) });
    await radioWrapper.click();
  }

  async saveForm(): Promise<void> {
    await this.saveButton.click();
    await expect(
      this.page.locator('.oxd-toast--success, .oxd-text--toast-message').first()
    ).toBeVisible({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
  }
}
