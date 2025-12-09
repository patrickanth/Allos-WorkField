'use client';

import { useState, useEffect } from 'react';
// Session removed
import { useRouter } from 'next/navigation';

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  language: 'it' | 'en';
}

export default function SettingsPage() {
  const session = { user: { id: 'admin-patrick', name: 'Patrick', email: 'patrickanthonystudio@gmail.com', teamId: null, role: 'admin' } }; const update = () => {};
  const router = useRouter();

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: true,
    emailNotifications: false,
    soundEnabled: true,
    language: 'it',
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (session?.user?.name) {
      setNewName(session.user.name);
    }
    loadPreferences();
  }, [session]);

  const loadPreferences = async () => {
    try {
      const res = await fetch('/api/user/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      setProfileError('Il nome non può essere vuoto');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setProfileError(data.error || 'Errore nel salvataggio');
        return;
      }

      await update({ name: newName.trim() });
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError('Errore nel salvataggio');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Compila tutti i campi');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La nuova password deve essere di almeno 8 caratteri');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non corrispondono');
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setPasswordError(data.error || 'Errore nel cambio password');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch {
      setPasswordError('Errore nel cambio password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSavePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    setIsSavingPrefs(true);

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPrefs),
      });

      if (res.ok) {
        setPrefsSuccess(true);
        setTimeout(() => setPrefsSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINA') return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/login' });
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Impostazioni</h1>
        <p className="page-subtitle">Gestisci il tuo profilo e le preferenze</p>
      </div>

      {/* Profile */}
      <div className="card mb-8">
        <div className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Profilo</span>
          </div>
          {profileSuccess && (
            <span className="text-emerald-400 text-[13px] flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvato
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="avatar avatar-glow w-20 h-20 rounded-2xl text-2xl shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input"
                    placeholder="Il tuo nome"
                  />
                </div>
                {profileError && (
                  <p className="text-red-400 text-[13px] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {profileError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="btn btn-primary disabled:opacity-40"
                  >
                    {isSavingProfile ? 'Salvataggio...' : 'Salva'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setNewName(session?.user?.name || '');
                      setProfileError('');
                    }}
                    className="btn btn-ghost"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xl text-white font-semibold mb-2 truncate">{session?.user?.name}</p>
                  <p className="text-[15px] text-zinc-400 truncate">{session?.user?.email}</p>
                </div>
                {session?.user?.teamId && (
                  <span className="badge badge-purple">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Membro di un team
                  </span>
                )}
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn btn-secondary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Modifica profilo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-0 overflow-hidden mb-8">
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Preferenze</span>
            </div>
            {prefsSuccess && (
              <span className="text-emerald-400 text-[13px] flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Salvato
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Tema</p>
              <p className="text-[14px] text-zinc-500">Scegli il tema dell'interfaccia</p>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => handleSavePreferences({ theme: e.target.value as 'dark' | 'light' | 'system' })}
              className="select shrink-0"
            >
              <option value="dark">Scuro</option>
              <option value="light">Chiaro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Notifiche push</p>
              <p className="text-[14px] text-zinc-500">Ricevi notifiche in tempo reale</p>
            </div>
            <button
              onClick={() => handleSavePreferences({ notifications: !preferences.notifications })}
              className={`toggle shrink-0 ${preferences.notifications ? 'active' : ''}`}
              disabled={isSavingPrefs}
            />
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Notifiche email</p>
              <p className="text-[14px] text-zinc-500">Ricevi aggiornamenti importanti via email</p>
            </div>
            <button
              onClick={() => handleSavePreferences({ emailNotifications: !preferences.emailNotifications })}
              className={`toggle shrink-0 ${preferences.emailNotifications ? 'active' : ''}`}
              disabled={isSavingPrefs}
            />
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Suoni</p>
              <p className="text-[14px] text-zinc-500">Riproduci suoni per le notifiche</p>
            </div>
            <button
              onClick={() => handleSavePreferences({ soundEnabled: !preferences.soundEnabled })}
              className={`toggle shrink-0 ${preferences.soundEnabled ? 'active' : ''}`}
              disabled={isSavingPrefs}
            />
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Lingua</p>
              <p className="text-[14px] text-zinc-500">Seleziona la lingua dell'interfaccia</p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handleSavePreferences({ language: e.target.value as 'it' | 'en' })}
              className="select shrink-0"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-0 overflow-hidden mb-8">
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Sicurezza</span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Password</p>
              <p className="text-[14px] text-zinc-500">Modifica la password del tuo account</p>
            </div>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="btn btn-secondary shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="hidden sm:inline">Modifica</span>
            </button>
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Sessioni attive</p>
              <p className="text-[14px] text-zinc-500">Dispositivo corrente: {typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'N/A'}</p>
            </div>
            <span className="badge badge-green">Attiva</span>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="card p-0 overflow-hidden mb-8">
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-[13px] text-zinc-400 uppercase tracking-wider font-semibold">Dati e Privacy</span>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-white font-medium mb-2">Esporta dati</p>
              <p className="text-[14px] text-zinc-500">Scarica una copia di tutti i tuoi dati</p>
            </div>
            <button onClick={handleExportData} className="btn btn-secondary shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Esporta</span>
            </button>
          </div>
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[15px] text-red-400 font-medium mb-2">Elimina account</p>
              <p className="text-[14px] text-zinc-500">Elimina permanentemente il tuo account e tutti i dati</p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Elimina</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[15px] text-white font-medium mb-2">Esci dall'account</p>
            <p className="text-[14px] text-zinc-500">Disconnetti questa sessione dal tuo account</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-danger shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="modal-overlay" onClick={() => setIsChangePasswordOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cambia password</h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Password attuale</label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPasswords ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Nuova password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="Minimo 8 caratteri"
                />
              </div>
              <div>
                <label className="label">Conferma password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Ripeti la nuova password"
                />
              </div>
              {passwordError && (
                <p className="text-red-400 text-[13px] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="text-emerald-400 text-[13px] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Password aggiornata con successo!
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="btn btn-ghost"
              >
                Annulla
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isSavingPassword || passwordSuccess}
                className="btn btn-primary disabled:opacity-40"
              >
                {isSavingPassword ? 'Salvataggio...' : 'Salva password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title text-red-400">Elimina account</h2>
            </div>
            <div className="modal-body">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <p className="text-red-400 text-[14px] font-medium mb-2">Attenzione!</p>
                <p className="text-zinc-400 text-[13px]">
                  Questa azione è irreversibile. Tutti i tuoi dati, note, ticket e preferenze saranno eliminati permanentemente.
                </p>
              </div>
              <div>
                <label className="label">Scrivi ELIMINA per confermare</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  className="input"
                  placeholder="ELIMINA"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="btn btn-ghost"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINA' || isDeleting}
                className="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-40"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
