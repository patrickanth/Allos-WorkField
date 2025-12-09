'use client';

import { useState, useEffect, useRef } from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tutorial sections data
const tutorialSections = [
  {
    id: 'welcome',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Benvenuto in WorkField',
    subtitle: 'Il tuo workspace intelligente',
    description: 'WorkField è la piattaforma all-in-one per gestire progetti, note, ticket e molto altro. Scopri tutte le funzionalità con questo breve tour.',
    color: 'cyan',
    features: [
      'Interfaccia moderna e intuitiva',
      'Design sci-fi per un\'esperienza unica',
      'Tutto sincronizzato in tempo reale',
    ],
  },
  {
    id: 'dashboard',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Dashboard',
    subtitle: 'Il centro di controllo',
    description: 'La tua dashboard mostra una panoramica completa: statistiche in tempo reale, attività recenti, ticket aperti e scadenze imminenti.',
    color: 'violet',
    features: [
      'Statistiche note e ticket',
      'Attività recente del team',
      'Grafici interattivi',
      'Quick actions',
    ],
  },
  {
    id: 'notes',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Note',
    subtitle: 'Cattura le tue idee',
    description: 'Crea note private o condivise con il team. Organizzale con colori, categorie e tag. Aggiungi le tue note preferite ai pin per trovarle sempre.',
    color: 'emerald',
    features: [
      'Note private e condivise',
      '8 colori disponibili',
      'Sistema di tag e categorie',
      'Ricerca full-text',
      'Pin per note importanti',
    ],
  },
  {
    id: 'tickets',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    title: 'Tickets',
    subtitle: 'Gestisci le richieste',
    description: 'Un sistema completo di ticketing con stati, priorità, assegnazioni e scadenze. Filtra, cerca e organizza i ticket come preferisci.',
    color: 'amber',
    features: [
      '4 stati: Aperto, In Corso, Risolto, Chiuso',
      'Priorità: Bassa, Media, Alta, Critica',
      'Assegnazione membri del team',
      'Scadenze e promemoria',
      'Esportazione Excel/CSV',
    ],
  },
  {
    id: 'calendar',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Calendario',
    subtitle: 'Pianifica il tuo tempo',
    description: 'Visualizza eventi, scadenze ticket e milestone in un calendario interattivo. Passa dalla vista mensile a quella settimanale con un click.',
    color: 'rose',
    features: [
      'Vista mensile e settimanale',
      'Eventi con colori personalizzati',
      'Integrazione scadenze ticket',
      'Tipi: Eventi, Scadenze, Riunioni, Promemoria',
    ],
  },
  {
    id: 'projects',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    title: 'Project Maps',
    subtitle: 'Visualizza i tuoi progetti',
    description: 'Crea mappe visive dei tuoi progetti con nodi collegati. Trascina, connetti e organizza i componenti del progetto in modo intuitivo.',
    color: 'cyan',
    features: [
      '5 tipi di nodi: Core, Modulo, Task, Milestone, Risorsa',
      'Connessioni con etichette',
      'Drag & drop interattivo',
      'Zoom e pan della mappa',
      'Stato e progresso per ogni nodo',
    ],
  },
  {
    id: 'analytics',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics',
    subtitle: 'Analizza i dati',
    description: 'Dashboard analitica con grafici interattivi. Monitora l\'attività del team, le performance sui ticket e l\'andamento nel tempo.',
    color: 'violet',
    features: [
      'Grafici attività giornaliera',
      'Distribuzione stati ticket',
      'Top contributors del team',
      'Trend su 14 giorni',
    ],
  },
  {
    id: 'team',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Team',
    subtitle: 'Collabora con il tuo team',
    description: 'Gestisci il tuo team, invita nuovi membri con codice univoco e visualizza l\'attività di tutti. Lavora insieme in modo efficiente.',
    color: 'emerald',
    features: [
      'Crea o unisciti a un team',
      'Inviti con codice univoco',
      'Statistiche per membro',
      'Activity feed del team',
      'Ruoli: Admin e Member',
    ],
  },
  {
    id: 'settings',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Impostazioni',
    subtitle: 'Personalizza l\'esperienza',
    description: 'Modifica il tuo profilo, cambia password, gestisci le preferenze di notifica e personalizza il tema dell\'applicazione.',
    color: 'amber',
    features: [
      'Modifica profilo e nome',
      'Cambio password sicuro',
      'Preferenze notifiche',
      'Tema: Dark, Light, System',
      'Esporta i tuoi dati',
    ],
  },
];

const colorClasses = {
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  violet: {
    bg: 'from-violet-500/20 to-violet-600/10',
    border: 'border-violet-500/50',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/30',
    dot: 'bg-violet-500',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30',
    dot: 'bg-amber-500',
  },
  rose: {
    bg: 'from-rose-500/20 to-rose-600/10',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/30',
    dot: 'bg-rose-500',
  },
};

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset to first section when opening
      setCurrentSection(0);
      // Fade in
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSection < tutorialSections.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSection(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSection(prev => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const section = tutorialSections[currentSection];
  const colors = colorClasses[section.color as keyof typeof colorClasses];

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={handleSkip} />

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Animated glow */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 ${colors.dot}`}
        style={{
          opacity: 0.1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div
          className={`relative w-full max-w-4xl bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Tour Guidato</h2>
                <p className="text-xs text-zinc-500 font-mono">
                  {currentSection + 1} / {tutorialSections.length}
                </p>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              Salta
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800">
            <div
              className={`h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500`}
              style={{ width: `${((currentSection + 1) / tutorialSections.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div
            ref={scrollContainerRef}
            className={`p-8 md:p-12 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
          >
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              {/* Icon */}
              <div className={`shrink-0 w-32 h-32 rounded-3xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text} shadow-2xl ${colors.glow}`}>
                {section.icon}
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4`}>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-mono ${colors.text} tracking-wider`}>
                    {section.subtitle.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {section.title}
                </h3>

                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  {section.description}
                </p>

                {/* Features list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                        <svg className={`w-3 h-3 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10 flex items-center justify-between">
            {/* Navigation dots */}
            <div className="flex items-center gap-2">
              {tutorialSections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentSection(i);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentSection
                      ? `w-8 ${colors.dot}`
                      : i < currentSection
                        ? 'bg-white/30'
                        : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {currentSection > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  Indietro
                </button>
              )}

              <button
                onClick={handleNext}
                className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium text-sm hover:opacity-90 transition-all flex items-center gap-2`}
              >
                {currentSection === tutorialSections.length - 1 ? (
                  <>
                    Inizia
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continua
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Decorative corners */}
          <div className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 ${colors.border} rounded-tl-3xl opacity-50`} />
          <div className={`absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 ${colors.border} rounded-tr-3xl opacity-50`} />
          <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 ${colors.border} rounded-bl-3xl opacity-50`} />
          <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 ${colors.border} rounded-br-3xl opacity-50`} />
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">←</kbd>
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">→</kbd>
          Naviga
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-mono">Esc</kbd>
          Salta
        </span>
      </div>
    </div>
  );
}
