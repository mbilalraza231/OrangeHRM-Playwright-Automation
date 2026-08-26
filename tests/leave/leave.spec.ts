import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Leave Tests — Phase 8 (UI components: Dropdowns, Checkboxes, etc.)
 *
 * Verifies navigation to Leave List and Apply Leave, and explores
 * form elements in the Leave module.
 */
test.describe('Leave Module', () => {

  test.beforeEach(async ({ leavePage }) => {
    await leavePage.navigateToList();
  });

  test('admin can navigate to Leave List and view table', async ({ leavePage }) => {
    await leavePage.verifyLeaveListLoaded();
  });

  test('admin can navigate to Apply Leave form', async ({ leavePage }) => {
    await leavePage.navigateToApply();
    await leavePage.verifyApplyLeaveFormLoaded();
  });

});
