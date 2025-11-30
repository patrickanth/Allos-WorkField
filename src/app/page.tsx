'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Users,
  FileText,
  Download,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Users,
      title: 'Spazio Condiviso',
      description: 'Collabora con il tuo team in tempo reale. Note, ticket e documenti sempre sincronizzati.',
    },
    {
      icon: FileText,
      title: 'Note Intelligenti',
      description: 'Prendi note al volo con timestamp automatico. Condividile con il team o tienile private.',
    },
    {
      icon: Download,
      title: 'Desktop Agent',
      description: 'Un overlay discreto sempre a portata di mano. Cattura idee senza interrompere il flusso di lavoro.',
    },
    {
      icon: Zap,
      title: 'Tabelle Personalizzabili',
      description: 'Crea campi e colonne su misura. Esporta tutto in Excel con un click.',
    },
  ];

  const benefits = [
    'Spazio personale e condiviso',
    'Autenticazione sicura',
    'Agent desktop sempre accessibile',
    'Export Excel integrato',
    'Interfaccia moderna e minimal',
    'Sincronizzazione in tempo reale',
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-200/10 dark:border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-dark-900 dark:text-white">
                Allos <span className="text-primary-500">WorkField</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/notes">
                  <Button>
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Accedi</Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      Inizia Gratis
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-pink-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                La nuova era della collaborazione
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-dark-900 dark:text-white mb-6"
            >
              Il tuo spazio di lavoro{' '}
              <span className="gradient-text">collaborativo</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-dark-600 dark:text-dark-300 mb-10 max-w-2xl mx-auto"
            >
              Note condivise, gestione ticket e un agent desktop sempre a portata di mano.
              Tutto ciò di cui il tuo team ha bisogno, in un unico posto.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg">
                  Inizia Gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Scopri le Funzionalità
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-dark-200/20 dark:border-dark-700/30">
              <div className="bg-dark-100 dark:bg-dark-800 px-4 py-3 border-b border-dark-200/20 dark:border-dark-700/30 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="p-8 bg-gradient-to-br from-dark-50 to-white dark:from-dark-900 dark:to-dark-800">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-4">
                    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-dark-900 dark:text-white">Le mie Note</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded w-full" />
                        <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded w-3/4" />
                        <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-dark-900 dark:text-white">Team</span>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500" />
                        <div className="w-8 h-8 rounded-full bg-violet-500" />
                        <div className="w-8 h-8 rounded-full bg-pink-500" />
                        <div className="w-8 h-8 rounded-full bg-dark-200 dark:bg-dark-600 flex items-center justify-center text-xs font-medium">+3</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-dark-900 dark:text-white">Ticket Recenti</h3>
                      <span className="text-sm text-primary-500">Vedi tutti</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { status: 'bg-emerald-500', title: 'Fix login bug' },
                        { status: 'bg-amber-500', title: 'Update documentation' },
                        { status: 'bg-primary-500', title: 'New feature request' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                          <div className={`w-2 h-2 rounded-full ${item.status}`} />
                          <span className="text-sm text-dark-700 dark:text-dark-200">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Agent Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-8 right-8 pulse-glow rounded-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              Strumenti potenti e intuitivi per portare la collaborazione del tuo team al livello successivo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-dark-50 dark:bg-dark-800 hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white group-hover:text-white mb-2 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-600 dark:text-dark-400 group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-6">
                Perché scegliere{' '}
                <span className="gradient-text">Allos WorkField</span>
              </h2>
              <p className="text-dark-600 dark:text-dark-300 mb-8">
                Progettato per team che vogliono lavorare in modo più intelligente.
                Ogni funzionalità è pensata per migliorare la produttività senza complicare il flusso di lavoro.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-dark-700 dark:text-dark-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 border border-dark-200/20 dark:border-dark-700/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">Sicuro e Privato</h3>
                    <p className="text-sm text-dark-500">I tuoi dati sono sempre protetti</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">Sempre Sincronizzato</h3>
                    <p className="text-sm text-dark-500">Aggiornamenti in tempo reale</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">Ultra Veloce</h3>
                    <p className="text-sm text-dark-500">Prestazioni ottimizzate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-500 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto a trasformare il tuo modo di lavorare?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Unisciti ai team che hanno già scoperto un nuovo livello di produttività.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-dark-50 shadow-xl"
              >
                Inizia Ora - È Gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-dark-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-dark-900 dark:text-white">
                Allos WorkField
              </span>
            </div>
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} Allos WorkField. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
