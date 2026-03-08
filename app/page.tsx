import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">

      {/* Animación pulse violeta */}
      <style>{`
        @keyframes pulse-violet {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 0 16px rgba(139, 92, 246, 0); }
        }
        .pulse-violet {
          animation: pulse-violet 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 shadow-lg">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-black text-white tracking-tight">Red Vecinal</h1>
          <p className="text-blue-200 text-xs font-medium mt-0.5 tracking-widest uppercase">
            San Martín, Buenos Aires
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">

        {/* NECESITO AYUDA — Hero Button violeta pulsante */}
        <Link href="/help" className="block mt-2">
          <div className="pulse-violet bg-gradient-to-br from-violet-600 to-purple-900 rounded-2xl p-8 text-center shadow-2xl shadow-purple-950 border border-violet-500/40 active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              NECESITO<br />AYUDA
            </h2>
            <p className="text-violet-300 text-sm font-medium mt-2">Tocá aquí para pedir ayuda urgente</p>
          </div>
        </Link>

        {/* Reportar Incidente */}
        <Link href="/report" className="block">
          <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-8 text-center shadow-2xl shadow-red-950 border border-red-600/30 active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              REPORTAR<br />INCIDENTE
            </h2>
            <p className="text-red-300 text-sm font-medium mt-2">Tocá aquí para alertar</p>
          </div>
        </Link>

        {/* Sección Emergencias */}
        <div className="mt-2">
          <h3 className="text-white font-black text-sm tracking-[0.2em] uppercase text-center mb-3">
            Emergencias
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <a href="tel:911" className="block">
              <div className="bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg shadow-blue-950 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <span className="text-white font-black text-lg leading-none">911</span>
                <span className="text-blue-200 text-[10px] font-bold tracking-widest uppercase">Policía</span>
              </div>
            </a>
            <a href="tel:107" className="block">
              <div className="bg-red-600 hover:bg-red-500 active:scale-95 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg shadow-red-950 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 10H6"/><path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2"/>
                  <path d="M19 18h2a1 1 0 000-2h-1a1 1 0 01-1-1v-3.65a2 2 0 00-.41-1.22L15 6.8A2 2 0 0013.42 6H12"/>
                  <circle cx="6.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/>
                  <path d="M8 8v4"/><path d="M6 10h4"/>
                </svg>
                <span className="text-white font-black text-lg leading-none">107</span>
                <span className="text-red-200 text-[10px] font-bold tracking-widest uppercase">Ambulancia</span>
              </div>
            </a>
            <a href="tel:100" className="block">
              <div className="bg-orange-500 hover:bg-orange-400 active:scale-95 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg shadow-orange-950 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
                </svg>
                <span className="text-white font-black text-lg leading-none">100</span>
                <span className="text-orange-100 text-[10px] font-bold tracking-widest uppercase">Bomberos</span>
              </div>
            </a>
          </div>
        </div>

        {/* Acciones vecinales */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/incidents" className="block">
            <div className="bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-lg shadow-blue-950 transition-all min-h-[100px] justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="text-white font-black text-xs text-center tracking-wide uppercase leading-tight">
                Ver alertas de mis vecinos
              </span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-auto pb-4">
          <Link href="/zones">
            <div className="flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-slate-300 active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="text-sm font-medium">Configurar Zonas</span>
            </div>
          </Link>
          <Link href="/profile">
            <div className="flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-300 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-sm font-medium">Mi perfil</span>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}
