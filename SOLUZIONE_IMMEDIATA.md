# 🚨 SOLUZIONE IMMEDIATA: Server Email Non Avviato

## Il Problema
L'errore `net::ERR_CONNECTION_REFUSED` indica che il server backend Node.js non è in esecuzione sulla porta 3001.

## ✅ SOLUZIONE PASSO-PASSO

### 1. Controlla se il server è installato
```bash
# Verifica se esistono le dipendenze del server
cd server
npm install
```

### 2. Avvia il server email
```bash
# Dalla cartella principale del progetto:
npm run server
```

### 3. Verifica che funzioni
Apri nel browser: http://localhost:3001/api/health

Dovresti vedere:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "Diplomati Online Email Service"
}
```

### 4. Testa SMTP dal CRM
1. Vai in **Integrazioni > SMTP Email**
2. Configura i dati SMTP:
   - **SendGrid**: Host `smtp.sendgrid.net`, Porta `587`, Username `apikey`, Password `TUA_API_KEY`
   - **Gmail**: Host `smtp.gmail.com`, Porta `587`, Username `email@gmail.com`, Password `APP_PASSWORD`
3. Clicca "Test Connessione"

## 🔧 Comandi Alternativi

### Avvia tutto insieme:
```bash
npm run dev:full
```

### Solo server in modalità sviluppo:
```bash
cd server
npm run dev
```

### Verifica stato porte:
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux  
lsof -i :3001
```

## ✅ Stato Finale Corretto
- ✅ Frontend: http://localhost:5173
- ✅ Backend Email: http://localhost:3001
- ✅ Test SMTP funzionante
- ✅ Invio email reali attivo

---

**IMPORTANTE:** Senza il server backend attivo, le email NON possono essere inviate!