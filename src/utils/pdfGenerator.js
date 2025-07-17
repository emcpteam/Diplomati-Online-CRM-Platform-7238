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

DATI CLIENTE: ${quote.studentName}

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
REPORT MENSILE ${new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}

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