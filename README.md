# OrangeHRM Playwright E2E Automation

A modular end-to-end test automation framework for the OrangeHRM demo application, built with Playwright and TypeScript.

The suite covers the main employee workflow:

```text
Login -> Dashboard -> Create Employee -> Personal Details -> Edit Employee -> Leave Assignment -> Logout
```

## Tech Stack

- Playwright
- TypeScript
- Page Object Model
- Custom Playwright fixtures
- One-time authentication with `storageState`
- Dynamic test data generation
- HTML reports, traces, screenshots, and videos on failure

## Project Structure

```text
OrangeHRM/
|-- fixtures/
|   `-- test-fixtures.ts          # Custom fixtures for page object injection
|-- pages/
|   |-- DashboardPage.ts
|   |-- EmployeePage.ts
|   |-- LeavePage.ts
|   |-- LoginPage.ts
|   `-- PersonalDetailsPage.ts
|-- test-data/
|   |-- employees.json            # Reference employee data
|   |-- users.json                # Test user credentials
|   `-- runtime-state.json        # Generated during test execution
|-- tests/
|   |-- auth/
|   |   `-- login.spec.ts         # Standalone login validation
|   `-- e2e/
|       |-- 01-dashboard.spec.ts
|       |-- 02-create-employee.spec.ts
|       |-- 03-personal-details.spec.ts
|       |-- 04-edit-employee.spec.ts
|       |-- 05-leave-module.spec.ts
|       `-- 06-logout.spec.ts
|-- tests-setup/
|   `-- auth.setup.ts             # Creates authenticated storage state
|-- utils/
|   |-- helpers.ts
|   `-- test-data-generator.ts
|-- playwright.config.ts
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Test Coverage

- 11 numbered E2E test cases across 6 modular spec files
- 1 standalone authentication test
- Dashboard access validation
- Employee creation with unique generated data
- Personal details update
- Employee search and edit flow
- Leave list, apply leave, assign leave, and leave verification
- Logout and session termination

## Key Features

- Page Object Model keeps selectors and page actions reusable.
- Custom fixtures inject page objects directly into tests.
- Authentication setup logs in once and reuses `playwright/.auth/user.json`.
- Dynamic employee data prevents collisions on the public OrangeHRM demo site.
- Sequential E2E execution supports shared runtime state across dependent flows.
- No hardcoded waits; tests rely on Playwright locators, assertions, and auto-waiting.
- Failure artifacts include HTML report, trace, screenshot, and video where configured.

## Prerequisites

- Node.js
- npm

## Installation

```powershell
npm install
npx playwright install
```

## Running Tests

Run the full suite:

```powershell
npx playwright test
```

Run tests in UI mode:

```powershell
npx playwright test --ui
```

Run the E2E flow in headed mode:

```powershell
npx playwright test tests/e2e --headed
```

Run with slow motion:

```powershell
$env:SLOWMO="500"; npx playwright test tests/e2e --headed
```

View the HTML report:

```powershell
npx playwright show-report
```

## Test Data

Default OrangeHRM demo credentials are stored in `test-data/users.json`.

Generated runtime data is written to `test-data/runtime-state.json` during execution. This file is ignored by Git because it is environment-specific test state.

## Notes

The OrangeHRM demo site is a shared public environment, so test results can occasionally be affected by server speed, resets, or data created by other users. The framework uses unique generated employee data and Playwright auto-waiting to reduce flakiness.
