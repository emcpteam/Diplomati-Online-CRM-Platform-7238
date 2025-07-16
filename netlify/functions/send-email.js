const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { to, subject, html, text, smtp, from } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || !html || !smtp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.auth.user,
        pass: smtp.auth.pass
      }
    });

    // Verify connection
    await transporter.verify();

    // Prepare email options
    const mailOptions = {
      from: from && from.name && from.email ? `"${from.name}" <${from.email}>` : `"Diplomati Online" <${smtp.auth.user}>`,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    // Special handling for SendGrid
    if (smtp.host.includes('sendgrid') && smtp.auth.user === 'apikey') {
      // If using SendGrid with 'apikey' as username, ensure from email is set
      if (from && from.email) {
        mailOptions.from = from.name ? `"${from.name}" <${from.email}>` : `${from.email}`;
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            error: 'SendGrid requires a valid from email address'
          })
        };
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        response: info.response
      })
    };

  } catch (error) {
    console.error('Email sending error:', error);
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