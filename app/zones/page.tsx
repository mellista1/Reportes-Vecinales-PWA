"use client";
import { useState} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ZoneMap = dynamic(() => import("../components/ZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-[#161b22] rounded-2xl border-2 border-slate-700 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Cargando mapa...</p>
    </div>
  ),
});

const RADIO_OPCIONES = [
  { label: "100m", value: 100 },
  { label: "250m", value: 250 },
  { label: "500m", value: 500 },
  { label: "1 km", value: 1000 },
];

const DEFAULT_LAT = -34.5709;
const DEFAULT_LNG = -58.5355;
const STORAGE_KEY = "zona_vecinal";

export default function ZoneSelection() {
  const [lat, setLat] = useState(() => {
  if (typeof window === "undefined") return DEFAULT_LAT;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").lat ?? DEFAULT_LAT; } catch { return DEFAULT_LAT; }
});
const [lng, setLng] = useState(() => {
  if (typeof window === "undefined") return DEFAULT_LNG;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").lng ?? DEFAULT_LNG; } catch { return DEFAULT_LNG; }
});
const [radius, setRadius] = useState(() => {
  if (typeof window === "undefined") return 500;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").radius ?? 500; } catch { return 500; }
});
const [yaConfigurado, setYaConfigurado] = useState(() => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEY);
});

  const [guardado, setGuardado] = useState(false);

  const handleGuardar = () => {
    const zona = { lat, lng, radius };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zona));
    setGuardado(true);
    setYaConfigurado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const handleUbicacionActual = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

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
            <h1 className="text-xl font-black text-white tracking-tight">Configurar Zona</h1>
            <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">
              Red Vecinal — San Martín
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Banner zona activa */}
        {yaConfigurado && (
          <div className="mt-2 bg-blue-900/30 border-2 border-blue-700/50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-blue-300 text-xs font-bold">
              Zona activa: {RADIO_OPCIONES.find(o => o.value === radius)?.label ?? `${radius}m`} alrededor de tu punto
            </p>
          </div>
        )}

        {/* Instrucción */}
        <div className="mt-1">
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-2">
            Centro de tu zona
          </label>
          <p className="text-slate-500 text-xs mb-3">
            Tocá el mapa para mover el centro, o usá tu ubicación actual.
          </p>

          {/* Mapa */}
          <div className="rounded-2xl overflow-hidden border-2 border-slate-700">
            <ZoneMap
              lat={lat}
              lng={lng}
              radius={radius}
              onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
            />
          </div>

          {/* Coordenadas + botón ubicación */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-slate-600 text-xs">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            <button
              onClick={handleUbicacionActual}
              className="flex items-center gap-1.5 text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
              Usar mi ubicación
            </button>
          </div>
        </div>

        {/* Selector de radio */}
        <div>
          <label className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-3">
            Radio de alertas
          </label>
          <div className="grid grid-cols-4 gap-2">
            {RADIO_OPCIONES.map((op) => (
              <button
                key={op.value}
                onClick={() => setRadius(op.value)}
                className={`py-3 rounded-xl border-2 font-black text-sm transition-all active:scale-95 ${
                  radius === op.value
                    ? "bg-blue-700 border-blue-500 text-white shadow-lg shadow-blue-950"
                    : "bg-[#161b22] border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-2 text-center">
            Solo recibirás alertas dentro de {RADIO_OPCIONES.find(o => o.value === radius)?.label ?? radius} desde tu punto central
          </p>
        </div>

        {/* Cómo funciona */}
        <div className="bg-[#161b22] border-2 border-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">Cómo funciona</p>
          <ul className="space-y-2 text-slate-500 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">1.</span>
              Elegí el centro de tu zona tocando el mapa o usando tu ubicación actual
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">2.</span>
              Seleccioná el radio: cuántos metros alrededor querés monitorear
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">3.</span>
              Guardá la zona. Solo verás alertas que ocurran dentro del círculo azul
            </li>
          </ul>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleGuardar}
          className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide transition-all active:scale-95 ${
            guardado
              ? "bg-green-700 text-white"
              : "bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-2xl shadow-blue-950"
          }`}
        >
          {guardado ? (
            <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ZONA GUARDADA
            </span>
          ) : "GUARDAR ZONA"}
        </button>

      </main>
    </div>
  );
}
