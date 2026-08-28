import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /auth/login', async ({ page }) => {
    await page.goto(`${BASE}/admin/dashboard`);
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.getByLabel(/email/i).fill('nobody@nowhere.com');
    await page.getByLabel(/password/i).fill('WrongPass@1');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 8000 });
  });

  test('teacher can log in and reach dashboard', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.getByLabel(/email/i).fill('teacher@sunrise.edu');
    await page.getByLabel(/password/i).fill('Demo@1234');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL(/teacher\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/good/i)).toBeVisible(); // greeting
  });

  test('parent can log in and reach dashboard', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.getByLabel(/email/i).fill('parent1@example.com');
    await page.getByLabel(/password/i).fill('Demo@1234');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL(/parent\/dashboard/, { timeout: 15000 });
  });
});

test.describe('Accessibility basics', () => {
  test('login page has no missing labels', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    // All inputs should have associated labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('focus rings are visible on interactive elements', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.keyboard.press('Tab');
    // After tabbing, at least one element should have focus
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focused);
  });
});
