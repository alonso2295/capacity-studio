"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ApiError, deleteAssignment, getAssignments, getProfessionalRoles, getProviders, getSquads } from "@/lib/api";
import type { Assignment, AssignmentFilters, AssignmentQueryOptions, AssignmentSortBy, AssignmentSortDirection, AssignmentView } from "@/lib/types";
import { AssignmentForm } from "@/components/assignment-form";

type CardPerspective = "assigned" | "executor";

const emptyFilters: AssignmentFilters = { search: "", vendor_id: "", professional_role_id: "", assigned_squad_id: "", start_date: "", end_date: "", member_resigned: "" };

const defaultSortBy: AssignmentSortBy = "start_date";
const defaultSortDirection: AssignmentSortDirection = "desc";

export function AssignmentsList() {
  const [filters, setFilters] = useState<AssignmentFilters>(emptyFilters);
  const [view, setView] = useState<AssignmentView>("table");
  const [cardPerspective, setCardPerspective] = useState<CardPerspective>("assigned");
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<AssignmentSortBy>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<AssignmentSortDirection>(defaultSortDirection);
  const [isUnauthorized] = useState(
    () => process.env.NEXT_PUBLIC_DEV_USER_ROLE === "Miembro de Equipo" || process.env.NEXT_PUBLIC_DEV_USER_ROLE === "Focal Proveedor",
  );
  const queryClient = useQueryClient();
  const assignmentOptions: AssignmentQueryOptions = {
    page: view === "table" ? page : 1,
    page_size: view === "table" ? pageSize : 100,
    sort_by: sortBy,
    sort_direction: sortDirection,
  };
  const assignments = useQuery({ queryKey: ["assignments", filters, assignmentOptions], queryFn: () => getAssignments(filters, assignmentOptions) });
  const providers = useQuery({ queryKey: ["providers", "all"], queryFn: () => getProviders("all") });
  const roles = useQuery({ queryKey: ["professional-roles"], queryFn: getProfessionalRoles });
  const squads = useQuery({ queryKey: ["squads", "all"], queryFn: () => getSquads("all") });
  const mutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setActionError(null);
    },
    onError: (error) => setActionError(error instanceof ApiError ? error.message : "No se pudo eliminar la asignación."),
  });

  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, Assignment[]>();
    for (const assignment of assignments.data?.items ?? []) {
      const squadId = cardPerspective === "assigned" ? assignment.assigned_squad_id : assignment.executor_squad_id;
      groups.set(squadId, [...(groups.get(squadId) ?? []), assignment]);
    }
    return [...groups.entries()];
  }, [assignments.data, cardPerspective]);

  function updateFilter(name: keyof AssignmentFilters, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setSearchInput("");
    setPage(1);
    setFilters(emptyFilters);
  }

  function updateSort(nextSortBy: AssignmentSortBy) {
    setPage(1);
    if (sortBy === nextSortBy) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(nextSortBy);
    setSortDirection("asc");
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditing(assignment);
    setFormOpen(true);
  }

  function remove(assignment: Assignment) {
    if (window.confirm(`¿Deseas eliminar la asignación de ${assignment.member_full_name}?`)) mutation.mutate(assignment.id);
  }

  function onSaved() {
    setFormOpen(false);
    setEditing(undefined);
  }

  if (isUnauthorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <section className="w-full max-w-xl rounded-card border border-border bg-white p-6 shadow-subtle sm:p-10" role="alert">
          <p className="text-sm font-semibold text-danger">Acceso restringido</p>
          <h1 className="mt-2 text-2xl font-bold">No puedes administrar asignaciones</h1>
          <p className="mt-3 text-text-secondary">Esta operación requiere el rol Chapter Lead.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary"><Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link><span className="px-2" aria-hidden="true">/</span><span aria-current="page">Asignaciones</span></nav>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-brand-cyan-700">Gestión de capacidad</p><h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Asignaciones</h1><p className="mt-3 max-w-2xl text-text-secondary">Visualiza y administra los servicios de los miembros en cada Squad.</p></div><button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none">Nueva asignación</button></header>

        <section className="mt-8 rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="assignment-filters-heading">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 id="assignment-filters-heading" className="text-xl font-bold">Buscar y filtrar</h2><p className="mt-1 text-sm text-text-secondary">Combina los criterios para encontrar una asignación.</p></div><div className="flex rounded-full border border-border p-1" aria-label="Vista de asignaciones"><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${view === "table" ? "bg-brand-cyan-700 text-white" : "text-brand-cyan-700 hover:bg-surface-muted"}`}>Tabla</button><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${view === "cards" ? "bg-brand-cyan-700 text-white" : "text-brand-cyan-700 hover:bg-surface-muted"}`}>Cards</button></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><label className="block text-sm font-semibold">Nombre o DNI<input aria-label="Buscar por nombre o DNI" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); updateFilter("search", event.target.value); }} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal" placeholder="Ej. Ana o 12345678" /></label><label className="block text-sm font-semibold">Proveedor<select aria-label="Filtrar por proveedor" value={filters.vendor_id} onChange={(event) => updateFilter("vendor_id", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal"><option value="">Todos los proveedores</option>{providers.data?.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}{!provider.is_active ? " · Inactivo" : ""}</option>)}</select></label><label className="block text-sm font-semibold">Rol<select aria-label="Filtrar por rol" value={filters.professional_role_id} onChange={(event) => updateFilter("professional_role_id", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal"><option value="">Todos los roles</option>{roles.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><label className="block text-sm font-semibold">Squad Asignado<select aria-label="Filtrar por Squad Asignado" value={filters.assigned_squad_id} onChange={(event) => updateFilter("assigned_squad_id", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal"><option value="">Todos los Squads</option>{squads.data?.map((squad) => <option key={squad.id} value={squad.id}>{squad.name}{!squad.is_active ? " · Inactivo" : ""}</option>)}</select></label><label className="block text-sm font-semibold">Fecha inicio<input type="date" aria-label="Filtrar desde fecha de inicio" value={filters.start_date} onChange={(event) => updateFilter("start_date", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal" /></label><label className="block text-sm font-semibold">Fecha fin<input type="date" aria-label="Filtrar hasta fecha fin" value={filters.end_date} onChange={(event) => updateFilter("end_date", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal" /></label><label className="block text-sm font-semibold">Renuncia<select aria-label="Filtrar por renuncia" value={filters.member_resigned} onChange={(event) => updateFilter("member_resigned", event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-white px-3 font-normal"><option value="">Todas</option><option value="true">Miembro renunció</option><option value="false">Miembro activo en la asignación</option></select></label></div>
          <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-brand-cyan-700 hover:underline">Limpiar filtros</button>
        </section>

        <section className="mt-6 rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="assignment-list-heading">
          <div className="flex items-center justify-between gap-4"><h2 id="assignment-list-heading" className="text-xl font-bold">Listado de asignaciones</h2>{assignments.data && <span className="text-sm text-text-secondary">{assignments.data.total} resultado{assignments.data.total === 1 ? "" : "s"}</span>}</div>
          {actionError && <div className="mt-5 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{actionError}</div>}
          {assignments.isLoading && <p className="mt-6 text-text-secondary">Cargando asignaciones…</p>}
          {assignments.isError && <p className="mt-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudieron cargar las asignaciones.</p>}
          {!assignments.isLoading && !assignments.isError && assignments.data?.total === 0 && <div className="mt-6 rounded-control bg-surface-muted p-5 text-text-secondary"><p>No hay asignaciones para los filtros seleccionados.</p><button type="button" onClick={clearFilters} className="mt-3 font-semibold text-brand-cyan-700 hover:underline">Limpiar filtros</button></div>}
          {!assignments.isLoading && !assignments.isError && assignments.data && assignments.data.total > 0 && (view === "table" ? <><AssignmentsTable assignments={assignments.data.items} sortBy={sortBy} sortDirection={sortDirection} onSort={updateSort} onEdit={openEdit} onDelete={remove} deleting={mutation.isPending} /><AssignmentsPagination page={page} pageSize={pageSize} total={assignments.data.total} totalPages={assignments.data.total_pages} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></> : <AssignmentsCards groups={groupedAssignments} perspective={cardPerspective} onPerspectiveChange={setCardPerspective} onEdit={openEdit} onDelete={remove} deleting={mutation.isPending} />)}
        </section>
      </div>
      {formOpen && <AssignmentForm assignment={editing} onClose={() => { setFormOpen(false); setEditing(undefined); }} onSaved={onSaved} />}
    </main>
  );
}

function AssignmentActions({ assignment, onEdit, onDelete, deleting }: { assignment: Assignment; onEdit: (assignment: Assignment) => void; onDelete: (assignment: Assignment) => void; deleting: boolean }) {
  return <IconAssignmentActions assignment={assignment} onEdit={onEdit} onDelete={onDelete} deleting={deleting} />;
}

function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 3.487 3.651 3.651M4 20l4.17-.835a2 2 0 0 0 1.02-.55L19.5 8.305a2.121 2.121 0 0 0-3-3L6.19 15.615a2 2 0 0 0-.55 1.02L4 20Z" /></svg>;
}

function DeleteIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
}

function IconAssignmentActions({ assignment, onEdit, onDelete, deleting }: { assignment: Assignment; onEdit: (assignment: Assignment) => void; onDelete: (assignment: Assignment) => void; deleting: boolean }) {
  return <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => onEdit(assignment)} title="Editar asignación" aria-label="Editar asignación" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border text-brand-cyan-700 transition hover:border-brand-cyan-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"><EditIcon /></button><button type="button" onClick={() => onDelete(assignment)} title="Eliminar asignación" aria-label="Eliminar asignación" disabled={deleting} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-danger/30 text-danger transition hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"><DeleteIcon /></button></div>;
}

function AssignmentCardContent({ assignment }: { assignment: Assignment }) {
  return <><h4 className="break-words text-base font-bold text-text-primary sm:text-lg">{assignment.member_full_name}</h4><dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary"><div className="flex min-w-0 gap-1"><dt className="font-semibold">Rol:</dt><dd className="break-words">{assignment.professional_role_name}</dd></div><div className="flex min-w-0 gap-1"><dt className="font-semibold">Proveedor:</dt><dd className="break-words">{assignment.vendor_name ?? "Planilla"}</dd></div></dl><dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Proyecto</dt><dd className="mt-1 break-words text-sm font-semibold text-text-primary">{assignment.project_code}</dd></div><div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Squad Ejecutor</dt><dd className="mt-1 break-words text-sm font-semibold text-text-primary">{assignment.executor_squad_name}</dd></div><div className="sm:text-right"><dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Capacidad asignada</dt><dd className="mt-1 text-xl font-bold text-brand-cyan-700">{assignment.allocation_percentage}%</dd></div></dl></>;
}

const sortableColumns: { key: AssignmentSortBy; label: string }[] = [
  { key: "member_full_name", label: "Miembro" },
  { key: "member_dni", label: "DNI" },
  { key: "vendor_name", label: "Proveedor" },
  { key: "professional_role_name", label: "Rol / seniority" },
  { key: "assigned_squad_name", label: "Squad Asignado" },
  { key: "executor_squad_name", label: "Squad Ejecutor" },
  { key: "project_code", label: "Proyecto" },
  { key: "start_date", label: "Fecha inicio" },
  { key: "end_date", label: "Fecha fin" },
  { key: "allocation_percentage", label: "%" },
];

function SortableHeader({ column, active, direction, onSort }: { column: { key: AssignmentSortBy; label: string }; active: boolean; direction: AssignmentSortDirection; onSort: (key: AssignmentSortBy) => void }) {
  const nextDirection = active && direction === "asc" ? "descendente" : "ascendente";
  return <th scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"} className="px-3 py-3 font-semibold"><button type="button" onClick={() => onSort(column.key)} className="inline-flex items-center gap-1 text-left hover:text-brand-cyan-700" aria-label={`Ordenar por ${column.label}. Siguiente orden ${nextDirection}`}>{column.label}<span aria-hidden="true">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>;
}

function AssignmentsTable({ assignments, sortBy, sortDirection, onSort, onEdit, onDelete, deleting }: { assignments: Assignment[]; sortBy: AssignmentSortBy; sortDirection: AssignmentSortDirection; onSort: (key: AssignmentSortBy) => void; onEdit: (assignment: Assignment) => void; onDelete: (assignment: Assignment) => void; deleting: boolean }) {
  return <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1280px] border-collapse text-left text-sm"><caption className="sr-only">Listado de asignaciones</caption><thead><tr className="border-b border-border text-text-secondary">{sortableColumns.map((column) => <SortableHeader key={column.key} column={column} active={sortBy === column.key} direction={sortDirection} onSort={onSort} />)}<th scope="col" className="px-3 py-3 font-semibold">Acciones</th></tr></thead><tbody>{assignments.map((assignment) => <tr key={assignment.id} className="border-b border-border last:border-b-0"><td className={`px-3 py-4 font-semibold ${assignment.member_resigned ? "text-brand-magenta-700" : "text-text-primary"}`}><span>{assignment.member_full_name}</span>{assignment.member_resigned && <span className="sr-only"> Miembro renunció</span>}</td><td className="px-3 py-4">{assignment.member_dni}</td><td className="px-3 py-4">{assignment.vendor_name ?? "Planilla"}</td><td className="px-3 py-4">{assignment.professional_role_name} · {assignment.seniority === "SENIOR" ? "Senior" : "Medium"}</td><td className="px-3 py-4">{assignment.assigned_squad_name}</td><td className="px-3 py-4">{assignment.executor_squad_name}</td><td className="px-3 py-4">{assignment.project_code}</td><td className="px-3 py-4 whitespace-nowrap">{assignment.start_date}</td><td className="px-3 py-4 whitespace-nowrap">{assignment.end_date}</td><td className="px-3 py-4 font-bold text-brand-cyan-700">{assignment.allocation_percentage}%</td><td className="px-3 py-4"><AssignmentActions assignment={assignment} onEdit={onEdit} onDelete={onDelete} deleting={deleting} /></td></tr>)}</tbody></table></div>;
}

function AssignmentsPagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }: { page: number; pageSize: number; total: number; totalPages: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return <nav className="mt-5 flex flex-col gap-4 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Paginación de asignaciones"><p className="text-text-secondary">Mostrando {first}–{last} de {total}</p><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-text-secondary">Por página<select aria-label="Tamaño de página" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="min-h-10 rounded-control border border-border bg-white px-2 text-text-primary"><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></label><span className="text-text-secondary">Página {page} de {totalPages}</span><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="min-h-10 rounded-control border border-border px-3 font-semibold text-brand-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><button type="button" aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="min-h-10 rounded-control border border-border px-3 font-semibold text-brand-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button></div></nav>;
}

function roleSummary(assignments: Assignment[]) {
  const counts = new Map<string, number>();
  for (const assignment of assignments) counts.set(assignment.professional_role_name, (counts.get(assignment.professional_role_name) ?? 0) + 1);
  return [...counts.entries()].map(([role, count]) => `${count} ${role}`).join(", ");
}

function AssignmentsCards({ groups, perspective, onPerspectiveChange, onEdit, onDelete, deleting }: { groups: [string, Assignment[]][]; perspective: CardPerspective; onPerspectiveChange: (perspective: CardPerspective) => void; onEdit: (assignment: Assignment) => void; onDelete: (assignment: Assignment) => void; deleting: boolean }) {
  return <div className="mt-6"><div className="inline-flex rounded-full border border-border p-1" role="tablist" aria-label="Perspectiva de Squad"><button type="button" role="tab" aria-selected={perspective === "assigned"} onClick={() => onPerspectiveChange("assigned")} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${perspective === "assigned" ? "bg-brand-cyan-700 text-white" : "text-brand-cyan-700 hover:bg-surface-muted"}`}>Squad Asignado</button><button type="button" role="tab" aria-selected={perspective === "executor"} onClick={() => onPerspectiveChange("executor")} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${perspective === "executor" ? "bg-brand-cyan-700 text-white" : "text-brand-cyan-700 hover:bg-surface-muted"}`}>Squad Ejecutor</button></div><div className="mt-4 grid gap-5 lg:grid-cols-2">{groups.map(([squadId, assignments]) => <section key={squadId} className="rounded-card border border-border bg-surface-muted p-4" aria-labelledby={`squad-group-${perspective}-${squadId}`}><div><h3 id={`squad-group-${perspective}-${squadId}`} className="text-lg font-bold">{perspective === "assigned" ? assignments[0].assigned_squad_name : assignments[0].executor_squad_name}</h3><p className="mt-1 text-sm text-text-secondary">{roleSummary(assignments)}</p></div><div className="mt-4 grid gap-3">{assignments.map((assignment) => <article key={assignment.id} className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-5"><div className="flex flex-col gap-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0 flex-1"><AssignmentCardContent assignment={assignment} /></div><IconAssignmentActions assignment={assignment} onEdit={onEdit} onDelete={onDelete} deleting={deleting} /></div></div></article>)}</div></section>)}</div></div>;
}
