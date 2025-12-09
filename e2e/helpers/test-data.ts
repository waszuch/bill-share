export function generateRoomName(): string {
  return `Test Room ${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateExpenseData() {
  return {
    description: `Test Expense ${Date.now()}`,
    amount: (Math.random() * 100 + 10).toFixed(2),
    paidBy: 'Test User',
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockSupabaseSession() {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  };
}
