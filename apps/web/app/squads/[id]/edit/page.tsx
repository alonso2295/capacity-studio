"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { SquadForm } from "@/components/squad-form";
import { getSquad } from "@/lib/api";

export default function EditSquadPage() {
  const params = useParams<{ id: string }>();
  const squad = useQuery({ queryKey: ["squad", params.id], queryFn: () => getSquad(params.id) });
  if (squad.isLoading) return <main className="p-8 text-text-secondary">Cargando Squad…</main>;
  if (squad.isError || !squad.data) return <main className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el Squad.</div><Link href="/squads" className="mt-6 inline-flex font-semibold text-brand-cyan-700 hover:underline">Volver a Squads</Link></main>;
  return <SquadForm squad={squad.data} />;
}
