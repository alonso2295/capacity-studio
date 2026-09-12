import { expect, test } from "./fixtures";

const activeSquad = {
  id: "squad-1",
  code: "DATA01",
  name: "Data Platform",
  tribe: "Growth",
  product_owner_name: "Luis PO",
  is_active: true,
};

test("consulta Squads y filtra por estado", async ({ page }) => {
  await page.route("**/api/v1/squads?status=active", async (route) => {
    await route.fulfill({ json: [activeSquad] });
  });
  await page.route("**/api/v1/squads?status=inactive", async (route) => {
    await route.fulfill({ json: [{ ...activeSquad, is_active: false }] });
  });
  await page.goto("/squads");

  await expect(page.getByRole("heading", { name: "Squads", exact: true })).toBeVisible();
  await expect(page.getByText("DATA01")).toBeVisible();
  await page.getByLabel("Filtrar por estado").selectOption("inactive");
  await expect(page.getByText("Inactivo", { exact: true })).toBeVisible();
});

test("registra un Squad con datos normalizados", async ({ page }) => {
  await page.route("**/api/v1/squads", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: activeSquad });
    }
  });
  await page.goto("/squads/new");
  await page.getByLabel("Código del Squad").fill(" data01 ");
  await page.getByLabel("Nombre de Squad").fill("Data Platform");
  await page.getByLabel("Tribu").fill("Growth");
  await page.getByLabel("Nombre del PO del Squad").fill("Luis PO");
  await page.getByRole("button", { name: "Crear Squad" }).click();
  await expect(page.getByRole("status")).toContainText("Squad registrado correctamente");
});

test("edita, desactiva y reactiva un Squad", async ({ page }) => {
  let currentSquad = activeSquad;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/v1/squads/squad-1", async (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { name?: string; is_active?: boolean };
      currentSquad = { ...currentSquad, name: body.name ?? currentSquad.name, is_active: body.is_active ?? currentSquad.is_active };
      await route.fulfill({ json: currentSquad });
      return;
    }
    if (route.request().method() === "DELETE") {
      currentSquad = { ...currentSquad, is_active: false };
      await route.fulfill({ json: currentSquad });
      return;
    }
    await route.fulfill({ json: currentSquad });
  });
  await page.goto("/squads/squad-1/edit");
  await page.getByLabel("Nombre de Squad").fill("Data Platform Updated");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("Squad actualizado correctamente");

  await page.goto("/squads/squad-1");
  await page.getByRole("button", { name: "Desactivar Squad" }).click();
  await expect(page.getByText("Inactivo")).toBeVisible();
  await page.getByRole("button", { name: "Reactivar Squad" }).click();
  await expect(page.getByText("Activo")).toBeVisible();
});

test("formulario de Squads no genera scroll horizontal en móvil", async ({ page }) => {
  await page.goto("/squads/new");
  await expect(page.getByLabel("Código del Squad")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
