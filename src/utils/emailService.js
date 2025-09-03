// Email service utilities - REAL email sending in production

// Determine API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/.netlify/functions'; // Use Netlify Functions in production

export const sendEmail = async (to, subject, content, smtpSettings) => {
  // Validate SMTP settings first
  if (!smtpSettings || !smtpSettings.active) {
    throw new Error('SMTP non configurato. Configura SMTP in Integrazioni > SMTP Email');
  }

  // Check if all required SMTP fields are present
  const requiredFields = ['host', 'port', 'username', 'password'];
  const missingFields = requiredFields.filter(field => !smtpSettings[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Configurazione SMTP incompleta. Campi mancanti: ${missingFields.join(', ')}`);
  }

  // Validate email parameters
  if (!to || !subject || !content) {
    throw new Error('Parametri email mancanti (destinatario, oggetto, contenuto)');
  }

  // Validate email format for recipient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Formato email destinatario non valido');
  }

  try {
    // Check if we're in production (Netlify)
    const isProduction = window.location.hostname !== 'localhost';
    
    console.log('📧 Sending email via:', isProduction ? 'Netlify Functions' : 'Local Server');
    
    if (isProduction) {
      // In production, use Netlify Functions for REAL email sending
      return await sendEmailNetlify(to, subject, content, smtpSettings);
    } else {
      // In development, use local server
      return await sendEmailLocalServer(to, subject, content, smtpSettings);
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Errore invio email: ${error.message}`);
  }
};

// Netlify Functions approach for REAL production email sending
const sendEmailNetlify = async (to, subject, content, smtpSettings) => {
  console.log('🚀 SENDING REAL EMAIL via Netlify Functions:', {
    to, subject, 
    smtp: smtpSettings.host,
    environment: 'production'
  });

  try {
    // Call the REAL Netlify Function
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        content: content,
        smtpConfig: {
          host: smtpSettings.host,
          port: smtpSettings.port,
          username: smtpSettings.username,
          password: smtpSettings.password,
          secure: smtpSettings.secure || false,
          fromName: smtpSettings.fromName || 'Diplomati Online'
        }
      }),
    });

    console.log('Netlify Function Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Netlify Function Error Response:', errorText);
      
      // Check if it's a 404 - Functions not deployed
      if (response.status === 404) {
        throw new Error('Netlify Functions non deployate. Ricompila e redeploya l\'app.');
      }
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      throw new Error(errorData.error || 'Errore durante l\'invio dell\'email');
    }

    const result = await response.json();
    
    console.log('✅ REAL EMAIL SENT via Netlify:', {
      messageId: result.messageId,
      provider: result.provider,
      timestamp: result.timestamp
    });

    return {
      success: true,
      messageId: result.messageId,
      timestamp: result.timestamp,
      provider: result.provider,
      smtpHost: smtpSettings.host,
      fromEmail: smtpSettings.username
    };
  } catch (fetchError) {
    console.error('❌ Netlify Functions Fetch Error:', fetchError);
    throw new Error(`Netlify Functions Error: ${fetchError.message}`);
  }
};

// Local server approach for development
const sendEmailLocalServer = async (to, subject, content, smtpSettings) => {
  let response;
  
  try {
    // Check if it's SendGrid based on host
    if (smtpSettings.host === 'smtp.sendgrid.net') {
      // Use SendGrid API
      response = await fetch(`${API_BASE_URL}/send-email/sendgrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          subject: subject,
          content: content,
          apiKey: smtpSettings.password, // SendGrid uses API key as password
          fromEmail: smtpSettings.username,
          fromName: smtpSettings.fromName || 'Diplomati Online'
        }),
      });
    } else {
      // Use generic SMTP
      response = await fetch(`${API_BASE_URL}/send-email/smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          subject: subject,
          content: content,
          smtpConfig: {
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            password: smtpSettings.password,
            secure: smtpSettings.secure || false,
            fromName: smtpSettings.fromName || 'Diplomati Online'
          }
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Errore durante l\'invio dell\'email');
    }

    const result = await response.json();
    
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      provider: result.provider,
      timestamp: result.timestamp
    });

    return {
      success: true,
      messageId: result.messageId,
      timestamp: result.timestamp,
      provider: result.provider,
      smtpHost: smtpSettings.host,
      fromEmail: smtpSettings.username
    };
  } catch (fetchError) {
    console.error('❌ Local Server Fetch Error:', fetchError);
    throw new Error(`Local Server Error: ${fetchError.message}`);
  }
};

// Test SMTP connection with real API call
export const testSMTPConnection = async (smtpSettings) => {
  if (!smtpSettings) {
    throw new Error('Configurazione SMTP mancante');
  }

  const requiredFields = ['host', 'port', 'username', 'password'];
  const missingFields = requiredFields.filter(field => !smtpSettings[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Campi obbligatori mancanti: ${missingFields.join(', ')}`);
  }

  try {
    const isProduction = window.location.hostname !== 'localhost';
    
    console.log('🧪 Testing SMTP via:', isProduction ? 'Netlify Functions' : 'Local Server');
    
    if (isProduction) {
      // In production, use REAL Netlify Function for testing
      const response = await fetch(`${API_BASE_URL}/test-smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpConfig: {
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            password: smtpSettings.password,
            secure: smtpSettings.secure || false
          }
        }),
      });

      console.log('Netlify Test Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Netlify Test Error Response:', errorText);
        
        // Check if it's a 404 - Functions not deployed
        if (response.status === 404) {
          throw new Error('⚠️ Netlify Functions non deployate. Redeploya l\'app per abilitare le email.');
        }
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText || 'Test connessione fallito'}`);
        }
        
        throw new Error(errorData.error || 'Test connessione fallito');
      }

      const result = await response.json();
      console.log('✅ REAL SMTP test successful in production:', result);

      return {
        success: true,
        message: result.message,
        provider: result.provider,
        timestamp: result.timestamp
      };
    } else {
      // In development, use local server
      const response = await fetch(`${API_BASE_URL}/test-smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpConfig: {
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            password: smtpSettings.password,
            secure: smtpSettings.secure || false
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test connessione fallito');
      }

      const result = await response.json();
      console.log('SMTP test successful:', result);

      return {
        success: true,
        message: result.message,
        provider: result.provider,
        timestamp: result.timestamp
      };
    }
  } catch (error) {
    console.error('SMTP test error:', error);
    throw new Error(`Test SMTP fallito: ${error.message}`);
  }
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