# 🚨 PROBLEMA RISOLTO: Server Email Non Avviato

## Il Problema
L'errore `net::ERR_CONNECTION_REFUSED` indica che il server backend Node.js non è in esecuzione sulla porta 3001.

## ✅ SOLUZIONE IMMEDIATA

### Opzione 1: Avvia Solo il Server Email
```bash
# Apri un nuovo terminale e esegui:
npm run server
```

### Opzione 2: Avvia Frontend + Backend Insieme
```bash
# Ferma il server frontend (Ctrl+C) e poi esegui:
npm run dev:full
```

## 🔧 Verifica che Funzioni

1. **Controlla che il server sia avviato:**
   - Vai su: http://localhost:3001/api/health
   - Dovresti vedere: `{"status": "OK", "service": "Diplomati Online Email Service"}`

2. **Testa SMTP dal CRM:**
   - Vai in **Integrazioni > SMTP Email**
   - Clicca "Test Connessione"
   - Dovrebbe funzionare ora!

## 📋 Comandi Utili

```bash
# Installa dipendenze server (se necessario)
npm run install:server

# Avvia solo il server email
npm run server

# Avvia server in modalità sviluppo (con auto-restart)
npm run server:dev

# Avvia tutto insieme (frontend + backend)
npm run dev:full
```

## ✅ Stato Finale Atteso

- ✅ Frontend su: http://localhost:5173
- ✅ Backend Email su: http://localhost:3001
- ✅ Test SMTP funzionante
- ✅ Invio email reali abilitato

## 🔍 Se Continua a Non Funzionare

1. **Controlla che la porta 3001 sia libera:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Mac/Linux
   lsof -i :3001
   ```

2. **Controlla i log del server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Verifica dipendenze server:**
   ```bash
   cd server
   npm install
   ```

## 💡 Configurazione SMTP Corretta

Una volta avviato il server, usa questi dati per il test:

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Porta: `587`
- Username: `apikey`
- Password: `TUA_SENDGRID_API_KEY`
- SSL/TLS: ✅

**Gmail:**
- Host: `smtp.gmail.com`
- Porta: `587`
- Username: `tua-email@gmail.com`
- Password: `APP_PASSWORD` (non la password Gmail)
- SSL/TLS: ✅

---

**IMPORTANTE:** Il server backend DEVE essere in esecuzione per inviare email reali!