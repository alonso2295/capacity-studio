import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

const candidate = {
  id: "member-1",
  dni: "12345678",
  full_name: "Ana Pérez Gómez",
  vendor_id: "vendor-1",
  vendor_name: "Proveedor Uno",
  professional_role_id: "role-1",
  professional_role_name: "Data Engineer",
  seniority: "SENIOR",
};

const assignment = {
  id: "assignment-1",
  member_id: "member-1",
  member_dni: candidate.dni,
  member_full_name: candidate.full_name,
  vendor_id: candidate.vendor_id,
  vendor_name: candidate.vendor_name,
  professional_role_id: candidate.professional_role_id,
  professional_role_name: candidate.professional_role_name,
  seniority: candidate.seniority,
  assigned_squad_id: "squad-1",
  assigned_squad_code: "DATA01",
  assigned_squad_name: "Data Platform",
  executor_squad_id: "squad-2",
  executor_squad_code: "DATA02",
  executor_squad_name: "Data Analytics",
  member_resigned: false,
  project_code: "PROJ-42/ETL!",
  start_date: "2026-01-01",
  end_date: "2026-03-31",
  allocation_percentage: 60,
};

async function mockCatalogs(page: Page) {
  await page.route("**/api/v1/providers?status=all", async (route) => {
    await route.fulfill({ json: [{ id: "vendor-1", name: "Proveedor Uno", ruc: "AB123", focal_point: "Ana", mobile: null, is_active: true }] });
  });
  await page.route("**/api/v1/catalogs/professional-roles", async (route) => {
    await route.fulfill({ json: [{ id: "role-1", name: "Data Engineer" }] });
  });
  await page.route("**/api/v1/squads?status=all", async (route) => {
    await route.fulfill({ json: [{ id: "squad-1", code: "DATA01", name: "Data Platform", tribe: null, product_owner_name: null, is_active: true }, { id: "squad-2", code: "DATA02", name: "Data Analytics", tribe: null, product_owner_name: null, is_active: true }] });
  });
}

