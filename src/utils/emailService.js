// Email service utilities
export const sendEmail = async (to, subject, content, settings) => {
  // Simulate email sending
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!to || !subject || !content) {
        reject(new Error('Missing email parameters'));
        return;
      }

      console.log('Email sent:', { to, subject, content, settings });
      resolve({
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  });
};

export const sendSMS = async (to, message, settings) => {
  // Simulate SMS sending via Skebby
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!to || !message) {
        reject(new Error('Missing SMS parameters'));
        return;
      }

      if (!settings.username || !settings.password) {
        reject(new Error('Skebby credentials not configured'));
        return;
      }

      console.log('SMS sent via Skebby:', { to, message, settings });
      resolve({
        success: true,
        messageId: `sms_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};

export const emailTemplates = {
  welcome: (student) => ({
    subject: `Benvenuto nel corso ${student.course}!`,
    content: `
Ciao ${student.firstName},

Benvenuto in Diplomati Online! Siamo felici di averti con noi per il corso ${student.course}.

DETTAGLI ISCRIZIONE:
- Corso: ${student.course}
- Anni da recuperare: ${student.yearsToRecover}
- Data iscrizione: ${new Date(student.enrollmentDate).toLocaleDateString('it-IT')}

I tuoi dati di accesso alla piattaforma ti verranno inviati separatamente.

Per qualsiasi domanda, non esitare a contattarci:
- Email: info@diplomatonline.it
- Telefono: +39 02 1234567
- WhatsApp: +39 320 1234567

Cordiali saluti,
Il team di Diplomati Online
    `
  }),

  paymentReminder: (student) => ({
    subject: 'Promemoria pagamento - Diplomati Online',
    content: `
Ciao ${student.firstName},

Ti ricordiamo che hai un pagamento in sospeso per il corso ${student.course}.

DETTAGLI PAGAMENTO:
- Importo totale: €${student.totalAmount}
- Già pagato: €${student.paidAmount}
- Rimanente: €${student.totalAmount - student.paidAmount}

Ti preghiamo di procedere con il pagamento entro i prossimi giorni per continuare senza interruzioni.

Per pagare puoi:
- Effettuare un bonifico ai nostri dati bancari
- Contattarci per altre modalità di pagamento

Grazie per la collaborazione,
Il team di Diplomati Online
    `
  }),

  examPreparation: (student) => ({
    subject: 'Preparazione esame - Informazioni importanti',
    content: `
Ciao ${student.firstName},

Il tuo esame si avvicina! Ecco alcune informazioni importanti:

CHECKLIST PREPARAZIONE:
✓ Assicurati di aver completato tutti i moduli del corso
✓ Rivedi le materie principali: ${student.course}
✓ Porta con te un documento d'identità valido
✓ Arriva almeno 30 minuti prima dell'orario

CONTATTI EMERGENZA:
- Telefono: +39 02 1234567
- WhatsApp: +39 320 1234567

In bocca al lupo per il tuo esame!

Il team di Diplomati Online
    `
  }),

  congratulations: (student) => ({
    subject: 'Congratulazioni per il diploma!',
    content: `
Caro ${student.firstName},

🎓 CONGRATULAZIONI! 🎓

Hai superato brillantemente l'esame e ottenuto il diploma in ${student.course}.

Siamo orgogliosi del tuo successo e ti auguriamo il meglio per il tuo futuro.

Il diploma ufficiale ti verrà recapitato nei prossimi giorni.

Un caloroso saluto e ancora congratulazioni!

Il team di Diplomati Online
    `
  }),

  leadWelcome: (lead) => ({
    subject: 'Grazie per il tuo interesse - Diplomati Online',
    content: `
Ciao ${lead.firstName},

Grazie per aver mostrato interesse nei nostri corsi di diploma online!

RIEPILOGO RICHIESTA:
- Piano di studi: ${lead.studyPlan}
- Anni da recuperare: ${lead.yearsToRecover}
- Disponibilità: ${lead.availableTime}

Un nostro consulente ti contatterà entro 24 ore per fornirti tutte le informazioni e un preventivo personalizzato.

Nel frattempo, puoi visitare il nostro sito per scoprire di più sui nostri servizi.

A presto!
Il team di Diplomati Online
    `
  }),

  leadFollowUp: (lead) => ({
    subject: 'Follow-up: la tua richiesta di informazioni',
    content: `
Ciao ${lead.firstName},

Abbiamo tentato di contattarti per il corso ${lead.studyPlan} ma non siamo riusciti a raggiungerti.

Siamo ancora interessati ad aiutarti nel tuo percorso di studi!

OFFERTA SPECIALE LIMITATA:
- Sconto del 10% sul corso prescelto
- Consulenza gratuita per la scelta del percorso
- Piano di pagamento personalizzato

Rispondi a questa email o chiamaci al +39 02 1234567 entro 7 giorni per non perdere questa opportunità.

Cordiali saluti,
Il team di Diplomati Online
    `
  })
};

export const smsTemplates = {
  welcome: (lead) => `Ciao ${lead.firstName}! Grazie per l'interesse in Diplomati Online. Ti contatteremo presto per il corso ${lead.studyPlan}. Info: 02-1234567`,
  
  reminder: (lead) => `Ciao ${lead.firstName}, non dimenticare la tua richiesta per ${lead.studyPlan}! Chiamaci per un preventivo gratuito: 02-1234567`,
  
  appointment: (student, date) => `Ciao ${student.firstName}, promemoria appuntamento ${date}. Per info: 02-1234567`,
  
  payment: (student) => `Ciao ${student.firstName}, promemoria pagamento corso. Rimanente: €${student.totalAmount - student.paidAmount}. Info: 02-1234567`
};