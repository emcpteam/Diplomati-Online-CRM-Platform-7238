// Add SMTP verification to utils/index.js
export * from './emailService';
export * from './fileUpload';
export * from './pdfGenerator';

export const testSmtpConnection = async (smtpConfig) => {
  try {
    const response = await verifySmtpConnection(smtpConfig);
    return response.success;
  } catch (error) {
    console.error('SMTP test error:', error);
    throw error;
  }
};