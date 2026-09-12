"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ApiError, deactivateSquad, getSquad, reactivateSquad } from "@/lib/api";

export default function SquadDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const squad = useQuery({ queryKey: ["squad", params.id], queryFn: () => getSquad(params.id) });
  const mutation = useMutation({
    mutationFn: (isActive: boolean) => isActive ? reactivateSquad(params.id) : deactivateSquad(params.id),
    onSuccess: (saved) => {
      queryClient.setQueryData(["squad", saved.id], saved);
      queryClient.invalidateQueries({ queryKey: ["squads"] });
    },
  });

  if (squad.isLoading) return <main className="p-8 text-text-secondary">Cargando Squad…</main>;
  if (squad.isError || !squad.data) return <main className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el Squad.</div><Link href="/squads" className="mt-6 inline-flex font-semibold text-brand-cyan-700 hover:underline">Volver a Squads</Link></main>;

  const item = squad.data;
  function changeStatus() {
    const action = item.is_active ? "desactivar" : "reactivar";
    if (window.confirm(`¿Deseas ${action} este Squad?`)) mutation.mutate(!item.is_active);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary"><Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link><span className="px-2" aria-hidden="true">/</span><Link href="/squads" className="font-semibold text-brand-cyan-700 hover:underline">Squads</Link><span className="px-2" aria-hidden="true">/</span><span aria-current="page">Detalle</span></nav>
      <div className="rounded-card border border-border bg-white p-6 shadow-subtle sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-brand-cyan-700">Squad</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{item.name}</h1></div><span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${item.is_active ? "bg-success/10 text-success" : "bg-surface-muted text-text-secondary"}`}>{item.is_active ? "Activo" : "Inactivo"}</span></div>
        {mutation.isError && <div className="mt-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{mutation.error instanceof ApiError ? mutation.error.message : "No se pudo actualizar el estado."}</div>}
        {mutation.isSuccess && <div className="mt-6 rounded-control border border-success/30 bg-success/10 p-4 font-medium text-success" role="status">Estado actualizado correctamente.</div>}
        <dl className="mt-8 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm font-semibold text-text-secondary">Código del Squad</dt><dd className="mt-1">{item.code}</dd></div><div><dt className="text-sm font-semibold text-text-secondary">Nombre de Squad</dt><dd className="mt-1">{item.name}</dd></div><div><dt className="text-sm font-semibold text-text-secondary">Tribu</dt><dd className="mt-1">{item.tribe || "No registrada"}</dd></div><div><dt className="text-sm font-semibold text-text-secondary">Nombre del PO del Squad</dt><dd className="mt-1">{item.product_owner_name || "No registrado"}</dd></div></dl>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/squads" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Volver</Link><button type="button" disabled={mutation.isPending} onClick={changeStatus} className="inline-flex min-h-11 items-center justify-center rounded-full border border-danger px-6 py-3 font-semibold text-danger hover:bg-danger/10 disabled:opacity-60">{item.is_active ? "Desactivar Squad" : "Reactivar Squad"}</button><Link href={`/squads/${item.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan">Editar Squad</Link></div>
      </div>
    </div></main>
  );
}
