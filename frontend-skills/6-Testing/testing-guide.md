# Frontend Testing Guide

## Testing Pyramid

```
        /\
       /  \     E2E Tests (5-10%)
      /    \    Integration Tests (15-30%)
     /______\   Unit Tests (60-80%)
```

## Testing Frameworks & Setup

### 1. Vitest - Fast Unit Testing

```bash
npm install -D vitest @vitest/ui
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
```

### 2. React Testing Library - Component Testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

**test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
```

## Unit Testing

### 1. Testing Utilities

```typescript
// utils/math.test.ts
import { describe, it, expect } from 'vitest';
import { add, multiply } from './math';

describe('Math utils', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
  });
});
```

### 2. Testing Components

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Testing Hooks

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(-1);
  });
});
```

### 4. Testing Async Operations

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('UserProfile', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />);

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles loading errors', async () => {
    vi.mock('../../hooks/useUser', () => ({
      useUser: () => ({ error: 'Failed to load' })
    }));

    render(<UserProfile userId="invalid" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

## Integration Testing

### 1. Testing Form Interaction

```typescript
describe('LoginForm', () => {
  it('submits form with user data', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
  });

  it('shows validation errors', async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### 2. Testing State Management

```typescript
// Redux component
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Counter from './Counter';
import counterSlice from './counterSlice';

describe('Counter with Redux', () => {
  it('increments count', async () => {
    const store = configureStore({
      reducer: {
        counter: counterSlice
      }
    });

    render(
      <Provider store={store}>
        <Counter />
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
  });
});
```

## End-to-End Testing

### 1. Playwright Setup

```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. E2E Test Example

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    // Navigate to shop
    await page.goto('/shop');
    expect(page.url()).toContain('/shop');

    // Add item to cart
    await page.click('button[aria-label="Add to cart"]');
    await expect(page.locator('[role="alert"]')).toContainText('Added to cart');

    // Navigate to checkout
    await page.click('a[href="/checkout"]');
    
    // Fill in shipping
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'Springfield');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page).toHaveURL('/confirmation');
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('shows validation errors on empty form', async ({ page }) => {
    await page.goto('/checkout');
    
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Address is required')).toBeVisible();
  });
});
```

## Mocking

### 1. Mocking Modules

```typescript
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

// Mock the API module
vi.mock('../../api/users', () => ({
  getUser: vi.fn(() => 
    Promise.resolve({ id: 1, name: 'John Doe' })
  )
}));

it('displays user data', async () => {
  render(<UserProfile id="1" />);
  
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 2. Mocking fetch

```typescript
global.fetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

it('fetches and displays posts', async () => {
  global.fetch.mockResolvedValueOnce({
    json: () => Promise.resolve([
      { id: 1, title: 'Post 1' }
    ])
  } as Response);

  render(<PostList />);

  await waitFor(() => {
    expect(screen.getByText('Post 1')).toBeInTheDocument();
  });
});
```

## Test Organization

**Best structure:**
```bash
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx      # Co-located tests
├── hooks/
│   ├── useCounter.ts
│   └── useCounter.test.ts
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
└── __tests__/
    └── integration.test.ts
```

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# UI mode
npm run test -- --ui

# Coverage
npm run test -- --coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui
```

## Coverage Goals

```
Statements   : 80%+
Branches     : 75%+
Functions    : 80%+
Lines        : 80%+
```

## Common Assertions

```typescript
expect(value).toBe(expected);              // Strict equality
expect(value).toEqual(expected);           // Deep equality
expect(string).toMatch(/regex/);           // Regex match
expect(array).toContain(item);             // Array includes
expect(func).toHaveBeenCalled();           // Called at least once
expect(func).toHaveBeenCalledWith(arg);    // Called with args
expect(element).toBeInTheDocument();       // In DOM
expect(element).toBeVisible();             // Visible on screen
expect(element).toBeDisabled();            // Is disabled
expect(promise).resolves.toEqual(value);   // Promise resolves
expect(promise).rejects.toThrow();         // Promise rejects
```

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Last Updated: March 2026
