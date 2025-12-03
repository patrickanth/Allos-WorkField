# Allos WorkField

Piattaforma di lavoro collaborativo per team - Note condivise, gestione ticket, clienti e visual board.

## 🚀 Quick Start

### Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📁 Struttura Progetto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pagine autenticazione (login, register)
│   ├── (dashboard)/       # Pagine dashboard (notes, tickets, clients, ecc.)
│   └── api/               # API Routes
├── components/            # Componenti React riusabili
│   └── layout/           # Layout components (Sidebar, ecc.)
├── lib/                   # Utilities e configurazioni
│   ├── auth.ts           # NextAuth configuration
│   ├── firebase.ts       # Firebase/Firestore operations
│   └── storage.ts        # Legacy file storage (da migrare)
└── types/                 # TypeScript type definitions

## 🔥 Funzionalità Principali

### ✅ Implementato

- **Autenticazione**: Sistema completo con NextAuth.js
- **Gestione Team**: Creazione team, inviti, gestione membri
- **Clienti**: CRUD completo per gestione clienti
- **Tickets**: Sistema ticket con tutti i campi (cliente, categoria, tags, scadenza, assegnazione)
- **Note**: Note private e condivise con collegamento a clienti
- **Visual Board**: Mappe visuali futuristiche per organizzare idee
- **Export Excel**: Export completo di tutti i ticket con tutti i campi
- **UI Futuristica**: Design glassmorphism con spaziatura professionale

### 🔄 Database

Il progetto è configurato per utilizzare **Firebase Firestore**:

- Collections: `users`, `teams`, `clients`, `tickets`, `notes`, `visualBoards`, `tableConfigs`
- Regole di sicurezza configurate
- Operazioni CRUD complete per tutte le entità

## 🛠️ Tecnologie

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: NextAuth.js
- **Icons**: Lucide React, SVG custom
- **Date**: date-fns
- **Export**: xlsx

## 🌍 Environment Variables

### Setup Rapido per Sviluppo

1. **Scarica le credenziali Firebase**:
   - Vai su [Firebase Console](https://console.firebase.google.com/)
   - Seleziona il tuo progetto
   - **Impostazioni progetto** → **Account di servizio**
   - Clicca **Genera nuova chiave privata**
   - Salva il file come `firebase-service-account.json` nella **root del progetto**

2. **Crea file `.env.local`** (solo NextAuth):

```bash
# NextAuth
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

**Fatto!** 🎉 Il sistema caricherà automaticamente le credenziali Firebase dal file JSON.

### Setup Produzione (Vercel/Firebase Hosting)

Per produzione, configura le variabili d'ambiente nella dashboard del tuo hosting:

```bash
# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.com"

# Firebase (copia dal file firebase-service-account.json)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----"
```

## 📦 Scripts Disponibili

```bash
npm run dev       # Avvia server sviluppo (localhost:3000)
npm run build     # Build per produzione
npm run start     # Avvia server produzione
npm run lint      # Linter
```

## 🚀 Deployment

### Opzione 1: Vercel (Consigliato - più semplice)

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy produzione
vercel --prod
```

Vercel gestisce automaticamente:
- Build Next.js
- API Routes
- Environment variables
- SSL/HTTPS
- CDN globale

### Opzione 2: Firebase Hosting + Functions

Per deployment completo su Firebase, segui la guida dettagliata in [DEPLOYMENT.md](./DEPLOYMENT.md).

**Nota**: Dato che l'app usa API Routes e server-side features, Firebase richiede setup Firebase Functions. Vercel è più semplice e veloce.

## 📊 Struttura Database Firestore

### Collections

**users**
- id, email, name, avatar, role, teamId, createdAt, updatedAt

**teams**
- id, name, slug, description, inviteCode, createdAt, updatedAt

**clients**
- id, name, email, phone, company, notes, teamId, createdAt, updatedAt

**tickets**
- id, name, description, status, priority, category, tags[], dueDate
- reactionTime, resolutionTime, customFields{}
- authorId, assigneeId, clientId, teamId
- createdAt, updatedAt

**notes**
- id, content, isPrivate, timestamp
- authorId, teamId, clientId
- createdAt, updatedAt

**visualBoards**
- id, name, description
- nodes[], edges[]
- teamId, authorId
- createdAt, updatedAt

**tableConfigs**
- id, name, columns[], isDefault
- teamId, createdAt, updatedAt

## 🎨 Design System

### Colors

- Background: `#0a0a0c`
- Cards: `rgba(255, 255, 255, 0.02)` con backdrop-blur
- Borders: `rgba(255, 255, 255, 0.06)`
- Primary: Indigo-500 to Purple-600 gradient
- Text: White, Zinc-300/400/500 per hierarchy

### Spacing

- Page padding: `56px-96px` con max-width `1600px`
- Card padding: `32px`
- Componenti padding: `16px-24px`
- Gap tra elementi: `24px-32px`

### Components

Tutti i componenti utilizzano classi utility globali definite in `globals.css`:
- `.page`, `.card`, `.btn`, `.input`, `.badge`, `.modal`, ecc.

## 🧪 Testing

### Checklist Pre-Deploy

- [ ] Registrazione e login funzionano
- [ ] Creazione team e invito membri
- [ ] CRUD clienti completo
- [ ] CRUD tickets con tutti i campi
- [ ] Note con collegamento clienti
- [ ] Visual board creazione
- [ ] Export Excel con tutti i campi
- [ ] Responsive design mobile e desktop
- [ ] Firestore security rules attive

## 📝 Note di Sviluppo

### Migrazione Storage

Il progetto include due sistemi di storage:
- `lib/storage.ts`: File-based (legacy, per sviluppo locale)
- `lib/firebase.ts`: Firestore (produzione)

Per sviluppo locale rapido, il file storage è mantenuto. In produzione, tutto usa Firestore.

### NextAuth

Configurazione in `lib/auth.ts`. Supporta:
- Credentials provider (email/password)
- Session management
- Protected routes

### API Routes

Tutte le API sono in `app/api/`:
- `/api/auth/*`: Autenticazione NextAuth
- `/api/teams/*`: Gestione team
- `/api/clients/*`: CRUD clienti
- `/api/tickets/*`: CRUD tickets + export
- `/api/notes/*`: CRUD note
- `/api/visual-boards/*`: CRUD visual boards

## 🤝 Contributing

Questo è un progetto privato. Per modifiche:

1. Crea branch da `main`: `git checkout -b feature/nome-feature`
2. Commit con messaggi descrittivi
3. Push: `git push -u origin feature/nome-feature`
4. Create Pull Request

## 📄 License

MIT License - Vedi LICENSE file per dettagli.

---

**Versione**: 1.0.0
**Ultimo aggiornamento**: 2025-12-03
**Autore**: Allos WorkField Team
