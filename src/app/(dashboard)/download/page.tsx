'use client';

const platforms = [
  { name: 'Windows', version: '1.0.0', size: '85 MB', available: true },
  { name: 'macOS', version: '1.0.0', size: '92 MB', available: true },
  { name: 'Linux', version: '1.0.0', size: '78 MB', available: true },
];

export default function DownloadPage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-medium text-neutral-100">Desktop Agent</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Overlay per catturare note rapidamente
          </p>
        </div>

        {/* Preview */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8">
          <div className="relative bg-neutral-800 rounded-lg overflow-hidden h-48">
            {/* Simulated window */}
            <div className="absolute inset-3 bg-neutral-700 rounded">
              <div className="bg-neutral-600 px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-500" />
                <div className="w-2 h-2 rounded-full bg-neutral-500" />
                <div className="w-2 h-2 rounded-full bg-neutral-500" />
              </div>
              <div className="p-3 space-y-2">
                <div className="h-2 bg-neutral-600 rounded w-3/4" />
                <div className="h-2 bg-neutral-600 rounded w-1/2" />
              </div>
            </div>

            {/* Floating button */}
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 text-sm font-medium">
              +
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-4 text-center">
            Pulsante sempre visibile per accesso rapido
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { title: 'Accesso rapido', desc: 'Pulsante overlay sempre visibile' },
            { title: 'Timestamp', desc: 'Data e ora automatiche' },
            { title: 'Privacy', desc: 'Scegli se condividere o meno' },
            { title: 'Sincronizzazione', desc: 'Sync automatico con il team' },
          ].map((f) => (
            <div key={f.title} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <p className="text-sm text-neutral-200 mb-1">{f.title}</p>
              <p className="text-xs text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Downloads */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="p-4 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Download</span>
          </div>
          <div className="divide-y divide-neutral-800">
            {platforms.map((platform) => (
              <div key={platform.name} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-200">{platform.name}</p>
                  <p className="text-xs text-neutral-500">v{platform.version} · {platform.size}</p>
                </div>
                <button
                  disabled={!platform.available}
                  className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Scarica
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 text-xs text-neutral-600">
          <p className="mb-2">Requisiti minimi:</p>
          <ul className="space-y-1">
            <li>Windows 10+ / macOS 10.14+ / Ubuntu 18.04+</li>
            <li>4 GB RAM</li>
            <li>100 MB spazio libero</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
