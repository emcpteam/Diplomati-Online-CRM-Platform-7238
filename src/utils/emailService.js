// Email Service Implementation
import toast from 'react-hot-toast';

// Global default sender configuration
let defaultSenderConfig = {
  fromName: 'Diplomati Online',
  fromEmail: 'noreply@diplomatonline.it'
};

// Function to get SMTP config
const getSmtpConfig = () => {
  try {
    // Get settings from localStorage 
    const settings = JSON.parse(localStorage.getItem('appState'))?.settings;
    if (!settings?.integrations?.smtp) {
      throw new Error('SMTP configuration not found');
    }
    return settings.integrations.smtp;
  } catch (error) {
    console.error('Error getting SMTP config:', error);
    throw new Error('SMTP configuration not available. Please configure SMTP in Integrations.');
  }
};

// Function to update the default sender configuration
export const setDefaultSender = (name, email) => {
  defaultSenderConfig = {
    fromName: name || defaultSenderConfig.fromName,
    fromEmail: email || defaultSenderConfig.fromEmail
  };
  return defaultSenderConfig;
};

// Main email sending function
export const sendEmail = async (to, subject, content) => {
  console.log('🚀 Starting email send process...');

  try {
    // Get SMTP config
    const smtpConfig = getSmtpConfig();
    
    if (!smtpConfig || !smtpConfig.active) {
      throw new Error('SMTP not configured or not active');
    }

    // Prepare email payload
    const emailPayload = {
      to,
      subject,
      html: content,
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      from: {
        name: smtpConfig.fromName || defaultSenderConfig.fromName,
        email: smtpConfig.fromEmail || defaultSenderConfig.fromEmail
      },
      smtp: {
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: smtpConfig.secure || false,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      }
    };

    console.log('📧 Sending email with configuration:', {
      to,
      from: emailPayload.from,
      subject,
      smtp: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username
      }
    });

    // Send email using Netlify function
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);

    // Store in email logs
    storeEmailLog({
      to,
      subject,
      status: 'sent',
      messageId: result.messageId,
      smtpHost: smtpConfig.host,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    storeEmailLog({
      to,
      subject,
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Helper function to store email logs
const storeEmailLog = (logData) => {
  try {
    const existingLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    existingLogs.unshift({
      id: Date.now(),
      ...logData
    });

    // Keep only last 50 logs
    if (existingLogs.length > 50) {
      existingLogs.length = 50;
    }

    localStorage.setItem('emailLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error storing email log:', error);
  }
};

// Get email logs
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

// Template function helper
const processTemplate = (template, data) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
};

// Email templates with automatic data insertion
export const emailTemplates = {
  welcome: (student) => {
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0ea5e9;">Benvenuto in Diplomati Online!</h1>
        <p>Ciao {{firstName}},</p>
        <p>Siamo felici di averti con noi per il corso <strong>{{course}}</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2>📚 DETTAGLI ISCRIZIONE:</h2>
          <ul>
            <li>Corso: {{course}}</li>
            <li>Anni da recuperare: {{yearsToRecover}}</li>
            <li>Data iscrizione: {{enrollmentDate}}</li>
          </ul>
        </div>
        <p>Cordiali saluti,<br><strong>Il team di Diplomati Online</strong></p>
      </div>
    `;

    return {
      subject: `Benvenuto nel corso ${student.course}!`,
      content: processTemplate(template, {
        firstName: student.firstName,
        course: student.course,
        yearsToRecover: student.yearsToRecover,
        enrollmentDate: new Date(student.enrollmentDate).toLocaleDateString('it-IT')
      })
    };
  },

  paymentReminder: (student) => {
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b;">💰 Promemoria Pagamento</h1>
        <p>Ciao {{firstName}},</p>
        <p>Ti ricordiamo che hai un pagamento in sospeso per il corso <strong>{{course}}</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2>💳 DETTAGLI PAGAMENTO:</h2>
          <ul>
            <li>Importo totale: €{{totalAmount}}</li>
            <li>Già pagato: €{{paidAmount}}</li>
            <li>Rimanente: €{{remainingAmount}}</li>
          </ul>
        </div>
        <p>Cordiali saluti,<br><strong>Il team di Diplomati Online</strong></p>
      </div>
    `;

    const remainingAmount = student.totalAmount - student.paidAmount;

    return {
      subject: 'Promemoria pagamento - Diplomati Online',
      content: processTemplate(template, {
        firstName: student.firstName,
        course: student.course,
        totalAmount: student.totalAmount.toFixed(2),
        paidAmount: student.paidAmount.toFixed(2),
        remainingAmount: remainingAmount.toFixed(2)
      })
    };
  }
};