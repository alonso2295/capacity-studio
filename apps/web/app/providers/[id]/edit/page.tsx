"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ProviderForm } from "@/components/provider-form";
import { getProvider } from "@/lib/api";

export default function EditProviderPage() {
  const params = useParams<{ id: string }>();
  const provider = useQuery({ queryKey: ["provider", params.id], queryFn: () => getProvider(params.id) });

  if (provider.isLoading) return <main className="p-8 text-text-secondary">Cargando proveedor…</main>;
  if (provider.isError || !provider.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el proveedor.</div>
        <Link href="/providers" className="mt-6 inline-flex font-semibold text-brand-cyan-700 hover:underline">Volver a proveedores</Link>
      </main>
    );
  }
  return <ProviderForm provider={provider.data} />;
}
