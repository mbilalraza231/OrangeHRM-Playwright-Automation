import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { LeavePage } from '../../pages/LeavePage';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 05-leave-module.spec.ts — Verifies the Leave module:
 * loads Leave List and Apply Leave pages, assigns leave to the created employee,
 * then searches and verifies the leave record in the Leave List.
 */

const STATE_FILE = path.join(__dirname, '../../test-data/runtime-state.json');

let page:       Page;
let context:    BrowserContext;
let leavePage:  LeavePage;
let employee:   EmployeeData;
let selectedLeaveType: string;

const fromDate = '2027-10-12';
const toDate   = '2027-10-12';

test.describe.serial('Leave Module', () => {

  test.beforeAll(async ({ browser }) => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee  = state.employee;
    context   = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page      = await context.newPage();
    leavePage = new LeavePage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('7. Verify Leave List page loads correctly', async () => {
    await leavePage.navigateToList();
    await leavePage.verifyLeaveListLoaded();
  });

  test('8. Verify Apply Leave form loads correctly', async () => {
    await leavePage.navigateToApply();
    await leavePage.verifyApplyLeaveFormLoaded();
  });

  test('9. Assign leave to the newly created employee', async () => {
    await leavePage.navigateToAssign();
    selectedLeaveType = await leavePage.assignLeave(
      employee.firstName,
      fromDate,
      toDate,
      'Automated E2E Leave Assignment'
    );
    const currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    currentState.leaveType = selectedLeaveType;
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
  });

  test('10. Verify assigned leave is present in the Leave List', async () => {
    await leavePage.navigateToList();
    await leavePage.searchLeaveList(employee.firstName, fromDate, toDate);
    await leavePage.verifyLeaveInList(employee.firstName, selectedLeaveType, 'Scheduled');
  });

});
