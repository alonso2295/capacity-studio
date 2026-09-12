"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/form-field";
import { ApiError, createMember, getProfessionalRoles, getVendors, updateMember } from "@/lib/api";
import type { MemberFormValues, MemberResponse } from "@/lib/types";

const memberSchema = z
  .object({
    dni: z.string().regex(/^\d{8}$/, "Ingresa un DNI de 8 dígitos"),
    first_name: z.string().trim().min(1, "Ingresa el nombre"),
    paternal_surname: z.string().trim().min(1, "Ingresa el apellido paterno"),
    maternal_surname: z.string().trim().optional(),
    email: z.string().trim().email("Ingresa un correo electrónico válido"),
    mobile: z.string().trim().optional(),
    birth_date: z.string().min(1, "Selecciona la fecha de nacimiento"),
    employment_type: z.enum(["PLANILLA", "TERCERIZADO"]),
    vendor_id: z.string().optional(),
    professional_role_id: z.string().min(1, "Selecciona el rol profesional"),
    seniority: z.enum(["MEDIUM", "SENIOR"]),
  })
  .superRefine((values, context) => {
    const birthDate = new Date(`${values.birth_date}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) {
      context.addIssue({ code: "custom", path: ["birth_date"], message: "Selecciona una fecha válida" });
    } else if (birthDate > new Date()) {
      context.addIssue({ code: "custom", path: ["birth_date"], message: "La fecha no puede ser futura" });
    }
    if (values.employment_type === "TERCERIZADO" && !values.vendor_id) {
      context.addIssue({ code: "custom", path: ["vendor_id"], message: "Selecciona el proveedor" });
    }
  });

const inputClass = (hasError = false) =>
  `min-h-11 w-full rounded-control border bg-white px-3 text-text-primary shadow-sm transition placeholder:text-text-secondary/70 ${
    hasError ? "border-danger" : "border-border"
  }`;

type MemberFormProps = {
  member?: MemberResponse;
};

export function MemberForm({ member }: MemberFormProps) {
  const isEdit = Boolean(member);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<"PLANILLA" | "TERCERIZADO">(member?.employment_type ?? "PLANILLA");
  const [isUnauthorized] = useState(
    () => process.env.NEXT_PUBLIC_DEV_USER_ROLE === "Miembro de Equipo" || process.env.NEXT_PUBLIC_DEV_USER_ROLE === "Focal Proveedor",
  );
  const roles = useQuery({ queryKey: ["professional-roles"], queryFn: getProfessionalRoles });
  const vendors = useQuery({ queryKey: ["vendors"], queryFn: getVendors });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          dni: member.dni,
          first_name: member.first_name,
          paternal_surname: member.paternal_surname,
          maternal_surname: member.maternal_surname ?? "",
          email: member.email,
          mobile: member.mobile ?? "",
          birth_date: member.birth_date,
          employment_type: member.employment_type,
          vendor_id: member.vendor_id ?? "",
          professional_role_id: member.professional_role_id,
          seniority: member.seniority,
        }
      : { employment_type: "PLANILLA", seniority: "MEDIUM" },
  });
  const employmentType = useWatch({ control, name: "employment_type", defaultValue: member?.employment_type ?? "PLANILLA" });
  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) => (member ? updateMember(member.id, values) : createMember(values)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.setQueryData(["member", saved.id], saved);
      setSuccess(true);
      if (member) {
        router.push(`/members/${saved.id}`);
      } else {
        reset({ employment_type: "PLANILLA", seniority: "MEDIUM" });
      }
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        if (error.message.toLowerCase().includes("dni")) setError("dni", { message: error.message });
        if (error.message.toLowerCase().includes("correo")) setError("email", { message: error.message });
        if (!error.message.toLowerCase().includes("dni") && !error.message.toLowerCase().includes("correo")) {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el miembro. Intenta nuevamente.");
      }
    },
  });

  useEffect(() => {
    if (member) {
      setSelectedEmploymentType(member.employment_type);
      reset({
        dni: member.dni,
        first_name: member.first_name,
        paternal_surname: member.paternal_surname,
        maternal_surname: member.maternal_surname ?? "",
        email: member.email,
        mobile: member.mobile ?? "",
        birth_date: member.birth_date,
        employment_type: member.employment_type,
        vendor_id: member.vendor_id ?? "",
        professional_role_id: member.professional_role_id,
        seniority: member.seniority,
      });
    }
  }, [member, reset]);

  useEffect(() => {
    if (employmentType === "PLANILLA") {
      setValue("vendor_id", "", { shouldValidate: false });
    }
  }, [employmentType, setValue]);

  const employmentTypeRegistration = register("employment_type");

  function onSubmit(values: MemberFormValues) {
    setSubmitError(null);
    setSuccess(false);
    mutation.mutate(values);
  }

  if (isUnauthorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <section className="w-full max-w-xl rounded-card border border-border bg-white p-6 shadow-subtle sm:p-10" role="alert">
          <p className="text-sm font-semibold text-danger">Acceso restringido</p>
          <h1 className="mt-2 text-2xl font-bold">No puedes administrar miembros</h1>
          <p className="mt-3 text-text-secondary">Esta operación requiere el rol Chapter Lead.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="font-semibold text-brand-cyan-700 hover:underline">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href="/members" className="font-semibold text-brand-cyan-700 hover:underline">Miembros</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">{isEdit ? "Editar" : "Registrar"}</span>
        </nav>
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Miembros del equipo</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{isEdit ? "Editar miembro" : "Registrar miembro"}</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">{isEdit ? "Actualiza la información vigente del miembro." : "Completa la información del miembro para habilitarlo en futuros procesos de asignación."}</p>
        </header>

        {success && <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-4 font-medium text-success" role="status">Miembro {isEdit ? "actualizado" : "registrado"} correctamente.</div>}
        {submitError && <div className="mb-6 rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <section className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="personal-heading">
            <h2 id="personal-heading" className="text-xl font-bold">Datos personales</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField id="dni" label="DNI" required hint="Ingresa 8 dígitos." error={errors.dni?.message}><input id="dni" inputMode="numeric" autoComplete="off" aria-invalid={Boolean(errors.dni)} {...register("dni")} className={inputClass(Boolean(errors.dni))} /></FormField>
              <FormField id="birth_date" label="Fecha de nacimiento" required error={errors.birth_date?.message}><input id="birth_date" type="date" aria-invalid={Boolean(errors.birth_date)} {...register("birth_date")} className={inputClass(Boolean(errors.birth_date))} /></FormField>
              <FormField id="first_name" label="Nombre" required error={errors.first_name?.message}><input id="first_name" autoComplete="given-name" aria-invalid={Boolean(errors.first_name)} {...register("first_name")} className={inputClass(Boolean(errors.first_name))} /></FormField>
              <FormField id="paternal_surname" label="Apellido paterno" required error={errors.paternal_surname?.message}><input id="paternal_surname" autoComplete="family-name" aria-invalid={Boolean(errors.paternal_surname)} {...register("paternal_surname")} className={inputClass(Boolean(errors.paternal_surname))} /></FormField>
              <FormField id="maternal_surname" label="Apellido materno" error={errors.maternal_surname?.message}><input id="maternal_surname" autoComplete="additional-name" aria-invalid={Boolean(errors.maternal_surname)} {...register("maternal_surname")} className={inputClass(Boolean(errors.maternal_surname))} /></FormField>
            </div>
          </section>

          <section className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-xl font-bold">Contacto</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField id="email" label="Correo" required error={errors.email?.message}><input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} className={inputClass(Boolean(errors.email))} /></FormField>
              <FormField id="mobile" label="Celular" hint="Opcional." error={errors.mobile?.message}><input id="mobile" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.mobile)} {...register("mobile")} className={inputClass(Boolean(errors.mobile))} /></FormField>
            </div>
          </section>

          <section className="rounded-card border border-border bg-white p-4 shadow-subtle sm:p-6" aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="text-xl font-bold">Vínculo y perfil</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField id="employment_type" label="Tipo de vínculo" required error={errors.employment_type?.message}><select id="employment_type" aria-invalid={Boolean(errors.employment_type)} {...employmentTypeRegistration} onInput={(event) => setSelectedEmploymentType(event.currentTarget.value as "PLANILLA" | "TERCERIZADO")} onChange={(event) => { employmentTypeRegistration.onChange(event); setSelectedEmploymentType(event.target.value as "PLANILLA" | "TERCERIZADO"); }} className={inputClass(Boolean(errors.employment_type))}><option value="PLANILLA">Planilla</option><option value="TERCERIZADO">Tercerizado</option></select></FormField>
            <FormField id="vendor_id" label="Proveedor" required={employmentType === "TERCERIZADO"} hint={employmentType === "PLANILLA" ? "No aplica para miembros de planilla." : undefined} error={errors.vendor_id?.message}><select id="vendor_id" disabled={selectedEmploymentType !== "TERCERIZADO" && employmentType !== "TERCERIZADO"} aria-invalid={Boolean(errors.vendor_id)} {...register("vendor_id")} className={inputClass(Boolean(errors.vendor_id))}><option value="">{vendors.isLoading ? "Cargando proveedores…" : "Selecciona un proveedor"}</option>{vendors.data?.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></FormField>
              <FormField id="professional_role_id" label="Rol profesional" required error={errors.professional_role_id?.message}><select id="professional_role_id" disabled={roles.isLoading} aria-invalid={Boolean(errors.professional_role_id)} {...register("professional_role_id")} className={inputClass(Boolean(errors.professional_role_id))}><option value="">{roles.isLoading ? "Cargando roles…" : "Selecciona un rol profesional"}</option>{roles.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></FormField>
              <FormField id="seniority" label="Seniority" required error={errors.seniority?.message}><select id="seniority" aria-invalid={Boolean(errors.seniority)} {...register("seniority")} className={inputClass(Boolean(errors.seniority))}><option value="MEDIUM">Medium</option><option value="SENIOR">Senior</option></select></FormField>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href={member ? `/members/${member.id}` : "/members"} className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-cyan-700 bg-white px-6 py-3 font-semibold text-brand-cyan-700 hover:bg-surface-muted">Cancelar</Link>
            <button type="submit" disabled={mutation.isPending || roles.isLoading || vendors.isLoading} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-cyan-700 px-6 py-3 font-semibold text-white hover:bg-brand-cyan focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear miembro"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
