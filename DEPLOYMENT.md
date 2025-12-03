# 🚀 Guida Deployment Firebase - Allos WorkField

Questa guida ti accompagna passo-passo nel deployment dell'applicazione in produzione su Firebase.

## 📋 Prerequisiti

- Node.js 18+ installato
- Account Firebase attivo
- Firebase CLI installato globalmente

```bash
npm install -g firebase-tools
```

## 🔥 Step 1: Configurazione Progetto Firebase

### 1.1 Crea un nuovo progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca su "Aggiungi progetto"
3. Inserisci il nome del progetto: `allos-workfield-prod` (o come preferisci)
4. Disabilita Google Analytics (opzionale)
5. Clicca su "Crea progetto"

### 1.2 Abilita Firestore Database

1. Nel menu laterale, vai su **Build > Firestore Database**
2. Clicca su "Crea database"
3. Scegli la modalità: **Produzione** (production mode)
4. Seleziona la location più vicina (es. `europe-west`)
5. Clicca su "Abilita"

### 1.3 Configura le regole Firestore

Nel tab **Regole** del Firestore, incolla queste regole di sicurezza:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function belongsToTeam(teamId) {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.teamId == teamId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isOwner(userId);
    }

    // Teams collection
    match /teams/{teamId} {
      allow read: if belongsToTeam(teamId);
      allow create: if isSignedIn();
      allow update, delete: if belongsToTeam(teamId);
    }

    // Clients collection
    match /clients/{clientId} {
      allow read, write: if isSignedIn() &&
                            belongsToTeam(resource.data.teamId);
    }

    // Notes collection
    match /notes/{noteId} {
      allow read: if isSignedIn() &&
                    (resource.data.authorId == request.auth.uid ||
                     (resource.data.isPrivate == false && belongsToTeam(resource.data.teamId)));
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.authorId == request.auth.uid;
    }

    // Tickets collection
    match /tickets/{ticketId} {
      allow read: if isSignedIn() && belongsToTeam(resource.data.teamId);
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && belongsToTeam(resource.data.teamId);
    }

    // Visual Boards collection
    match /visualBoards/{boardId} {
      allow read: if isSignedIn() && belongsToTeam(resource.data.teamId);
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && belongsToTeam(resource.data.teamId);
    }

    // Table Configs collection
    match /tableConfigs/{configId} {
      allow read, write: if isSignedIn() && belongsToTeam(resource.data.teamId);
    }
  }
}
```

Clicca su **Pubblica** per applicare le regole.

### 1.4 Abilita Firebase Authentication

1. Nel menu laterale, vai su **Build > Authentication**
2. Clicca su "Inizia"
3. Nella tab **Sign-in method**, abilita:
   - **Email/Password**: Abilita e salva

### 1.5 Crea un Service Account

1. Vai su **Impostazioni progetto** (icona ingranaggio in alto a sinistra)
2. Vai nella tab **Account di servizio**
3. Clicca su "Genera nuova chiave privata"
4. Scarica il file JSON (lo useremo per le variabili d'ambiente)

## 🔐 Step 2: Configurazione Environment Variables

### 2.1 Crea il file .env.local

Nella root del progetto, crea il file `.env.local`:

```bash
# Database (legacy - mantenere per compatibilità)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="GENERA_UNA_STRINGA_CASUALE_MINIMO_32_CARATTERI"
NEXTAUTH_URL="https://tuo-dominio.web.app"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="il-tuo-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@il-tuo-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLA_TUA_CHIAVE_PRIVATA\n-----END PRIVATE KEY-----"
```

### 2.2 Recupera le credenziali Firebase

Apri il file JSON del service account scaricato e copia:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

**IMPORTANTE**: La `FIREBASE_PRIVATE_KEY` deve mantenere i caratteri `\n`. Esempio:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...tua chiave...Ag==\n-----END PRIVATE KEY-----"
```

### 2.3 Genera NEXTAUTH_SECRET

Genera una stringa sicura per NextAuth:

```bash
openssl rand -base64 32
```

Copia l'output nella variabile `NEXTAUTH_SECRET`.

## 🏗️ Step 3: Setup Firebase Hosting

### 3.1 Login su Firebase CLI

```bash
firebase login
```

### 3.2 Inizializza Firebase nel progetto

```bash
firebase init
```

Seleziona:
- **Hosting**: Configure files for Firebase Hosting
- Scegli il progetto creato precedentemente
- **Public directory**: `out` (Next.js static export)
- **Configure as single-page app**: No
- **Set up automatic builds**: No
- **Overwrite existing files**: No

### 3.3 Configura firebase.json

Il file `firebase.json` dovrebbe essere simile a questo:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 3.4 Aggiorna next.config.js

