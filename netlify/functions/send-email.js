const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📧 Netlify Function: Processing email request');

    // Parse request body safely
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body' 
        })
      };
    }

    const { to, subject, content, smtpConfig } = requestData;

    // Validate required fields
    if (!to || !subject || !content || !smtpConfig) {
      console.error('❌ Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Missing required fields: to, subject, content, smtpConfig' 
        })
      };
    }

    console.log('✅ Email data validated, attempting to send...');
    console.log('SMTP Host:', smtpConfig.host);
    console.log('To:', to);

    let result;

    // Check if it's SendGrid
    if (smtpConfig.host === 'smtp.sendgrid.net') {
      console.log('🔵 Using SendGrid API');
      
      try {
        // Use SendGrid API
        sgMail.setApiKey(smtpConfig.password);

        const msg = {
          to: to,
          from: {
            email: smtpConfig.username,
            name: smtpConfig.fromName || 'Diplomati Online'
          },
          subject: subject,
          html: content.replace(/\n/g, '<br>'),
          text: content
        };

        console.log('SendGrid message config:', {
          to: msg.to,
          from: msg.from,
          subject: msg.subject
        });

        const response = await sgMail.send(msg);
        console.log('✅ SendGrid response received:', response[0].statusCode);
        
        result = {
          success: true,
          messageId: response[0].headers['x-message-id'] || 'sendgrid-' + Date.now(),
          provider: 'sendgrid',
          timestamp: new Date().toISOString(),
          statusCode: response[0].statusCode
        };
      } catch (sendGridError) {
        console.error('❌ SendGrid Error:', sendGridError);
        
        let errorMessage = 'SendGrid API error';
        if (sendGridError.response?.body?.errors) {
          errorMessage = sendGridError.response.body.errors[0].message;
        } else if (sendGridError.message) {
          errorMessage = sendGridError.message;
        }

        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: errorMessage,
            provider: 'sendgrid'
          })
        };
      }
    } else {
      console.log('🔵 Using generic SMTP');
      
      try {
        // Use generic SMTP
        const transporter = nodemailer.createTransporter({
          host: smtpConfig.host,
          port: parseInt(smtpConfig.port),
          secure: smtpConfig.secure || false,
          auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password,
          },
        });

        // Verify connection first
        console.log('Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified');

        // Send email
        const info = await transporter.sendMail({
          from: `"${smtpConfig.fromName || 'Diplomati Online'}" <${smtpConfig.username}>`,
          to: to,
          subject: subject,
          text: content,
          html: content.replace(/\n/g, '<br>'),
        });

        console.log('✅ SMTP email sent:', info.messageId);

        result = {
          success: true,
          messageId: info.messageId || 'smtp-' + Date.now(),
          provider: 'smtp',
          timestamp: new Date().toISOString()
        };
      } catch (smtpError) {
        console.error('❌ SMTP Error:', smtpError);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: smtpError.message || 'SMTP connection failed',
            provider: 'smtp'
          })
        };
      }
    }

    console.log('🎉 EMAIL SENT SUCCESSFULLY:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ GENERAL EMAIL ERROR:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      })
    };
  }
};