"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const MAX_INVITACIONES = 3;

interface Invitation {
  id: string;
  token: string;
  used: boolean;
  used_by: string | null;
  created_at: string;
  expires_at: string;
}

function generarToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const [invitaciones, setInvitaciones] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchInvitaciones();
  }, [user]);

  const fetchInvitaciones = async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .eq("created_by", user!.id)
      .order("created_at", { ascending: false });
    if (data) setInvitaciones(data);
    setLoading(false);
  };

  const generarInvitacion = async () => {
    const disponibles = invitaciones.filter((i) => !i.used).length;
    const total = invitaciones.length;

    if (total >= MAX_INVITACIONES) {
      alert("Ya usaste tus 3 invitaciones disponibles");
      return;
    }

    setGenerando(true);
    const token = generarToken();
    const { error } = await supabase.from("invitations").insert([
      { token, created_by: user!.id },
    ]);
    if (!error) await fetchInvitaciones();
    setGenerando(false);
  };

  const copiarLink = async (token: string) => {
    const link = `${window.location.origin}/registro?invite=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  const invitacionesUsadas = invitaciones.filter((i) => i.used).length;
  const invitacionesDisponibles = MAX_INVITACIONES - invitaciones.length;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-blue-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Mi Perfil</h1>
            <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">
              Red Vecinal — San Martín
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Info del usuario */}
        <div className="mt-2 bg-[#161b22] border-2 border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-700/30 rounded-full flex items-center justify-center border-2 border-blue-600/40">
              <span className="text-blue-300 font-black text-xl">
                {profile?.alias?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p className="text-white font-black text-lg">@{profile?.alias}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Invitaciones */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-3">
            Mis invitaciones
          </label>

          {/* Contador */}
          <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-300 text-sm font-bold">Invitaciones disponibles</p>
              <span className={`font-black text-lg ${invitacionesDisponibles > 0 ? "text-green-400" : "text-slate-600"}`}>
                {invitacionesDisponibles} / {MAX_INVITACIONES}
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: MAX_INVITACIONES }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < invitaciones.length ? "bg-blue-600" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Botón generar */}
          {invitacionesDisponibles > 0 && (
            <button
              onClick={generarInvitacion}
              disabled={generando}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 mb-3 ${
                generando
                  ? "bg-slate-700 text-slate-500"
                  : "bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-950"
              }`}
            >
              {generando ? "Generando..." : "GENERAR LINK DE INVITACIÓN"}
            </button>
          )}

          {/* Lista de invitaciones */}
          {loading ? (
            <div className="flex justify-center py-6">
              <svg className="animate-spin text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
              </svg>
            </div>
          ) : invitaciones.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600 text-sm">Todavía no generaste ninguna invitación</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {invitaciones.map((inv) => (
                <li key={inv.id} className={`bg-[#161b22] border-2 rounded-2xl p-4 ${inv.used ? "border-slate-800 opacity-50" : "border-slate-700"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${
                      inv.used
                        ? "bg-slate-700 text-slate-500"
                        : "bg-green-900/50 text-green-400 border border-green-700"
                    }`}>
                      {inv.used ? "Usada" : "Disponible"}
                    </span>
                    <span className="text-slate-600 text-xs">
                      Vence {new Date(inv.expires_at).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-slate-300 text-sm font-mono bg-slate-800 px-3 py-1.5 rounded-lg flex-1 text-center tracking-widest">
                      {inv.token}
                    </code>
                    {!inv.used && (
                      <button
                        onClick={() => copiarLink(inv.token)}
                        className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex-shrink-0"
                      >
                        {copiado === inv.token ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                            Copiar link
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cerrar sesión */}
        <div className="mt-auto pt-4">
          <button
            onClick={signOut}
            className="w-full py-4 rounded-2xl border-2 border-slate-700 text-slate-400 font-bold text-sm hover:border-red-700 hover:text-red-400 transition-all active:scale-95"
          >
            Cerrar sesión
          </button>
        </div>

      </main>
    </div>
  );
}
