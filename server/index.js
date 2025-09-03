import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Diplomati Online Email Service'
  });
});

// SendGrid email endpoint
app.post('/api/send-email/sendgrid', async (req, res) => {
  try {
    const { to, subject, content, apiKey, fromEmail, fromName } = req.body;

    // Validate required fields
    if (!to || !subject || !content || !apiKey || !fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, apiKey, fromEmail'
      });
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey);

    // Prepare email message
    const msg = {
      to: to,
      from: {
        email: fromEmail,
        name: fromName || 'Diplomati Online'
      },
      subject: subject,
      html: content.replace(/\n/g, '<br>'),
      text: content
    };

    console.log('Sending email via SendGrid:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    // Send email
    const response = await sgMail.send(msg);

    console.log('SendGrid response:', response[0].statusCode);

    res.json({
      success: true,
      messageId: response[0].headers['x-message-id'],
      provider: 'sendgrid',
      timestamp: new Date().toISOString(),
      statusCode: response[0].statusCode
    });

  } catch (error) {
    console.error('SendGrid error:', error);
    
    let errorMessage = 'Errore durante l\'invio dell\'email';
    
    if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors[0].message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      provider: 'sendgrid'
    });
  }
});

// Generic SMTP email endpoint (for other providers like Gmail, Outlook, etc.)
app.post('/api/send-email/smtp', async (req, res) => {
  try {
    const { to, subject, content, smtpConfig } = req.body;

    // Validate required fields
    if (!to || !subject || !content || !smtpConfig) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const { host, port, username, password, secure, fromName } = smtpConfig;

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: host,
      port: parseInt(port),
      secure: secure || false, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName || 'Diplomati Online'}" <${username}>`,
      to: to,
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>'),
    });

    console.log('SMTP email sent:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      provider: 'smtp',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SMTP error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      provider: 'smtp'
    });
  }
});

// Test SMTP connection endpoint
app.post('/api/test-smtp', async (req, res) => {
  try {
    const { smtpConfig } = req.body;

    if (!smtpConfig) {
      return res.status(400).json({
        success: false,
        error: 'SMTP configuration is required'
      });
    }

    const { host, port, username, password, secure } = smtpConfig;

    // For SendGrid API, we test differently
    if (host === 'smtp.sendgrid.net') {
      // Test SendGrid API key
      sgMail.setApiKey(password); // SendGrid uses API key as password
      
      // Try to get account information (simple API test)
      const testMsg = {
        to: username, // Use username as test email for SendGrid
        from: username,
        subject: 'SendGrid Connection Test',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p>',
        mail_settings: {
          sandbox_mode: {
            enable: true // Send in sandbox mode for testing
          }
        }
      };

      await sgMail.send(testMsg);
      
      return res.json({
        success: true,
        message: 'SendGrid API connection successful',
        provider: 'sendgrid',
        timestamp: new Date().toISOString()
      });
    }

    // For other SMTP providers, use nodemailer
    const transporter = nodemailer.createTransporter({
      host: host,
      port: parseInt(port),
      secure: secure || false,
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verify connection
    await transporter.verify();

    res.json({
      success: true,
      message: 'SMTP connection successful',
      provider: 'smtp',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SMTP test error:', error);
    
    let errorMessage = 'Connection failed';
    if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors[0].message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`📧 Email service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📨 SendGrid endpoint: http://localhost:${PORT}/api/send-email/sendgrid`);
  console.log(`📮 SMTP endpoint: http://localhost:${PORT}/api/send-email/smtp`);
});