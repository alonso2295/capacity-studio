"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ApiError, deactivateSquad, getSquads, reactivateSquad } from "@/lib/api";
import type { SquadStatus } from "@/lib/types";

export function SquadsList() {
  const [filter, setFilter] = useState<SquadStatus>("active");
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const squads = useQuery({ queryKey: ["squads", filter], queryFn: () => getSquads(filter) });
  const mutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? reactivateSquad(id) : deactivateSquad(id),
    onSuccess: (squad) => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      queryClient.setQueryData(["squad", squad.id], squad);
      setActionError(null);
    },
    onError: (error) => setActionError(error instanceof ApiError ? error.message : "No se pudo actualizar el estado."),
  });

  function changeStatus(id: string, isActive: boolean) {
    const action = isActive ? "reactivar" : "desactivar";
    if (window.confirm(`¿Deseas ${action} este Squad?`)) mutation.mutate({ id, isActive });
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">Squads</span>
        </nav>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Catálogo de equipos</p>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Squads</h1>
            <p className="mt-3 max-w-2xl text-text-secondary">Consulta y administra los equipos disponibles para futuras asignaciones.</p>
          </div>
          <Link href="/squads/new" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none">Registrar Squad</Link>
        </header>

        <section className="mt-8 rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="squads-list-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="squads-list-heading" className="text-xl font-bold">Listado de Squads</h2>
            <label className="flex items-center gap-3 text-sm font-semibold">Estado<select value={filter} onChange={(event) => setFilter(event.target.value as SquadStatus)} className="min-h-11 rounded-control border border-border bg-white px-3 font-normal" aria-label="Filtrar por estado"><option value="active">Activos</option><option value="inactive">Inactivos</option><option value="all">Todos</option></select></label>
          </div>

          {actionError && <div className="mt-5 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{actionError}</div>}
          {squads.isLoading && <p className="mt-6 text-text-secondary">Cargando Squads…</p>}
          {squads.isError && <p className="mt-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el listado. Intenta nuevamente.</p>}
          {!squads.isLoading && !squads.isError && squads.data?.length === 0 && <p className="mt-6 rounded-control bg-surface-muted p-4 text-text-secondary">No hay Squads para este filtro.</p>}

          {squads.data && squads.data.length > 0 && <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-left text-sm"><caption className="sr-only">Listado de Squads</caption><thead><tr className="border-b border-border text-text-secondary"><th scope="col" className="px-3 py-3 font-semibold">Código</th><th scope="col" className="px-3 py-3 font-semibold">Nombre</th><th scope="col" className="px-3 py-3 font-semibold">Tribu</th><th scope="col" className="px-3 py-3 font-semibold">PO del Squad</th><th scope="col" className="px-3 py-3 font-semibold">Estado</th><th scope="col" className="px-3 py-3 font-semibold">Acciones</th></tr></thead><tbody>{squads.data.map((squad) => <tr key={squad.id} className="border-b border-border last:border-b-0"><td className="px-3 py-4 font-semibold"><Link href={`/squads/${squad.id}`} className="text-brand-cyan-700 hover:underline">{squad.code}</Link></td><td className="px-3 py-4">{squad.name}</td><td className="px-3 py-4">{squad.tribe || "No registrada"}</td><td className="px-3 py-4">{squad.product_owner_name || "No registrado"}</td><td className="px-3 py-4"><span className={squad.is_active ? "font-semibold text-success" : "font-semibold text-text-secondary"}>{squad.is_active ? "Activo" : "Inactivo"}</span></td><td className="px-3 py-4"><div className="flex flex-wrap gap-3"><Link href={`/squads/${squad.id}/edit`} className="font-semibold text-brand-cyan-700 hover:underline">Editar</Link><button type="button" disabled={mutation.isPending} onClick={() => changeStatus(squad.id, !squad.is_active)} className="font-semibold text-danger hover:underline disabled:opacity-60">{squad.is_active ? "Desactivar" : "Reactivar"}</button></div></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </main>
  );
}
