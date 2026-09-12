"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError, deactivateMember, getMembers, getProfessionalRoles, getProviders, reactivateMember } from "@/lib/api";
import type { MemberFilters, MemberResponse, MemberSortBy, MemberSortDirection, MemberStatus } from "@/lib/types";

const emptyFilters: MemberFilters = {
  search: "",
  vendor_id: "",
  professional_role_id: "",
  status: "active",
};

const sortableColumns: { key: MemberSortBy; label: string }[] = [
  { key: "member_full_name", label: "Miembro" },
  { key: "dni", label: "DNI" },
  { key: "employment_type", label: "Vínculo" },
  { key: "vendor_name", label: "Proveedor" },
  { key: "professional_role_name", label: "Rol profesional" },
  { key: "seniority", label: "Seniority" },
  { key: "is_active", label: "Estado" },
];

export function MembersList() {
  const [filters, setFilters] = useState<MemberFilters>(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<MemberSortBy>("member_full_name");
  const [sortDirection, setSortDirection] = useState<MemberSortDirection>("asc");
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput.trim() }));
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const members = useQuery({
    queryKey: ["members", filters, { page, pageSize, sortBy, sortDirection }],
    queryFn: () => getMembers(filters, { page, page_size: pageSize, sort_by: sortBy, sort_direction: sortDirection }),
  });
  const providers = useQuery({ queryKey: ["providers", "active"], queryFn: () => getProviders("active") });
  const roles = useQuery({ queryKey: ["professional-roles"], queryFn: getProfessionalRoles });
  const mutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? reactivateMember(id) : deactivateMember(id),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.setQueryData(["member", member.id], member);
      setActionError(null);
    },
    onError: (error) => setActionError(error instanceof ApiError ? error.message : "No se pudo actualizar el estado."),
  });

  useEffect(() => {
    if (members.data && members.data.total_pages > 0 && page > members.data.total_pages) {
      setPage(members.data.total_pages);
    }
  }, [members.data, page]);

  function updateFilter<Key extends keyof MemberFilters>(key: Key, value: MemberFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function updateSort(key: MemberSortBy) {
    if (sortBy === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setFilters(emptyFilters);
    setPage(1);
  }

  function changeStatus(member: MemberResponse) {
    const isActive = !member.is_active;
    const action = isActive ? "reactivar" : "desactivar";
    if (window.confirm(`¿Deseas ${action} este miembro?`)) {
      mutation.mutate({ id: member.id, isActive });
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">Miembros</span>
        </nav>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Equipo de Ingeniería de Datos</p>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Miembros</h1>
            <p className="mt-3 max-w-2xl text-text-secondary">Consulta y mantén actualizada la información del equipo.</p>
          </div>
          <Link href="/members/new" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">Registrar miembro</Link>
        </header>

        <section className="mt-8 rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="members-list-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="members-list-heading" className="text-xl font-bold">Listado de miembros</h2>
              <p className="mt-1 text-sm text-text-secondary">Busca, filtra y ordena los miembros registrados.</p>
            </div>
            <label className="flex shrink-0 items-center gap-3 text-sm font-semibold">
              Estado
              <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value as MemberStatus)} className="min-h-11 rounded-control border border-border bg-white px-3 font-normal" aria-label="Filtrar por estado">
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="all">Todos</option>
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Filtros de miembros">
            <label className="text-sm font-semibold">
              Buscar por nombre o DNI
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nombre o DNI" aria-label="Buscar por nombre o DNI" className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal text-text-primary focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring/20" />
            </label>
            <label className="text-sm font-semibold">
              Proveedor
              <select value={filters.vendor_id} onChange={(event) => updateFilter("vendor_id", event.target.value)} aria-label="Filtrar por proveedor" className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal text-text-primary">
                <option value="">Todos los proveedores</option>
                {providers.data?.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Rol profesional
              <select value={filters.professional_role_id} onChange={(event) => updateFilter("professional_role_id", event.target.value)} aria-label="Filtrar por rol profesional" className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal text-text-primary">
                <option value="">Todos los roles</option>
                {roles.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={clearFilters} className="mt-4 font-semibold text-brand-cyan-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">Limpiar filtros</button>

          {actionError && <div className="mt-5 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{actionError}</div>}
          {members.isLoading && <p className="mt-6 text-text-secondary">Cargando miembros…</p>}
          {members.isError && <p className="mt-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el listado. Intenta nuevamente.</p>}
          {!members.isLoading && !members.isError && members.data?.total === 0 && <p className="mt-6 rounded-control bg-surface-muted p-4 text-text-secondary">No hay miembros para los filtros seleccionados.</p>}

          {!members.isLoading && !members.isError && members.data && members.data.total > 0 && (
            <>
              <MembersTable members={members.data.items} sortBy={sortBy} sortDirection={sortDirection} onSort={updateSort} onStatusChange={changeStatus} statusPending={mutation.isPending} />
              <MembersPagination page={page} pageSize={pageSize} total={members.data.total} totalPages={members.data.total_pages} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 3.487 3.651 3.651M4 20l4.17-.835a2 2 0 0 0 1.02-.55L19.5 8.305a2.121 2.121 0 0 0-3-3L6.19 15.615a2 2 0 0 0-.55 1.02L4 20Z" /></svg>;
}

function StatusIcon({ active }: { active: boolean }) {
  if (!active) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5v14" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" /></svg>;
}

function SortableHeader({ column, active, direction, onSort }: { column: { key: MemberSortBy; label: string }; active: boolean; direction: MemberSortDirection; onSort: (key: MemberSortBy) => void }) {
  const nextDirection = active && direction === "asc" ? "descendente" : "ascendente";
  return <th scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"} className="px-3 py-3 font-semibold"><button type="button" onClick={() => onSort(column.key)} className="inline-flex min-h-10 items-center gap-1 text-left hover:text-brand-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2" aria-label={`Ordenar por ${column.label}. Siguiente orden ${nextDirection}`}>{column.label}<span aria-hidden="true">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>;
}

function MemberActions({ member, onStatusChange, statusPending }: { member: MemberResponse; onStatusChange: (member: MemberResponse) => void; statusPending: boolean }) {
  const statusLabel = member.is_active ? "Desactivar miembro" : "Reactivar miembro";
  return <div className="flex shrink-0 items-center gap-2"><Link href={`/members/${member.id}/edit`} title="Editar miembro" aria-label="Editar miembro" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border text-brand-cyan-700 transition hover:border-brand-cyan-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"><EditIcon /></Link><button type="button" disabled={statusPending} onClick={() => onStatusChange(member)} title={statusLabel} aria-label={statusLabel} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${member.is_active ? "border-danger/30 text-danger hover:bg-danger/10 focus-visible:ring-danger" : "border-success/30 text-success hover:bg-success/10 focus-visible:ring-success"}`}><StatusIcon active={member.is_active} /></button></div>;
}

function MemberFullName({ member }: { member: MemberResponse }) {
  return <>{member.first_name} {member.paternal_surname}{member.maternal_surname ? ` ${member.maternal_surname}` : ""}</>;
}

function MembersTable({ members, sortBy, sortDirection, onSort, onStatusChange, statusPending }: { members: MemberResponse[]; sortBy: MemberSortBy; sortDirection: MemberSortDirection; onSort: (key: MemberSortBy) => void; onStatusChange: (member: MemberResponse) => void; statusPending: boolean }) {
  return <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left text-sm"><caption className="sr-only">Listado de miembros</caption><thead><tr className="border-b border-border text-text-secondary">{sortableColumns.map((column) => <SortableHeader key={column.key} column={column} active={sortBy === column.key} direction={sortDirection} onSort={onSort} />)}<th scope="col" className="px-3 py-3 font-semibold">Acciones</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-b border-border last:border-b-0"><td className="px-3 py-4 font-semibold"><Link href={`/members/${member.id}`} className="text-brand-cyan-700 hover:underline"><MemberFullName member={member} /></Link></td><td className="px-3 py-4">{member.dni}</td><td className="px-3 py-4">{member.employment_type === "PLANILLA" ? "Planilla" : "Tercerizado"}</td><td className="px-3 py-4">{member.vendor_name ?? "No aplica"}</td><td className="px-3 py-4">{member.professional_role_name ?? member.professional_role_id}</td><td className="px-3 py-4">{member.seniority === "SENIOR" ? "Senior" : "Medium"}</td><td className="px-3 py-4"><span className={member.is_active ? "font-semibold text-success" : "font-semibold text-text-secondary"}>{member.is_active ? "Activo" : "Inactivo"}</span></td><td className="px-3 py-4"><MemberActions member={member} onStatusChange={onStatusChange} statusPending={statusPending} /></td></tr>)}</tbody></table></div>;
}

function MembersPagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }: { page: number; pageSize: number; total: number; totalPages: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return <nav className="mt-5 flex flex-col gap-4 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Paginación de miembros"><p className="text-text-secondary">Mostrando {first}–{last} de {total}</p><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-text-secondary">Por página<select aria-label="Tamaño de página" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="min-h-10 rounded-control border border-border bg-white px-2 text-text-primary"><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></label><span className="text-text-secondary">Página {page} de {totalPages}</span><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="min-h-10 rounded-control border border-border px-3 font-semibold text-brand-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><button type="button" aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="min-h-10 rounded-control border border-border px-3 font-semibold text-brand-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button></div></nav>;
}
