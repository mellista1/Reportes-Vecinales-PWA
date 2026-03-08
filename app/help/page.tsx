"use client"
import { useState } from "react";

const situaciones = [
  {
    id: "violencia",
    titulo: "VIOLENCIA DOMÉSTICA",
    icon: "😟",
    color: "bg-purple-700",
    ring: "ring-purple-400",
    shadow: "shadow-purple-900",
    border: "border-purple-500",
  },
  {
    id: "acoso_callejero",
    titulo: "ACOSO CALLEJERO",
    icon: "😟",
    color: "bg-purple-700",
    ring: "ring-purple-400",
    shadow: "shadow-purple-900",
    border: "border-purple-500",
  },
  {
    id: "me_siguen",
    titulo: "ME ESTÁN SIGUIENDO",
    icon: "👣",
    color: "bg-purple-700",
    ring: "ring-purple-400",
    shadow: "shadow-purple-900",
    border: "border-purple-500",
  },
  {
    id: "adulto_desconocido",
    titulo: "ADULTO DESCONOCIDO",
    icon: "🚶",
    color: "bg-amber-500",
    ring: "ring-amber-300",
    shadow: "shadow-amber-900",
    border: "border-amber-400",
    textDark: true,
  },
  {
    id: "quieren_llevarme",
    titulo: "ME QUIEREN LLEVAR",
    icon: "🚨",
    color: "bg-amber-500",
    ring: "ring-amber-300",
    shadow: "shadow-amber-900",
    border: "border-amber-400",
    textDark: true,
  },
  {
    id: "perdido",
    titulo: "ESTOY PERDIDO/A",
    icon: "😰",
    color: "bg-amber-500",
    ring: "ring-amber-300",
    shadow: "shadow-amber-900",
    border: "border-amber-400",
    textDark: true,
  },
  {
    id: "incendio",
    titulo: "INCENDIO",
    icon: "🔥",
    color: "bg-blue-700",
    ring: "ring-blue-400",
    shadow: "shadow-blue-900",
    border: "border-blue-500",
  },
  {
    id: "inundacion",
    titulo: "INUNDACIÓN",
    icon: "🌊",
    color: "bg-blue-700",
    ring: "ring-blue-400",
    shadow: "shadow-blue-900",
    border: "border-blue-500",
  },
];

export default function NeedHelp() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = () => {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 1500);
  };

  const handleReset = () => {
    setSeleccionada(null);
    setEnviado(false);
  };

  // ——— PANTALLA: ALERTA ENVIADA ———
  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-bounce text-6xl mb-6">🚨</div>
        <h1 className="text-3xl font-black text-white mb-3">ALERTA ENVIADA</h1>
        <p className="text-slate-300 text-lg mb-2">
          Tus vecinos fueron notificados.
        </p>
        <p className="text-slate-400 text-sm mb-10">
          Alguien se está acercando a ayudarte. Quedá donde estás si es seguro.
        </p>
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 mb-6 text-left">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
            Mientras esperás
          </p>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <span>📍</span> Entrá a un local o lugar con gente
            </li>
            <li className="flex items-start gap-3">
              <span>📞</span> Llamá al 911 si el peligro es inmediato
            </li>
            <li className="flex items-start gap-3">
              <span>🗣️</span> Pedile ayuda a alguien de confianza cerca
            </li>
          </ul>
        </div>
        <button
          onClick={() => (window.location.href = "tel:911")}
          className="w-full max-w-sm bg-red-600 text-white font-black text-xl py-5 rounded-2xl mb-3 active:scale-95 transition-all"
        >
          LLAMAR AL 911
        </button>
        <button
          onClick={handleReset}
          className="text-slate-500 text-sm mt-2 underline"
        >
          Nueva alerta
        </button>
      </div>
    );
  }

  // ——— PANTALLA PRINCIPAL ———
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-red-700 p-6 text-center">
        <div className="text-3xl mb-1">🆘</div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          NECESITO AYUDA
        </h1>
        <p className="text-red-200 text-sm mt-1">Tocá lo que está pasando</p>
      </div>

      {/* Grid de botones */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-3 content-start">
        {situaciones.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeleccionada(s.id === seleccionada ? null : s.id)}
            className={`
              flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-2
              transition-all active:scale-95 shadow-lg
              ${s.color} ${s.shadow}
              ${
                seleccionada === s.id
                  ? `ring-4 ${s.ring} border-white scale-95`
                  : `${s.border}`
              }
              ${s.textDark ? "text-slate-900" : "text-white"}
            `}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="font-black text-xs text-center leading-tight tracking-wide">
              {s.titulo}
            </span>
            {seleccionada === s.id && (
              <span
                className={`text-lg ${
                  s.textDark ? "text-slate-900" : "text-white"
                }`}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="p-4 pb-8 space-y-3">
        <button
          onClick={handleEnviar}
          disabled={!seleccionada || enviando}
          className={`w-full py-5 rounded-3xl font-black text-xl transition-all active:scale-95 ${
            seleccionada
              ? "bg-red-600 text-white shadow-2xl shadow-red-900"
              : "bg-slate-800 text-slate-600"
          }`}
        >
          {enviando ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin">⏳</span> Enviando alerta...
            </span>
          ) : (
            "🚨 PEDIR AYUDA AHORA"
          )}
        </button>

        <button
          onClick={() => (window.location.href = "tel:911")}
          className="w-full border-2 border-red-700 text-red-500 py-4 rounded-2xl font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          📞 LLAMAR AL 911
        </button>
      </div>
    </div>
  );
}