test("crea una asignación desde el modal con datos automáticos", async ({ page }) => {
  await mockCatalogs(page);
  let currentAssignments: typeof assignment[] = [];
  await page.route("**/api/v1/assignments**", async (route) => {
    const request = route.request();
    if (request.method() === "GET" && request.url().includes("/candidates")) {
      await route.fulfill({ json: [candidate] });
      return;
    }
    if (request.method() === "GET") {
      await route.fulfill({ json: currentAssignments });
      return;
    }
    if (request.method() === "POST") {
      currentAssignments = [assignment];
      await route.fulfill({ status: 201, json: assignment });
    }
  });
  await page.goto("/assignments");
  await page.getByRole("button", { name: "Nueva asignación" }).click();
  await page.getByRole("dialog").getByLabel("Buscar por nombre o DNI").fill("Ana");
  await expect(page.getByRole("dialog").getByText(candidate.full_name, { exact: true })).toBeVisible();
  await page.getByRole("dialog").getByText(candidate.full_name, { exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("DNI", { exact: true })).toHaveValue(candidate.dni);
  await expect(page.getByRole("dialog").getByLabel("Proveedor")).toHaveValue(candidate.vendor_name);
  await page.getByRole("dialog").getByLabel("Squad Asignado * obligatorio").selectOption("squad-1");
  await expect(page.getByRole("dialog").getByLabel("Squad Ejecutor * obligatorio")).toHaveValue("squad-1");
  await page.getByRole("dialog").getByLabel("Código de proyecto").fill(" PROJ-42/ETL! ");
  await page.getByRole("dialog").getByLabel("Fecha de inicio").fill("2026-01-01");
  await page.getByRole("dialog").getByLabel("Fecha fin").fill("2026-03-31");
  await page.getByRole("dialog").getByLabel("Porcentaje de asignación").fill("60");
  await page.getByRole("button", { name: "Guardar asignación" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("PROJ-42/ETL!")).toBeVisible();
});

test("filtra asignaciones y conserva los filtros al cambiar a cards", async ({ page }) => {
  await mockCatalogs(page);
  await page.route("**/api/v1/assignments**", async (route) => {
    if (route.request().method() !== "GET") return;
    const url = new URL(route.request().url());
    const filtered = url.searchParams.get("vendor_id") === "vendor-1" && url.searchParams.get("assigned_squad_id") === "squad-1";
    await route.fulfill({ json: filtered || !url.search ? [assignment] : [] });
  });
  await page.goto("/assignments");
  await page.getByLabel("Buscar por nombre o DNI").fill("Ana");
  await page.getByLabel("Filtrar por proveedor").selectOption("vendor-1");
  await page.getByLabel("Filtrar por Squad Asignado").selectOption("squad-1");
  await expect(page.getByText("PROJ-42/ETL!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cards" }).click();
  await expect(page.getByRole("heading", { name: "Data Platform", exact: true })).toBeVisible();
  await expect(page.getByText("PROJ-42/ETL!")).toBeVisible();
});

test("marca una renuncia, conserva la fecha fin y filtra en tabla y cards", async ({ page }) => {
  await mockCatalogs(page);
  let currentAssignment = { ...assignment };
  await page.route("**/api/v1/assignments**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      const url = new URL(request.url());
      const resignationFilter = url.searchParams.get("member_resigned");
      await route.fulfill({
        json: resignationFilter === "true" && !currentAssignment.member_resigned ? [] : [currentAssignment],
      });
      return;
    }
    if (request.method() === "PATCH") {
      const body = request.postDataJSON() as { member_resigned?: boolean; end_date?: string };
      currentAssignment = {
        ...currentAssignment,
        member_resigned: body.member_resigned ?? currentAssignment.member_resigned,
        end_date: body.end_date ?? currentAssignment.end_date,
      };
      await route.fulfill({ json: currentAssignment });
    }
  });

  await page.goto("/assignments");
  const activeRow = page.getByRole("row").filter({ hasText: candidate.full_name });
  await expect(activeRow.getByRole("cell").first()).not.toHaveClass(/text-brand-magenta-700/);
  await expect(activeRow).not.toContainText("Miembro renunció");
  await page.getByRole("button", { name: "Editar asignación" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("checkbox", { name: "Miembro renunció" })).not.toBeChecked();
  await expect(dialog.getByLabel("Fecha fin")).toHaveValue("2026-03-31");
  await dialog.getByRole("checkbox", { name: "Miembro renunció" }).check();
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  const assignmentRow = page.getByRole("row").filter({ hasText: candidate.full_name });
  await expect(assignmentRow.getByRole("cell").first()).toHaveClass(/text-brand-magenta-700/);
  await expect(assignmentRow.getByRole("cell").first()).toHaveCSS("color", "rgb(197, 31, 89)");
  await expect(assignmentRow.getByRole("cell").first()).toContainText("Miembro renunció");
  await page.getByLabel("Filtrar por renuncia").selectOption("true");
  const filteredRow = page.getByRole("row").filter({ hasText: candidate.full_name });
  await expect(filteredRow.getByRole("cell").first()).toHaveClass(/text-brand-magenta-700/);
  await expect(filteredRow.getByRole("cell").first()).toContainText("Miembro renunció");
  await page.getByRole("button", { name: "Cards" }).click();
  const card = page.locator("article").filter({ hasText: candidate.full_name });
  await expect(card.getByRole("heading", { name: candidate.full_name, exact: true })).toBeVisible();
  await expect(card).toContainText("Data Engineer");
  await expect(card).toContainText("Proveedor Uno");
  await expect(card).toContainText("PROJ-42/ETL!");
  await expect(card).toContainText("Squad Ejecutor");
  await expect(card).toContainText("Data Analytics");
  await expect(card).toContainText("60%");
  await expect(card.getByText("Miembro renunció", { exact: true })).toHaveCount(0);
  await expect(card).not.toContainText(candidate.dni);
  await expect(card).not.toContainText("Senior");
  await expect(card).not.toContainText("2026-01-01");
  await expect(card).not.toContainText("2026-03-31");
  await expect(card).not.toContainText("Data Platform");
});

test("filtra por fechas inclusivas y muestra cards con información esencial", async ({ page }) => {
  await mockCatalogs(page);
  const secondAssignment = {
    ...assignment,
    id: "assignment-2",
    member_id: "member-2",
    member_dni: "87654321",
    member_full_name: "Luis Pérez Gómez",
    professional_role_id: "role-1",
    professional_role_name: "Data Engineer",
    start_date: "2026-03-31",
    end_date: "2026-04-30",
    project_code: "PROJ-43",
  };
  const thirdAssignment = {
    ...assignment,
    id: "assignment-3",
    member_id: "member-3",
    member_dni: "11223344",
    member_full_name: "Marta Díaz Ruiz",
    professional_role_id: "role-2",
    professional_role_name: "Data Architect",
    start_date: "2026-03-31",
    end_date: "2026-05-31",
    project_code: "PROJ-44",
  };
  await page.route("**/api/v1/assignments**", async (route) => {
    if (route.request().method() !== "GET") return;
    const url = new URL(route.request().url());
    const usesInclusiveBoundary = url.searchParams.get("start_date") === "2026-03-31" && url.searchParams.get("end_date") === "2026-03-31";
    await route.fulfill({ json: usesInclusiveBoundary ? [assignment, secondAssignment, thirdAssignment] : [] });
  });
  await page.goto("/assignments");
  const startDate = page.getByLabel("Filtrar desde fecha de inicio");
  const endDate = page.getByLabel("Filtrar hasta fecha fin");
  await startDate.fill("2026-03-31");
  await expect(startDate).toHaveValue("2026-03-31");
  await endDate.fill("2026-03-31");
  await expect(endDate).toHaveValue("2026-03-31");
  await page.getByRole("button", { name: "Cards" }).click();
  await expect(page.getByRole("heading", { name: "Data Platform", exact: true })).toBeVisible();
  await expect(page.getByText("2 Data Engineer, 1 Data Architect", { exact: true })).toBeVisible();
  const cards = page.locator("article");
  await expect(cards).toHaveCount(3);
  for (const name of [assignment.member_full_name, secondAssignment.member_full_name, thirdAssignment.member_full_name]) {
    await expect(cards.filter({ hasText: name }).getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(cards.filter({ hasText: assignment.member_full_name })).toContainText("Proyecto");
  await expect(cards.filter({ hasText: assignment.member_full_name })).toContainText("Squad Ejecutor");
  await expect(cards.filter({ hasText: assignment.member_full_name })).toContainText("Data Analytics");
  await expect(cards.filter({ hasText: assignment.member_full_name })).toContainText("Capacidad asignada");
  for (const name of [assignment.member_full_name, secondAssignment.member_full_name, thirdAssignment.member_full_name]) {
    const card = cards.filter({ hasText: name });
    await expect(card).not.toContainText("Senior");
    await expect(card).not.toContainText("2026-03-31");
    await expect(card).not.toContainText("Data Platform");
  }
  await expect(cards.filter({ hasText: assignment.member_full_name })).not.toContainText(assignment.member_dni);
  await expect(cards.filter({ hasText: secondAssignment.member_full_name })).not.toContainText(secondAssignment.member_dni);
  await expect(cards.filter({ hasText: thirdAssignment.member_full_name })).not.toContainText(thirdAssignment.member_dni);
  await page.getByRole("tab", { name: "Squad Ejecutor" }).click();
  await expect(page.getByRole("heading", { name: "Data Analytics", exact: true })).toBeVisible();
});

test("muestra Planilla y acciones accesibles de icono en cards", async ({ page }) => {
  await mockCatalogs(page);
  const payrollAssignment = { ...assignment, vendor_id: null, vendor_name: null };
  let currentAssignment: typeof payrollAssignment | undefined = payrollAssignment;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/v1/assignments**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ json: currentAssignment ? [currentAssignment] : [] });
      return;
    }
    if (request.method() === "PATCH") {
      await route.fulfill({ json: currentAssignment });
      return;
    }
    if (request.method() === "DELETE") {
      currentAssignment = undefined;
      await route.fulfill({ status: 204 });
    }
  });

  await page.goto("/assignments");
  await page.getByRole("button", { name: "Cards" }).click();
  const card = page.locator("article").filter({ hasText: payrollAssignment.member_full_name });
  await expect(card).toContainText("Planilla");
  await expect(card).toContainText("Data Analytics");
  const editButton = card.getByRole("button", { name: "Editar asignación" });
  const deleteButton = card.getByRole("button", { name: "Eliminar asignación" });
  await expect(editButton).toHaveAttribute("title", "Editar asignación");
  await expect(deleteButton).toHaveAttribute("title", "Eliminar asignación");
  await editButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await deleteButton.click();
  await expect(page.getByText("No hay asignaciones para los filtros seleccionados.")).toBeVisible();
});

