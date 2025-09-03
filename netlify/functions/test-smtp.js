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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🧪 Netlify Function: Testing SMTP connection');
    
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

    const { smtpConfig } = requestData;

    if (!smtpConfig) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'SMTP configuration is required' 
        })
      };
    }

    const { host, port, username, password, secure } = smtpConfig;

    // Validate required SMTP fields
    if (!host || !port || !username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Missing required SMTP fields: host, port, username, password' 
        })
      };
    }

    console.log('Testing SMTP config:', { 
      host, 
      port, 
      username: username?.substring(0, 5) + '***' 
    });

    // For SendGrid API, test differently
    if (host === 'smtp.sendgrid.net') {
      console.log('🔵 Testing SendGrid API connection');
      
      try {
        // Test SendGrid API key
        sgMail.setApiKey(password);

        // Try to send a test email in sandbox mode
        const testMsg = {
          to: username, // Use username as test email for SendGrid
          from: username,
          subject: 'SendGrid Connection Test - Diplomati Online',
          text: 'This is a test email to verify SendGrid configuration.',
          html: '<p>This is a test email to verify SendGrid configuration.</p>',
          mail_settings: {
            sandbox_mode: {
              enable: true // Send in sandbox mode for testing
            }
          }
        };

        const response = await sgMail.send(testMsg);
        console.log('✅ SendGrid test successful:', response[0].statusCode);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'SendGrid API connection successful',
            provider: 'sendgrid',
            timestamp: new Date().toISOString(),
            statusCode: response[0].statusCode
          })
        };
      } catch (sendGridError) {
        console.error('❌ SendGrid test error:', sendGridError);
        
        let errorMessage = 'SendGrid connection failed';
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
    }

    console.log('🔵 Testing generic SMTP connection');

    try {
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
      console.log('✅ SMTP connection verified successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'SMTP connection successful',
          provider: 'smtp',
          timestamp: new Date().toISOString()
        })
      };
    } catch (smtpError) {
      console.error('❌ SMTP test error:', smtpError);
      
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

  } catch (error) {
    console.error('❌ GENERAL SMTP TEST ERROR:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      })
    };
  }
};