Crea o modifica `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

## 📦 Step 4: Build e Deploy

### 4.1 Installa le dipendenze

```bash
npm install
```

### 4.2 Build per produzione

```bash
npm run build
```

Questo comando:
1. Compila il progetto Next.js
2. Genera i file statici nella cartella `out/`

### 4.3 Test locale (opzionale)

Prima del deploy, testa localmente:

```bash
firebase serve
```

Apri [http://localhost:5000](http://localhost:5000) per vedere l'anteprima.

### 4.4 Deploy su Firebase Hosting

```bash
firebase deploy --only hosting
```

Al termine, Firebase ti fornirà due URL:
- **Hosting URL**: `https://il-tuo-project-id.web.app`
- **Custom domain** (se configurato)

### 4.5 Aggiorna NEXTAUTH_URL

Dopo il primo deploy, aggiorna il file `.env.local`:

```bash
NEXTAUTH_URL="https://il-tuo-project-id.web.app"
```

E fai un nuovo build + deploy:

```bash
npm run build
firebase deploy --only hosting
```

## ✅ Step 5: Testing Pre-Produzione

### 5.1 Checklist Funzionalità

Testa tutte le funzionalità principali:

- [ ] **Autenticazione**
  - [ ] Registrazione nuovo utente
  - [ ] Login con email/password
  - [ ] Logout

- [ ] **Team Management**
  - [ ] Creazione team
  - [ ] Invito membri tramite codice
  - [ ] Visualizzazione membri team

- [ ] **Clienti**
  - [ ] Creazione nuovo cliente
  - [ ] Modifica cliente esistente
  - [ ] Eliminazione cliente
  - [ ] Ricerca clienti

- [ ] **Tickets**
  - [ ] Creazione ticket completo (tutti i campi)
  - [ ] Assegnazione cliente al ticket
  - [ ] Assegnazione membro team al ticket
  - [ ] Aggiunta tags
  - [ ] Cambio stato ticket
  - [ ] Modifica ticket
  - [ ] Eliminazione ticket
  - [ ] Export Excel con tutti i campi

- [ ] **Note**
  - [ ] Creazione nota privata
  - [ ] Creazione nota team
  - [ ] Collegamento nota a cliente
  - [ ] Cambio privacy nota
  - [ ] Modifica nota
  - [ ] Eliminazione nota

- [ ] **Visual Board**
  - [ ] Creazione board
  - [ ] Modifica board
  - [ ] Eliminazione board

### 5.2 Checklist Performance e Sicurezza

- [ ] Verifica tempi di caricamento pagine < 2s
- [ ] Controlla che le regole Firestore siano attive
- [ ] Testa l'accesso non autorizzato (deve essere bloccato)
- [ ] Verifica che gli utenti vedano solo i dati del loro team
- [ ] Testa la responsività su mobile e desktop

## 🔄 Step 6: Aggiornamenti Futuri

Per pubblicare aggiornamenti:

```bash
# 1. Pull delle ultime modifiche
git pull origin main

# 2. Installa eventuali nuove dipendenze
npm install

# 3. Build
npm run build

# 4. Deploy
firebase deploy --only hosting
```

## 🆘 Troubleshooting Comune

### Errore: "Firebase Admin SDK not initialized"

**Soluzione**: Verifica che le variabili d'ambiente siano configurate correttamente. La `FIREBASE_PRIVATE_KEY` deve contenere i caratteri `\n`.

### Errore: "Permission denied" su Firestore

**Soluzione**: Controlla le regole Firestore. Assicurati che l'utente appartenga a un team e che le regole permettano l'accesso.

### Build fallita

**Soluzione**:
```bash
# Pulisci cache e node_modules
rm -rf .next out node_modules
npm install
npm run build
```

### Firebase deploy lento o timeout

**Soluzione**:
- Controlla la connessione internet
- Riprova con: `firebase deploy --only hosting --debug`

## 📊 Monitoring Produzione

### Firebase Console

Monitora l'utilizzo da Firebase Console:

1. **Firestore**: Storage e letture/scritture
2. **Authentication**: Utenti attivi
3. **Hosting**: Traffico e bandwidth

### Costi Firebase

Il piano **Spark** (gratuito) include:
- Firestore: 1GB storage, 50K letture/giorno, 20K scritture/giorno
- Auth: Illimitato
- Hosting: 10GB storage, 360MB/giorno bandwidth

Per maggiori utenti, passa al piano **Blaze** (pay-as-you-go).

## 🎉 Congratulazioni!

L'applicazione è ora live in produzione! 🚀

URL Produzione: `https://il-tuo-project-id.web.app`

---

**Supporto**: Per problemi o domande, consulta la [documentazione Firebase](https://firebase.google.com/docs).
