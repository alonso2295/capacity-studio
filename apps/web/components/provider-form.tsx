"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/form-field";
import { ApiError, createProvider, updateProvider } from "@/lib/api";
import type { Provider, ProviderFormValues } from "@/lib/types";

const providerSchema = z.object({
  name: z.string().trim().min(1, "Ingresa la razón social"),
  ruc: z
    .string()
    .trim()
    .min(1, "Ingresa el RUC")
    .regex(/^[a-zA-Z0-9]+$/, "El RUC solo acepta caracteres alfanuméricos"),
  focal_point: z.string().trim().min(1, "Ingresa el focal point"),
  mobile: z.string().trim().optional(),
});

const inputClass = (hasError = false) =>
  `min-h-11 w-full rounded-control border bg-white px-3 text-text-primary shadow-sm transition placeholder:text-text-secondary/70 ${
    hasError ? "border-danger" : "border-border"
  }`;

type ProviderFormProps = {
  provider?: Provider;
};

export function ProviderForm({ provider }: ProviderFormProps) {
  const isEdit = Boolean(provider);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: provider?.name ?? "",
      ruc: provider?.ruc ?? "",
      focal_point: provider?.focal_point ?? "",
      mobile: provider?.mobile ?? "",
    },
  });

  useEffect(() => {
    if (provider) {
      reset({ name: provider.name, ruc: provider.ruc, focal_point: provider.focal_point, mobile: provider.mobile ?? "" });
    }
  }, [provider, reset]);

  async function onSubmit(values: ProviderFormValues) {
    setSubmitError(null);
    setSuccess(false);
    const payload = { ...values, mobile: values.mobile?.trim() ?? "" };
    try {
      if (provider) {
        await updateProvider(provider.id, payload);
      } else {
        await createProvider(payload);
      }
      setSuccess(true);
      if (!provider) reset();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError("ruc", { message: error.message });
      } else {
        setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el proveedor. Intenta nuevamente.");
      }
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href="/providers" className="font-semibold text-brand-cyan-700 hover:underline">Proveedores</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">{isEdit ? "Editar" : "Registrar"}</span>
        </nav>
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Catálogo de proveedores</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {isEdit ? "Editar proveedor" : "Registrar proveedor"}
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Mantén actualizada la información de contacto de la empresa proveedora.
          </p>
        </header>

        {success && (
          <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-4 font-medium text-success" role="status">
            Proveedor {isEdit ? "actualizado" : "registrado"} correctamente.
          </div>
        )}
        {submitError && <div className="mb-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <section className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="provider-data-heading">
            <h2 id="provider-data-heading" className="text-xl font-bold">Datos del proveedor</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField id="name" label="Razón social" required error={errors.name?.message}>
                <input id="name" autoComplete="organization" aria-invalid={Boolean(errors.name)} {...register("name")} className={inputClass(Boolean(errors.name))} />
              </FormField>
              <FormField id="ruc" label="RUC" required hint="Solo caracteres alfanuméricos." error={errors.ruc?.message}>
                <input id="ruc" autoComplete="off" aria-invalid={Boolean(errors.ruc)} {...register("ruc")} className={inputClass(Boolean(errors.ruc))} />
              </FormField>
              <FormField id="focal_point" label="Focal point" required error={errors.focal_point?.message}>
                <input id="focal_point" autoComplete="name" aria-invalid={Boolean(errors.focal_point)} {...register("focal_point")} className={inputClass(Boolean(errors.focal_point))} />
              </FormField>
              <FormField id="mobile" label="Número celular" hint="Opcional." error={errors.mobile?.message}>
                <input id="mobile" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.mobile)} {...register("mobile")} className={inputClass(Boolean(errors.mobile))} />
              </FormField>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/providers" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Cancelar</Link>
            <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear proveedor"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
