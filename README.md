# OrangeHRM Playwright E2E Test Suite

A premium, modular Page Object Model (POM) end-to-end (E2E) automation framework built with **Playwright** and **TypeScript** for the OrangeHRM demo application.

---

## 🏗️ Project Architecture

```text
orangehrm-playwright/
│
├── fixtures/                   # Custom Test Fixtures
│   └── test-fixtures.ts        # Extends Playwright test to construct page objects
│
├── pages/                      # Page Object Model (POM) layer
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── EmployeePage.ts
│   ├── PersonalDetailsPage.ts
│   └── LeavePage.ts
│
├── test-data/                  # Static & Runtime test state resources
│   ├── users.json              # Mock users & credentials
│   ├── employees.json          # Reference search data
│   └── runtime-state.json      # Dynamic employee data shared between tests (Git ignored)
│
├── tests/                      # Test suites
│   └── e2e/                    # Sequential core user journeys
│       ├── 01-dashboard.spec.ts
│       ├── 02-create-employee.spec.ts
│       ├── 03-personal-details.spec.ts
│       ├── 04-edit-employee.spec.ts
│       ├── 05-leave-module.spec.ts
│       └── 06-logout.spec.ts
│
├── tests-setup/
│   └── auth.setup.ts           # Pre-authenticates once and saves session storageState
│
├── utils/                      # Helper scripts
│   ├── helpers.ts              # Timestamps & Date string helper formatters
│   └── test-data-generator.ts  # Unique Pakistani employee generator
│
├── playwright.config.ts        # Main config (workers: 1, auth setup, test results)
├── package.json
└── README.md
```

---

## ⚡ Key Features

1. **One-Time Authentication State (`storageState`)**: Logs in via `auth.setup.ts` once before the test suite, saving cookies to `playwright/.auth/user.json`. Subsequent E2E tests start pre‑authenticated, saving execution time.
2. **Page Object Model (POM)**: Isolation of test logic from selectors and page actions.
3. **Custom Fixtures**: Automatically instantiates and injects page objects (`employeePage`, `personalDetailsPage`, etc.) directly into tests, removing setup boilerplate.
4. **Collision Prevention**: Generates dynamic timestamp‑based suffixes for employee names (`Bilal126511`) to prevent duplicate entry failures on the shared public demo database.
5. **No `waitForTimeout` Anti‑patterns**: Purely relies on Playwright auto‑waiting assertions (`expect().toBeVisible()`) for stability.
6. **Improved Navigation Stability**: Navigation methods use `waitUntil: 'domcontentloaded'` followed by `.waitFor()` on a key page element to ensure the DOM is ready and interactive before taking actions.

---

## 🚀 How to Run

### Install Dependencies

```powershell
npm install
npx playwright install
```

### Run All Tests (Headless in background)

```powershell
npx playwright test
```

### Run in UI Mode

```powershell
npx playwright test --ui
```

### Run in Headed Mode (With slow-motion)

```powershell
$env:SLOWMO="500"; npx playwright test tests/e2e --headed
```

### View Test Report

```powershell
npx playwright show-report
```

---

## 📖 Architecture & Design Study Guide
For a deep dive into the framework's design patterns, dependency graph, execution matrix, and senior SDET review, please check:
👉 [**`playwright_architecture_guide.txt`**](./playwright_architecture_guide.txt)
