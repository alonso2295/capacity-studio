import { expect, test } from "@playwright/test";

const landingOptions = [
  { label: "Gestionar miembros", href: "/members", description: "Consulta y administra los miembros del equipo." },
  { label: "Gestionar proveedores", href: "/providers", description: "Mantén actualizado el catálogo de proveedores." },
  { label: "Gestionar Squads", href: "/squads", description: "Organiza los Squads y sus responsables." },
  { label: "Gestionar asignaciones", href: "/assignments", description: "Administra la capacidad asignada por proyecto." },
  { label: "Ver métricas", href: "/metrics", description: "Analiza la capacidad y distribución del equipo." },
];

test.describe("Landing page", () => {
  test("muestra accesos consistentes a los módulos principales", async ({ page }) => {
    await page.goto("/");

    const links = page.locator('nav[aria-label="Módulos principales"] a');
    await expect(links).toHaveCount(landingOptions.length);
    await expect(links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))).resolves.toEqual(
      landingOptions.map((option) => option.href),
    );

    for (const option of landingOptions) {
      const link = page.getByRole("link", { name: option.label, exact: true });
      await expect(link).toHaveAttribute("href", option.href);
      await expect(link.getByText(option.description, { exact: true })).toBeVisible();
    }

    await expect(links.locator("svg")).toHaveCount(landingOptions.length);
    await expect(links.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("mantiene foco visible y no genera overflow horizontal en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const firstLink = page.locator('nav[aria-label="Módulos principales"] a').first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });
});
