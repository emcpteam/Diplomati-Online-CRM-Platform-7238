# Email Service Backend

This is the backend service for sending real emails through the Diplomati Online CRM.

## Features

- **SendGrid API Integration**: Direct API calls to SendGrid for reliable email delivery
- **Generic SMTP Support**: Support for Gmail, Outlook, Mailgun, and other SMTP providers
- **Connection Testing**: Test SMTP configurations before saving
- **Error Handling**: Comprehensive error handling with detailed messages

## API Endpoints

### Health Check
```
GET /api/health
```

### Send Email via SendGrid
```
POST /api/send-email/sendgrid
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "content": "Email content",
  "apiKey": "your-sendgrid-api-key",
  "fromEmail": "sender@yourdomain.com",
  "fromName": "Your Name"
}
```

### Send Email via SMTP
```
POST /api/send-email/smtp
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "content": "Email content",
  "smtpConfig": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "your-email@gmail.com",
    "password": "your-app-password",
    "secure": false,
    "fromName": "Your Name"
  }
}
```

### Test SMTP Connection
```
POST /api/test-smtp
Content-Type: application/json

{
  "smtpConfig": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "username": "apikey",
    "password": "your-sendgrid-api-key",
    "secure": false
  }
}
```

## SendGrid Configuration

1. **Create SendGrid Account**: Go to https://sendgrid.com and create an account
2. **Get API Key**: 
   - Go to Settings > API Keys
   - Create a new API key with "Full Access" permissions
   - Copy the API key

3. **Configure in CRM**:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey` (literally the word "apikey")
   - Password: Your SendGrid API Key
   - SSL/TLS: Enabled

4. **Verify Sender**: Add your sender email in SendGrid's Sender Authentication

## Running the Server

1. **Start the email server**:
```bash
npm run server
```

2. **Start both frontend and backend**:
```bash
npm run dev:full
```

The email server will run on port 3001 and the frontend on port 5173.

## Error Handling

The service provides detailed error messages for:
- Invalid API keys
- Authentication failures
- Rate limiting
- Invalid email addresses
- Network connectivity issues

## Security Notes

- API keys are never logged or stored permanently
- All requests are validated before processing
- CORS is properly configured for frontend access
- Sensitive data is handled securely