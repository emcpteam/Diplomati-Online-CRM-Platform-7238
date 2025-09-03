# Diplomati Online CRM

Sistema CRM completo per la gestione di studenti, lead, scuole e corsi di recupero anni scolastici.

## 🚀 Avvio Rapido

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Avvia il sistema completo (Frontend + Backend Email)
```bash
npm run dev:full
```

Oppure avvia separatamente:

**Frontend (porta 5173):**
```bash
npm run dev
```

**Backend Email (porta 3001):**
```bash
npm run server
```

## 📧 Sistema Email

Il CRM include un server backend Node.js per l'invio di **email reali** attraverso:

- **SendGrid API** (consigliato per produzione)
- **SMTP Generico** (Gmail, Outlook, Mailgun, etc.)

### Configurazione SMTP

#### SendGrid (Consigliato)
1. Crea account su [SendGrid](https://sendgrid.com)
2. Genera API Key con permessi "Mail Send"
3. Configura in **Integrazioni > SMTP Email**:
   - Host: `smtp.sendgrid.net`
   - Porta: `587`
   - Username: `apikey` (letteralmente)
   - Password: La tua SendGrid API Key
   - SSL/TLS: ✅ Abilitato

#### Gmail
1. Abilita "Autenticazione a 2 fattori"
2. Genera "Password per App" in Google Account
3. Configura:
   - Host: `smtp.gmail.com`
   - Porta: `587`
   - Username: tua-email@gmail.com
   - Password: Password per App (non la password Gmail)

#### Outlook/Hotmail
- Host: `smtp.live.com`
- Porta: `587`
- Username/Password: credenziali account

## 🎯 Funzionalità Principali

### Gestione Studenti
- ✅ Anagrafica completa
- ✅ Gestione pagamenti e rate
- ✅ Assegnazione scuole per esami
- ✅ Storico comunicazioni
- ✅ Upload documenti

### Lead Management
- ✅ Acquisizione lead da form/API
- ✅ Sistema di follow-up
- ✅ Invio email automatico
- ✅ Conversione lead → studente
- ✅ Generazione preventivi PDF

### Gestione Scuole
- ✅ Database scuole partner
- ✅ Assegnazione studenti per esami
- ✅ Upload documenti e convenzioni
- ✅ Template per richieste esami

### Sistema Email Avanzato
- ✅ **Email reali** tramite SMTP
- ✅ Template personalizzabili
- ✅ Variabili dinamiche
- ✅ Test connessioni SMTP
- ✅ Supporto SendGrid, Gmail, Outlook

### Analytics e Report
- ✅ Dashboard con KPI
- ✅ Report pagamenti
- ✅ Statistiche conversioni
- ✅ Export dati CSV

## 🔧 Struttura Progetto

```
diplomati-online-crm/
├── src/
│   ├── components/          # Componenti React
│   ├── pages/              # Pagine principali
│   ├── context/            # Context API
│   ├── utils/              # Utilità e servizi
│   └── common/             # Componenti comuni
├── server/                 # Backend Node.js per email
│   ├── index.js           # Server Express
│   └── package.json       # Dipendenze backend
└── package.json           # Configurazione principale
```

## 🔐 Accessi Demo

**Super Admin:**
- Email: `admin@diplomatonline.it`
- Password: `admin123`

**Segreteria:**
- Email: `segreteria@diplomatonline.it`
- Password: `segreteria123`

**Sales Manager:**
- Email: `sales@diplomatonline.it`
- Password: `sales123`

## 📋 Checklist Configurazione

### ✅ Configurazioni Completate
- [x] Sistema autenticazione
- [x] Gestione utenti e ruoli
- [x] Database studenti/lead/scuole
- [x] Server email Node.js
- [x] Interfaccia responsive
- [x] Sistema PDF generation

### 🔧 Da Configurare per Produzione
- [ ] Configurare SMTP reale (SendGrid consigliato)
- [ ] Impostare dati azienda in **Azienda**
- [ ] Configurare integrazioni esterne
- [ ] Personalizzare template email
- [ ] Setup backup database

## 🚨 Risoluzione Problemi

### Email non funzionano
1. Verifica che il server backend sia avviato: `npm run server`
2. Controlla configurazione SMTP in **Integrazioni**
3. Testa la connessione SMTP con il pulsante "Test Connessione"

### Server Backend non si avvia
1. Verifica di aver installato le dipendenze: `npm run install:server`
2. Controlla che la porta 3001 sia libera
3. Avvia con: `cd server && npm run dev`

### Build fallisce
1. Esegui il linter: `npm run lint`
2. Correggi eventuali errori di sintassi
3. Riprova il build: `npm run build`

## 📞 Supporto

- **Email:** info@diplomatonline.it
- **Telefono:** +39 02 1234567
- **WhatsApp:** +39 320 1234567

---

**Sviluppato da:** Emanuele Marchiori - Copilots Srl  
**Versione:** 1.2.0  
**Ultimo aggiornamento:** Gennaio 2024