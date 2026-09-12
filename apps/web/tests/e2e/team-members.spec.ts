import { expect, test } from "./fixtures";

test("muestra el formulario de miembros sin scroll horizontal en móvil", async ({ page }) => {
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }] });
  });
  await page.route("**/api/v1/catalogs/vendors", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno" }] });
  });
  await page.goto("/members/new");

  await expect(page.getByRole("heading", { name: "Registrar miembro" })).toBeVisible();
  await expect(page.getByLabel("DNI")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear miembro" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("limpia y deshabilita proveedor al cambiar a planilla", async ({ page }) => {
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }] });
  });
  await page.route("**/api/v1/catalogs/vendors", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno" }] });
  });
  await page.goto("/members/new");

  const employmentType = page.getByLabel("Tipo de vínculo");
  const vendor = page.getByLabel("Proveedor");
  await expect(employmentType).toHaveValue("PLANILLA");
  await expect(vendor).toBeDisabled();
  await employmentType.selectOption("TERCERIZADO");
  await expect(vendor).toBeEnabled();
  await vendor.selectOption("vendor-1");
  await employmentType.selectOption("PLANILLA");
  await expect(vendor).toBeDisabled();
  await expect(vendor).toHaveValue("");
});

const activeMember = {
  id: "member-1",
  dni: "12345678",
  first_name: "Ana",
  paternal_surname: "Pérez",
  maternal_surname: "Gómez",
  email: "ana@example.com",
  mobile: "999999999",
  birth_date: "1990-01-01",
  employment_type: "PLANILLA" as const,
  vendor_id: null,
  vendor_name: null,
  professional_role_id: "role-1",
  professional_role_name: "Data Engineer",
  seniority: "MEDIUM" as const,
  is_active: true,
  affiliations: [],
};

test("consulta miembros y filtra por estado", async ({ page }) => {
  await page.route("**/api/v1/providers?status=active", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno", ruc: "RUC-1", focal_point: "Ana", mobile: null, is_active: true }] });
  });
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }] });
  });
  await page.route("**/api/v1/members**", async (route) => {
    const url = new URL(route.request().url());
    const inactive = url.searchParams.get("status") === "inactive";
    const item = { ...activeMember, is_active: inactive ? false : true };
    await route.fulfill({ json: { items: [item], total: 1, page: 1, page_size: 20, total_pages: 1 } });
  });
  await page.goto("/members");

  await expect(page.getByRole("heading", { name: "Miembros", exact: true })).toBeVisible();
  await expect(page.getByText("Ana Pérez")).toBeVisible();
  await page.getByLabel("Filtrar por estado").selectOption("inactive");
  await expect(page.getByText("Inactivo", { exact: true })).toBeVisible();
});

