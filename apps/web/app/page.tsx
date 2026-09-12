import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
      <section className="w-full max-w-2xl rounded-card border border-border bg-white p-6 shadow-subtle sm:p-10">
        <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Capacity Studio</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Gestión de capacidad</h1>
        <p className="mt-3 text-text-secondary">Administra los miembros y sus asignaciones a Squads.</p>
        <Link
          href="/members"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-cyan focus-visible:outline-none"
        >
          Gestionar miembros
        </Link>
        <Link
          href="/providers"
          className="ml-3 mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 transition hover:bg-surface-muted focus-visible:outline-none"
        >
          Gestionar proveedores
        </Link>
        <Link
          href="/squads"
          className="ml-3 mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 transition hover:bg-surface-muted focus-visible:outline-none"
        >
          Gestionar Squads
        </Link>
        <Link
          href="/assignments"
          className="ml-3 mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-cyan focus-visible:outline-none"
        >
          Gestionar asignaciones
        </Link>
        <Link
          href="/metrics"
          className="ml-3 mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 transition hover:bg-surface-muted focus-visible:outline-none"
        >
          Ver métricas
        </Link>
      </section>
    </main>
  );
}
