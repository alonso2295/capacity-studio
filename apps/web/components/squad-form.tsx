"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/form-field";
import { ApiError, createSquad, updateSquad } from "@/lib/api";
import type { Squad, SquadFormValues } from "@/lib/types";

const squadSchema = z.object({
  code: z.string().trim().min(1, "Ingresa el código del Squad").regex(/^[a-zA-Z0-9]+$/, "El código solo acepta caracteres alfanuméricos"),
  name: z.string().trim().min(1, "Ingresa el nombre del Squad"),
  tribe: z.string().trim().optional(),
  product_owner_name: z.string().trim().optional(),
});

const inputClass = (hasError = false) =>
  `min-h-11 w-full rounded-control border bg-white px-3 text-text-primary shadow-sm transition placeholder:text-text-secondary/70 ${hasError ? "border-danger" : "border-border"}`;

type SquadFormProps = {
  squad?: Squad;
};

export function SquadForm({ squad }: SquadFormProps) {
  const isEdit = Boolean(squad);
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<SquadFormValues>({
    resolver: zodResolver(squadSchema),
    defaultValues: {
      code: squad?.code ?? "",
      name: squad?.name ?? "",
      tribe: squad?.tribe ?? "",
      product_owner_name: squad?.product_owner_name ?? "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: SquadFormValues) => squad ? updateSquad(squad.id, values) : createSquad(values),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      queryClient.setQueryData(["squad", saved.id], saved);
      setSuccess(true);
      reset({ code: saved.code, name: saved.name, tribe: saved.tribe ?? "", product_owner_name: saved.product_owner_name ?? "" });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) setError("code", { message: error.message });
      else setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el Squad. Intenta nuevamente.");
    },
  });

  useEffect(() => {
    if (squad) reset({ code: squad.code, name: squad.name, tribe: squad.tribe ?? "", product_owner_name: squad.product_owner_name ?? "" });
  }, [squad, reset]);

  function onSubmit(values: SquadFormValues) {
    setSubmitError(null);
    setSuccess(false);
    mutation.mutate(values);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary"><Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link><span className="px-2" aria-hidden="true">/</span><Link href="/squads" className="font-semibold text-brand-cyan-700 hover:underline">Squads</Link><span className="px-2" aria-hidden="true">/</span><span aria-current="page">{isEdit ? "Editar" : "Registrar"}</span></nav>
        <header className="mb-8"><p className="mb-2 text-sm font-semibold text-brand-cyan-700">Catálogo de Squads</p><h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{isEdit ? "Editar Squad" : "Registrar Squad"}</h1><p className="mt-3 max-w-2xl text-text-secondary">Completa la información básica del equipo.</p></header>
        {success && <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-4 font-medium text-success" role="status">Squad {isEdit ? "actualizado" : "registrado"} correctamente.</div>}
        {submitError && <div className="mb-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{submitError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <section className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="squad-data-heading"><h2 id="squad-data-heading" className="text-xl font-bold">Datos del Squad</h2><div className="mt-6 grid gap-5 md:grid-cols-2">
            <FormField id="code" label="Código del Squad" required hint="Solo caracteres alfanuméricos." error={errors.code?.message}><input id="code" autoComplete="off" aria-invalid={Boolean(errors.code)} {...register("code")} className={inputClass(Boolean(errors.code))} /></FormField>
            <FormField id="name" label="Nombre de Squad" required error={errors.name?.message}><input id="name" autoComplete="organization" aria-invalid={Boolean(errors.name)} {...register("name")} className={inputClass(Boolean(errors.name))} /></FormField>
            <FormField id="tribe" label="Tribu" hint="Opcional." error={errors.tribe?.message}><input id="tribe" aria-invalid={Boolean(errors.tribe)} {...register("tribe")} className={inputClass(Boolean(errors.tribe))} /></FormField>
            <FormField id="product_owner_name" label="Nombre del PO del Squad" hint="Opcional." error={errors.product_owner_name?.message}><input id="product_owner_name" autoComplete="name" aria-invalid={Boolean(errors.product_owner_name)} {...register("product_owner_name")} className={inputClass(Boolean(errors.product_owner_name))} /></FormField>
          </div></section>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={squad ? `/squads/${squad.id}` : "/squads"} className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Cancelar</Link><button type="submit" disabled={mutation.isPending} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear Squad"}</button></div>
        </form>
      </div>
    </main>
  );
}