test("busca, filtra, ordena y pagina el listado de miembros", async ({ page }) => {
  const dataset = Array.from({ length: 21 }, (_, index) => ({
    ...activeMember,
    id: `member-${index + 1}`,
    dni: String(10000000 + index),
    first_name: index === 0 ? "Zoe" : `Ana${index}`,
    email: `member-${index}@example.com`,
    vendor_id: index % 2 === 0 ? "vendor-1" : null,
    vendor_name: index % 2 === 0 ? "Proveedor Uno" : null,
    professional_role_id: index % 3 === 0 ? "role-2" : "role-1",
    professional_role_name: index % 3 === 0 ? "Data Architect" : "Data Engineer",
  }));
  const requests: URL[] = [];
  await page.route("**/api/v1/providers?status=active", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno", ruc: "RUC-1", focal_point: "Ana", mobile: null, is_active: true }] });
  });
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }, { id: "role-2", name: "Data Architect" }] });
  });
  await page.route("**/api/v1/members**", async (route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    let filtered = dataset.filter((member) => url.searchParams.get("status") === "all" || member.is_active);
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    if (search) filtered = filtered.filter((member) => `${member.first_name} ${member.paternal_surname} ${member.maternal_surname} ${member.dni}`.toLowerCase().includes(search));
    if (url.searchParams.get("vendor_id")) filtered = filtered.filter((member) => member.vendor_id === url.searchParams.get("vendor_id"));
    if (url.searchParams.get("professional_role_id")) filtered = filtered.filter((member) => member.professional_role_id === url.searchParams.get("professional_role_id"));
    const sortBy = url.searchParams.get("sort_by") ?? "member_full_name";
    const direction = url.searchParams.get("sort_direction") === "desc" ? -1 : 1;
    filtered.sort((left, right) => String(left[sortBy as keyof typeof left]).localeCompare(String(right[sortBy as keyof typeof right])) * direction);
    const pageNumber = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("page_size") ?? "20");
    await route.fulfill({ json: { items: filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), total: filtered.length, page: pageNumber, page_size: pageSize, total_pages: Math.ceil(filtered.length / pageSize) } });
  });

  await page.goto("/members");
  await expect(page.getByText("Mostrando 1–20 de 21", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Página siguiente" })).toBeEnabled();
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect(page.getByText("Página 2 de 2", { exact: true })).toBeVisible();
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("2");

  const memberSort = page.getByRole("button", { name: /Ordenar por Miembro/ });
  await memberSort.click();
  await expect(memberSort).toHaveAttribute("aria-label", /ascendente/);
  await expect.poll(() => requests.at(-1)?.searchParams.get("sort_direction")).toBe("desc");

  await page.getByLabel("Buscar por nombre o DNI").fill("Zoe");
  await expect(page.getByText("Zoe Pérez Gómez", { exact: true })).toBeVisible();
  await expect(page.getByText("Mostrando 1–1 de 1", { exact: true })).toBeVisible();
  await expect.poll(() => requests.at(-1)?.searchParams.get("search")).toBe("Zoe");

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByLabel("Filtrar por proveedor").selectOption("vendor-1");
  await page.getByLabel("Filtrar por rol profesional").selectOption("role-2");
  await expect.poll(() => requests.at(-1)?.searchParams.get("vendor_id")).toBe("vendor-1");
  await expect.poll(() => requests.at(-1)?.searchParams.get("professional_role_id")).toBe("role-2");
  await expect(page.getByRole("link", { name: "Editar miembro" })).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Desactivar miembro" })).toHaveCount(4);
});

test("el listado de miembros no genera overflow horizontal en móvil", async ({ page }) => {
  await page.route("**/api/v1/providers?status=active", async (route) => await route.fulfill({ json: [] }));
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => await route.fulfill({ json: [] }));
  await page.route("**/api/v1/members**", async (route) => await route.fulfill({ json: { items: [activeMember], total: 1, page: 1, page_size: 20, total_pages: 1 } }));
  await page.goto("/members");
  await expect(page.getByRole("heading", { name: "Miembros", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("edita, desactiva y reactiva un miembro", async ({ page }) => {
  let currentMember = activeMember;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }] });
  });
  await page.route("**/api/v1/catalogs/vendors", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno" }] });
  });
  await page.route("**/api/v1/members/member-1", async (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { first_name?: string; is_active?: boolean };
      currentMember = { ...currentMember, first_name: body.first_name ?? currentMember.first_name, is_active: body.is_active ?? currentMember.is_active };
      await route.fulfill({ json: currentMember });
      return;
    }
    if (route.request().method() === "DELETE") {
      currentMember = { ...currentMember, is_active: false };
      await route.fulfill({ json: currentMember });
      return;
    }
    await route.fulfill({ json: currentMember });
  });
  await page.goto("/members/member-1/edit");
  await page.getByLabel("Nombre").fill("Carla");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page).toHaveURL(/\/members\/member-1$/);
  await expect(page.getByText("Carla Pérez")).toBeVisible();

  await page.getByRole("button", { name: "Desactivar miembro" }).click();
  await expect(page.getByText("Inactivo")).toBeVisible();
  await page.getByRole("button", { name: "Reactivar miembro" }).click();
  await expect(page.getByText("Activo")).toBeVisible();
});
