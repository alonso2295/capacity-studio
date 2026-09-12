import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("capacity-studio.basic-auth", "Basic ZmFrZS1wYWdlOnRlc3Q=");
    });
    await use(page);
  },
});

export const unauthenticatedTest = base;
export { expect };
