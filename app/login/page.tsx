"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signInWithPassword(email, password);
      setLoading(false);
      if (error) return setError(traduzErro(error.message));
      router.push("/perfil");
      router.refresh();
    } else {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) return setError(traduzErro(error.message));
      setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/15 text-primary mb-3">
          <LogIn className="size-6" />
        </span>
        <h1 className="font-display text-2xl font-extrabold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="text-sm text-muted mt-1">
          {mode === "login" ? "Acesse sua conta do Travel Quest" : "Leva 30 segundos, sem cartão"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted flex items-center gap-1.5">
            <Mail className="size-3.5" /> E-mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            placeholder="voce@email.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted flex items-center gap-1.5">
            <Lock className="size-3.5" /> Senha
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            placeholder="mínimo 6 caracteres"
          />
        </label>

        {error && <p className="text-xs text-danger">{error}</p>}
        {info && <p className="text-xs text-primary">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary text-white font-semibold py-2.5 text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-xs text-muted mt-5">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
              Criar agora
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
              Entrar
            </button>
          </>
        )}
      </p>

      <p className="text-center text-[11px] text-muted mt-8">
        <Link href="/" className="hover:underline">
          ← Voltar para a Home
        </Link>
      </p>
    </div>
  );
}

function traduzErro(msg: string) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com esse e-mail.";
  if (msg.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}
