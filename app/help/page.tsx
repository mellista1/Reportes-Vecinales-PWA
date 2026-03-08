"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const situaciones = [
  { label: "Acoso callejero", color: "violet" },
  { label: "Me están siguiendo", color: "violet" },
  { label: "Vehículo sospechoso", color: "violet" },
  { label: "Adulto desconocido", color: "yellow" },
  { label: "Me quieren llevar", color: "yellow" },
  { label: "Estoy perdido/a", color: "yellow" },
  { label: "Incendio", color: "blue" },
  { label: "Inundación", color: "blue" },
];

const colorMap: Record<string, string> = {
  violet: "bg-violet-900/60 border-violet-600 text-violet-200 selected:bg-violet-700",
  yellow: "bg-yellow-900/60 border-yellow-600 text-yellow-200",
  blue: "bg-blue-900/60 border-blue-600 text-blue-200",
};

const colorSelected: Record<string, string> = {
  violet: "bg-violet-700 border-violet-400 text-white shadow-lg shadow-violet-950",
  yellow: "bg-yellow-700 border-yellow-400 text-white shadow-lg shadow-yellow-950",
  blue: "bg-blue-700 border-blue-400 text-white shadow-lg shadow-blue-950",
};

export default function HelpPage() {
  const { user } = useAuth();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!seleccionada || !user) return;
    setEnviando(true);

    // Intentar obtener ubicación
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // Sin ubicación, igual enviamos
    }

    await supabase.from("help_requests").insert([{
      author_id: user.id,
      tipo: seleccionada,
      latitude: lat,
      longitude: lng,
    }]);

    setEnviando(false);
    setEnviado(true);
  };

  // ——— PANTALLA ENVIADO ———
  if (enviado) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-violet-500/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-3">ALERTA ENVIADA</h1>
        <p className="text-slate-400 text-sm mb-2 max-w-xs">
          Tu alerta de <span className="text-violet-300 font-bold">"{seleccionada}"</span> fue enviada a los vecinos de tu zona.
        </p>
        <p className="text-slate-600 text-xs max-w-xs mb-10">
          Tus vecinos fueron notificados y pueden ver tu alerta en el feed de ayuda.
        </p>
        <Link href="/" className="w-full max-w-sm bg-violet-700 text-white font-black text-base py-4 rounded-2xl text-center active:scale-95 transition-all block">
          Volver al inicio
        </Link>
        <Link href="/ayuda" className="mt-3 text-slate-500 text-sm underline">
          Ver feed de alertas de ayuda
        </Link>
      </div>
    );
  }

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
            <h1 className="text-xl font-black text-white tracking-tight">Necesito Ayuda</h1>
            <p className="text-violet-200 text-xs font-medium mt-0.5 tracking-widest uppercase">Red Vecinal — San Martín</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 p-4 max-w-lg mx-auto w-full pb-8">

        <div className="mt-2">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">¿Qué está pasando?</p>
          <p className="text-slate-600 text-xs mb-4">Seleccioná la situación que mejor describe lo que estás viviendo</p>

          <div className="grid grid-cols-2 gap-3">
            {situaciones.map(({ label, color }) => {
              const isSelected = seleccionada === label;
              return (
                <button
                  key={label}
                  onClick={() => setSeleccionada(label)}
                  className={`py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 text-left ${
                    isSelected ? colorSelected[color] : colorMap[color]
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {seleccionada && (
          <div className="bg-violet-950/40 border-2 border-violet-700/50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-violet-200 text-xs">
              Seleccionaste: <span className="font-black text-white">{seleccionada}</span>
            </p>
          </div>
        )}

        <button
          onClick={handleEnviar}
          disabled={!seleccionada || enviando}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 mt-auto ${
            !seleccionada || enviando
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-br from-violet-600 to-purple-900 text-white shadow-2xl shadow-purple-950"
          }`}
        >
          {enviando ? "Enviando alerta..." : "PEDIR AYUDA AHORA"}
        </button>

      </main>
    </div>
  );
}