test("las cards no generan overflow horizontal en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockCatalogs(page);
  await page.route("**/api/v1/assignments**", async (route) => await route.fulfill({ json: [{ ...assignment, member_full_name: "Nombre de colaborador con un nombre suficientemente extenso para probar el wrapping", project_code: "PROYECTO-CON-CODIGO-MUY-LARGO/ETL!" }] }));
  await page.goto("/assignments");
  await page.getByRole("button", { name: "Cards" }).click();
  await expect(page.locator("article")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("edita y elimina una asignación con confirmación", async ({ page }) => {
  await mockCatalogs(page);
  let currentAssignment: typeof assignment | undefined = assignment;
  page.on("dialog", (dialog) => dialog.accept());
  await page.route("**/api/v1/assignments**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ json: currentAssignment ? [currentAssignment] : [] });
      return;
    }
    if (request.method() === "PATCH") {
      if (!currentAssignment) {
        await route.fulfill({ status: 404, json: { detail: "No existe" } });
        return;
      }
      const body = request.postDataJSON() as { project_code?: string; allocation_percentage?: number };
      currentAssignment = { ...currentAssignment, project_code: body.project_code ?? currentAssignment.project_code, allocation_percentage: body.allocation_percentage ?? currentAssignment.allocation_percentage };
      await route.fulfill({ json: currentAssignment });
      return;
    }
    if (request.method() === "DELETE") {
      currentAssignment = undefined;
      await route.fulfill({ status: 204 });
    }
  });
  await page.goto("/assignments");
  await expect(page.getByRole("columnheader", { name: "Renuncia", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Ordenar por Renuncia/ })).toHaveCount(0);
  const editButton = page.getByRole("button", { name: "Editar asignación" });
  const deleteButton = page.getByRole("button", { name: "Eliminar asignación" });
  await expect(editButton).toHaveAttribute("title", "Editar asignación");
  await expect(deleteButton).toHaveAttribute("title", "Eliminar asignación");
  await editButton.click();
  await page.getByLabel("Código de proyecto").fill("PROJ-UPDATED");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("PROJ-UPDATED")).toBeVisible();
  await page.getByRole("button", { name: "Eliminar asignación" }).click();
  await expect(page.getByText("No hay asignaciones para los filtros seleccionados.")).toBeVisible();
});

