"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getProvider } from "@/lib/api";

export default function ProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const provider = useQuery({ queryKey: ["provider", params.id], queryFn: () => getProvider(params.id) });

  if (provider.isLoading) return <main className="p-8 text-text-secondary">Cargando proveedor…</main>;
  if (provider.isError || !provider.data) {
    return <main className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el proveedor.</div></main>;
  }
  const item = provider.data;
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href="/providers" className="font-semibold text-brand-cyan-700 hover:underline">Proveedores</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">Detalle</span>
        </nav>
        <div className="rounded-card border border-border bg-white p-6 shadow-subtle sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-cyan-700">Proveedor</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{item.name}</h1>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${item.is_active ? "bg-success/10 text-success" : "bg-surface-muted text-text-secondary"}`}>
              {item.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm font-semibold text-text-secondary">RUC</dt><dd className="mt-1">{item.ruc}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Focal point</dt><dd className="mt-1">{item.focal_point}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Número celular</dt><dd className="mt-1">{item.mobile || "No registrado"}</dd></div>
          </dl>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/providers" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Volver</Link>
            <Link href={`/providers/${item.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan">Editar proveedor</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
