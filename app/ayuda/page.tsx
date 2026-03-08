"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

interface HelpRequest {
  id: string;
  tipo: string;
  created_at: string;
  activa: boolean;
  author_id: string;
  latitude: number | null;
  longitude: number | null;
  profiles: { alias: string } | { alias: string }[] | null;
}

const tipoColor: Record<string, string> = {
  "Acoso callejero": "bg-violet-900/60 text-violet-300 border-violet-700",
  "Me están siguiendo": "bg-violet-900/60 text-violet-300 border-violet-700",
  "Vehículo sospechoso": "bg-violet-900/60 text-violet-300 border-violet-700",
  "Adulto desconocido": "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "Me quieren llevar": "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "Estoy perdido/a": "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "Incendio": "bg-blue-900/60 text-blue-300 border-blue-700",
  "Inundación": "bg-blue-900/60 text-blue-300 border-blue-700",
};

function tiempoRelativo(fechaStr: string): string {
  const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hs`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function AyudaFeed() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

const fetchRequests = useCallback(async () => {
  const { data } = await supabase
    .from("help_requests")
    .select("*")
    .eq("activa", true)
    .order("created_at", { ascending: false });

  if (!data) { setLoading(false); return; }

  const withProfiles = await Promise.all(
    data.map(async (req) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias")
        .eq("id", req.author_id)
        .single();
      return { ...req, profiles: profile ?? null };
    })
  );

  setRequests(withProfiles as HelpRequest[]);
  setLoading(false);
}, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();

    const channel = supabase
      .channel("help-requests-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "help_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRequests]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      <header className="bg-gradient-to-r from-violet-700 to-purple-800 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-violet-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Alertas de Ayuda</h1>
            <p className="text-violet-200 text-xs font-medium mt-0.5 tracking-widest uppercase">Red Vecinal — San Martín</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full gap-3">

        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="animate-spin text-violet-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-slate-400 font-bold">Sin alertas activas</p>
            <p className="text-slate-600 text-sm mt-1">No hay pedidos de ayuda en este momento</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-2">
              {requests.length} alerta{requests.length !== 1 ? "s" : ""} activa{requests.length !== 1 ? "s" : ""}
            </p>
            <ul className="flex flex-col gap-3">
              {requests.map((req) => {
                const badgeClass = tipoColor[req.tipo] ?? "bg-slate-700/60 text-slate-300 border-slate-600";
                const alias = Array.isArray(req.profiles) ? req.profiles[0]?.alias : req.profiles?.alias;

                return (
                  <li key={req.id}>
                    <div className="bg-[#161b22] border-2 border-violet-900/40 hover:border-violet-700/60 rounded-2xl p-5 transition-all">

                      {/* Tipo + tiempo */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${badgeClass}`}>
                          {req.tipo}
                        </span>
                        <span className="text-slate-600 text-xs font-medium">
                          {tiempoRelativo(req.created_at)}
                        </span>
                      </div>

                      {/* Autor */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-violet-900/40 rounded-full flex items-center justify-center border border-violet-700/40 flex-shrink-0">
                          <span className="text-violet-300 font-black text-xs">
                            {alias?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <span className="text-slate-300 text-sm font-bold">@{alias ?? "vecino"}</span>
                        <span className="text-slate-600 text-xs">está pidiendo ayuda</span>
                      </div>

                      {/* Ubicación si existe */}
                      {req.latitude && req.longitude && (
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>Ubicación disponible</span>
                          <a
                            href={`https://maps.google.com/?q=${req.latitude},${req.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 font-bold underline"
                          >
                            Ver en mapa
                          </a>
                        </div>
                      )}

                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
