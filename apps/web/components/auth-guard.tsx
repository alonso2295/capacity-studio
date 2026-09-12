"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getStoredAuthorization } from "@/lib/auth";

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";
  const [authorized, setAuthorized] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setAuthorized(true);
      return;
    }

    const hasSession = Boolean(getStoredAuthorization());
    setAuthorized(hasSession);
    if (!hasSession) router.replace("/login");
  }, [isLogin, router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" aria-live="polite">
        <p className="text-text-secondary">Cargando…</p>
      </main>
    );
  }

  return children;
}
