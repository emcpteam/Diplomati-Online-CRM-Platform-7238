// Email service utilities - Real implementation
import toast from 'react-hot-toast';

export const sendEmail = async (to, subject, content, settings) => {
  console.log('🚀 Starting real email send process...');
  console.log('📧 Email details:', { to, subject, contentLength: content.length });

  if (!settings || !settings.smtp) {
    console.error('❌ SMTP configuration missing');
    throw new Error('SMTP not configured');
  }

  console.log('⚙️ SMTP Configuration:', {
    host: settings.smtp.host,
    port: settings.smtp.port,
    secure: settings.smtp.secure,
    username: settings.smtp.username,
    fromName: settings.smtp.fromName,
    active: settings.smtp.active
  });

  try {
    // Validate SMTP configuration
    if (!settings.smtp.host || !settings.smtp.port || !settings.smtp.username || !settings.smtp.password) {
      console.error('❌ Incomplete SMTP configuration');
      throw new Error('Configurazione SMTP incompleta');
    }

    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error('❌ Invalid email address:', to);
      throw new Error('Indirizzo email non valido');
    }

    console.log('✅ SMTP configuration validated');
    console.log('📤 Preparing email payload...');

    // Create email payload for backend service
    const emailPayload = {
      from: `${settings.smtp.fromName || 'Diplomati Online'} <${settings.smtp.username}>`,
      to: to,
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      smtp: {
        host: settings.smtp.host,
        port: parseInt(settings.smtp.port),
        secure: settings.smtp.secure || false,
        auth: {
          user: settings.smtp.username,
          pass: settings.smtp.password
        }
      }
    };

    console.log('📨 Email payload prepared');

    // Try to send via backend service first
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent via backend service:', result);
        
        // Store successful email log
        storeEmailLog({
          to,
          subject,
          status: 'sent',
          messageId: result.messageId,
          smtpHost: settings.smtp.host,
          timestamp: new Date().toISOString()
        });

        return result;
      }
    } catch (backendError) {
      console.warn('⚠️ Backend service not available, trying alternative method...');
    }

    // Alternative: Use EmailJS or similar service
    try {
      // Check if EmailJS is available
      if (window.emailjs) {
        const templateParams = {
          to_email: to,
          subject: subject,
          message: content,
          from_name: settings.smtp.fromName || 'Diplomati Online'
        };

        const result = await window.emailjs.send(
          'YOUR_SERVICE_ID', // You'll need to configure this
          'YOUR_TEMPLATE_ID', // You'll need to configure this
          templateParams,
          'YOUR_PUBLIC_KEY' // You'll need to configure this
        );

        console.log('✅ Email sent via EmailJS:', result);
        
        storeEmailLog({
          to,
          subject,
          status: 'sent',
          messageId: result.text,
          smtpHost: 'emailjs.com',
          timestamp: new Date().toISOString()
        });

        return { success: true, messageId: result.text };
      }
    } catch (emailjsError) {
      console.warn('⚠️ EmailJS not available or failed:', emailjsError);
    }

    // Alternative: Use Netlify Functions (if deployed on Netlify)
    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent via Netlify function:', result);
        
        storeEmailLog({
          to,
          subject,
          status: 'sent',
          messageId: result.messageId,
          smtpHost: settings.smtp.host,
          timestamp: new Date().toISOString()
        });

        return result;
      }
    } catch (netlifyError) {
      console.warn('⚠️ Netlify function not available:', netlifyError);
    }

    // Alternative: Use Formspree or similar form service
    try {
      const formData = new FormData();
      formData.append('email', to);
      formData.append('subject', subject);
      formData.append('message', content);
      formData.append('_replyto', settings.smtp.username);

      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Email sent via Formspree');
        
        storeEmailLog({
          to,
          subject,
          status: 'sent',
          messageId: 'formspree-' + Date.now(),
          smtpHost: 'formspree.io',
          timestamp: new Date().toISOString()
        });

        return { success: true, service: 'formspree' };
      }
    } catch (formspreeError) {
      console.warn('⚠️ Formspree not available:', formspreeError);
    }

    // If all methods fail, show helpful error message
    throw new Error(`
      Impossibile inviare l'email. Opzioni disponibili:
      
      1. Configura un backend service con endpoint /api/send-email
      2. Integra EmailJS (https://www.emailjs.com/)
      3. Usa Netlify Functions per l'invio email
      4. Configura Formspree (https://formspree.io/)
      
      Per ora, l'email è stata simulata ma non inviata realmente.
    `);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Store error log
    storeEmailLog({
      to,
      subject,
      status: 'failed',
      error: error.message,
      smtpHost: settings.smtp?.host,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
};

// Helper function to store email logs
const storeEmailLog = (logData) => {
  try {
    const existingLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    existingLogs.push({ id: Date.now(), ...logData });
    
    // Keep only last 50 logs
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('emailLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error storing email log:', error);
  }
};

export const verifySmtpConnection = async (smtpConfig) => {
  console.log('🔍 Verifying SMTP connection...');
  
  try {
    // Basic validation
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      const missingFields = [];
      if (!smtpConfig.host) missingFields.push('host');
      if (!smtpConfig.port) missingFields.push('port');
      if (!smtpConfig.username) missingFields.push('username');
      if (!smtpConfig.password) missingFields.push('password');
      
      throw new Error(`Campi SMTP mancanti: ${missingFields.join(', ')}`);
    }

    // Validate host format
    if (!smtpConfig.host.includes('.')) {
      throw new Error('Formato host SMTP non valido');
    }

    // Validate port
    const port = parseInt(smtpConfig.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Porta SMTP non valida');
    }

    // Validate email format for username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(smtpConfig.username)) {
      throw new Error('Username deve essere un indirizzo email valido');
    }

    console.log('✅ SMTP configuration validation passed');

    // Try to test connection with backend
    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SMTP connection test successful via backend');
        return { success: true, method: 'backend', ...result };
      }
    } catch (error) {
      console.warn('⚠️ Backend SMTP test not available');
    }

    // If backend not available, just validate configuration
    console.log('✅ SMTP configuration appears valid (backend test not available)');
    return { 
      success: true, 
      method: 'validation',
      message: 'Configurazione SMTP validata. Test di connessione non disponibile senza backend.'
    };

  } catch (error) {
    console.error('❌ SMTP verification failed:', error);
    throw error;
  }
};

