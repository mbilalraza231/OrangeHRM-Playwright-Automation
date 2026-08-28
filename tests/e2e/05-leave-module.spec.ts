import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { LeavePage } from '../../pages/LeavePage';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 05-leave-module.spec.ts
 *
 * Verifies the Leave module:
 *  - Verifies pages load correctly (List and Apply).
 *  - Assigns a leave to the newly created employee.
 *  - Searches and verifies the leave details in the Leave List.
 *
 * Reads employee data from test-data/runtime-state.json.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

let page:       Page;
let context:    BrowserContext;
let leavePage:  LeavePage;
let employee:   EmployeeData;
let selectedLeaveType: string;

// Let's use a clear, valid date range for a single-day leave
const fromDate = '2027-10-12';
const toDate   = '2027-10-12';

test.describe.serial('Leave Module', () => {

  test.beforeAll(async ({ browser }) => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee = state.employee;

    context   = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page      = await context.newPage();
    leavePage = new LeavePage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 7 — Verify Leave List page loads
  // ─────────────────────────────────────────────────────────────────────────
  test('7. Verify Leave List page loads correctly', async () => {
    await leavePage.navigateToList();
    await leavePage.verifyLeaveListLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 8 — Verify Apply Leave form loads
  // ─────────────────────────────────────────────────────────────────────────
  test('8. Verify Apply Leave form loads correctly', async () => {
    await leavePage.navigateToApply();
    await leavePage.verifyApplyLeaveFormLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 9 — Assign Leave to the employee
  // ─────────────────────────────────────────────────────────────────────────
  test('9. Assign leave to the newly created employee', async () => {
    await leavePage.navigateToAssign();

    // Use firstName for the typeahead — it's unique (has numeric suffix) and
    // avoids mismatch with OrangeHRM's "First Middle Last" display format.
    selectedLeaveType = await leavePage.assignLeave(
      employee.firstName,
      fromDate,
      toDate,
      'Automated E2E Leave Assignment'
    );

    // Save the selected leave type in the state file for downstream reference
    const currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    currentState.leaveType = selectedLeaveType;
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 10 — Verify assigned leave is in the Leave List
  // ─────────────────────────────────────────────────────────────────────────
  test('10. Verify assigned leave is present in the Leave List', async () => {
    await leavePage.navigateToList();

    await leavePage.searchLeaveList(employee.firstName, fromDate, toDate);

    // Assert that the record exists in the table matching the employee name,
    // the leave type we dynamically chose, and status.
    await leavePage.verifyLeaveInList(
      employee.firstName,
      selectedLeaveType,
      'Scheduled' // admin-assigned leaves bypass standard workflow approvals
    );
  });

});
