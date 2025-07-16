import { sendEmail, emailTemplates, getEmailLogs, clearEmailLogs } from './emailService';
import { uploadFile, validateFile, deleteFile } from './fileUpload';
import { 
  generateStudentContract,
  generateQuotePDF,
  generatePaymentReceipt,
  generateMonthlyReport,
  generateExamRequest,
  downloadPDF
} from './pdfGenerator';

// Test SMTP connection
export const testSmtpConnection = async (smtpConfig) => {
  console.log('🔧 Testing SMTP connection...');
  try {
    // Create test email payload
    const testPayload = {
      to: smtpConfig.fromEmail || smtpConfig.username,
      subject: 'SMTP Test',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
      smtp: {
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: smtpConfig.secure || false,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      },
      from: {
        name: smtpConfig.fromName || 'SMTP Test',
        email: smtpConfig.fromEmail || smtpConfig.username
      }
    };

    // Try to send test email
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'SMTP test failed');
    }

    console.log('✅ SMTP test completed successfully');
    return true;
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

export {
  sendEmail,
  emailTemplates,
  getEmailLogs,
  clearEmailLogs,
  uploadFile,
  validateFile,
  deleteFile,
  generateStudentContract,
  generateQuotePDF,
  generatePaymentReceipt,
  generateMonthlyReport,
  generateExamRequest,
  downloadPDF
};