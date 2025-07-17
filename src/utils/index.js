import { sendEmail, emailTemplates, getEmailLogs, clearEmailLogs, setDefaultSender } from './emailService';
import { uploadFile, validateFile, deleteFile } from './fileUpload';

// Test SMTP connection using the saved SMTP configuration
export const testSmtpConnection = async (smtpConfig) => {
  console.log('🔧 Testing SMTP connection...');
  try {
    // Use the provided config or get from integrations
    let testConfig = smtpConfig;
    if (!testConfig) {
      // Get SMTP config from localStorage/app state
      const appStateString = localStorage.getItem('appState');
      if (!appStateString) {
        throw new Error('App state not found. Please configure SMTP in API Integrations.');
      }
      const appState = JSON.parse(appStateString);
      const smtpSettings = appState?.settings?.integrations?.smtp;
      if (!smtpSettings || !smtpSettings.active) {
        throw new Error('SMTP configuration not found or not active. Please configure SMTP in API Integrations.');
      }
      testConfig = smtpSettings;
    }

    // Validate required fields
    if (!testConfig.host || !testConfig.port || !testConfig.username || !testConfig.password) {
      throw new Error('Incomplete SMTP configuration. Please check all required fields.');
    }

    console.log('🧪 Testing with configuration:', {
      host: testConfig.host,
      port: testConfig.port,
      username: testConfig.username,
      fromName: testConfig.fromName,
      fromEmail: testConfig.fromEmail
    });

    // Instead of using the test-smtp endpoint which might not exist,
    // try to send a test email through the regular send-email endpoint
    const testEmailPayload = {
      to: testConfig.fromEmail || testConfig.username,
      subject: 'SMTP Test - Diplomati Online',
      html: '<p>This is a test email to verify SMTP configuration from Diplomati Online CRM.</p>',
      text: 'This is a test email to verify SMTP configuration from Diplomati Online CRM.',
      from: {
        name: testConfig.fromName || 'Diplomati Online',
        email: testConfig.fromEmail || testConfig.username
      },
      smtp: {
        host: testConfig.host,
        port: parseInt(testConfig.port),
        secure: testConfig.secure || false,
        auth: {
          user: testConfig.username,
          pass: testConfig.password
        }
      }
    };

    // Try to send test email
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmailPayload)
    });

    // Handle non-JSON responses (like HTML)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // It's JSON, proceed normally
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'SMTP test failed');
      }
      const result = await response.json();
      console.log('✅ SMTP test completed successfully:', result);
      return true;
    } else {
      // It's not JSON, handle as error
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 100) + '...');
      
      if (text.includes('Function not found')) {
        throw new Error('SMTP test function not deployed. Please deploy your Netlify functions first.');
      } else {
        throw new Error('Backend service error. Please check your Netlify functions deployment.');
      }
    }
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    throw error;
  }
};

// Helper function for email validation
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Function to export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header] || '';
        // Handle commas and quotes in cell content
        return typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Generator functions
export const generateStudentContract = (student) => {
  const content = `
CONTRATTO DI ISCRIZIONE
Diplomati Online Srl

DATI STUDENTE:
Nome: ${student.firstName} ${student.lastName}
Codice Fiscale: ${student.codiceFiscale}
Email: ${student.email}
Telefono: ${student.phone}
Indirizzo: ${student.address}, ${student.city} ${student.province} ${student.cap}

DETTAGLI CORSO:
Corso: ${student.course}
Anni da Recuperare: ${student.yearsToRecover}
Importo Totale: €${student.totalAmount}
Sconto Applicato: €${student.discount || 0}
Importo Netto: €${student.totalAmount - (student.discount || 0)}

PAGAMENTO:
Tipo: ${student.paymentType === 'wire_transfer' ? 'Bonifico' : student.paymentType === 'installment' ? 'Rateale' : 'Finanziamento'}
Importo Pagato: €${student.paidAmount}
Rimanente: €${student.totalAmount - student.paidAmount}

Data Iscrizione: ${new Date(student.enrollmentDate).toLocaleDateString('it-IT')}

Diplomati Online Srl
P.IVA: IT12345678901

Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

  return downloadPDF(content, `contratto-${student.firstName}-${student.lastName}.txt`);
};

export const generateQuotePDF = (quote) => {
  const content = `
PREVENTIVO PERSONALIZZATO
Diplomati Online Srl

DATI CLIENTE:
${quote.studentName}

DETTAGLI OFFERTA:
Corso: ${quote.course}
Prezzo Base: €${quote.basePrice}
${quote.promoPrice > 0 ? `Sconto Promozionale: -€${quote.promoPrice}` : ''}
Totale: €${quote.basePrice - quote.promoPrice}

MODALITÀ DI PAGAMENTO:
${quote.paymentMethod === 'wire_transfer' ? 'Bonifico Completo' : quote.paymentMethod === 'financing' ? 'Finanziamento Banca Sella' : 'Piano Ibrido'}

VALIDITÀ:
Offerta valida fino al: ${new Date(quote.validUntil).toLocaleDateString('it-IT')}

CONTATTI:
Email: info@diplomatonline.it
Telefono: +39 02 1234567

Diplomati Online Srl
P.IVA: IT12345678901

Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

  return downloadPDF(content, `preventivo-${quote.studentName.replace(' ', '-')}.txt`);
};

