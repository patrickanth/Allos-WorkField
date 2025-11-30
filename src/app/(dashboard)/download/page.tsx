'use client';

import { motion } from 'framer-motion';
import {
  Download,
  Monitor,
  Apple,
  Chrome,
  CheckCircle2,
  Sparkles,
  MousePointer,
  Bell,
  Clock,
  Share2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const features = [
  {
    icon: MousePointer,
    title: 'Accesso rapido',
    description: 'Un cerchio sempre visibile in basso a destra per accedere alle note istantaneamente.',
  },
  {
    icon: Clock,
    title: 'Timestamp automatico',
    description: 'Ogni nota viene salvata con data e ora automaticamente.',
  },
  {
    icon: Share2,
    title: 'Condivisione facile',
    description: 'Scegli se tenere la nota privata o condividerla con il team.',
  },
  {
    icon: Bell,
    title: 'Notifiche',
    description: 'Ricevi notifiche quando il team condivide nuove note.',
  },
];

const platforms = [
  {
    name: 'Windows',
    icon: Monitor,
    version: '1.0.0',
    size: '85 MB',
    downloadUrl: '#',
    available: true,
  },
  {
    name: 'macOS',
    icon: Apple,
    version: '1.0.0',
    size: '92 MB',
    downloadUrl: '#',
    available: true,
  },
  {
    name: 'Linux',
    icon: Chrome,
    version: '1.0.0',
    size: '78 MB',
    downloadUrl: '#',
    available: true,
  },
];

export default function DownloadPage() {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
            Allos WorkField Agent
          </h1>
          <p className="text-dark-500 max-w-2xl mx-auto text-lg">
            Un discreto overlay sempre a portata di mano. Cattura idee e note senza interrompere il tuo flusso di lavoro.
          </p>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-dark-100 to-dark-50 dark:from-dark-800 dark:to-dark-900 p-8 relative min-h-[300px]">
              {/* Simulated desktop */}
              <div className="absolute inset-4 rounded-lg bg-white dark:bg-dark-700 shadow-lg overflow-hidden">
                <div className="bg-dark-200 dark:bg-dark-600 px-4 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="p-4">
                  <div className="h-3 bg-dark-200 dark:bg-dark-600 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-dark-200 dark:bg-dark-600 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-dark-200 dark:bg-dark-600 rounded w-5/6" />
                </div>
              </div>

              {/* Floating button simulation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute bottom-8 right-8"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl flex items-center justify-center pulse-glow cursor-pointer hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Popup simulation */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-24 right-8 w-72 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold text-dark-900 dark:text-white text-sm">Nuova Nota</span>
                </div>
                <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-3 mb-3 text-sm text-dark-500">
                  Scrivi qui la tua nota...
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-400">14:32</span>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-700 text-xs">Privata</div>
                    <div className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs">Salva</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6 text-center">
            Caratteristiche principali
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-dark-500">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Download Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6 text-center">
            Scarica per il tuo sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="text-center hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
                    <platform.icon className="w-8 h-8 text-dark-600 dark:text-dark-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                    {platform.name}
                  </h3>
                  <div className="flex items-center justify-center gap-3 text-sm text-dark-500 mb-4">
                    <span>v{platform.version}</span>
                    <span>•</span>
                    <span>{platform.size}</span>
                  </div>
                  <Button
                    className="w-full"
                    variant={platform.available ? 'primary' : 'secondary'}
                    disabled={!platform.available}
                  >
                    <Download className="w-5 h-5" />
                    {platform.available ? 'Scarica' : 'Prossimamente'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">
              Requisiti di sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-dark-700 dark:text-dark-200 mb-2">Windows</p>
                <ul className="space-y-1 text-dark-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Windows 10 o superiore
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    4 GB RAM minimo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    100 MB spazio libero
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-dark-700 dark:text-dark-200 mb-2">macOS</p>
                <ul className="space-y-1 text-dark-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    macOS 10.14 o superiore
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    4 GB RAM minimo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    100 MB spazio libero
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-dark-700 dark:text-dark-200 mb-2">Linux</p>
                <ul className="space-y-1 text-dark-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Ubuntu 18.04+, Fedora 32+
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    4 GB RAM minimo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    100 MB spazio libero
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
