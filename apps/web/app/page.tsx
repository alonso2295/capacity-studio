import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

type LandingIcon = (props: SVGProps<SVGSVGElement>) => ReactNode;

type LandingOption = {
  href: string;
  label: string;
  description: string;
  icon: LandingIcon;
};

function MembersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 20a4 4 0 0 0-8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 20a3 3 0 0 0-2.5-2.96M16.5 6.2a3 3 0 0 1 0 5.6M5 20a3 3 0 0 1 2.5-2.96M7.5 6.2a3 3 0 0 0 0 5.6" />
    </svg>
  );
}

function ProvidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 9h16M8 14h3" />
    </svg>
  );
}

function SquadsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M5 8h14M6 8l-3 5h6L6 8ZM18 8l-3 5h6l-3-5ZM7 20h10" />
    </svg>
  );
}

function AssignmentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h9l3 3v13H6V4ZM15 4v4h4M9 12h6M9 16h4" />
    </svg>
  );
}

function MetricsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V10M12 19V5M19 19v-7M3 19h18" />
    </svg>
  );
}

const landingOptions: LandingOption[] = [
  {
    href: "/members",
    label: "Gestionar miembros",
    description: "Consulta y administra los miembros del equipo.",
    icon: MembersIcon,
  },
  {
    href: "/providers",
    label: "Gestionar proveedores",
    description: "Mantén actualizado el catálogo de proveedores.",
    icon: ProvidersIcon,
  },
  {
    href: "/squads",
    label: "Gestionar Squads",
    description: "Organiza los Squads y sus responsables.",
    icon: SquadsIcon,
  },
  {
    href: "/assignments",
    label: "Gestionar asignaciones",
    description: "Administra la capacidad asignada por proyecto.",
    icon: AssignmentsIcon,
  },
  {
    href: "/metrics",
    label: "Ver métricas",
    description: "Analiza la capacidad y distribución del equipo.",
    icon: MetricsIcon,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="w-full rounded-card border border-border bg-white p-6 shadow-subtle sm:p-10" aria-labelledby="landing-title">
        <header className="max-w-2xl">
          <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Capacity Studio</p>
          <h1 id="landing-title" className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Gestión de capacidad</h1>
          <p className="mt-3 text-text-secondary">Administra los miembros y sus asignaciones a Squads.</p>
        </header>

        <nav className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Módulos principales">
          {landingOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link
                key={option.href}
                href={option.href}
                aria-label={option.label}
                className="group flex min-h-44 flex-col justify-between rounded-card border border-border bg-white p-5 text-text-primary transition-colors hover:border-brand-cyan-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:bg-surface-muted"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-control bg-surface-muted text-brand-cyan-700 transition-colors group-hover:bg-brand-cyan-700 group-hover:text-white">
                  <Icon aria-hidden="true" focusable="false" className="h-7 w-7" />
                </span>
                <span className="mt-6 block">
                  <span className="block text-lg font-semibold">{option.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-text-secondary">{option.description}</span>
                </span>
                <span className="mt-5 text-sm font-semibold text-brand-cyan-700" aria-hidden="true">Abrir módulo →</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
