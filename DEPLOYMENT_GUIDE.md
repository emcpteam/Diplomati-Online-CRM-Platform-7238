# 📧 Guida Configurazione Email in Produzione

## 🚨 PROBLEMA IDENTIFICATO
La tua app è in produzione su **Netlify** ma cerca di connettersi a `localhost:3001` che non esiste.

## ✅ SOLUZIONI DISPONIBILI

### 🎯 SOLUZIONE 1: Configurazione SMTP Diretta (CONSIGLIATA)

#### SendGrid (Più Semplice)
1. **Crea account SendGrid**: https://sendgrid.com
2. **Genera API Key**:
   - Vai in Settings > API Keys  
   - Crea nuova API key con permessi "Mail Send"
   - Copia l'API key

3. **Configura nell'app**:
   - Vai in **Integrazioni > SMTP Email**
   - Host: `smtp.sendgrid.net`
   - Porta: `587`
   - Username: `apikey` (letteralmente "apikey")
   - Password: La tua SendGrid API Key
   - SSL/TLS: ✅ Abilitato
   - Clicca "Test Connessione"

#### Gmail (Alternativa)
1. **Abilita autenticazione a 2 fattori** su Gmail
2. **Genera Password per App**:
   - Account Google > Sicurezza > Password per le app
   - Genera password per "Mail"

3. **Configura nell'app**:
   - Host: `smtp.gmail.com`
   - Porta: `587`
   - Username: `tua-email@gmail.com`
   - Password: Password per App (non quella Gmail)
   - SSL/TLS: ✅ Abilitato

### 🎯 SOLUZIONE 2: Deploy Backend

#### Opzione A: Heroku
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create diplomati-email-service

# 4. Deploy
cd server
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a diplomati-email-service
git push heroku main
```

#### Opzione B: Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
cd server
railway deploy
```

## 🔧 CONFIGURAZIONE IMMEDIATA

### Passo 1: Testa SMTP
1. Vai su: https://crmdo.netlify.app/#/integrations
2. Clicca su "SMTP Email"
3. Inserisci dati SendGrid o Gmail
4. Clicca "Test Connessione"

### Passo 2: Verifica Funzionamento
1. Vai in **Lead Management**
2. Seleziona un lead
3. Clicca "Email"
4. Invia email di test

## 📊 Stato Attuale vs Obiettivo

| Componente | Stato Attuale | Obiettivo |
|------------|---------------|-----------|
| Frontend | ✅ Netlify (crmdo.netlify.app) | ✅ Funzionante |
| Backend Email | ❌ localhost:3001 (non esiste) | ⚠️ SMTP o Deploy |
| Database | ✅ In-memory (AppContext) | ✅ Funzionante |
| Email | ❌ Non funzionanti | 🎯 **DA CONFIGURARE** |

## 🚀 AZIONE IMMEDIATA

**PER ABILITARE LE EMAIL SUBITO:**

1. **Vai su**: https://crmdo.netlify.app/#/integrations
2. **Clicca**: "SMTP Email" → "Configura"
3. **Usa SendGrid**:
   - Crea account gratuito su sendgrid.com
   - Genera API Key
   - Inserisci i dati nell'app
   - Testa la connessione

4. **Risultato**: Email reali funzionanti in 5 minuti! 🎉

## ⚡ Test Rapido

Una volta configurato SMTP:
- Vai in **Lead Management**
- Seleziona qualsiasi lead
- Clicca "Email" 
- Invia email di benvenuto
- **Controlla l'email nella casella del destinatario** ✅

---

**IMPORTANTE**: Con SMTP configurato, le email verranno inviate **realmente** senza bisogno del server backend locale!