import { expect, unauthenticatedTest } from "./fixtures";

unauthenticatedTest.describe("Autenticación básica", () => {
  unauthenticatedTest("redirige a login cuando no existe una sesión", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });

  unauthenticatedTest("inicia sesión con credenciales válidas y guarda la sesión temporal", async ({ page }) => {
    await page.route("**/api/v1/auth/verify", async (route) => {
      await route.fulfill({ json: { user_id: "capacity-admin", role: "Chapter Lead" } });
    });
    await page.goto("/login");
    await page.getByLabel("Usuario").fill("capacity-admin");
    await page.getByLabel("Clave").fill("correct-password");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.evaluate(() => window.sessionStorage.getItem("capacity-studio.basic-auth"))).resolves.toMatch(/^Basic /);
  });

  unauthenticatedTest("rechaza credenciales inválidas y no crea sesión", async ({ page }) => {
    await page.route("**/api/v1/auth/verify", async (route) => {
      await route.fulfill({ status: 401, headers: { "WWW-Authenticate": "Basic" }, json: { detail: "Autenticación requerida" } });
    });
    await page.goto("/login");
    await page.getByLabel("Usuario").fill("capacity-admin");
    await page.getByLabel("Clave").fill("wrong-password");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText("El usuario o la clave no son válidos.", { exact: true })).toBeVisible();
    await expect(page.evaluate(() => window.sessionStorage.getItem("capacity-studio.basic-auth"))).resolves.toBeNull();
  });

  unauthenticatedTest("limpia la sesión y vuelve a login si la API responde 401", async ({ page }) => {
    await page.route("**/api/v1/providers?status=all", async (route) => {
      await route.fulfill({ status: 401, headers: { "WWW-Authenticate": "Basic" }, json: { detail: "Autenticación requerida" } });
    });
    await page.goto("/login");
    await page.evaluate(() => window.sessionStorage.setItem("capacity-studio.basic-auth", "Basic ZmFrZS1wYWdlOnRlc3Q="));
    await page.goto("/providers");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.evaluate(() => window.sessionStorage.getItem("capacity-studio.basic-auth"))).resolves.toBeNull();
  });
});
