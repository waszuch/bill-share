import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting e2e tests setup...');

  const { baseURL } = config.projects[0].use;
  if (baseURL) {
    console.log(`✅ Testing against: ${baseURL}`);
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
