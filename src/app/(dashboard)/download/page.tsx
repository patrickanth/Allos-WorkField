'use client';

const upcomingFeatures = [
  {
    title: 'Pulsante Overlay Flottante',
    desc: 'Un pulsante sempre visibile su qualsiasi finestra del tuo desktop per catturare note istantaneamente senza interrompere il flusso di lavoro',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  {
    title: 'Screenshot Intelligenti',
    desc: 'Cattura screenshot con un click, annotali direttamente e allegali alle tue note o ticket automaticamente',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: 'Timestamp Automatico',
    desc: 'Data, ora e contesto dell\'applicazione attiva vengono salvati automaticamente per ogni nota catturata',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Scorciatoie da Tastiera',
    desc: 'Configura le tue scorciatoie personalizzate per azioni rapide: nuova nota, screenshot, apri dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    title: 'Sincronizzazione Real-time',
    desc: 'Le note catturate dal desktop si sincronizzano istantaneamente con la web app e con tutti i membri del team',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    title: 'Modalità Privata',
    desc: 'Scegli se condividere le note con il team o mantenerle private. Controllo totale sulla visibilità dei contenuti',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
];

const platforms = [
  { name: 'Windows', icon: 'windows' },
  { name: 'macOS', icon: 'apple' },
  { name: 'Linux', icon: 'linux' },
];

const platformIcons: Record<string, React.ReactNode> = {
  windows: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  apple: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  linux: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.311.001-.465.003-.653.014-1.283.082-1.89.199-.617.12-1.203.29-1.758.508a6.76 6.76 0 00-1.54.844c-.441.336-.848.72-1.219 1.147a8.14 8.14 0 00-.95 1.372c-.262.426-.493.878-.69 1.351a9.97 9.97 0 00-.434 1.444 11.06 11.06 0 00-.213 1.488c-.043.472-.064.94-.064 1.399 0 .441.019.878.058 1.306.039.437.101.871.186 1.298.087.426.198.847.332 1.257.135.41.295.81.481 1.194.188.386.401.756.64 1.108.24.353.508.685.801.992.293.309.612.593.958.851.345.258.716.49 1.111.691.396.202.816.372 1.259.508.444.136.91.237 1.396.3.486.064.992.097 1.515.097.521 0 1.028-.033 1.514-.097a8.09 8.09 0 001.397-.301 7.24 7.24 0 001.259-.508c.396-.202.767-.433 1.111-.691.346-.258.665-.542.958-.851.293-.307.56-.639.801-.992.239-.352.452-.722.64-1.108.186-.384.346-.783.481-1.194.134-.41.245-.83.332-1.257.085-.426.147-.86.186-1.298.039-.428.058-.865.058-1.306 0-.459-.021-.927-.064-1.399a11.06 11.06 0 00-.213-1.488 9.97 9.97 0 00-.434-1.444 7.8 7.8 0 00-.69-1.351 8.14 8.14 0 00-.95-1.372 7.6 7.6 0 00-1.219-1.147 6.76 6.76 0 00-1.54-.844 7.18 7.18 0 00-1.758-.508 9.2 9.2 0 00-1.89-.199A12.66 12.66 0 0012.504 0z" />
    </svg>
  ),
};

export default function DownloadPage() {
  return (
    <div className="page">
      {/* Hero Section - Coming Soon */}
      <div className="card mb-10 overflow-hidden">
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />

          <div className="relative px-12 py-16 text-center">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[13px] font-medium text-indigo-400 uppercase tracking-wider">In Sviluppo</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Desktop Agent
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Prossimamente disponibile per Windows, macOS e Linux
            </p>

            {/* Platform icons */}
            <div className="flex items-center justify-center gap-6 mb-10">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-500"
                >
                  {platformIcons[p.icon]}
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-[15px] text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Un&apos;applicazione nativa che ti permette di catturare note, screenshot e idee
              direttamente dal tuo desktop, senza interrompere il flusso di lavoro.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Mockup */}
      <div className="card mb-10">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Anteprima</span>
        </div>

        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden h-80 border border-white/[0.06]">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px]" />

          {/* Simulated desktop with windows */}
          <div className="absolute inset-6">
            {/* Background window 1 */}
            <div className="absolute top-4 left-4 w-3/5 h-48 bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-white/[0.05] shadow-xl">
              <div className="bg-zinc-900/60 px-4 py-2.5 flex items-center gap-2 border-b border-white/[0.05] rounded-t-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 text-[11px] text-zinc-600">Browser</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/[0.03] rounded w-4/5" />
                <div className="h-3 bg-white/[0.03] rounded w-3/5" />
                <div className="h-3 bg-white/[0.03] rounded w-2/3" />
              </div>
            </div>

            {/* Background window 2 */}
            <div className="absolute top-16 right-16 w-2/5 h-40 bg-zinc-800/30 backdrop-blur-sm rounded-xl border border-white/[0.05] shadow-xl">
              <div className="bg-zinc-900/60 px-4 py-2.5 flex items-center gap-2 border-b border-white/[0.05] rounded-t-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 text-[11px] text-zinc-600">Editor</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="h-2.5 bg-white/[0.03] rounded w-full" />
                <div className="h-2.5 bg-white/[0.03] rounded w-4/5" />
              </div>
            </div>
          </div>

          {/* Floating button with glow - the main feature */}
          <div className="absolute bottom-8 right-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 cursor-pointer hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-24 right-6 bg-zinc-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/[0.08] shadow-xl">
            <p className="text-[12px] text-zinc-300">Clicca per una nuova nota</p>
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-zinc-800/90 border-r border-b border-white/[0.08] rotate-45" />
          </div>
        </div>

        <p className="text-[14px] text-zinc-500 mt-6 text-center">
          Il pulsante flottante sarà sempre visibile su qualsiasi applicazione
        </p>
      </div>

      {/* Upcoming Features Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Funzionalità in arrivo</span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {upcomingFeatures.map((f) => (
            <div key={f.title} className="card group hover:border-indigo-500/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <p className="text-[15px] text-white font-medium mb-2">{f.title}</p>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline / Roadmap */}
      <div className="card mb-10">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Roadmap di sviluppo</span>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />

          <div className="space-y-8">
            {/* Phase 1 */}
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[15px] text-white font-medium">Fase 1: Core Development</p>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[11px] font-medium rounded-full">In corso</span>
                </div>
                <p className="text-[13px] text-zinc-500">Sviluppo dell&apos;architettura base e sistema di cattura note</p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <span className="text-[12px] text-zinc-500 font-medium">2</span>
              </div>
              <div>
                <p className="text-[15px] text-white font-medium mb-1">Fase 2: Screenshot & Annotazioni</p>
                <p className="text-[13px] text-zinc-500">Sistema di cattura screenshot con strumenti di annotazione integrati</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <span className="text-[12px] text-zinc-500 font-medium">3</span>
              </div>
              <div>
                <p className="text-[15px] text-white font-medium mb-1">Fase 3: Sync & Team Features</p>
                <p className="text-[13px] text-zinc-500">Sincronizzazione real-time e funzionalità di collaborazione</p>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <span className="text-[12px] text-zinc-500 font-medium">4</span>
              </div>
              <div>
                <p className="text-[15px] text-white font-medium mb-1">Fase 4: Beta Release</p>
                <p className="text-[13px] text-zinc-500">Rilascio beta per Windows, macOS e Linux</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notify Me Section */}
      <div className="card bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 border-indigo-500/10">
        <div className="text-center py-4">
          <h3 className="text-xl font-semibold text-white mb-3">Resta aggiornato</h3>
          <p className="text-[14px] text-zinc-400 mb-6 max-w-md mx-auto">
            Ricevi una notifica quando il Desktop Agent sarà disponibile per il download
          </p>

          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="La tua email"
              className="flex-1 px-4 py-3 bg-zinc-900/50 border border-white/[0.08] rounded-xl text-[14px] text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              disabled
            />
            <button
              className="btn btn-glow opacity-60 cursor-not-allowed"
              disabled
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notificami
            </button>
          </div>

          <p className="text-[12px] text-zinc-600 mt-4">
            Funzionalità disponibile prossimamente
          </p>
        </div>
      </div>
    </div>
  );
}
