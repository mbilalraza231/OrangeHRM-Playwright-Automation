import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Employee List Tests — Phase 6 + 7 (Tables)
 *
 * Practises:
 *  - Table navigation
 *  - Row counting
 *  - Reading row data (parent/child locator relationships)
 *  - Column header verification
 */
test.describe('Employee List — Tables', () => {

  test.beforeEach(async ({ employeePage }) => {
    await employeePage.navigateToList();
  });

  test('admin can navigate to the Employee List page', async ({ page }) => {
    // ✅ URL assertion
    await expect(page).toHaveURL(/viewEmployeeList/);

    // ✅ getByRole() — page heading
    await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  });

  test('employee table is visible and has rows', async ({ employeePage }) => {
    // ✅ locator() — table body
    // ✅ element state — count > 0
    await employeePage.verifyTableLoaded();
  });

  test('employee table has expected column headers', async ({ page }) => {
    // ✅ getByRole() — column headers (Phase 7 — table structure)
    await expect(page.getByRole('columnheader', { name: 'First (& Middle) Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /^Id/i })).toBeVisible();
  });

  test('admin can count total employee rows in the table', async ({ employeePage, page }) => {
    // ✅ Phase 7 — count rows
    // Wait for the table to load by checking the Records Found text
    await expect(page.locator('.oxd-text').filter({ hasText: /Record/ })).toBeVisible();

    const count = await employeePage.getRowCount();
    expect(count).toBeGreaterThan(0);
    console.log(`Total employee rows visible: ${count}`);
  });

  test('admin can read data from the first table row', async ({ employeePage }) => {
    // ✅ Phase 7 — parent/child locator relationship
    // Get first row, then locate a cell within it
    const firstRow = employeePage.tableRows.first();
    await expect(firstRow).toBeVisible();

    // Verify the first row has some text content (employee ID / name)
    const firstCell = firstRow.locator('.oxd-table-cell').nth(1); // skip checkbox cell
    await expect(firstCell).toBeVisible();
    const text = (await firstCell.innerText()).trim();
    expect(text.length).toBeGreaterThan(0);
  });

});
