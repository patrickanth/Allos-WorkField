'use client';

const platforms = [
  { name: 'Windows', version: '1.0.0', size: '85 MB', available: true, icon: 'windows' },
  { name: 'macOS', version: '1.0.0', size: '92 MB', available: true, icon: 'apple' },
  { name: 'Linux', version: '1.0.0', size: '78 MB', available: true, icon: 'linux' },
];

const icons: Record<string, React.ReactNode> = {
  windows: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  apple: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  linux: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.311.001-.465.003-.653.014-1.283.082-1.89.199-.617.12-1.203.29-1.758.508a6.76 6.76 0 00-1.54.844c-.441.336-.848.72-1.219 1.147a8.14 8.14 0 00-.95 1.372c-.262.426-.493.878-.69 1.351a9.97 9.97 0 00-.434 1.444 11.06 11.06 0 00-.213 1.488c-.043.472-.064.94-.064 1.399 0 .441.019.878.058 1.306.039.437.101.871.186 1.298.087.426.198.847.332 1.257.135.41.295.81.481 1.194.188.386.401.756.64 1.108.24.353.508.685.801.992.293.309.612.593.958.851.345.258.716.49 1.111.691.396.202.816.372 1.259.508.444.136.91.237 1.396.3.486.064.992.097 1.515.097.521 0 1.028-.033 1.514-.097a8.09 8.09 0 001.397-.301 7.24 7.24 0 001.259-.508c.396-.202.767-.433 1.111-.691.346-.258.665-.542.958-.851.293-.307.56-.639.801-.992.239-.352.452-.722.64-1.108.186-.384.346-.783.481-1.194.134-.41.245-.83.332-1.257.085-.426.147-.86.186-1.298.039-.428.058-.865.058-1.306 0-.459-.021-.927-.064-1.399a11.06 11.06 0 00-.213-1.488 9.97 9.97 0 00-.434-1.444 7.8 7.8 0 00-.69-1.351 8.14 8.14 0 00-.95-1.372 7.6 7.6 0 00-1.219-1.147 6.76 6.76 0 00-1.54-.844 7.18 7.18 0 00-1.758-.508 9.2 9.2 0 00-1.89-.199A12.66 12.66 0 0012.504 0z" />
    </svg>
  ),
};

const features = [
  { title: 'Accesso rapido', desc: 'Pulsante overlay sempre visibile' },
  { title: 'Timestamp automatico', desc: 'Data e ora aggiunte automaticamente' },
  { title: 'Privacy integrata', desc: 'Scegli se condividere o tenere privato' },
  { title: 'Sincronizzazione', desc: 'Sync automatico con il team' },
];

export default function DownloadPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Desktop Agent</h1>
        <p className="page-subtitle">Cattura note rapidamente ovunque ti trovi</p>
      </div>

      {/* Preview */}
      <div className="card p-8 mb-6">
        <div className="relative bg-zinc-900 rounded-xl overflow-hidden h-56 border border-zinc-800">
          {/* Simulated window */}
          <div className="absolute inset-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2 border-b border-zinc-700/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-3 bg-zinc-700/50 rounded w-3/4" />
              <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
              <div className="h-3 bg-zinc-700/50 rounded w-2/3" />
            </div>
          </div>

          {/* Floating button */}
          <div className="absolute bottom-6 right-6">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-zinc-900 text-xl font-medium shadow-lg">
              +
            </div>
          </div>
        </div>
        <p className="text-[13px] text-zinc-500 mt-4 text-center">
          Pulsante sempre visibile per accesso rapido alle note
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {features.map((f) => (
          <div key={f.title} className="card p-5">
            <p className="text-[14px] text-white mb-1">{f.title}</p>
            <p className="text-[13px] text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Downloads */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-zinc-800">
          <span className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Download</span>
        </div>
        <div className="divide-y divide-zinc-800">
          {platforms.map((platform) => (
            <div key={platform.name} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  {icons[platform.icon]}
                </div>
                <div>
                  <p className="text-[14px] text-white">{platform.name}</p>
                  <p className="text-[13px] text-zinc-500">v{platform.version} · {platform.size}</p>
                </div>
              </div>
              <button
                disabled={!platform.available}
                className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Scarica
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="text-[13px] text-zinc-500">
        <p className="mb-3 text-zinc-400 font-medium">Requisiti minimi:</p>
        <ul className="space-y-1.5">
          <li>Windows 10+ / macOS 10.14+ / Ubuntu 18.04+</li>
          <li>4 GB RAM</li>
          <li>100 MB spazio libero</li>
        </ul>
      </div>
    </div>
  );
}
