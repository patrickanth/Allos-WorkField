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
      <path d="M12.504 0c-.155 0-.311.001-.465.003-.653.014-1.283.082-1.89.199-.617.12-1.203.29-1.758.508a6.76 6.76 0 00-1.54.844c-.441.336-.848.72-1.219 1.147a8.14 8.14 0 00-.95 1.372c-.262.426-.493.878-.69 1.351a9.97 9.97 0 00-.434 1.444 11.06 11.06 0 00-.213 1.488c-.043.472-.064.94-.064 1.399 0 .441.019.878.058 1.306.039.437.101.871.186 1.298.087.426.198.847.332 1.257.135.41.295.81.481 1.194.188.386.401.756.64 1.108.24.353.508.685.801.992.293.309.612.593.958.851.345.258.716.49 1.111.691.396.202.816.372 1.259.508.444.136.91.237 1.396.3.486.064.992.097 1.515.097.521 0 1.028-.033 1.514-.097a8.09 8.09 0 001.397-.301 7.24 7.24 0 001.259-.508c.396-.202.767-.433 1.111-.691.346-.258.665-.542.958-.851.293-.307.56-.639.801-.992.239-.352.452-.722.64-1.108.186-.384.346-.783.481-1.194.134-.41.245-.83.332-1.257.085-.426.147-.86.186-1.298.039-.428.058-.865.058-1.306 0-.459-.021-.927-.064-1.399a11.06 11.06 0 00-.213-1.488 9.97 9.97 0 00-.434-1.444 7.8 7.8 0 00-.69-1.351 8.14 8.14 0 00-.95-1.372 7.6 7.6 0 00-1.219-1.147 6.76 6.76 0 00-1.54-.844 7.18 7.18 0 00-1.758-.508 9.2 9.2 0 00-1.89-.199A12.66 12.66 0 0012.504 0zm-.41 1.424c.553-.007 1.063.029 1.527.103.471.075.901.185 1.295.329.397.146.76.327 1.093.541.335.214.64.46.914.737.275.278.522.588.742.926.22.34.413.707.582 1.098.169.392.312.809.433 1.246.12.439.217.896.293 1.369.076.474.131.963.167 1.465.036.503.055 1.02.055 1.548 0 .52-.019 1.026-.055 1.517-.036.492-.091.969-.167 1.432a8.63 8.63 0 01-.293 1.308 6.78 6.78 0 01-.433 1.18 5.81 5.81 0 01-.582 1.034 5.25 5.25 0 01-.742.878 4.84 4.84 0 01-.914.698 4.59 4.59 0 01-1.093.516c-.394.14-.824.247-1.295.32a8.52 8.52 0 01-1.527.098c-.553.006-1.062-.03-1.527-.105-.47-.076-.9-.186-1.294-.33a4.58 4.58 0 01-1.093-.518 4.84 4.84 0 01-.914-.698 5.25 5.25 0 01-.742-.878 5.81 5.81 0 01-.582-1.034 6.78 6.78 0 01-.433-1.18 8.63 8.63 0 01-.293-1.308 10.67 10.67 0 01-.167-1.432 12.51 12.51 0 01-.055-1.517c0-.528.019-1.045.055-1.548.036-.502.091-.991.167-1.465.076-.473.173-.93.293-1.369.121-.437.264-.854.433-1.246.169-.391.362-.758.582-1.098.22-.338.467-.648.742-.926.274-.277.579-.523.914-.737.333-.214.696-.395 1.093-.541.394-.144.824-.254 1.295-.329a8.49 8.49 0 011.527-.103z" />
    </svg>
  ),
};

const features = [
  { title: 'Accesso rapido', desc: 'Pulsante overlay sempre visibile su ogni finestra' },
  { title: 'Timestamp automatico', desc: 'Data e ora aggiunte automaticamente' },
  { title: 'Privacy integrata', desc: 'Scegli se condividere o tenere privato' },
  { title: 'Sincronizzazione', desc: 'Sync automatico con il tuo team in tempo reale' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen relative lamp-container">
      <div className="px-16 py-14 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 font-medium">
            Strumenti
          </p>
          <h1 className="text-5xl font-extralight text-white tracking-tight mb-3">Desktop Agent</h1>
          <p className="text-lg text-white/40 font-light">
            Overlay per catturare note rapidamente ovunque ti trovi
          </p>
        </div>

        {/* Preview */}
        <div className="elegant-card p-12 mb-14 overflow-hidden">
          <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden h-72 border border-white/[0.06]">
            {/* Simulated window */}
            <div className="absolute inset-6 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="bg-white/[0.04] px-5 py-3 flex items-center gap-2 border-b border-white/[0.04]">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              </div>
            </div>

            {/* Floating button with glow */}
            <div className="absolute bottom-8 right-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl" />
                <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center text-black text-2xl font-light shadow-2xl">
                  +
                </div>
              </div>
            </div>
          </div>
          <p className="text-base text-white/40 mt-8 text-center font-light">
            Pulsante sempre visibile per accesso rapido alle note
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-6 mb-14">
          {features.map((f) => (
            <div key={f.title} className="elegant-card p-8">
              <p className="text-lg text-white/80 mb-2 font-light">{f.title}</p>
              <p className="text-base text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Downloads */}
        <div className="elegant-card overflow-hidden mb-10">
          <div className="px-10 py-8 border-b border-white/[0.06]">
            <span className="text-sm text-white/40 uppercase tracking-[0.15em] font-medium">Download</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {platforms.map((platform) => (
              <div key={platform.name} className="px-10 py-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50">
                    {icons[platform.icon]}
                  </div>
                  <div>
                    <p className="text-lg text-white/80 font-light">{platform.name}</p>
                    <p className="text-sm text-white/40">v{platform.version} · {platform.size}</p>
                  </div>
                </div>
                <button
                  disabled={!platform.available}
                  className="primary-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Scarica
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="text-base text-white/30 font-light">
          <p className="mb-4 text-white/40">Requisiti minimi:</p>
          <ul className="space-y-2">
            <li>Windows 10+ / macOS 10.14+ / Ubuntu 18.04+</li>
            <li>4 GB RAM</li>
            <li>100 MB spazio libero</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
