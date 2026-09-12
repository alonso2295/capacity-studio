import { expect, test } from "./fixtures";

const activeProvider = {
  id: "provider-1",
  name: "Proveedor Uno",
  ruc: "AB123",
  focal_point: "Ana Contacto",
  mobile: null,
  is_active: true,
};

const inactiveProvider = {
  id: "provider-2",
  name: "Proveedor Inactivo",
  ruc: "CD456",
  focal_point: "Luis Contacto",
  mobile: "999999999",
  is_active: false,
};

test("consulta proveedores y filtra por estado", async ({ page }) => {
  await page.route("**/api/v1/providers?status=all", async (route) => {
    await route.fulfill({ json: [activeProvider, inactiveProvider] });
  });
  await page.goto("/providers");

  await expect(page.getByRole("heading", { name: "Proveedores", exact: true })).toBeVisible();
  await expect(page.getByText("Proveedor Uno")).toBeVisible();
  await expect(page.getByText("Proveedor Inactivo")).toBeVisible();
  await page.route("**/api/v1/providers?status=active", async (route) => {
    await route.fulfill({ json: [activeProvider] });
  });
  await page.getByLabel("Filtrar por estado").selectOption("active");
  await expect(page.getByText("Proveedor Inactivo")).toBeHidden();
});

test("registra un proveedor", async ({ page }) => {
  await page.route("**/api/v1/providers?status=all", async (route) => {
    await route.fulfill({ json: [activeProvider] });
  });
  await page.route("**/api/v1/providers", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: { ...activeProvider, name: "Nuevo Proveedor", ruc: "XY789" } });
    }
  });
  await page.goto("/providers/new");
  await page.getByLabel("Razón social").fill("Nuevo Proveedor");
  await page.getByLabel("RUC").fill(" xy789 ");
  await page.getByLabel("Focal point").fill("María Contacto");
  await page.getByRole("button", { name: "Crear proveedor" }).click();
  await expect(page.getByRole("status")).toContainText("Proveedor registrado correctamente");
});

test("desactiva un proveedor sin borrarlo", async ({ page }) => {
  let currentProvider = activeProvider;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/v1/providers?status=all", async (route) => {
    await route.fulfill({ json: [currentProvider] });
  });
  await page.route("**/api/v1/providers/provider-1", async (route) => {
    if (route.request().method() === "DELETE") {
      currentProvider = { ...activeProvider, is_active: false };
      await route.fulfill({ json: currentProvider });
    }
  });
  await page.goto("/providers");
  await page.getByRole("button", { name: "Desactivar" }).click();
  await expect(page.getByRole("button", { name: "Reactivar" })).toBeVisible();
});
