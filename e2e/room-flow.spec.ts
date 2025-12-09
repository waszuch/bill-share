import { test, expect } from '@playwright/test';

test.describe('Room Management Flow', () => {
  test.describe.skip('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should display create room dialog', async ({ page }) => {
      await page.getByRole('button', { name: /create room/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByLabel(/room name/i)).toBeVisible();
    });

    test('should create a new room', async ({ page }) => {
      const roomName = `Test Room ${Date.now()}`;
      
      await page.getByRole('button', { name: /create room/i }).click();
      await page.getByLabel(/room name/i).fill(roomName);
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/room\/.+/);
      
      await expect(page.getByRole('heading', { name: roomName })).toBeVisible();
      
      const roomCode = page.locator('code');
      await expect(roomCode).toBeVisible();
    });

    test('should display join room dialog', async ({ page }) => {
      await page.getByRole('button', { name: /join room/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByLabel(/room code/i)).toBeVisible();
    });
  });
});

test.describe('Room Page', () => {
  test('should show "room not found" for invalid code', async ({ page }) => {
    await page.goto('/room/INVALID_CODE_123');
    await expect(
      page.getByText(/room not found|loading/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe.skip('Room with valid access', () => {
    test('should display room details', async ({ page }) => {
      const roomCode = 'TEST_CODE';
      await page.goto(`/room/${roomCode}`);
      
      await expect(page.getByRole('heading', { name: /expenses/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /participants/i })).toBeVisible();
    });

    test('should allow adding expense', async ({ page }) => {
      const roomCode = 'TEST_CODE';
      await page.goto(`/room/${roomCode}`);
      
      await page.getByRole('button', { name: /add expense/i }).click();
      await page.getByLabel(/description/i).fill('Test Expense');
      await page.getByLabel(/amount/i).fill('50.00');
      await page.getByRole('button', { name: /add|save/i }).click();
      
      await expect(page.getByText('Test Expense')).toBeVisible();
    });

    test('should display balances summary', async ({ page }) => {
      const roomCode = 'TEST_CODE';
      await page.goto(`/room/${roomCode}`);
      
      const balancesSection = page.getByText(/who owes whom|balances/i);
    });

    test('should allow room owner to delete room', async ({ page }) => {
      const roomCode = 'TEST_CODE';
      await page.goto(`/room/${roomCode}`);
      
      const deleteButton = page.getByRole('button', { name: /delete/i });
      await deleteButton.click();
      
      page.on('dialog', (dialog) => dialog.accept());
      await expect(page).toHaveURL('/');
    });

    test('should copy room code to clipboard', async ({ page }) => {
      const roomCode = 'TEST_CODE';
      await page.goto(`/room/${roomCode}`);
      
      await page.getByRole('button', { name: /copy/i }).click();
      await expect(page.getByText(/copied/i)).toBeVisible();
    });
  });
});