// Get email logs for debugging
export const getEmailLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('emailLogs') || '[]');
  } catch (error) {
    console.error('Error reading email logs:', error);
    return [];
  }
};

// Clear email logs
export const clearEmailLogs = () => {
  localStorage.removeItem('emailLogs');
  console.log('📧 Email logs cleared');
};

export const emailTemplates = {
  welcome: (student) => ({
    subject: `Benvenuto nel corso ${student.course}!`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Benvenuto in Diplomati Online!</h1>
        </div>
        
        <p style="font-size: 16px; color: #333;">Ciao ${student.firstName},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Siamo felici di averti con noi per il corso <strong>${student.course}</strong>.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">📚 DETTAGLI ISCRIZIONE:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 5px 0;"><strong>Corso:</strong> ${student.course}</li>
            <li style="padding: 5px 0;"><strong>Anni da recuperare:</strong> ${student.yearsToRecover}</li>
            <li style="padding: 5px 0;"><strong>Data iscrizione:</strong> ${new Date(student.enrollmentDate).toLocaleDateString('it-IT')}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          I tuoi dati di accesso alla piattaforma ti verranno inviati separatamente.
        </p>

        <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #0369a1;">📞 Per qualsiasi domanda, non esitare a contattarci:</p>
          <ul style="list-style: none; padding: 0; margin: 10px 0 0;">
            <li style="padding: 3px 0;">📧 <strong>Email:</strong> info@diplomatonline.it</li>
            <li style="padding: 3px 0;">📞 <strong>Telefono:</strong> +39 02 1234567</li>
            <li style="padding: 3px 0;">📱 <strong>WhatsApp:</strong> +39 320 1234567</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
          Cordiali saluti,<br>
          <strong>Il team di Diplomati Online</strong>
        </p>
      </div>
    `
  }),

  paymentReminder: (student) => ({
    subject: 'Promemoria pagamento - Diplomati Online',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; margin: 0;">💰 Promemoria Pagamento</h1>
        </div>
        
        <p style="font-size: 16px; color: #333;">Ciao ${student.firstName},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Ti ricordiamo che hai un pagamento in sospeso per il corso <strong>${student.course}</strong>.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h2 style="color: #333; margin-top: 0;">💳 DETTAGLI PAGAMENTO:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 5px 0;"><strong>Importo totale:</strong> €${student.totalAmount}</li>
            <li style="padding: 5px 0;"><strong>Già pagato:</strong> €${student.paidAmount}</li>
            <li style="padding: 5px 0; color: #f59e0b;"><strong>Rimanente:</strong> €${student.totalAmount - student.paidAmount}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Ti preghiamo di procedere con il pagamento entro i prossimi giorni per continuare senza interruzioni.
        </p>

        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #0369a1;">💡 Modalità di pagamento:</p>
          <ul style="margin: 10px 0 0; padding-left: 20px;">
            <li>Bonifico bancario ai nostri dati bancari</li>
            <li>Contattaci per altre modalità di pagamento</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
          Grazie per la collaborazione,<br>
          <strong>Il team di Diplomati Online</strong>
        </p>
      </div>
    `
  }),

  examPreparation: (student) => ({
    subject: 'Preparazione esame - Informazioni importanti',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">🎓 Preparazione Esame</h1>
        </div>
        
        <p style="font-size: 16px; color: #333;">Ciao ${student.firstName},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Il tuo esame si avvicina! Ecco alcune informazioni importanti.
        </p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #059669;">
          <h2 style="color: #333; margin-top: 0;">✅ CHECKLIST PREPARAZIONE:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 5px 0;">✅ Assicurati di aver completato tutti i moduli del corso</li>
            <li style="padding: 5px 0;">📚 Rivedi le materie principali: ${student.course}</li>
            <li style="padding: 5px 0;">🪪 Porta con te un documento d'identità valido</li>
            <li style="padding: 5px 0;">⏰ Arriva almeno 30 minuti prima dell'orario</li>
          </ul>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">📞 CONTATTI EMERGENZA:</p>
          <ul style="list-style: none; padding: 0; margin: 10px 0 0;">
            <li style="padding: 3px 0;">📞 <strong>Telefono:</strong> +39 02 1234567</li>
            <li style="padding: 3px 0;">📱 <strong>WhatsApp:</strong> +39 320 1234567</li>
          </ul>
        </div>

        <p style="font-size: 18px; color: #059669; text-align: center; font-weight: bold; margin: 30px 0;">
          🍀 In bocca al lupo per il tuo esame! 🍀
        </p>

        <p style="font-size: 16px; color: #333; margin-top: 30px;">
          Un caloroso saluto,<br>
          <strong>Il team di Diplomati Online</strong>
        </p>
      </div>
    `
  }),

  congratulations: (student) => ({
    subject: '🎓 Congratulazioni per il diploma!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">🎓 CONGRATULAZIONI! 🎓</h1>
        </div>
        
        <p style="font-size: 18px; color: #333; text-align: center;">Caro ${student.firstName},</p>
        
        <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; margin: 20px 0;">
          <p style="font-size: 20px; color: white; margin: 0;">
            Hai superato brillantemente l'esame e ottenuto il diploma in
          </p>
          <p style="color: white; font-size: 24px; font-weight: bold; margin: 10px 0;">
            ${student.course}
          </p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6; text-align: center;">
          Siamo orgogliosi del tuo successo e ti auguriamo il meglio per il tuo futuro.
        </p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <p style="font-size: 16px; color: #059669; margin: 0;">
            📜 Il diploma ufficiale ti verrà recapitato nei prossimi giorni.
          </p>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 30px; text-align: center;">
          Un caloroso saluto e ancora congratulazioni!<br>
          <strong>Il team di Diplomati Online</strong>
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 24px; margin: 0;">🌟 🎉 🏆 🎉 🌟</p>
        </div>
      </div>
    `
  })
};