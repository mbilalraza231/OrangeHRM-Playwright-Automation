# OrangeHRM Playwright E2E Test Suite

A premium, modular Page Object Model (POM) end-to-end (E2E) automation framework built with **Playwright** and **TypeScript** for the OrangeHRM demo application.

---

## 🏗️ Project Architecture

```text
orangehrm-playwright/
│
├── .github/workflows/          # CI/CD Workflows
│   └── playwright.yml          # GitHub Actions workflow
│
├── fixtures/                   # Custom Test Fixtures
│   └── test-fixtures.ts        # Extends Playwright test with page objects
│
├── pages/                      # Page Object Model (POM) layer
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── EmployeePage.ts
│   └── LeavePage.ts
│
├── playwright/
│   └── .auth/                  # Stores state (session cookies) for reuse
│
├── test-data/                  # Static test resources
│   ├── users.json              # Mock users & credentials
│   └── employees.json          # Employee reference search data
│
├── tests/                      # Modular Test Suites
│   ├── auth/                   # Login/Logout flows
│   ├── dashboard/              # Home/Dashboard state validation
│   ├── employee/               # PIM module (CRUD: List, Add, Edit, Search)
│   ├── leave/                  # Leave module basics
│   └── e2e.spec.ts             # Core end-to-end employee lifecycle + login/logout
│
├── tests-setup/
│   └── auth.setup.ts           # StorageState builder (Logs in once)
│
├── utils/                      # Reusable Utilities
│   ├── helpers.ts              # Unique suffix & Date formatters
│   └── test-data-generator.ts  # Unique Employee generator
│
├── playwright.config.ts        # Main config (1 worker, baseURL, auth-setup, traces)
├── package.json
└── README.md
```

---

## ⚡ Key Features

1. **One-Time Authentication State (`storageState`)**: Logs in via `auth.setup.ts` once before the test suite, saving cookies to `playwright/.auth/user.json`. Rest of tests start pre‑authenticated (speeding up runtimes).
2. **Page Object Model (POM)**: Complete separation of test logic (spec files) from DOM selectors and interactions.
3. **Custom Fixtures**: Automatically injects pages (`loginPage`, `dashboardPage`, etc.) directly into tests, removing setup boilerplate.
4. **Collision Prevention**: Generates randomized timestamp‑based suffix fields for employee names (`Test123456 Auto123456`) to ensure independent execution on the shared public demo database.
5. **No `waitForTimeout` Anti‑patterns**: Purely relies on Playwright auto‑waiting assertions (`expect().toBeVisible()`) for reliable execution.
6. **Improved Navigation Stability**: Dashboard and Login page navigations now use `waitUntil: 'networkidle'` with a 60 s timeout, eliminating flaky `domcontentloaded` timeouts.

---

## 🚀 How to Run

### Install Dependencies

```powershell
npm install
npx playwright install
```

### Run All Tests

```powershell
npx playwright test
```

### Run in UI Mode

```powershell
npx playwright test --ui
```

### Run Specific Test Suite

```powershell
npx playwright test tests/e2e/e2e.spec.ts   # Core E2E lifecycle (includes login & logout)
```

### Test Suite Pruning

The project now focuses on a **core test set** for faster feedback:

- `tests/e2e/e2e.spec.ts` – full employee lifecycle with login & logout.
- `tests/auth/login.spec.ts` – validates successful login.
- `tests/auth/logout.spec.ts` – validates logout redirection.

All other spec files (dashboard, employee list, add/edit, leave, etc.) have been removed to keep the suite lightweight while maintaining critical coverage.

### View Test Report

```powershell
npx playwright show-report
```
