'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Bell,
  Moon,
  Sun,
  LogOut,
  Save,
  AlertTriangle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Impostazioni
          </h1>
          <p className="text-dark-500 mt-1">
            Gestisci il tuo profilo e le preferenze
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Profilo
            </h2>

            <div className="flex items-start gap-6 mb-6">
              <Avatar name={session?.user?.name || ''} size="xl" />
              <div className="flex-1">
                <Button variant="secondary" size="sm">
                  Cambia foto
                </Button>
                <p className="text-sm text-dark-500 mt-2">
                  JPG, PNG o GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                defaultValue={session?.user?.name || ''}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email"
                defaultValue={session?.user?.email || ''}
                leftIcon={<Mail className="w-5 h-5" />}
                disabled
              />
            </div>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              Preferenze
            </h2>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-primary-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">
                      Tema scuro
                    </p>
                    <p className="text-sm text-dark-500">
                      Attiva il tema scuro per ridurre l'affaticamento degli occhi
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    isDark ? 'bg-primary-500' : 'bg-dark-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      isDark ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <Bell className={`w-5 h-5 ${notifications ? 'text-primary-500' : 'text-dark-400'}`} />
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">
                      Notifiche
                    </p>
                    <p className="text-sm text-dark-500">
                      Ricevi notifiche quando il team condivide nuove note
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications ? 'bg-primary-500' : 'bg-dark-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              Sicurezza
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-dark-900 dark:text-white">
                    Cambia password
                  </p>
                  <p className="text-sm text-dark-500">
                    Aggiorna la tua password per mantenere l'account sicuro
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Modifica
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-dark-900 dark:text-white">
                    Sessioni attive
                  </p>
                  <p className="text-sm text-dark-500">
                    Gestisci i dispositivi connessi al tuo account
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Visualizza
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-red-200 dark:border-red-900/30">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona pericolosa
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-dark-900 dark:text-white">
                    Esci dall'account
                  </p>
                  <p className="text-sm text-dark-500">
                    Disconnettiti da questa sessione
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>

              <div className="border-t border-dark-100 dark:border-dark-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">
                      Elimina account
                    </p>
                    <p className="text-sm text-dark-500">
                      Elimina permanentemente il tuo account e tutti i dati
                    </p>
                  </div>
                  <Button variant="danger" size="sm">
                    Elimina
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-end"
        >
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="w-5 h-5" />
            Salva modifiche
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
