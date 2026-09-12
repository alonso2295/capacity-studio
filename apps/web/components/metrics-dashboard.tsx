"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getMetricsDashboard } from "@/lib/api";
import type { MetricsDashboard as MetricsDashboardData, MetricsRoleCount } from "@/lib/types";

function currentPeriod() {
  const today = new Date();
  return { year: today.getFullYear(), quarter: Math.floor(today.getMonth() / 3) + 1 };
}

function quarterName(quarter: number) {
  return `T${quarter}`;
}

function RoleBar({ role, maximum }: { role: MetricsRoleCount; maximum: number }) {
  const width = maximum ? Math.max((role.member_count / maximum) * 100, role.member_count ? 4 : 0) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-text-primary">{role.role_name}</span>
        <span className="font-semibold text-text-primary">{role.member_count}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-muted" aria-hidden="true">
        <div className="h-2 rounded-full bg-brand-cyan-700" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, onClick }: { label: string; value: number; hint: string; onClick?: () => void }) {
  const content = (
    <>
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{hint}</p>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-card border border-border bg-white p-5 text-left shadow-subtle transition hover:border-brand-cyan-700 focus-visible:outline-none"
        aria-label={`${label}: ${value}. Ver detalle`}
      >
        {content}
      </button>
    );
  }
  return <div className="rounded-card border border-border bg-white p-5 shadow-subtle">{content}</div>;
}

