import { sendEmail, emailTemplates, getEmailLogs, clearEmailLogs, setDefaultSender } from './emailService';
import { uploadFile, validateFile, deleteFile } from './fileUpload';
import { 
  generateStudentContract,
  generateQuotePDF,
  generatePaymentReceipt,
  generateMonthlyReport,
  generateExamRequest
} from './pdfGenerator';

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

export {
  sendEmail,
  emailTemplates,
  getEmailLogs,
  clearEmailLogs,
  setDefaultSender,
  uploadFile,
  validateFile,
  deleteFile,
  generateStudentContract,
  generateQuotePDF,
  generatePaymentReceipt,
  generateMonthlyReport,
  generateExamRequest
};