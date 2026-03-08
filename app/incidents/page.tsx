"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

interface Incident {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  helper_count?: number;
}

const tipoColor: Record<string, string> = {
  "Robo": "bg-red-900/60 text-red-300 border-red-700",
  "Intento de Robo": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Accidente vial": "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "Vandalismo": "bg-purple-900/60 text-purple-300 border-purple-700",
  "Otro": "bg-slate-700/60 text-slate-300 border-slate-600",
};

function tiempoRelativo(fechaStr: string): string {
  const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hs`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();

    // Realtime: actualizar cuando cambian helpers
    const channel = supabase
      .channel("helpers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "helpers" }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) { setLoading(false); return; }

    // Traer conteo de helpers por incidente
    const withHelpers = await Promise.all(
      data.map(async (inc) => {
        const { count } = await supabase
          .from("helpers")
          .select("*", { count: "exact", head: true })
          .eq("incident_id", inc.id);
        return { ...inc, helper_count: count ?? 0 };
      })
    );

    setIncidents(withHelpers);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-blue-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Alertas del Barrio</h1>
            <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">Red Vecinal — San Martín</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full gap-3">

        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="animate-spin text-slate-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <p className="text-slate-400 font-bold">Sin incidentes reportados</p>
            <p className="text-slate-600 text-sm mt-1">El barrio está tranquilo por ahora</p>
          </div>
        )}

        {!loading && incidents.length > 0 && (
          <>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-2">
              {incidents.length} alerta{incidents.length !== 1 ? "s" : ""} reciente{incidents.length !== 1 ? "s" : ""}
            </p>
            <ul className="flex flex-col gap-3">
              {incidents.map((inc) => {
                const badgeClass = tipoColor[inc.title] ?? tipoColor["Otro"];
                return (
                  <li key={inc.id}>
                    <Link href={`/incidents/${inc.id}`}>
                      <div className="bg-[#161b22] border-2 border-slate-800 hover:border-slate-600 active:scale-[0.98] rounded-2xl p-5 transition-all cursor-pointer">

                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${badgeClass}`}>
                            {inc.title}
                          </span>
                          <span className="text-slate-600 text-xs font-medium">
                            {tiempoRelativo(inc.created_at)}
                          </span>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 mb-3">
                          {inc.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="text-xs">San Martín, BA</span>
                          </div>

                          {/* Contador de helpers */}
                          <div className="flex items-center gap-3">
                            {inc.helper_count! > 0 && (
                              <div className="flex items-center gap-1.5 bg-green-900/40 border border-green-700/50 rounded-full px-2.5 py-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 010 7.75"/>
                                </svg>
                                <span className="text-green-400 text-xs font-black">{inc.helper_count} ayudando</span>
                              </div>
                            )}
                            <span className="text-blue-500 text-xs font-bold">Ver →</span>
                          </div>
                        </div>

                      </div>
                    </Link>
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
