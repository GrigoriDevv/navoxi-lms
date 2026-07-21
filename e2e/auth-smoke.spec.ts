import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  test("login page loads and demo-status is JSON", async ({ page, request }) => {
    const status = await request.get("/api/auth/demo-status");
    expect(status.ok()).toBeTruthy();
    const body = await status.json();
    expect(body).toEqual(
      expect.objectContaining({
        enabled: expect.any(Boolean),
        allowed: expect.any(Boolean),
      })
    );

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Acessar plataforma" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});
