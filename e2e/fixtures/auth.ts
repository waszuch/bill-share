import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect } from '@playwright/test';
