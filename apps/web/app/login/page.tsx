"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, verifyCredentials } from "@/lib/api";
import { createBasicAuthorization, storeAuthorization } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authorization = createBasicAuthorization(username.trim(), password);
      await verifyCredentials(authorization);
      storeAuthorization(authorization);
      router.replace("/");
    } catch (reason) {
      setError(reason instanceof ApiError && reason.status === 401 ? "El usuario o la clave no son válidos." : "No se pudo iniciar sesión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-card border border-border bg-white p-6 shadow-subtle sm:p-8" aria-labelledby="login-title">
        <p className="mb-2 text-sm font-semibold text-brand-cyan-700">Capacity Studio</p>
        <h1 id="login-title" className="text-3xl font-bold tracking-tight text-text-primary">Iniciar sesión</h1>
        <p className="mt-3 text-text-secondary">Ingresa tus credenciales para acceder a la aplicación.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="min-h-11 w-full rounded-control border border-border bg-white px-3 text-text-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Clave</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 w-full rounded-control border border-border bg-white px-3 text-text-primary"
            />
          </div>

          {error && <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}

          <button type="submit" disabled={isLoading} className="min-h-11 w-full rounded-full bg-brand-cyan-700 px-5 py-3 font-semibold text-white hover:bg-brand-cyan disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? "Validando…" : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