test("el formulario de asignación no genera overflow horizontal en móvil", async ({ page }) => {
  await mockCatalogs(page);
  await page.route("**/api/v1/assignments", async (route) => await route.fulfill({ json: [] }));
  await page.goto("/assignments");
  await page.getByRole("button", { name: "Nueva asignación" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("inicia los filtros de fechas vacíos y los restaura al limpiar", async ({ page }) => {
  const requests: URL[] = [];

  await page.route("**/api/v1/assignments**", async (route) => {
    if (route.request().method() !== "GET") return;
    const url = new URL(route.request().url());
    requests.push(url);
    await route.fulfill({ json: { items: [assignment], total: 1, page: 1, page_size: 20, total_pages: 1 } });
  });
  await page.goto("/assignments");
  const startDate = page.getByLabel("Filtrar desde fecha de inicio");
  const endDate = page.getByLabel("Filtrar hasta fecha fin");
  await expect(startDate).toHaveValue("");
  await expect(endDate).toHaveValue("");
  await expect.poll(() => requests.at(-1)?.searchParams.has("start_date")).toBe(false);
  await expect.poll(() => requests.at(-1)?.searchParams.has("end_date")).toBe(false);

  await startDate.fill("2026-01-01");
  await endDate.fill("2026-03-31");
  await expect(startDate).toHaveValue("2026-01-01");
  await expect(endDate).toHaveValue("2026-03-31");

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(startDate).toHaveValue("");
  await expect(endDate).toHaveValue("");
  await expect.poll(() => requests.at(-1)?.searchParams.has("start_date")).toBe(false);
  await expect.poll(() => requests.at(-1)?.searchParams.has("end_date")).toBe(false);
});

test("pagina y ordena la tabla, conserva filtros y cambia a cards sin paginación", async ({ page }) => {
  const requests: URL[] = [];
  await page.route("**/api/v1/assignments**", async (route) => {
    if (route.request().method() !== "GET") return;
    const url = new URL(route.request().url());
    requests.push(url);
    const pageNumber = Number(url.searchParams.get("page"));
    const sortBy = url.searchParams.get("sort_by");
    const sortDirection = url.searchParams.get("sort_direction");
    const row = pageNumber === 2 ? { ...assignment, id: "assignment-2", member_full_name: "Luis Pérez Gómez", project_code: "PROJ-SECOND" } : { ...assignment, member_full_name: sortBy === "member_full_name" && sortDirection === "desc" ? "Zoe Pérez Gómez" : "Ana Pérez Gómez" };
    await route.fulfill({ json: { items: [row], total: 41, page: pageNumber, page_size: Number(url.searchParams.get("page_size")), total_pages: Number(url.searchParams.get("page_size")) >= 41 ? 1 : 3 } });
  });
  await page.goto("/assignments");
  await expect(page.getByText("41 resultados", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("2");
  await expect(page.getByText("PROJ-SECOND", { exact: true })).toBeVisible();

  const memberSort = page.getByRole("button", { name: /Ordenar por Miembro/ });
  await memberSort.click();
  await expect.poll(() => requests.at(-1)?.searchParams.get("sort_by")).toBe("member_full_name");
  await expect.poll(() => requests.at(-1)?.searchParams.get("sort_direction")).toBe("asc");
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("1");
  await memberSort.click();
  await expect.poll(() => requests.at(-1)?.searchParams.get("sort_direction")).toBe("desc");

  await page.getByLabel("Tamaño de página").selectOption("50");
  await expect.poll(() => requests.at(-1)?.searchParams.get("page_size")).toBe("50");
  await expect(page.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
  await page.getByRole("button", { name: "Cards" }).click();
  await expect(page.getByRole("navigation", { name: "Paginación de asignaciones" })).toHaveCount(0);
  await expect(page.getByText("PROJ-42/ETL!", { exact: true })).toBeVisible();
});

test("descarga las asignaciones aplicando los filtros sin paginación", async ({ page }) => {
  await mockCatalogs(page);
  await page.route("**/api/v1/assignments**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { items: [assignment], total: 1, page: 1, page_size: 20, total_pages: 1 } });
    }
  });
  let exportRequestUrl = "";
  await page.route("**/api/v1/assignments/export**", async (route) => {
    exportRequestUrl = route.request().url();
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="assignments.xlsx"',
      },
      body: "xlsx",
    });
  });

  await page.goto("/assignments");
  await page.getByLabel("Buscar por nombre o DNI").fill("Ana");
  await page.getByLabel("Filtrar por proveedor").selectOption("vendor-1");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar Excel" }).click();
  const download = await downloadPromise;
  const params = new URL(exportRequestUrl).searchParams;

  expect(download.suggestedFilename()).toBe("assignments.xlsx");
  expect(params.get("search")).toBe("Ana");
  expect(params.get("vendor_id")).toBe("vendor-1");
  expect(params.get("sort_by")).toBe("start_date");
  expect(params.get("page")).toBeNull();
  expect(params.get("page_size")).toBeNull();
  await expect(page.getByRole("status")).toHaveText("Excel descargado.");
});
