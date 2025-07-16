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
    const { host, port, secure, username, password } = JSON.parse(event.body);

    // Create transporter
    const transporter = nodemailer.createTransporter({
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