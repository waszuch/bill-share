import { test, expect } from '@playwright/test';
import { HomePage, RoomPage } from './helpers/page-objects';
import { generateRoomName } from './helpers/test-data';

test.describe('Example: Using Page Objects', () => {
  test('should navigate homepage using page objects', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await expect(homePage.appTitle).toBeVisible();
    await expect(homePage.signInButton).toBeVisible();
  });

  test.skip('should create room using page objects', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomName = generateRoomName();
    
    await homePage.goto();
    await homePage.openCreateRoomDialog();
    
    const roomPage = new RoomPage(page);
    await expect(roomPage.roomCode).toBeVisible();
  });

  test('should show proper error for invalid room', async ({ page }) => {
    const roomPage = new RoomPage(page);
    
    await roomPage.goto('INVALID_CODE');
    await expect(
      page.getByText(/room not found|loading/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
