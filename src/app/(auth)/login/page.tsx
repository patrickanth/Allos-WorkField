'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN SEQUENCE STATES
// ═══════════════════════════════════════════════════════════════════════════
type LoginPhase =
  | 'form'           // Normal login form
  | 'countdown'      // "Questo dispositivo si autodistruggerà in 3,2,1"
  | 'glitch'         // Hacked/glitch screen
  | 'reboot'         // System reboot sequence
  | 'camera'         // Face recognition
  | 'welcome'        // Welcome message
  | 'redirect';      // Redirecting to dashboard

// ═══════════════════════════════════════════════════════════════════════════
// RANDOM TEXT FOR GLITCH EFFECT
// ═══════════════════════════════════════════════════════════════════════════
const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const hackerMessages = [
  'ACCESS DENIED',
  'SECURITY BREACH DETECTED',
  'FIREWALL COMPROMISED',
  'INITIATING COUNTERMEASURES',
  'TRACING ORIGIN...',
  'ENCRYPTION FAILED',
  'SYSTEM OVERRIDE',
  'UNAUTHORIZED ACCESS',
  'MEMORY DUMP IN PROGRESS',
  'ROOT ACCESS GRANTED',
];

const rebootMessages = [
  { text: 'BIOS v4.2.1 - WorkField Systems', delay: 200 },
  { text: 'Checking memory... 32768 MB OK', delay: 400 },
  { text: 'Initializing secure boot...', delay: 300 },
  { text: 'Loading kernel modules...', delay: 500 },
  { text: 'Mounting encrypted filesystem...', delay: 400 },
  { text: 'Starting security services...', delay: 300 },
  { text: 'Initializing neural interface...', delay: 600 },
  { text: 'Calibrating biometric sensors...', delay: 400 },
  { text: 'Establishing secure connection...', delay: 500 },
  { text: 'System ready.', delay: 300 },
];

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Animation state
  const [phase, setPhase] = useState<LoginPhase>('form');
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [glitchText, setGlitchText] = useState<string[]>([]);
  const [rebootLines, setRebootLines] = useState<string[]>([]);
  const [rebootProgress, setRebootProgress] = useState(0);
  const [cameraPhase, setCameraPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Refs
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    checkExistingSession();
    return () => {
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.authenticated) {
        router.push('/dashboard');
      }
    } catch {
      // Not logged in
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUND EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════
  const playBeep = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;

      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch {
      // Audio not supported
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check if this is the correct email
    const isCorrectEmail = email.toLowerCase() === 'patrickanthonystudio@gmail.com';
    const isCorrectPassword = password === 'dev123@@';

    if (!isCorrectEmail || !isCorrectPassword) {
      setError('Credenziali non valide');
      setIsLoading(false);
      return;
    }

    // First attempt - show error
    if (loginAttempts === 0) {
      setLoginAttempts(1);
      setError('Errore di autenticazione. Riprova.');
      setIsLoading(false);
      playBeep(200, 200);
      return;
    }

    // Second attempt - start the cinematic sequence
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store that we've done the intro
        localStorage.setItem('workfield_intro_seen', 'true');
        localStorage.setItem('workfield_show_tutorial', 'true');
        startCinematicSequence();
      } else {
        setError('Credenziali non valide');
        setIsLoading(false);
      }
    } catch {
      setError('Si è verificato un errore');
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CINEMATIC SEQUENCE
  // ═══════════════════════════════════════════════════════════════════════════
  const startCinematicSequence = () => {
    setPhase('countdown');
    playBeep(800, 100);
  };

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;

    const countdown = setInterval(() => {
      setCountdownNumber(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setTimeout(() => setPhase('glitch'), 500);
          return 0;
        }
        playBeep(600 + (3 - prev) * 200, 150);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [phase, playBeep]);

  // Glitch phase
  useEffect(() => {
    if (phase !== 'glitch') return;

    let lineCount = 0;
    glitchIntervalRef.current = setInterval(() => {
      // Generate random glitch text
      const newLines: string[] = [];
      for (let i = 0; i < 30; i++) {
        let line = '';
        const lineLength = Math.floor(Math.random() * 80) + 20;
        for (let j = 0; j < lineLength; j++) {
          line += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        // Occasionally insert hacker messages
        if (Math.random() > 0.7) {
          line = hackerMessages[Math.floor(Math.random() * hackerMessages.length)];
        }
        newLines.push(line);
      }
      setGlitchText(newLines);
      lineCount++;

      // Play glitch sounds
      if (lineCount % 3 === 0) {
        playBeep(Math.random() * 1000 + 100, 50);
      }

      // After 3 seconds, move to reboot
      if (lineCount > 30) {
        if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
        setPhase('reboot');
      }
    }, 100);

    return () => {
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
    };
  }, [phase, playBeep]);

  // Reboot phase
  useEffect(() => {
    if (phase !== 'reboot') return;

    let currentLine = 0;
    const addLine = () => {
      if (currentLine < rebootMessages.length) {
        setRebootLines(prev => [...prev, rebootMessages[currentLine].text]);
        setRebootProgress(((currentLine + 1) / rebootMessages.length) * 100);
        playBeep(400, 30);
        currentLine++;
        setTimeout(addLine, rebootMessages[currentLine - 1].delay);
      } else {
        // Move to camera phase after a short delay
        setTimeout(() => setPhase('camera'), 1000);
      }
    };

    setTimeout(addLine, 500);
  }, [phase, playBeep]);

  // Camera/Face recognition phase
  useEffect(() => {
    if (phase !== 'camera') return;

    const phases = [
      { delay: 1000, phase: 1 }, // "Accensione fotocamera..."
      { delay: 2000, phase: 2 }, // Camera view appears
      { delay: 2500, phase: 3 }, // "Riconoscimento volto..."
      { delay: 4500, phase: 4 }, // Scanning
      { delay: 6000, phase: 5 }, // "IDENTITÀ VERIFICATA"
    ];

    phases.forEach(({ delay, phase: p }) => {
      setTimeout(() => setCameraPhase(p), delay);
    });

    // Scan progress animation
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Move to welcome after verification
    setTimeout(() => setPhase('welcome'), 7000);

    return () => clearInterval(scanInterval);
  }, [phase]);

  // Welcome phase
  useEffect(() => {
    if (phase !== 'welcome') return;

    setTimeout(() => setWelcomeVisible(true), 500);
    setTimeout(() => setPhase('redirect'), 4000);
  }, [phase]);

  // Redirect phase
  useEffect(() => {
    if (phase !== 'redirect') return;
    router.push('/dashboard');
    router.refresh();
  }, [phase, router]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Login Form
  const renderLoginForm = () => (
    <div className="w-full max-w-sm relative z-10">
      {/* Allos Branding */}
      <div className="mb-12 text-center">
        <div className="mb-6">
          <h1 className="text-5xl font-extralight tracking-[0.35em] text-neutral-200 uppercase">
            {mounted && 'Allos'.split('').map((letter, i) => (
              <span
                key={i}
                className="inline-block animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-neutral-700" />
          <span className="text-xs tracking-[0.4em] text-neutral-500 uppercase">WorkField</span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-neutral-700" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:bg-neutral-900 transition-all"
            placeholder="nome@azienda.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:bg-neutral-900 transition-all pr-16"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors text-xs uppercase tracking-wider"
            >
              {showPassword ? 'Nascondi' : 'Mostra'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center py-3 bg-red-950/30 rounded-lg border border-red-900/30 animate-shake">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2 relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Accesso...
              </span>
            ) : (
              'Accedi'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </form>

      <p className="mt-10 text-center text-neutral-700 text-xs">
        Sistema di accesso sicuro WorkField
      </p>
    </div>
  );

  // Countdown Phase
  const renderCountdown = () => (
    <div className="text-center relative z-10">
      <div className="mb-8">
        <svg className="w-20 h-20 mx-auto text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <p className="text-red-400 text-lg mb-4 font-mono animate-pulse">
        ATTENZIONE
      </p>

      <p className="text-white text-xl mb-8 font-light tracking-wide">
        Per ragioni di sicurezza, questo dispositivo<br />
        si autodistruggerà in
      </p>

      <div className="text-8xl font-bold text-red-500 animate-bounce font-mono">
        {countdownNumber}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i <= countdownNumber ? 'bg-red-500 animate-pulse' : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>
    </div>
  );

  // Glitch Phase
  const renderGlitch = () => (
    <div className="fixed inset-0 bg-black overflow-hidden glitch-container">
      {/* Glitch overlay effects */}
      <div className="absolute inset-0 glitch-effect" />
      <div className="absolute inset-0 scanlines" />

      {/* Random glitch text */}
      <div className="absolute inset-0 font-mono text-xs overflow-hidden">
        {glitchText.map((line, i) => (
          <div
            key={i}
            className={`whitespace-nowrap ${
              Math.random() > 0.5 ? 'text-red-500' : Math.random() > 0.5 ? 'text-cyan-500' : 'text-green-500'
            }`}
            style={{
              transform: `translateX(${Math.random() * 100 - 50}px)`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Central warning */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center glitch-text" data-text="SECURITY BREACH">
          <p className="text-6xl font-bold text-red-500 animate-glitch">
            SECURITY BREACH
          </p>
          <p className="text-xl text-red-400 mt-4 animate-pulse">
            SYSTEM COMPROMISED
          </p>
        </div>
      </div>

      {/* RGB split effect overlay */}
      <div className="absolute inset-0 pointer-events-none rgb-split" />
    </div>
  );

  // Reboot Phase
  const renderReboot = () => (
    <div className="fixed inset-0 bg-black flex flex-col p-8 font-mono text-sm">
      {/* BIOS-like header */}
      <div className="text-cyan-400 mb-4 border-b border-cyan-400/30 pb-2">
        WorkField Security System v2.4.1
      </div>

      {/* Boot messages */}
      <div className="flex-1 overflow-hidden">
        {rebootLines.map((line, i) => (
          <div key={i} className="text-green-400 mb-1 animate-fade-in">
            <span className="text-cyan-400">[{String(i).padStart(2, '0')}]</span> {line}
          </div>
        ))}
        {rebootLines.length > 0 && (
          <span className="inline-block w-2 h-4 bg-green-400 animate-blink ml-1" />
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span>SYSTEM REBOOT</span>
          <span>{Math.round(rebootProgress)}%</span>
        </div>
        <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
            style={{ width: `${rebootProgress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Camera/Face Recognition Phase
  const renderCamera = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center w-full max-w-lg px-8">
        {/* Phase 1: Accensione fotocamera */}
        {cameraPhase >= 1 && (
          <div className={`mb-8 transition-opacity duration-500 ${cameraPhase >= 2 ? 'opacity-50' : 'opacity-100'}`}>
            <p className="text-cyan-400 font-mono text-lg animate-pulse">
              Accensione fotocamera...
            </p>
          </div>
        )}

        {/* Phase 2-4: Camera viewfinder */}
        {cameraPhase >= 2 && (
          <div className="relative mx-auto w-64 h-64 mb-8">
            {/* Camera frame */}
            <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Face outline */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div className={`w-32 h-40 border-2 border-dashed rounded-full transition-all duration-1000 ${
                cameraPhase >= 4 ? 'border-green-400 scale-105' : 'border-cyan-400/50'
              }`}>
                {/* Face detection points */}
                {cameraPhase >= 4 && (
                  <>
                    <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-6 h-1 bg-green-400 rounded animate-ping" style={{ animationDelay: '0.3s' }} />
                  </>
                )}
              </div>
            </div>

            {/* Scanning line */}
            {cameraPhase >= 3 && cameraPhase < 5 && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  top: `${scanProgress}%`,
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)',
                }}
              />
            )}

            {/* Status indicators */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs font-mono">
              <span className="text-cyan-400">REC</span>
              <span className={cameraPhase >= 4 ? 'text-green-400' : 'text-neutral-500'}>
                {cameraPhase >= 4 ? 'MATCH' : 'ANALYZING...'}
              </span>
            </div>
          </div>
        )}

        {/* Phase 3: Riconoscimento volto */}
        {cameraPhase >= 3 && cameraPhase < 5 && (
          <div className="mb-4">
            <p className="text-cyan-400 font-mono animate-pulse">
              Riconoscimento volto...
            </p>
            <div className="mt-4 h-1 bg-neutral-900 rounded-full overflow-hidden w-48 mx-auto">
              <div
                className="h-full bg-cyan-500 transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Phase 5: Verification complete */}
        {cameraPhase >= 5 && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 text-2xl font-bold font-mono">
              IDENTITÀ VERIFICATA
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Welcome Phase
  const renderWelcome = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className={`text-center transition-all duration-1000 ${welcomeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Welcome animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/50 flex items-center justify-center mb-6">
            <span className="text-4xl">LS</span>
          </div>
        </div>

        <p className="text-neutral-500 font-mono text-sm mb-2 animate-pulse">
          Loading...
        </p>

        <h1 className="text-4xl font-light text-white mb-2">
          Ciao <span className="text-cyan-400">Luigi Salierno</span>,
        </h1>
        <p className="text-xl text-neutral-400">
          benvenuto in <span className="text-violet-400 font-semibold">WorkField</span>
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-48 mx-auto h-1 bg-neutral-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 animate-loading-bar" />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen bg-neutral-950 relative overflow-hidden ${phase === 'glitch' ? 'glitch-shake' : ''}`}>
      {/* Background */}
      {phase === 'form' && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-neutral-900/50 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-6">
        {phase === 'form' && renderLoginForm()}
        {phase === 'countdown' && renderCountdown()}
        {phase === 'glitch' && renderGlitch()}
        {phase === 'reboot' && renderReboot()}
        {phase === 'camera' && renderCamera()}
        {phase === 'welcome' && renderWelcome()}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }

        /* Glitch Effects */
        .glitch-shake {
          animation: glitch-shake 0.1s infinite;
        }

        @keyframes glitch-shake {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        .glitch-effect {
          background: linear-gradient(
            transparent 0%,
            rgba(255, 0, 0, 0.03) 50%,
            transparent 100%
          );
          animation: glitch-scan 0.5s linear infinite;
        }

        @keyframes glitch-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          );
          pointer-events: none;
        }

        .rgb-split::before,
        .rgb-split::after {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          animation: rgb-split 0.2s infinite;
        }

        .rgb-split::before {
          filter: url('#red');
          animation-delay: 0.05s;
        }

        .rgb-split::after {
          filter: url('#cyan');
          animation-delay: 0.1s;
        }

        @keyframes rgb-split {
          0% { transform: translate(0); }
          33% { transform: translate(-2px, 1px); }
          66% { transform: translate(2px, -1px); }
          100% { transform: translate(0); }
        }

        .animate-glitch {
          animation: glitch-text 0.3s infinite;
        }

        @keyframes glitch-text {
          0% { text-shadow: 2px 0 red, -2px 0 cyan; }
          25% { text-shadow: -2px 0 red, 2px 0 cyan; }
          50% { text-shadow: 2px 2px red, -2px -2px cyan; }
          75% { text-shadow: -2px -2px red, 2px 2px cyan; }
          100% { text-shadow: 2px 0 red, -2px 0 cyan; }
        }
      `}</style>
    </div>
  );
}
