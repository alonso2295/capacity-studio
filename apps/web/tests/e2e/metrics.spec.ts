import { expect, test } from "./fixtures";

function dashboardResponse(quarter: number) {
  return {
    period: { year: 2026, quarter, start_date: `2026-${String((quarter - 1) * 3 + 1).padStart(2, "0")}-01`, end_date: "2026-12-31" },
    kpis: { total_squads: 1, assigned_members: 2, unassigned_active_members: 2, resigned_members: 1 },
    role_distribution_by_executor_squad: [{ squad_id: "squad-1", squad_name: "Data Platform", roles: [{ role_id: "role-engineer", role_name: "Data Engineer", member_count: 2 }] }],
    unassigned_members: [{ id: "member-1", full_name: "Ana Pérez Gómez", dni: "12345678" }, { id: "member-2", full_name: "Luis Díaz Ruiz", dni: "87654321" }],
    members_by_vendor_and_role: [{ vendor_id: "vendor-1", vendor_name: "Proveedor Uno", professional_role_id: "role-engineer", professional_role_name: "Data Engineer", member_count: 2 }],
    assignment_filter_options: {
      providers: [{ id: "vendor-1", name: "Proveedor Uno" }, { id: "vendor-2", name: "Proveedor Dos" }],
      roles: [{ id: "role-engineer", name: "Data Engineer" }, { id: "role-architect", name: "Data Architect" }],
      squads: [{ id: "squad-1", name: "Data Platform" }, { id: "squad-2", name: "Data Analytics" }],
    },
    assignment_cards: [
      {
        id: "assignment-1",
        member_full_name: "Ana Pérez Gómez",
        professional_role_name: "Data Engineer",
        vendor_id: "vendor-1",
        vendor_name: "Proveedor Uno",
        project_code: "PROJ-42/ETL!",
        allocation_percentage: 60,
        assigned_squad_id: "squad-1",
        assigned_squad_name: "Data Platform",
        executor_squad_id: "squad-2",
        executor_squad_name: "Data Analytics",
      },
      {
        id: "assignment-2",
        member_full_name: "Luis Díaz Ruiz",
        professional_role_name: "Data Architect",
        vendor_id: null,
        vendor_name: "Planilla",
        project_code: "PROJECT-ARCH",
        allocation_percentage: 40,
        assigned_squad_id: "squad-2",
        assigned_squad_name: "Data Analytics",
        executor_squad_id: "squad-2",
        executor_squad_name: "Data Analytics",
      },
    ],
  };
}

test("consulta métricas, filtra el trimestre, muestra detalle y vuelve a gestión central", async ({ page }) => {
  const requestedQuarters: number[] = [];
  const requestedUrls: string[] = [];
  await page.route("**/api/v1/metrics/dashboard**", async (route) => {
    const requestUrl = route.request().url();
    const quarter = Number(new URL(requestUrl).searchParams.get("quarter"));
    requestedQuarters.push(quarter);
    requestedUrls.push(requestUrl);
    await route.fulfill({ json: dashboardResponse(quarter) });
  });

  await page.goto("/metrics");
  await expect(page.getByRole("heading", { name: "Métricas y visualizaciones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data Platform" }).last()).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Data Platform" }).getByText("Data Engineer", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ana Pérez Gómez" })).toBeVisible();
  await expect(page.getByText("Planilla", { exact: true })).toBeVisible();
  await expect(page.getByText("PROJ-42/ETL!", { exact: true })).toBeVisible();
  await expect(page.getByText("DNI", { exact: true })).toHaveCount(0);

  await page.getByLabel("Filtro por proveedor").selectOption("vendor-1");
  await page.getByLabel("Filtro por rol").selectOption("role-engineer");
  await page.getByRole("button", { name: "Filtrar por Squad Asignado" }).click();
  await page.getByRole("checkbox", { name: "Data Platform" }).check();
  await page.getByRole("checkbox", { name: "Data Analytics" }).check();
  await expect.poll(() => {
    const params = new URL(requestedUrls.at(-1) ?? "http://localhost").searchParams;
    return `${params.get("vendor_id")}|${params.get("professional_role_id")}|${params.getAll("assigned_squad_id").join(",")}`;
  }).toBe("vendor-1|role-engineer|squad-1,squad-2");
  await expect(page.getByRole("tab", { name: "Squad Ejecutor" })).toHaveAttribute("aria-selected", "false");
  await page.getByRole("tab", { name: "Squad Ejecutor" }).click();
  await expect(page.getByRole("tab", { name: "Squad Ejecutor" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Data Analytics" }).last()).toBeVisible();

  await page.getByRole("button", { name: /Sin asignación: 2/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Ana Pérez Gómez");
  await expect(dialog).toContainText("12345678");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.getByRole("combobox", { name: "Trimestre" }).selectOption("2");
  await expect.poll(() => requestedQuarters.at(-1)).toBe(2);
  await expect(page.getByText(/Periodo seleccionado: 2026-04-01/)).toBeVisible();

  await page.getByRole("link", { name: /Volver a gestión central/ }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("mantiene la gráfica legible en móvil", async ({ page }) => {
  await page.route("**/api/v1/metrics/dashboard**", async (route) => {
    await route.fulfill({ json: dashboardResponse(1) });
  });
  await page.goto("/metrics");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
