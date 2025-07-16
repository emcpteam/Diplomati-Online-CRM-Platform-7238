// Email service utilities
import toast from 'react-hot-toast';

export const sendEmail = async (to, subject, content, settings) => {
  if (!settings?.smtp?.active) {
    toast.error('SMTP non configurato. Configura SMTP nelle Integrazioni API');
    throw new Error('SMTP not configured');
  }

  const toastId = toast.loading('Invio email in corso...');

  try {
    // First verify SMTP connection
    const verifyResponse = await fetch('/api/smtp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings.smtp)
    });

    if (!verifyResponse.ok) {
      throw new Error('SMTP connection failed');
    }

    // Send email using configured SMTP
    const response = await fetch('/api/smtp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        smtp: settings.smtp,
        email: {
          to,
          subject,
          content,
          from: `${settings.smtp.fromName} <${settings.smtp.username}>`,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const result = await response.json();
    toast.success('Email inviata con successo!', { id: toastId });
    return result;

  } catch (error) {
    console.error('Email sending error:', error);
    toast.error(`Errore invio email: ${error.message}`, { id: toastId });
    throw error;
  }
};

export const verifySmtpConnection = async (smtpConfig) => {
  try {
    const response = await fetch('/api/smtp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smtpConfig)
    });

    if (!response.ok) {
      throw new Error('SMTP connection failed');
    }

    return { success: true };

  } catch (error) {
    console.error('SMTP verification error:', error);
    throw error;
  }
};

export const emailTemplates = {
  welcome: (student) => ({
    subject: `Benvenuto nel corso ${student.course}!`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Benvenuto in Diplomati Online!</h1>
        <p>Ciao ${student.firstName},</p>
        <p>Siamo felici di averti con noi per il corso <strong>${student.course}</strong>.</p>
        
        <h2 style="color: #333;">DETTAGLI ISCRIZIONE:</h2>
        <ul style="list-style: none; padding: 0;">
          <li>📚 <strong>Corso:</strong> ${student.course}</li>
          <li>📅 <strong>Anni da recuperare:</strong> ${student.yearsToRecover}</li>
          <li>📆 <strong>Data iscrizione:</strong> ${new Date(student.enrollmentDate).toLocaleDateString('it-IT')}</li>
        </ul>

        <p>I tuoi dati di accesso alla piattaforma ti verranno inviati separatamente.</p>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Per qualsiasi domanda, non esitare a contattarci:</strong></p>
          <ul style="list-style: none; padding: 0; margin: 10px 0 0;">
            <li>📧 <strong>Email:</strong> info@diplomatonline.it</li>
            <li>📞 <strong>Telefono:</strong> +39 02 1234567</li>
            <li>📱 <strong>WhatsApp:</strong> +39 320 1234567</li>
          </ul>
        </div>

        <p>Cordiali saluti,<br>Il team di Diplomati Online</p>
      </div>
    `
  }),

  paymentReminder: (student) => ({
    subject: 'Promemoria pagamento - Diplomati Online',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Promemoria Pagamento</h1>
        <p>Ciao ${student.firstName},</p>
        <p>Ti ricordiamo che hai un pagamento in sospeso per il corso <strong>${student.course}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">DETTAGLI PAGAMENTO:</h2>
          <ul style="list-style: none; padding: 0;">
            <li>💰 <strong>Importo totale:</strong> €${student.totalAmount}</li>
            <li>✅ <strong>Già pagato:</strong> €${student.paidAmount}</li>
            <li>⏳ <strong>Rimanente:</strong> €${student.totalAmount - student.paidAmount}</li>
          </ul>
        </div>

        <p>Ti preghiamo di procedere con il pagamento entro i prossimi giorni per continuare senza interruzioni.</p>
        
        <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Modalità di pagamento:</strong></p>
          <ul>
            <li>Bonifico bancario ai nostri dati bancari</li>
            <li>Contattaci per altre modalità di pagamento</li>
          </ul>
        </div>

        <p>Grazie per la collaborazione,<br>Il team di Diplomati Online</p>
      </div>
    `
  }),

  examPreparation: (student) => ({
    subject: 'Preparazione esame - Informazioni importanti',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Preparazione Esame</h1>
        <p>Ciao ${student.firstName},</p>
        <p>Il tuo esame si avvicina! Ecco alcune informazioni importanti.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">CHECKLIST PREPARAZIONE:</h2>
          <ul style="list-style: none; padding: 0;">
            <li>✅ Assicurati di aver completato tutti i moduli del corso</li>
            <li>📚 Rivedi le materie principali: ${student.course}</li>
            <li>🪪 Porta con te un documento d'identità valido</li>
            <li>⏰ Arriva almeno 30 minuti prima dell'orario</li>
          </ul>
        </div>

        <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>CONTATTI EMERGENZA:</strong></p>
          <ul style="list-style: none; padding: 0; margin: 10px 0 0;">
            <li>📞 <strong>Telefono:</strong> +39 02 1234567</li>
            <li>📱 <strong>WhatsApp:</strong> +39 320 1234567</li>
          </ul>
        </div>

        <p>In bocca al lupo per il tuo esame!<br>Il team di Diplomati Online</p>
      </div>
    `
  }),

  congratulations: (student) => ({
    subject: 'Congratulazioni per il diploma!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">🎓 CONGRATULAZIONI! 🎓</h1>
        <p>Caro ${student.firstName},</p>
        
        <div style="text-align: center; padding: 30px 0;">
          <p style="font-size: 18px; color: #333;">
            Hai superato brillantemente l'esame e ottenuto il diploma in
            <br>
            <strong style="color: #0ea5e9; font-size: 20px;">${student.course}</strong>
          </p>
        </div>

        <p>Siamo orgogliosi del tuo successo e ti auguriamo il meglio per il tuo futuro.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Il diploma ufficiale ti verrà recapitato nei prossimi giorni.</p>
        </div>

        <p>Un caloroso saluto e ancora congratulazioni!<br>Il team di Diplomati Online</p>
      </div>
    `
  })
};