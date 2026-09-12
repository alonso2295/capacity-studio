"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { MemberForm } from "@/components/member-form";
import { getMember } from "@/lib/api";

export default function EditMemberPage() {
  const params = useParams<{ id: string }>();
  const member = useQuery({ queryKey: ["member", params.id], queryFn: () => getMember(params.id) });

  if (member.isLoading) return <main className="p-8 text-text-secondary">Cargando miembro…</main>;
  if (member.isError || !member.data) {
    return <main className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-danger" role="alert">No se pudo cargar el miembro.</div><Link href="/members" className="mt-6 inline-flex font-semibold text-brand-cyan-700 hover:underline">Volver a miembros</Link></main>;
  }
  return <MemberForm member={member.data} />;
}
