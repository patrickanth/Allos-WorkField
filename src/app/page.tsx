'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  Sparkles,
  Users,
  FileText,
  Download,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Allos
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {session ? (
                <Link href="/notes">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Accedi
                    </button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Inizia Gratis
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Workspace collaborativo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6"
          >
            Lavora meglio,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">insieme.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Note condivise, gestione ticket e un agent desktop
            sempre a portata di mano. Tutto in un unico posto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10"
              >
                Inizia Gratuitamente
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="#features">
              <button className="w-full sm:w-auto px-8 py-4 text-gray-600 font-medium hover:text-gray-900 transition-colors">
                Scopri di più
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-gray-200">
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="grid grid-cols-12 gap-6">
                {/* Sidebar Preview */}
                <div className="col-span-3 space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">Note</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded-full w-full" />
                      <div className="h-2 bg-gray-100 rounded-full w-4/5" />
                      <div className="h-2 bg-gray-100 rounded-full w-3/5" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">Team</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-white" />
                      <div className="w-7 h-7 rounded-full bg-purple-400 border-2 border-white" />
                      <div className="w-7 h-7 rounded-full bg-pink-400 border-2 border-white" />
                    </div>
                  </div>
                </div>

                {/* Main Content Preview */}
                <div className="col-span-9 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Ticket Recenti</h3>
                    <span className="text-sm text-blue-500 font-medium cursor-pointer hover:text-blue-600">Vedi tutti</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { color: 'bg-emerald-400', title: 'Aggiornamento dashboard completato', tag: 'Completato', tagColor: 'bg-emerald-50 text-emerald-600' },
                      { color: 'bg-amber-400', title: 'Review codice frontend in corso', tag: 'In corso', tagColor: 'bg-amber-50 text-amber-600' },
                      { color: 'bg-blue-400', title: 'Nuova feature da implementare', tag: 'Aperto', tagColor: 'bg-blue-50 text-blue-600' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm text-gray-700 font-medium">{item.title}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.tagColor}`}>{item.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Agent Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            className="absolute -bottom-6 right-8"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Strumenti semplici e potenti per il tuo team
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Spazio Condiviso',
                description: 'Collabora con il team in tempo reale',
                color: 'bg-blue-500',
              },
              {
                icon: FileText,
                title: 'Note Smart',
                description: 'Con timestamp automatico e privacy',
                color: 'bg-emerald-500',
              },
              {
                icon: Download,
                title: 'Desktop Agent',
                description: 'Overlay sempre a portata di mano',
                color: 'bg-purple-500',
              },
              {
                icon: Zap,
                title: 'Export Excel',
                description: 'Esporta i dati con un click',
                color: 'bg-amber-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Perché scegliere Allos?
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-lg">
                Progettato per team che vogliono lavorare meglio,
                senza complicazioni.
              </p>

              <div className="space-y-4">
                {[
                  'Spazio personale e condiviso',
                  'Autenticazione sicura',
                  'Agent desktop sempre accessibile',
                  'Export Excel integrato',
                  'Design minimal e moderno',
                  'Zero configurazione',
                ].map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {[
                { icon: Shield, title: 'Sicuro', desc: 'I tuoi dati sono sempre protetti', color: 'bg-blue-50', iconColor: 'text-blue-600' },
                { icon: Clock, title: 'Sincronizzato', desc: 'Aggiornamenti in tempo reale', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                { icon: Zap, title: 'Veloce', desc: 'Performance ottimali', color: 'bg-purple-50', iconColor: 'text-purple-600' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto per iniziare?
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              Unisciti ai team che lavorano in modo più intelligente.
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                Inizia Ora - È Gratis
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Allos WorkField</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
