"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const MapSelector = dynamic(() => import("../components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-[#161b22] rounded-2xl border-2 border-slate-700 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Cargando mapa...</p>
    </div>
  ),
});

const tiposIncidente = ["Robo", "Intento de Robo", "Accidente vial", "Vandalismo", "Otro"];

const DEFAULT_LAT = -34.5709;
const DEFAULT_LNG = -58.5355;

export default function ReportIncident() {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));

  const submitIncident = async () => {
    if (!title || !description) {
      alert("Seleccioná el tipo de incidente y agregá una descripción");
      return;
    }
    if (!user) {
      alert("Tenés que iniciar sesión para reportar");
      return;
    }
    setLoading(true);
    const timestamp = `${date}T${time}`;
    const { error } = await supabase.from("incidents").insert([
      {
        title,
        description,
        latitude: lat,
        longitude: lng,
        timestamp,
        author_id: user.id,
      },
    ]);
    setLoading(false);
    if (error) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      alert(`Error: ${error.message}\nCódigo: ${error.code}`);
    } else {
      setEnviado(true);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setLat(DEFAULT_LAT);
    setLng(DEFAULT_LNG);
    setEnviado(false);
  };

  // ——— PANTALLA: ENVIADO ———
  if (enviado) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-3">INCIDENTE REPORTADO</h1>
        {profile && (
          <p className="text-blue-400 text-sm font-bold mb-2">Publicado como @{profile.alias}</p>
        )}
        <p className="text-slate-400 text-sm mb-10 max-w-xs">
          Tu reporte fue enviado. Los vecinos del barrio serán notificados.
        </p>
        <button onClick={handleReset} className="w-full max-w-sm bg-red-700 text-white font-black text-base py-4 rounded-2xl mb-3 active:scale-95 transition-all">
          Nuevo reporte
        </button>
        <Link href="/" className="text-slate-500 text-sm underline">Volver al inicio</Link>
      </div>
    );
  }

  // ——— PANTALLA PRINCIPAL ———
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Reportar Incidente</h1>
              <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">Red Vecinal — San Martín</p>
            </div>
          </div>
          {/* Alias del usuario logueado */}
          {profile && (
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white text-xs font-bold">@{profile.alias}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Tipo de incidente */}
        <div className="mt-2">
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-3">Tipo de incidente</label>
          <div className="grid grid-cols-2 gap-2">
            {tiposIncidente.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTitle(tipo)}
                className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 text-left ${
                  title === tipo
                    ? "bg-red-700 border-red-500 text-white shadow-lg shadow-red-950"
                    : "bg-[#161b22] border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>


        {/* Aviso legal */}
        <div className="bg-amber-950/40 border-2 border-amber-700/50 rounded-2xl px-4 py-3 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-amber-200/80 text-xs leading-relaxed">
            <span className="font-black text-amber-300">AVISO LEGAL:</span> Este texto reviste carácter de declaración jurada. Cualquier denuncia falsa o acusación infundada será objeto de juicio por calumnias e injurias.
          </p>
        </div>


        {/* Descripción */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">Descripción</label>
          <p className="text-slate-500 text-xs mb-2">
            ¿Qué ocurrió? ¿Cuántos involucrados? ¿Descripción de sospechosos? ¿Escaparon? ¿En qué dirección?
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describí el incidente con el mayor detalle posible..."
            className="w-full bg-[#161b22] border-2 border-slate-700 focus:border-red-600 outline-none text-white placeholder-slate-600 rounded-2xl p-4 text-sm resize-none transition-colors"
          />
        </div>


        {/* Mapa */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">
            Ubicación del incidente
          </label>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs">Tocá el mapa para mover el marcador al lugar exacto</p>
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(
                  (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); },
                  () => alert("No se pudo obtener tu ubicación")
                );
              }}
              className="flex items-center gap-1.5 text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors active:scale-95 flex-shrink-0 ml-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
              Mi ubicación
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border-2 border-slate-700">
            <MapSelector lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-slate-600 text-xs">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
          </div>
        </div>


        {/* Fecha y Hora */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-3">Fecha y hora</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-[#161b22] border-2 border-slate-700 focus:border-red-600 outline-none text-white rounded-2xl p-4 text-sm transition-colors [color-scheme:dark]" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="bg-[#161b22] border-2 border-slate-700 focus:border-red-600 outline-none text-white rounded-2xl p-4 text-sm transition-colors [color-scheme:dark]" />
          </div>
        </div>

        {/* Info publicación */}
        {profile && (
          <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
            <p className="text-slate-400 text-xs">
              Este reporte se publicará bajo el alias <span className="text-white font-bold">@{profile.alias}</span>. Tu email nunca es visible para otros vecinos.
            </p>
          </div>
        )}

        {/* Botón publicar */}
        <button
          onClick={submitIncident}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide transition-all active:scale-95 ${
            loading
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-br from-red-700 to-red-900 text-white shadow-2xl shadow-red-950"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
              </svg>
              Enviando...
            </span>
          ) : "PUBLICAR ALERTA"}
        </button>

      </main>
    </div>
  );
}
