import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly getStartedButton: Locator;
  readonly appTitle: Locator;
  readonly createRoomButton: Locator;
  readonly joinRoomButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.getStartedButton = page.getByRole('button', { name: /get started/i });
    this.appTitle = page.getByRole('heading', { name: 'BillShare' });
    this.createRoomButton = page.getByRole('button', { name: /create room/i });
    this.joinRoomButton = page.getByRole('button', { name: /join room/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async openCreateRoomDialog() {
    await this.createRoomButton.click();
  }

  async openJoinRoomDialog() {
    await this.joinRoomButton.click();
  }
}

export class RoomPage {
  readonly page: Page;
  readonly roomName: Locator;
  readonly roomCode: Locator;
  readonly copyCodeButton: Locator;
  readonly addExpenseButton: Locator;
  readonly deleteRoomButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.roomCode = page.locator('code');
    this.copyCodeButton = page.getByRole('button', { name: /copy/i });
    this.addExpenseButton = page.getByRole('button', { name: /add expense/i });
    this.deleteRoomButton = page.getByRole('button', { name: /delete/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.roomName = page.locator('h1').nth(1);
  }

  async goto(code: string) {
    await this.page.goto(`/room/${code}`);
  }

  async copyRoomCode() {
    await this.copyCodeButton.click();
  }

  async openAddExpenseDialog() {
    await this.addExpenseButton.click();
  }

  async deleteRoom() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteRoomButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async getRoomCodeText(): Promise<string> {
    return (await this.roomCode.textContent()) || '';
  }

  async waitForExpenseToAppear(description: string) {
    await this.page.getByText(description).waitFor({ state: 'visible' });
  }
}

export class RoomDialogs {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createRoom(roomName: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    
    await this.page.getByLabel(/room name/i).fill(roomName);
    await this.page.getByRole('button', { name: /create/i }).click();
    await dialog.waitFor({ state: 'hidden' });
  }

  async joinRoom(roomCode: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    
    await this.page.getByLabel(/room code/i).fill(roomCode);
    await this.page.getByRole('button', { name: /join/i }).click();
    await dialog.waitFor({ state: 'hidden' });
  }
}

export class ExpenseDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addExpense(description: string, amount: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    
    await this.page.getByLabel(/description/i).fill(description);
    await this.page.getByLabel(/amount/i).fill(amount);
    await this.page.getByRole('button', { name: /add|save/i }).click();
    await dialog.waitFor({ state: 'hidden' });
  }
}
