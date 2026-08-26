import { test, expect } from '../../fixtures/test-fixtures';
import employees from '../../test-data/employees.json';

/**
 * Employee Search Tests — Phase 6
 *
 * Practises:
 *  - Filling a search form
 *  - Verifying filtered table results
 *  - Verifying "No Records Found" for non-existent data
 */
test.describe('Employee Search', () => {

  test.beforeEach(async ({ employeePage }) => {
    await employeePage.navigateToList();
  });

  test('admin can search for an existing employee by name', async ({ employeePage, page }) => {
    // Dynamically grab the first employee's first name from the table to guarantee they exist
    const firstRow = employeePage.tableRows.first();
    await expect(firstRow).toBeVisible();
    const cellText = (await firstRow.locator('.oxd-table-cell').nth(2).innerText()).trim();
    const firstName = cellText.split(' ')[0] || cellText;
    expect(firstName.length).toBeGreaterThan(0);

    // ✅ getByPlaceholder() — typeahead search input via POM
    // ✅ getByRole() — Search button
    await employeePage.searchEmployee(firstName);

    // ✅ automatic waiting — Playwright waits for the filtered results
    // ✅ locator().filter() — find row containing the searched name
    await expect(
      employeePage.tableRows.filter({ hasText: firstName }).first()
    ).toBeVisible();
  });

  test('searching for a non-existent employee shows No Records Found', async ({ employeePage }) => {
    await employeePage.searchEmployee(employees.nonExistentEmployee.firstName);

    // ✅ getByText() — verify no records message
    await expect(employeePage.noRecordsMessage).toBeVisible();
  });

  test('reset button clears the search and shows all employees', async ({ employeePage }) => {
    // Search for something specific first
    await employeePage.searchEmployee(employees.nonExistentEmployee.firstName);
    await expect(employeePage.noRecordsMessage).toBeVisible();

    // Reset the search form
    await employeePage.resetSearch();

    // ✅ element state — table rows should appear again after reset
    await employeePage.verifyTableLoaded();
  });

});
