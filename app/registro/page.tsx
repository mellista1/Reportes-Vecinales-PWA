"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(false);

  useEffect(() => {
    if (!inviteToken) { setTokenValido(false); return; }
    verificarToken();
  }, [inviteToken]);

  const verificarToken = async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", inviteToken)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();
    setTokenValido(!!data);
  };

  const handleRegistro = async () => {
    setError("");
    if (!alias.trim() || alias.trim().length < 3) {
      setError("El alias debe tener al menos 3 caracteres");
      return;
    }
    if (!email || !password) {
      setError("Completá todos los campos");
      return;
    }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { alias: alias.trim() } },
    });

    if (signUpError) {
      setError(signUpError.message.includes("already registered")
        ? "Este email ya está registrado"
        : signUpError.message);
      setLoading(false);
      return;
    }

    // Marcar la invitación como usada
    if (data.user) {
      await supabase
        .from("invitations")
        .update({ used: true, used_by: data.user.id })
        .eq("token", inviteToken);
    }

    setLoading(false);
    setConfirmacion(true);
  };

  // Token inválido
  if (tokenValido === false) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-700/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">INVITACIÓN INVÁLIDA</h1>
        <p className="text-slate-400 text-sm max-w-xs mb-2">
          Este link de invitación no es válido, ya fue usado o expiró.
        </p>
        <p className="text-slate-600 text-xs max-w-xs">
          Para registrarte necesitás un link de invitación de un vecino activo de la red.
        </p>
        <Link href="/auth" className="mt-8 text-blue-400 text-sm underline">
          Ya tengo cuenta — Ingresar
        </Link>
      </div>
    );
  }

  // Verificando token
  if (tokenValido === null) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <svg className="animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  // Confirmación enviada
  if (confirmacion) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-500/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">REVISÁ TU EMAIL</h1>
        <p className="text-slate-400 text-sm max-w-xs mb-2">
          Te enviamos un link de confirmación a <span className="text-white font-bold">{email}</span>
        </p>
        <p className="text-slate-600 text-xs max-w-xs">
          Una vez confirmado, podés ingresar con tu alias <span className="text-blue-400 font-bold">@{alias}</span>
        </p>
        <button
          onClick={() => router.push("/auth")}
          className="mt-10 w-full max-w-sm bg-blue-700 text-white font-black py-4 rounded-2xl active:scale-95 transition-all"
        >
          IR AL LOGIN
        </button>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 shadow-lg text-center">
        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Unirse a Red Vecinal</h1>
        <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">
          San Martín, Buenos Aires
        </p>
      </header>

      <main className="flex-1 flex flex-col p-6 max-w-sm mx-auto w-full gap-5 pt-8">

        {/* Token válido */}
        <div className="bg-green-900/30 border-2 border-green-700/50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-green-300 text-xs font-bold">Invitación válida — podés registrarte</p>
        </div>

        {/* Alias */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">Tu alias público</label>
          <p className="text-slate-600 text-xs mb-2">Este nombre es lo único que verán tus vecinos.</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="tu_alias"
              maxLength={20}
              className="w-full bg-[#161b22] border-2 border-slate-700 focus:border-blue-600 outline-none text-white placeholder-slate-600 rounded-2xl p-4 pl-8 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full bg-[#161b22] border-2 border-slate-700 focus:border-blue-600 outline-none text-white placeholder-slate-600 rounded-2xl p-4 text-sm transition-colors" />
        </div>

        {/* Contraseña */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-[#161b22] border-2 border-slate-700 focus:border-blue-600 outline-none text-white placeholder-slate-600 rounded-2xl p-4 text-sm transition-colors" />
        </div>

        {error && (
          <div className="bg-red-900/30 border-2 border-red-700/50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-red-300 text-xs font-bold">{error}</p>
          </div>
        )}

        <button onClick={handleRegistro} disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 ${
            loading ? "bg-slate-700 text-slate-500" : "bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-2xl shadow-blue-950"
          }`}>
          {loading ? "Registrando..." : "CREAR CUENTA"}
        </button>

        <Link href="/auth" className="text-center text-slate-500 text-sm underline">
          Ya tengo cuenta — Ingresar
        </Link>

      </main>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <svg className="animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
        </svg>
      </div>
    }>
      <RegistroForm />
    </Suspense>
  );
}
