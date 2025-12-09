import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).toContain('BillShare');
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = await page.getByRole('button').all();
    let focusableButtonsCount = 0;
    
    for (const button of buttons) {
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (isVisible && isEnabled) {
        try {
          await button.focus();
          const isFocused = await button.evaluate(
            (el) => el === document.activeElement
          );
          if (isFocused) {
            focusableButtonsCount++;
          }
        } catch (e) {
        }
      }
    }
    
    expect(focusableButtonsCount).toBeGreaterThan(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/');
    
    const inputs = await page.locator('input[type="text"], input[type="email"]').all();

    for (const input of inputs) {
      const isVisible = await input.isVisible();
      if (isVisible) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
        const isLabeled = hasLabel || ariaLabel || ariaLabelledBy;
        
        expect(isLabeled).toBe(true);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(colorContrastViolations).toEqual([]);
  });
});

test.describe.skip('Accessibility - Authenticated pages', () => {
  test('room page should not have accessibility violations', async ({ page }) => {
    const roomCode = 'TEST_CODE';
    await page.goto(`/room/${roomCode}`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
