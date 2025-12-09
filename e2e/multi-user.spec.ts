import { test as base, expect } from '@playwright/test';
import { BrowserContext, Page } from '@playwright/test';

const test = base.extend<{
  context: BrowserContext;
  page: Page;
  secondUserContext: BrowserContext;
  secondUserPage: Page;
}>({
  context: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },

  secondUserContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },

  secondUserPage: async ({ secondUserContext }, use) => {
    const page = await secondUserContext.newPage();
    await use(page);
  },
});

test.describe.skip('Multi-User Scenarios', () => {
  test('two users should see the same room', async ({ page, secondUserPage }) => {
    const roomCode = 'SHARED_ROOM';
    
    await page.goto(`/room/${roomCode}`);
    await secondUserPage.goto(`/room/${roomCode}`);
    
    await expect(page.locator('code')).toHaveText(roomCode);
    await expect(secondUserPage.locator('code')).toHaveText(roomCode);
  });

  test('expense added by one user should appear for another user', async ({
    page,
    secondUserPage,
  }) => {
    const roomCode = 'SHARED_ROOM';
    const expenseName = `Shared Expense ${Date.now()}`;
    
    await page.goto(`/room/${roomCode}`);
    await secondUserPage.goto(`/room/${roomCode}`);
    
    await page.getByRole('button', { name: /add expense/i }).click();
    await page.getByLabel(/description/i).fill(expenseName);
    await page.getByLabel(/amount/i).fill('50.00');
    await page.getByRole('button', { name: /add|save/i }).click();
    
    await expect(page.getByText(expenseName)).toBeVisible();
    await expect(secondUserPage.getByText(expenseName)).toBeVisible({
      timeout: 10000,
    });
  });

  test('room deletion by owner should redirect all users', async ({
    page,
    secondUserPage,
  }) => {
    const roomCode = 'ROOM_TO_DELETE';
    
    await page.goto(`/room/${roomCode}`);
    await secondUserPage.goto(`/room/${roomCode}`);
    
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /delete/i }).click();
    
    await expect(page).toHaveURL('/');
    
    await secondUserPage.reload();
    await expect(secondUserPage.getByText(/room not found/i)).toBeVisible();
  });

  test('participants list should update when user joins', async ({
    page,
    secondUserPage,
  }) => {
    const roomCode = 'PARTICIPANTS_TEST';
    
    await page.goto(`/room/${roomCode}`);
    
    const initialParticipants = await page
      .getByRole('heading', { name: /participants/i })
      .locator('..')
      .locator('[data-participant]')
      .count();
    
    await secondUserPage.goto(`/room/${roomCode}`);
    await page.waitForTimeout(2000);
    
    const updatedParticipants = await page
      .getByRole('heading', { name: /participants/i })
      .locator('..')
      .locator('[data-participant]')
      .count();
    
    expect(updatedParticipants).toBeGreaterThan(initialParticipants);
  });
});

test.describe('Concurrent Actions', () => {
  test.skip('should handle concurrent expense additions', async ({
    page,
    secondUserPage,
  }) => {
    const roomCode = 'CONCURRENT_TEST';
    
    await page.goto(`/room/${roomCode}`);
    await secondUserPage.goto(`/room/${roomCode}`);
    
    const expense1Promise = (async () => {
      await page.getByRole('button', { name: /add expense/i }).click();
      await page.getByLabel(/description/i).fill('Expense 1');
      await page.getByLabel(/amount/i).fill('25.00');
      await page.getByRole('button', { name: /add/i }).click();
    })();
    
    const expense2Promise = (async () => {
      await secondUserPage.getByRole('button', { name: /add expense/i }).click();
      await secondUserPage.getByLabel(/description/i).fill('Expense 2');
      await secondUserPage.getByLabel(/amount/i).fill('30.00');
      await secondUserPage.getByRole('button', { name: /add/i }).click();
    })();
    
    await Promise.all([expense1Promise, expense2Promise]);
    
    await expect(page.getByText('Expense 1')).toBeVisible();
    await expect(page.getByText('Expense 2')).toBeVisible();
    await expect(secondUserPage.getByText('Expense 1')).toBeVisible();
    await expect(secondUserPage.getByText('Expense 2')).toBeVisible();
  });
});

test.describe.skip('Group Scenarios', () => {
  test('should handle 5 users in the same room', async ({ browser }) => {
    const roomCode = 'GROUP_TEST';
    const userCount = 5;
    
    const contexts = await Promise.all(
      Array.from({ length: userCount }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map((context) => context.newPage())
    );
    
    try {
      await Promise.all(pages.map((page) => page.goto(`/room/${roomCode}`)));
      
      for (const page of pages) {
        await expect(page.locator('code')).toHaveText(roomCode);
      }
      
      const participantCount = await pages[0]
        .getByRole('heading', { name: /participants/i })
        .locator('..')
        .locator('[data-participant]')
        .count();
      
      expect(participantCount).toBe(userCount);
    } finally {
      await Promise.all(pages.map((page) => page.close()));
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
});
