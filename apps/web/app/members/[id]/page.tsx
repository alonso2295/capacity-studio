"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ApiError, deactivateMember, getMember, reactivateMember } from "@/lib/api";

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const member = useQuery({ queryKey: ["member", params.id], queryFn: () => getMember(params.id) });
  const mutation = useMutation({
    mutationFn: (isActive: boolean) => (isActive ? reactivateMember(params.id) : deactivateMember(params.id)),
    onSuccess: (saved) => {
      queryClient.setQueryData(["member", saved.id], saved);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  if (member.isLoading) return <main className="p-8 text-text-secondary">Cargando miembro…</main>;
  if (member.isError || !member.data) {
    return <main className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el miembro.</div><Link href="/members" className="mt-6 inline-flex font-semibold text-brand-cyan-700 hover:underline">Volver a miembros</Link></main>;
  }

  const item = member.data;
  const fullName = [item.first_name, item.paternal_surname, item.maternal_surname].filter(Boolean).join(" ");
  function changeStatus() {
    const action = item.is_active ? "desactivar" : "reactivar";
    if (window.confirm(`¿Deseas ${action} este miembro?`)) mutation.mutate(!item.is_active);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href="/members" className="font-semibold text-brand-cyan-700 hover:underline">Miembros</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">Detalle</span>
        </nav>
        <div className="rounded-card border border-border bg-white p-6 shadow-subtle sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-sm font-semibold text-brand-cyan-700">Miembro del equipo</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{fullName}</h1></div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${item.is_active ? "bg-success/10 text-success" : "bg-surface-muted text-text-secondary"}`}>{item.is_active ? "Activo" : "Inactivo"}</span>
          </div>

          {mutation.isError && <div className="mt-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{mutation.error instanceof ApiError ? mutation.error.message : "No se pudo actualizar el estado."}</div>}
          {mutation.isSuccess && <div className="mt-6 rounded-control border border-success/30 bg-success/10 p-4 font-medium text-success" role="status">Estado actualizado correctamente.</div>}

          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm font-semibold text-text-secondary">DNI</dt><dd className="mt-1">{item.dni}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Fecha de nacimiento</dt><dd className="mt-1">{item.birth_date}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Correo</dt><dd className="mt-1 break-words">{item.email}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Celular</dt><dd className="mt-1">{item.mobile || "No registrado"}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Tipo de vínculo</dt><dd className="mt-1">{item.employment_type === "PLANILLA" ? "Planilla" : "Tercerizado"}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Proveedor vigente</dt><dd className="mt-1">{item.vendor_name || "No aplica"}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Rol profesional</dt><dd className="mt-1">{item.professional_role_name || item.professional_role_id}</dd></div>
            <div><dt className="text-sm font-semibold text-text-secondary">Seniority</dt><dd className="mt-1">{item.seniority === "MEDIUM" ? "Medium" : "Senior"}</dd></div>
          </dl>

          <section className="mt-10" aria-labelledby="affiliations-heading">
            <h2 id="affiliations-heading" className="text-xl font-bold">Historial de proveedores</h2>
            {item.affiliations.length === 0 ? <p className="mt-4 rounded-control bg-surface-muted p-4 text-text-secondary">Este miembro no tiene afiliaciones con proveedores.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><caption className="sr-only">Historial de proveedores</caption><thead><tr className="border-b border-border text-text-secondary"><th scope="col" className="px-3 py-3 font-semibold">Proveedor</th><th scope="col" className="px-3 py-3 font-semibold">Desde</th><th scope="col" className="px-3 py-3 font-semibold">Hasta</th></tr></thead><tbody>{item.affiliations.map((affiliation) => <tr key={affiliation.id} className="border-b border-border last:border-b-0"><td className="px-3 py-4">{affiliation.vendor_name}</td><td className="px-3 py-4">{affiliation.valid_from}</td><td className="px-3 py-4">{affiliation.valid_until ?? "Vigente"}</td></tr>)}</tbody></table></div>}
          </section>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/members" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Volver</Link>
            <button type="button" disabled={mutation.isPending} onClick={changeStatus} className="inline-flex min-h-11 items-center justify-center rounded-full border border-danger px-6 py-3 font-semibold text-danger hover:bg-danger/10 disabled:opacity-60">{item.is_active ? "Desactivar miembro" : "Reactivar miembro"}</button>
            <Link href={`/members/${item.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan">Editar miembro</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
