import { expect, test } from '@playwright/test';

// Smoke (P0-34). Login → dashboard needs a real auth provider; it joins the Better Auth task (P1).

test('the server answers on the sign-in route', async ({ request }) => {
  const response = await request.get('/handler/sign-in');
  expect(response.status()).toBe(200);
});

test('a visitor who is not signed in is sent from the dashboard to sign-in', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/handler\/sign-in$/);
});

test('the home page leads a visitor to sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/handler\/sign-in$/);
});
