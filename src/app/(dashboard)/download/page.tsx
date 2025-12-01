'use client';

const platforms = [
  { name: 'Windows', version: '1.0.0', size: '85 MB', available: true, icon: 'windows' },
  { name: 'macOS', version: '1.0.0', size: '92 MB', available: true, icon: 'apple' },
  { name: 'Linux', version: '1.0.0', size: '78 MB', available: true, icon: 'linux' },
];

const icons: Record<string, React.ReactNode> = {
  windows: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  apple: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  linux: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.311.001-.465.003-.653.014-1.283.082-1.89.199-.617.12-1.203.29-1.758.508a6.76 6.76 0 00-1.54.844c-.441.336-.848.72-1.219 1.147a8.14 8.14 0 00-.95 1.372c-.262.426-.493.878-.69 1.351a9.97 9.97 0 00-.434 1.444 11.06 11.06 0 00-.213 1.488c-.043.472-.064.94-.064 1.399 0 .441.019.878.058 1.306.039.437.101.871.186 1.298.087.426.198.847.332 1.257.135.41.295.81.481 1.194.188.386.401.756.64 1.108.24.353.508.685.801.992.293.309.612.593.958.851.345.258.716.49 1.111.691.396.202.816.372 1.259.508.444.136.91.237 1.396.3.486.064.992.097 1.515.097.521 0 1.028-.033 1.514-.097a8.09 8.09 0 001.397-.301 7.24 7.24 0 001.259-.508c.396-.202.767-.433 1.111-.691.346-.258.665-.542.958-.851.293-.307.56-.639.801-.992.239-.352.452-.722.64-1.108.186-.384.346-.783.481-1.194.134-.41.245-.83.332-1.257.085-.426.147-.86.186-1.298.039-.428.058-.865.058-1.306 0-.459-.021-.927-.064-1.399a11.06 11.06 0 00-.213-1.488 9.97 9.97 0 00-.434-1.444 7.8 7.8 0 00-.69-1.351 8.14 8.14 0 00-.95-1.372 7.6 7.6 0 00-1.219-1.147 6.76 6.76 0 00-1.54-.844 7.18 7.18 0 00-1.758-.508 9.2 9.2 0 00-1.89-.199A12.66 12.66 0 0012.504 0z" />
    </svg>
  ),
};

const features = [
  {
    title: 'Accesso rapido',
    desc: 'Pulsante overlay sempre visibile su qualsiasi finestra',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Timestamp automatico',
    desc: 'Data e ora aggiunte automaticamente a ogni nota',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Privacy integrata',
    desc: 'Scegli se condividere con il team o mantenere privato',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: 'Sincronizzazione',
    desc: 'Sync automatico e in tempo reale con il tuo team',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
];

export default function DownloadPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Desktop Agent</h1>
        <p className="page-subtitle">Cattura note rapidamente ovunque ti trovi sul tuo desktop</p>
      </div>

      {/* Preview */}
      <div className="card mb-10">
        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden h-72 border border-white/[0.06]">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />

          {/* Simulated window */}
          <div className="absolute inset-6 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-white/[0.08] shadow-2xl">
            <div className="bg-zinc-900/80 px-5 py-3 flex items-center gap-2.5 border-b border-white/[0.06] rounded-t-xl">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-4 text-[12px] text-zinc-500">La tua applicazione</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-white/5 rounded-lg w-4/5" />
              <div className="h-4 bg-white/5 rounded-lg w-3/5" />
              <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/2" />
            </div>
          </div>

          {/* Floating button with glow */}
          <div className="absolute bottom-8 right-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium shadow-2xl shadow-indigo-500/30">
                +
              </div>
            </div>
          </div>
        </div>
        <p className="text-[14px] text-zinc-500 mt-6 text-center">
          Pulsante flottante sempre visibile per accesso immediato alle tue note
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              {f.icon}
            </div>
            <p className="text-[16px] text-white font-medium mb-2">{f.title}</p>
            <p className="text-[14px] text-zinc-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Downloads */}
      <div className="card p-0 overflow-hidden mb-10">
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Download disponibili</span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {platforms.map((platform) => (
            <div key={platform.name} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-lg">
                  {icons[platform.icon]}
                </div>
                <div>
                  <p className="text-[16px] text-white font-medium mb-1">{platform.name}</p>
                  <p className="text-[14px] text-zinc-500">Versione {platform.version} · {platform.size}</p>
                </div>
              </div>
              <button
                disabled={!platform.available}
                className="btn btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Scarica
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Requisiti di sistema</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[13px] text-zinc-500 mb-2">Sistema operativo</p>
            <p className="text-[14px] text-zinc-300">Windows 10+ / macOS 10.14+ / Ubuntu 18.04+</p>
          </div>
          <div>
            <p className="text-[13px] text-zinc-500 mb-2">Memoria RAM</p>
            <p className="text-[14px] text-zinc-300">4 GB minimo</p>
          </div>
          <div>
            <p className="text-[13px] text-zinc-500 mb-2">Spazio su disco</p>
            <p className="text-[14px] text-zinc-300">100 MB liberi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
