import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title and branding', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'BillShare' })).toBeVisible();
  });

  test('should show sign in button for unauthenticated users', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    
    await expect(page.getByText('Split bills with friends')).toBeVisible();
    await expect(
      page.getByText('Create a room, add expenses, and see who owes what.')
    ).toBeVisible();
  });

  test('should show get started button', async ({ page }) => {
    const getStartedButton = page.getByRole('button', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();
  });

  test('should have proper page structure and accessibility', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { name: 'BillShare' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const filteredErrors = consoleErrors.filter(
      (error) => !error.includes('supabase')
    );

    expect(filteredErrors).toHaveLength(0);
  });
});
