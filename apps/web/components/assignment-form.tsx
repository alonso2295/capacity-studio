"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/form-field";
import {
  ApiError,
  createAssignment,
  getAssignmentCandidates,
  getSquads,
  updateAssignment,
} from "@/lib/api";
import type { Assignment, AssignmentCandidate, AssignmentFormValues } from "@/lib/types";

const assignmentSchema = z
  .object({
    member_id: z.string().min(1, "Selecciona un colaborador"),
    assigned_squad_id: z.string().min(1, "Selecciona el Squad Asignado"),
    executor_squad_id: z.string().min(1, "Selecciona el Squad Ejecutor"),
    member_resigned: z.boolean(),
    project_code: z.string().trim().min(1, "Ingresa el código de proyecto").max(160, "Máximo 160 caracteres"),
    start_date: z.string().min(1, "Selecciona la fecha de inicio"),
    end_date: z.string().min(1, "Selecciona la fecha fin"),
    allocation_percentage: z.number().min(0, "El porcentaje mínimo es 0").max(100, "El porcentaje máximo es 100"),
  })
  .refine((values) => values.end_date >= values.start_date, {
    path: ["end_date"],
    message: "La fecha fin no puede ser anterior a la fecha de inicio",
  });

const inputClass = (hasError = false) =>
  `min-h-11 w-full rounded-control border bg-white px-3 text-text-primary shadow-sm transition placeholder:text-text-secondary/70 ${hasError ? "border-danger" : "border-border"}`;

type AssignmentFormProps = {
  assignment?: Assignment;
  onClose: () => void;
  onSaved: (assignment: Assignment) => void;
};

function assignmentCandidateFromAssignment(assignment: Assignment): AssignmentCandidate {
  return {
    id: assignment.member_id,
    dni: assignment.member_dni,
    full_name: assignment.member_full_name,
    vendor_id: assignment.vendor_id,
    vendor_name: assignment.vendor_name,
    professional_role_id: assignment.professional_role_id,
    professional_role_name: assignment.professional_role_name,
    seniority: assignment.seniority,
  };
}