export const generatePaymentReceipt = (student, payment) => {
  const content = `
RICEVUTA DI PAGAMENTO
Diplomati Online Srl

DATI STUDENTE:
${student.firstName} ${student.lastName}
Codice Fiscale: ${student.codiceFiscale}

DETTAGLI PAGAMENTO:
Importo: €${payment.amount}
Data: ${new Date(payment.date).toLocaleDateString('it-IT')}
Metodo: ${payment.method === 'bank_transfer' ? 'Bonifico' : payment.method === 'card' ? 'Carta' : 'Contanti'}

RIEPILOGO CORSO:
Importo Totale: €${student.totalAmount}
Totale Pagato: €${student.paidAmount}
Rimanente: €${student.totalAmount - student.paidAmount}

Diplomati Online Srl
P.IVA: IT12345678901
Via Roma 123, Milano

Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

  return downloadPDF(content, `ricevuta-${student.firstName}-${student.lastName}-${Date.now()}.txt`);
};

export const generateMonthlyReport = (data) => {
  const content = `
REPORT MENSILE
${new Date().toLocaleDateString('it-IT', {month: 'long', year: 'numeric'})}

STATISTICHE GENERALI:
- Studenti Totali: ${data.totalStudents}
- Studenti Attivi: ${data.activeStudents}
- Nuovi Lead: ${data.newLeads}
- Fatturato del Mese: €${data.monthlyRevenue.toLocaleString()}
- Fatturato Totale: €${data.totalRevenue.toLocaleString()}

PERFORMANCE CORSI:
${data.topCourses.map(course => `- ${course.name}: ${course.enrollments} iscrizioni`).join('\n')}

CONVERSIONI LEAD:
- Lead Totali: ${data.leadStats?.total || 0}
- Convertiti: ${data.leadStats?.converted || 0}
- Tasso Conversione: ${data.leadStats?.conversionRate || 0}%

PAGAMENTI:
- Incassi del Mese: €${data.monthlyRevenue.toLocaleString()}
- Pagamenti Pendenti: €${data.pendingPayments?.toLocaleString() || 0}

Diplomati Online Srl
Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

  return downloadPDF(content, `report-mensile-${new Date().getMonth() + 1}-${new Date().getFullYear()}.txt`);
};

export const generateExamRequest = (student, school, subjects, examDate) => {
  const content = `
RICHIESTA ESAME
Diplomati Online Srl

DATI STUDENTE:
Nome: ${student.firstName} ${student.lastName}
Codice Fiscale: ${student.codiceFiscale}
Data di Nascita: ${student.birthDate}
Luogo di Nascita: ${student.birthPlace}
Corso: ${student.course}

DATI SCUOLA:
Istituto: ${school.name}
Indirizzo: ${school.address}
Telefono: ${school.phone}
Email: ${school.email}
Referente: ${school.contact}

DETTAGLI ESAME:
Data Richiesta: ${new Date(examDate).toLocaleDateString('it-IT')}
Materie d'Esame:
${subjects.map(subject => `- ${subject}`).join('\n')}
Anno Scolastico: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}

Si richiede gentilmente di procedere con l'iscrizione all'esame di idoneità/maturità per lo studente sopra indicato.

Diplomati Online Srl
P.IVA: IT12345678901

Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

  return downloadPDF(content, `richiesta-esame-${student.firstName}-${student.lastName}.txt`);
};

// Helper function to download text as file
const downloadPDF = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};

export { 
  sendEmail, 
  emailTemplates, 
  getEmailLogs, 
  clearEmailLogs, 
  setDefaultSender, 
  uploadFile, 
  validateFile, 
  deleteFile 
};