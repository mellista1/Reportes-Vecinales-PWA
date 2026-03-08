"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] bg-[#161b22] rounded-2xl border-2 border-slate-700 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Cargando mapa...</p>
    </div>
  ),
});

const tipoColor: Record<string, string> = {
  "Robo": "bg-red-900/60 text-red-300 border-red-700",
  "Intento de Robo": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Accidente vial": "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "Vandalismo": "bg-purple-900/60 text-purple-300 border-purple-700",
  "Otro": "bg-slate-700/60 text-slate-300 border-slate-600",
};

interface Incident {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  author_id: string | null;
}

interface Helper {
  id: string;
  author_id: string;
  created_at: string;
  profiles: { alias: string }[] | { alias: string } | null;
}

export default function IncidentDetail() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [author, setAuthor] = useState<{ alias: string } | null>(null);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [yaAyuda, setYaAyuda] = useState(false);
  const [enviando, setEnviando] = useState(false);

const fetchHelpers = useCallback(async () => {
    const { data } = await supabase
      .from("helpers")
      .select("id, author_id, created_at, profiles(alias)")
      .eq("incident_id", id)
      .order("created_at", { ascending: true });

    if (data) {
      setHelpers(data as Helper[]);
      if (user) {
        setYaAyuda(data.some((h) => h.author_id === user.id));
      }
    }
  }, [id, user]);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setIncident(data);
      if (data.author_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("alias")
          .eq("id", data.author_id)
          .single();
        if (profile) setAuthor(profile);
      }
    }
    await fetchHelpers();
    setLoading(false);
  }, [id, fetchHelpers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();

    const channel = supabase
      .channel(`helpers-${id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "helpers",
        filter: `incident_id=eq.${id}`,
      }, () => {
        fetchHelpers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, fetchAll, fetchHelpers]);

    const handleAyuda = async () => {
    if (!user || yaAyuda || enviando) return;
    setEnviando(true);
    const { error } = await supabase.from("helpers").upsert(
      [{ incident_id: id, author_id: user.id }],
      { onConflict: "incident_id,author_id", ignoreDuplicates: true }
    );
    if (!error) setYaAyuda(true);
    setEnviando(false);
    };

  // ——— LOADING ———
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <svg className="animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-400 font-bold mb-4">Incidente no encontrado</p>
        <Link href="/incidents" className="text-blue-400 text-sm underline">Volver a alertas</Link>
      </div>
    );
  }

  const badgeClass = tipoColor[incident.title] ?? tipoColor["Otro"];
  const fecha = new Date(incident.created_at);
  const fechaStr = fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  const horaStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/incidents" className="text-blue-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Detalle del Incidente</h1>
            <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">Red Vecinal — San Martín</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Tipo + fecha */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border ${badgeClass}`}>
            {incident.title}
          </span>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-bold">{fechaStr}</p>
            <p className="text-slate-600 text-xs">{horaStr}</p>
          </div>
        </div>

        {/* Autor */}
        <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700/30 rounded-full flex items-center justify-center border border-blue-600/40 flex-shrink-0">
            <span className="text-blue-300 font-black text-sm">
              {author?.alias?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Reportado por</p>
            <p className="text-white font-bold text-sm">{author ? `@${author.alias}` : "Usuario desconocido"}</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">Descripción</p>
          <p className="text-slate-200 text-sm leading-relaxed">{incident.description}</p>
        </div>

        {/* Mapa */}
        <div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Ubicación</p>
          <div className="rounded-2xl overflow-hidden border-2 border-slate-700">
            <MapView lat={incident.latitude} lng={incident.longitude} />
          </div>
        </div>

        {/* Helpers */}
        <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Vecinos que van a ayudar</p>
            {helpers.length > 0 && (
              <span className="bg-green-900/50 border border-green-700 text-green-400 text-xs font-black px-2.5 py-1 rounded-full">
                {helpers.length}
              </span>
            )}
          </div>

          {helpers.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-2">Todavía nadie se ofreció a ayudar</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {helpers.map((h) => {
                const alias = Array.isArray(h.profiles) ? h.profiles[0]?.alias : h.profiles?.alias;
                return (
                <li key={h.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-green-900/30 rounded-full flex items-center justify-center border border-green-700/40 flex-shrink-0">
                    <span className="text-green-400 font-black text-xs">
                      {alias?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm font-bold">
                    @{alias ?? "vecino"}
                  </span>
                  <span className="text-slate-600 text-xs ml-auto">
                    {new Date(h.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Botón ayuda */}
        {yaAyuda ? (
          <div className="bg-green-900/30 border-2 border-green-700/50 rounded-2xl px-4 py-4 flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-green-300 font-bold text-sm">Ya registraste tu ayuda — gracias!</p>
          </div>
        ) : (
          <button
            onClick={handleAyuda}
            disabled={enviando || !user}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 ${
              enviando || !user
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-br from-green-700 to-green-900 text-white shadow-2xl shadow-green-950"
            }`}
          >
            {enviando ? "Registrando..." : "ESTOY DISPONIBLE PARA AYUDAR"}
          </button>
        )}

      </main>
    </div>
  );
}
