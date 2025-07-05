// PDF Generation utilities
export const generatePDF = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};

export const generateStudentContract = (student) => {
  const content = `
CONTRATTO DI ISCRIZIONE
Diplomati Online Srl

DATI STUDENTE:
Nome: ${student.firstName} ${student.lastName}
Codice Fiscale: ${student.codiceFiscale}
Email: ${student.email}
Telefono: ${student.phone}

DETTAGLI CORSO:
Corso: ${student.course}
Anni da Recuperare: ${student.yearsToRecover}
Importo Totale: €${student.totalAmount}

Data Iscrizione: ${new Date(student.enrollmentDate).toLocaleDateString('it-IT')}

Diplomati Online Srl
P.IVA: IT12345678901
Generato il: ${new Date().toLocaleDateString('it-IT')}
  `;
  
  return generatePDF(content, `contratto-${student.firstName}-${student.lastName}.txt`);
};

// Email Service utilities
export const sendEmail = async (to, subject, content, settings) => {
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

Grazie per la collaborazione,
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

Un nostro consulente ti contatterà entro 24 ore.

A presto!
Il team di Diplomati Online
    `
  })
};

// File upload utilities
export const uploadFile = async (file, type = 'general') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File size too large. Maximum 10MB allowed.'));
      return;
    }

    // Simulate file upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        resolve({
          url: event.target.result,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }, 1000);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024, allowedTypes = []) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum ${(maxSize / 1024 / 1024).toFixed(1)}MB allowed.`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return errors;
};

// Date utilities
export const formatDate = (date, locale = 'it-IT', options = {}) => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
};

// Currency utilities
export const formatCurrency = (amount, locale = 'it-IT', currency = 'EUR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Search utilities
export const searchItems = (items, searchTerm, searchFields) => {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item => 
    searchFields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(term);
    })
  );
};

// Export utilities
export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};