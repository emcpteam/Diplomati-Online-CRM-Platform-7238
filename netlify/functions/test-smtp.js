// Netlify Function for testing SMTP connection
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { host, port, secure, username, password, fromName, fromEmail } = JSON.parse(event.body);
    
    // Special handling for SendGrid API
    if (host.includes('sendgrid') && username === 'apikey') {
      try {
        // For SendGrid, we'll make a simple API call to verify the API key
        const response = await fetch('https://api.sendgrid.com/v3/scopes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${password}`
          }
        });
        
        if (response.ok) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              success: true,
              message: 'SendGrid API key validated successfully'
            })
          };
        } else {
          const errorData = await response.json();
          throw new Error(`SendGrid API error: ${errorData.errors?.[0]?.message || 'Invalid API key'}`);
        }
      } catch (sendgridError) {
        console.error('SendGrid API validation error:', sendgridError);
        throw new Error(`Error validating SendGrid API key: ${sendgridError.message}`);
      }
    }

    // Create transporter for regular SMTP
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: secure,
      auth: {
        user: username,
        pass: password
      }
    });

    // Test connection
    await transporter.verify();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'SMTP connection successful'
      })
    };
  } catch (error) {
    console.error('SMTP test error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};