function RoleDistribution({ data }: { data: MetricsDashboardData }) {
  if (!data.role_distribution_by_executor_squad.length) {
    return <p className="text-sm text-text-secondary">No hay asignaciones operativas en este trimestre.</p>;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {data.role_distribution_by_executor_squad.map((squad) => {
        const maximum = Math.max(...squad.roles.map((role) => role.member_count), 0);
        return (
          <article key={squad.squad_id} className="rounded-card border border-border p-4">
            <h3 className="font-semibold text-text-primary">{squad.squad_name}</h3>
            <div className="mt-4 space-y-4">
              {squad.roles.map((role) => <RoleBar key={role.role_id} role={role} maximum={maximum} />)}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function VendorRoleTable({ data }: { data: MetricsDashboardData }) {
  if (!data.members_by_vendor_and_role.length) {
    return <p className="text-sm text-text-secondary">No hay datos de proveedor y rol para este trimestre.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Miembros por proveedor y rol</caption>
        <thead className="border-b border-border text-xs uppercase tracking-wide text-text-secondary">
          <tr><th className="px-3 py-3">Proveedor</th><th className="px-3 py-3">Rol</th><th className="px-3 py-3 text-right">Miembros</th></tr>
        </thead>
        <tbody>
          {data.members_by_vendor_and_role.map((item) => (
            <tr key={`${item.vendor_id ?? "payroll"}-${item.professional_role_id}`} className="border-b border-border last:border-0">
              <td className="px-3 py-3 text-text-primary">{item.vendor_name}</td>
              <td className="px-3 py-3 text-text-secondary">{item.professional_role_name}</td>
              <td className="px-3 py-3 text-right font-semibold text-text-primary">{item.member_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AssignmentPerspective = "assigned" | "executor";

function AssignmentFilters({
  data,
  vendorId,
  professionalRoleId,
  assignedSquadIds,
  onVendorChange,
  onRoleChange,
  onSquadsChange,
}: {
  data: MetricsDashboardData;
  vendorId: string;
  professionalRoleId: string;
  assignedSquadIds: string[];
  onVendorChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSquadsChange: (value: string[]) => void;
}) {
  const [squadsOpen, setSquadsOpen] = useState(false);
  const { providers, roles, squads } = data.assignment_filter_options;
  const squadSummary = assignedSquadIds.length
    ? `${assignedSquadIds.length} squad${assignedSquadIds.length === 1 ? " seleccionado" : " seleccionados"}`
    : "Todos los squads";

  return (
    <section className="mt-6 rounded-card border border-border bg-white p-5 shadow-subtle" aria-labelledby="assignment-filters-title">
      <div>
        <h2 id="assignment-filters-title" className="text-xl font-bold text-text-primary">Filtros de asignaciones</h2>
        <p className="mt-1 text-sm text-text-secondary">Estos filtros solo afectan las cards de asignaciones.</p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-text-secondary">
          Proveedor
          <select aria-label="Filtro por proveedor" value={vendorId} onChange={(event) => onVendorChange(event.target.value)} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-white px-3 font-normal text-text-primary">
            <option value="">Todos los proveedores</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-text-secondary">
          Rol
          <select aria-label="Filtro por rol" value={professionalRoleId} onChange={(event) => onRoleChange(event.target.value)} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-white px-3 font-normal text-text-primary">
            <option value="">Todos los roles</option>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
        </label>
        <div className="relative text-sm font-semibold text-text-secondary sm:col-span-2">
          <span>Squad Asignado</span>
          <button
            type="button"
            className="mt-1 flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-white px-3 text-left font-normal text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-700"
            aria-label="Filtrar por Squad Asignado"
            aria-expanded={squadsOpen}
            aria-haspopup="true"
            onClick={() => setSquadsOpen((open) => !open)}
          >
            <span>{squadSummary}</span><span aria-hidden="true">⌄</span>
          </button>
          {squadsOpen && (
            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-white p-3 shadow-lg" role="group" aria-label="Opciones de Squad Asignado">
              <div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="text-xs font-normal text-text-secondary">Selecciona uno o más</span>
                <button type="button" onClick={() => onSquadsChange([])} className="min-h-9 rounded px-2 text-xs font-semibold text-brand-cyan-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-700">Limpiar</button>
              </div>
              <div className="space-y-2">
                {squads.map((squad) => (
                  <label key={squad.id} className="flex min-h-10 items-center gap-3 rounded px-2 font-normal text-text-primary hover:bg-surface-muted">
                    <input
                      type="checkbox"
                      checked={assignedSquadIds.includes(squad.id)}
                      onChange={(event) => onSquadsChange(event.target.checked ? [...assignedSquadIds, squad.id] : assignedSquadIds.filter((id) => id !== squad.id))}
                      className="h-4 w-4 accent-brand-cyan-700"
                    />
                    {squad.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function assignmentGroupKey(card: MetricsDashboardData["assignment_cards"][number], perspective: AssignmentPerspective) {
  return perspective === "assigned" ? card.assigned_squad_id : card.executor_squad_id;
}

function assignmentGroupName(card: MetricsDashboardData["assignment_cards"][number], perspective: AssignmentPerspective) {
  return perspective === "assigned" ? card.assigned_squad_name : card.executor_squad_name;
}

function AssignmentCard({ card }: { card: MetricsDashboardData["assignment_cards"][number] }) {
  return (
    <article className="min-w-0 rounded-lg border border-border bg-white px-3 py-3 transition hover:border-brand-cyan-700">
      <h4 className="truncate text-sm font-semibold leading-5 text-text-primary">{card.member_full_name}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Rol</dt><dd className="mt-0.5 truncate font-medium text-text-primary">{card.professional_role_name}</dd></div>
        <div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Proveedor</dt><dd className="mt-0.5 truncate font-medium text-text-primary">{card.vendor_name}</dd></div>
        <div className="col-span-2 min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Proyecto</dt><dd className="mt-0.5 truncate font-medium text-text-primary" title={card.project_code}>{card.project_code}</dd></div>
        <div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Capacidad</dt><dd className="mt-0.5 font-semibold text-text-primary">{card.allocation_percentage}%</dd></div>
        <div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Squad Ejecutor</dt><dd className="mt-0.5 truncate font-medium text-text-primary">{card.executor_squad_name}</dd></div>
      </dl>
    </article>
  );
}

function AssignmentCards({
  data,
  isFetching,
  isError,
}: {
  data: MetricsDashboardData;
  isFetching: boolean;
  isError: boolean;
}) {
  const [perspective, setPerspective] = useState<AssignmentPerspective>("assigned");
  const groups = useMemo(() => {
    const grouped = new Map<string, { name: string; cards: MetricsDashboardData["assignment_cards"] }>();
    data.assignment_cards.forEach((card) => {
      const key = assignmentGroupKey(card, perspective);
      const group = grouped.get(key) ?? { name: assignmentGroupName(card, perspective), cards: [] };
      group.cards.push(card);
      grouped.set(key, group);
    });
    return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [data.assignment_cards, perspective]);

  const roleSummary = (cards: MetricsDashboardData["assignment_cards"]) => {
    const counts = new Map<string, number>();
    cards.forEach((card) => counts.set(card.professional_role_name, (counts.get(card.professional_role_name) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => left[0].localeCompare(right[0])).map(([role, count]) => `${count} ${role}`).join(", ");
  };

  return (
    <section className="mt-6 rounded-card border border-border bg-surface-muted/30 p-4" aria-labelledby="assignment-cards-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 id="assignment-cards-title" className="text-xl font-bold text-text-primary">Asignaciones del trimestre</h2>
          <p className="mt-1 text-sm text-text-secondary">Consulta los perfiles agrupados por la perspectiva seleccionada.</p>
        </div>
        <div className="inline-flex w-fit rounded-md border border-border bg-white p-1" role="tablist" aria-label="Perspectiva de agrupación">
          {(["assigned", "executor"] as const).map((value) => {
            const selected = perspective === value;
            return <button key={value} type="button" role="tab" aria-selected={selected} onClick={() => setPerspective(value)} className={`min-h-10 rounded px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-700 ${selected ? "bg-brand-cyan-700 text-white" : "text-text-secondary hover:bg-surface-muted"}`}>{value === "assigned" ? "Squad Asignado" : "Squad Ejecutor"}</button>;
          })}
        </div>
      </div>
      {isFetching && <p className="mt-4 text-sm text-text-secondary" role="status">Actualizando asignaciones…</p>}
      {isError && <p className="mt-4 rounded-md border border-red-200 bg-white p-4 text-sm text-danger" role="alert">No se pudieron actualizar las asignaciones. Se muestran los últimos datos disponibles.</p>}
      {!data.assignment_cards.length && !isFetching && <p className="mt-6 rounded-md border border-dashed border-border bg-white p-6 text-center text-sm text-text-secondary">No hay asignaciones para los filtros seleccionados.</p>}
      {!!groups.length && <div className="mt-4 space-y-4">{groups.map((group) => <section key={group.name} aria-labelledby={`assignment-group-${group.name}`}><div className="mb-2 flex flex-wrap items-baseline justify-between gap-1.5"><h3 id={`assignment-group-${group.name}`} className="text-base font-semibold text-text-primary">{group.name}</h3><p className="text-xs text-text-secondary">{roleSummary(group.cards)}</p></div><div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">{group.cards.map((card) => <AssignmentCard key={card.id} card={card} />)}</div></section>)}</div>}
    </section>
  );
}

function UnassignedModal({ members, onClose }: { members: MetricsDashboardData["unassigned_members"]; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="unassigned-title">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="unassigned-title" className="text-xl font-bold text-text-primary">Miembros sin asignación</h2><p className="mt-1 text-sm text-text-secondary">Miembros activos sin una asignación operativa en el trimestre.</p></div>
          <button ref={closeButton} type="button" onClick={onClose} className="rounded-full px-3 py-1 text-xl text-text-secondary hover:bg-surface-muted" aria-label="Cerrar detalle">×</button>
        </div>
        {members.length ? <ul className="mt-5 divide-y divide-border">{members.map((member) => <li key={member.id} className="flex justify-between gap-4 py-3"><span className="font-medium text-text-primary">{member.full_name}</span><span className="text-text-secondary">{member.dni}</span></li>)}</ul> : <p className="mt-5 text-sm text-text-secondary">Todos los miembros activos tienen una asignación operativa.</p>}
      </section>
    </div>
  );
}

export default function MetricsDashboard() {
  const initial = currentPeriod();
  const [year, setYear] = useState(initial.year);
  const [quarter, setQuarter] = useState(initial.quarter);
  const [detailOpen, setDetailOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [professionalRoleId, setProfessionalRoleId] = useState("");
  const [assignedSquadIds, setAssignedSquadIds] = useState<string[]>([]);
  const metrics = useQuery({
    queryKey: ["metrics-dashboard", year, quarter, vendorId, professionalRoleId, assignedSquadIds],
    queryFn: () => getMetricsDashboard(year, quarter, { vendor_id: vendorId, professional_role_id: professionalRoleId, assigned_squad_ids: assignedSquadIds }),
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const years = Array.from({ length: 5 }, (_, index) => initial.year - 3 + index);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><Link href="/" className="inline-flex min-h-11 items-center font-semibold text-brand-cyan-700 hover:underline focus-visible:outline-none">← Volver a gestión central</Link><p className="mt-4 text-sm font-semibold text-brand-cyan-700">Capacity Studio</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Métricas y visualizaciones</h1><p className="mt-2 text-text-secondary">Consulta la capacidad operativa por trimestre usando el Squad Ejecutor.</p></div>
        <div className="flex gap-3" aria-label="Filtros del periodo"><label className="text-sm font-semibold text-text-secondary">Año<select value={year} onChange={(event) => setYear(Number(event.target.value))} className="mt-1 block min-h-11 rounded-md border border-border bg-white px-3 font-normal text-text-primary"><option value={year}>{year}</option>{years.filter((item) => item !== year).map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-text-secondary">Trimestre<select value={quarter} onChange={(event) => setQuarter(Number(event.target.value))} className="mt-1 block min-h-11 rounded-md border border-border bg-white px-3 font-normal text-text-primary">{[1, 2, 3, 4].map((item) => <option key={item} value={item}>{quarterName(item)}</option>)}</select></label></div>
      </div>

      {metrics.isPending && <div className="mt-8 rounded-card border border-border bg-white p-8 text-center text-text-secondary">Cargando métricas…</div>}
      {metrics.isError && <div className="mt-8 rounded-card border border-red-200 bg-white p-8 text-center"><p className="font-semibold text-danger">No se pudieron cargar las métricas.</p><button type="button" onClick={() => metrics.refetch()} className="mt-4 min-h-11 rounded-full bg-brand-cyan-700 px-5 font-semibold text-white">Reintentar</button></div>}
      {metrics.data && <DashboardContent data={metrics.data} isFetching={metrics.isFetching} isError={metrics.isError} vendorId={vendorId} professionalRoleId={professionalRoleId} assignedSquadIds={assignedSquadIds} onVendorChange={setVendorId} onRoleChange={setProfessionalRoleId} onSquadsChange={setAssignedSquadIds} detailOpen={detailOpen} onOpenDetail={() => setDetailOpen(true)} onCloseDetail={() => setDetailOpen(false)} />}
    </main>
  );
}

function DashboardContent({ data, isFetching, isError, vendorId, professionalRoleId, assignedSquadIds, onVendorChange, onRoleChange, onSquadsChange, detailOpen, onOpenDetail, onCloseDetail }: { data: MetricsDashboardData; isFetching: boolean; isError: boolean; vendorId: string; professionalRoleId: string; assignedSquadIds: string[]; onVendorChange: (value: string) => void; onRoleChange: (value: string) => void; onSquadsChange: (value: string[]) => void; detailOpen: boolean; onOpenDetail: () => void; onCloseDetail: () => void }) {
  return (
    <>
      <p className="mt-6 text-sm text-text-secondary">Periodo seleccionado: <span className="font-semibold">{data.period.start_date} – {data.period.end_date}</span></p>
      <AssignmentFilters data={data} vendorId={vendorId} professionalRoleId={professionalRoleId} assignedSquadIds={assignedSquadIds} onVendorChange={onVendorChange} onRoleChange={onRoleChange} onSquadsChange={onSquadsChange} />
      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores principales">
        <KpiCard label="Squads activos" value={data.kpis.total_squads} hint="Con asignación operativa" />
        <KpiCard label="Miembros asignados" value={data.kpis.assigned_members} hint="Miembros únicos" />
        <KpiCard label="Sin asignación" value={data.kpis.unassigned_active_members} hint="Ver detalle" onClick={onOpenDetail} />
        <KpiCard label="Miembros que renunciaron" value={data.kpis.resigned_members} hint="Excluidos de agrupaciones" />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-border bg-white p-5 shadow-subtle"><h2 className="text-xl font-bold text-text-primary">Distribución de roles por Squad Ejecutor</h2><p className="mt-1 text-sm text-text-secondary">Cada miembro se cuenta una sola vez por rol y Squad.</p><div className="mt-5"><RoleDistribution data={data} /></div></section>
        <section className="rounded-card border border-border bg-white p-5 shadow-subtle"><h2 className="text-xl font-bold text-text-primary">Miembros por proveedor y rol</h2><p className="mt-1 text-sm text-text-secondary">Se conserva el proveedor registrado en cada asignación.</p><div className="mt-5"><VendorRoleTable data={data} /></div></section>
      </div>
      <AssignmentCards data={data} isFetching={isFetching} isError={isError} />
      {detailOpen && <UnassignedModal members={data.unassigned_members} onClose={onCloseDetail} />}
    </>
  );
}