export function AssignmentForm({ assignment, onClose, onSaved }: AssignmentFormProps) {
  const isEdit = Boolean(assignment);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<AssignmentCandidate | null>(
    assignment ? assignmentCandidateFromAssignment(assignment) : null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const executorWasChangedRef = useRef(Boolean(assignment && assignment.assigned_squad_id !== assignment.executor_squad_id));
  const queryClient = useQueryClient();
  const squads = useQuery({ queryKey: ["squads", "all"], queryFn: () => getSquads("all") });
  const candidates = useQuery({
    queryKey: ["assignment-candidates", debouncedCandidateSearch],
    queryFn: () => getAssignmentCandidates(debouncedCandidateSearch),
    enabled: !isEdit && debouncedCandidateSearch.trim().length >= 2,
  });
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment
      ? {
          member_id: assignment.member_id,
          assigned_squad_id: assignment.assigned_squad_id,
          executor_squad_id: assignment.executor_squad_id,
          member_resigned: assignment.member_resigned,
          project_code: assignment.project_code,
          start_date: assignment.start_date,
          end_date: assignment.end_date,
          allocation_percentage: assignment.allocation_percentage,
        }
      : { member_id: "", assigned_squad_id: "", executor_squad_id: "", member_resigned: false, project_code: "", start_date: "", end_date: "", allocation_percentage: 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: AssignmentFormValues) =>
      assignment ? updateAssignment(assignment.id, values) : createAssignment(values),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      onSaved(saved);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setSubmitError(error.message);
      } else {
        setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la asignación.");
      }
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCandidateSearch(candidateSearch), 250);
    return () => window.clearTimeout(timer);
  }, [candidateSearch]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();
    return () => previousFocusRef.current?.focus();
  }, []);

  function selectCandidate(candidate: AssignmentCandidate) {
    setSelectedCandidate(candidate);
    setValue("member_id", candidate.id, { shouldValidate: true });
    setCandidateSearch(candidate.full_name);
  }

  function onSubmit(values: AssignmentFormValues) {
    setSubmitError(null);
    mutation.mutate(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/40 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-dialog-title"
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-card bg-white p-5 shadow-lg sm:rounded-card sm:p-7"
        onKeyDown={(event) => { if (event.key === "Escape" && !mutation.isPending) onClose(); }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-cyan-700">Asignaciones</p>
            <h2 id="assignment-dialog-title" className="mt-1 text-2xl font-bold">{isEdit ? "Editar asignación" : "Nueva asignación"}</h2>
            <p className="mt-2 text-sm text-text-secondary">Completa el periodo y la capacidad del servicio.</p>
          </div>
          <button type="button" aria-label="Cerrar ventana" onClick={onClose} disabled={mutation.isPending} className="min-h-11 min-w-11 rounded-full border border-border text-xl text-text-secondary hover:bg-surface-muted disabled:opacity-60">×</button>
        </div>

        {submitError && <div className="mt-5 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-6">
          <section className="rounded-card border border-border bg-surface-muted p-4" aria-labelledby="assignment-member-heading">
            <h3 id="assignment-member-heading" className="text-lg font-bold">Colaborador</h3>
            {!isEdit && (
              <FormField id="candidate_search" label="Buscar por nombre o DNI" hint="Escribe al menos 2 caracteres." error={errors.member_id?.message}>
                <input id="candidate_search" value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} autoComplete="off" className={inputClass(Boolean(errors.member_id))} placeholder="Ej. Ana o 12345678" />
                {candidates.isLoading && <p className="mt-2 text-sm text-text-secondary">Buscando colaboradores…</p>}
                {candidates.isError && <p className="mt-2 text-sm text-danger" role="alert">No se pudieron consultar los colaboradores.</p>}
                {candidates.data && candidates.data.length > 0 && !selectedCandidate && <div className="mt-2 max-h-44 overflow-y-auto rounded-control border border-border bg-white" role="listbox" aria-label="Colaboradores encontrados">{candidates.data.map((candidate) => <button key={candidate.id} type="button" role="option" aria-selected="false" onClick={() => selectCandidate(candidate)} className="block w-full border-b border-border px-3 py-3 text-left last:border-b-0 hover:bg-surface-muted"><span className="font-semibold">{candidate.full_name}</span><span className="block text-sm text-text-secondary">DNI {candidate.dni} · {candidate.professional_role_name}</span></button>)}</div>}
                {candidates.data?.length === 0 && <p className="mt-2 text-sm text-text-secondary">No encontramos colaboradores activos.</p>}
              </FormField>
            )}
            <input type="hidden" {...register("member_id")} />
            {selectedCandidate ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Nombre completo" value={selectedCandidate.full_name} />
                <ReadOnlyField label="DNI" value={selectedCandidate.dni} />
                <ReadOnlyField label="Proveedor" value={selectedCandidate.vendor_name ?? "No aplica (planilla)"} />
                <ReadOnlyField label="Rol profesional" value={selectedCandidate.professional_role_name} />
                <ReadOnlyField label="Seniority" value={selectedCandidate.seniority === "SENIOR" ? "Senior" : "Medium"} />
              </div>
            ) : <p className="mt-4 rounded-control bg-white p-3 text-sm text-text-secondary">Selecciona un colaborador para cargar sus datos.</p>}
          </section>

          <section className="grid gap-5 sm:grid-cols-2" aria-labelledby="assignment-data-heading">
            <h3 id="assignment-data-heading" className="sr-only">Datos de la asignación</h3>
            <FormField id="assigned_squad_id" label="Squad Asignado" required error={errors.assigned_squad_id?.message}><select id="assigned_squad_id" {...register("assigned_squad_id", { onChange: (event) => { if (!executorWasChangedRef.current) setValue("executor_squad_id", event.target.value, { shouldValidate: true }); } })} className={inputClass(Boolean(errors.assigned_squad_id))}><option value="">{squads.isLoading ? "Cargando Squads…" : "Selecciona el Squad Asignado"}</option>{squads.data?.map((squad) => <option key={squad.id} value={squad.id} disabled={!squad.is_active}>{squad.name} ({squad.code}){!squad.is_active ? " · Inactivo" : ""}</option>)}</select></FormField>
            <FormField id="executor_squad_id" label="Squad Ejecutor" required hint="Por defecto toma el Squad Asignado; puedes elegir otro." error={errors.executor_squad_id?.message}><select id="executor_squad_id" {...register("executor_squad_id", { onChange: () => { executorWasChangedRef.current = true; } })} className={inputClass(Boolean(errors.executor_squad_id))}><option value="">{squads.isLoading ? "Cargando Squads…" : "Selecciona el Squad Ejecutor"}</option>{squads.data?.map((squad) => <option key={squad.id} value={squad.id} disabled={!squad.is_active}>{squad.name} ({squad.code}){!squad.is_active ? " · Inactivo" : ""}</option>)}</select></FormField>
            <FormField id="project_code" label="Código de proyecto" required hint="Acepta letras, números, guiones, signos y símbolos." error={errors.project_code?.message}><input id="project_code" autoComplete="off" {...register("project_code")} className={inputClass(Boolean(errors.project_code))} /></FormField>
            <FormField id="start_date" label="Fecha de inicio" required error={errors.start_date?.message}><input id="start_date" type="date" {...register("start_date")} className={inputClass(Boolean(errors.start_date))} /></FormField>
            <FormField id="end_date" label="Fecha fin" required error={errors.end_date?.message}><input id="end_date" type="date" {...register("end_date")} className={inputClass(Boolean(errors.end_date))} /></FormField>
            <FormField id="allocation_percentage" label="Porcentaje de asignación" required hint="Valor entre 0 y 100%. Puede usar hasta 2 decimales." error={errors.allocation_percentage?.message}><div className="relative"><input id="allocation_percentage" type="number" min="0" max="100" step="0.01" {...register("allocation_percentage", { valueAsNumber: true })} className={`${inputClass(Boolean(errors.allocation_percentage))} pr-10`} /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-secondary">%</span></div></FormField>
            <label className="flex min-h-11 items-center gap-3 rounded-control border border-border bg-white px-3 text-sm font-semibold text-text-primary sm:col-span-2"><input type="checkbox" aria-label="Miembro renunció" {...register("member_resigned")} className="h-5 w-5 accent-brand-cyan-700" /><span>Miembro renunció</span></label>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={mutation.isPending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted disabled:opacity-60">Cancelar</button><button type="submit" disabled={mutation.isPending || squads.isLoading} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar asignación"}</button></div>
        </form>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="block text-sm font-semibold text-text-secondary">{label}<input readOnly value={value} aria-label={label} className="mt-1 min-h-11 w-full rounded-control border border-border bg-white px-3 py-2.5 font-normal text-text-primary" /></label>;
}
