// Update the SMTP configuration section in APIIntegrations.jsx
// Find the SMTP section in handleSave function and add:

const handleSave = async () => {
  // ... existing code ...

  // Test SMTP connection if SMTP settings are being saved
  if (integration.id === 'smtp') {
    try {
      await testSmtpConnection(formData);
      // Update the integration with active status
      dispatch({
        type: 'UPDATE_INTEGRATION',
        payload: {
          key: integration.id,
          data: {
            ...formData,
            active: true,
            lastSync: new Date().toISOString(),
            status: 'connected'
          }
        }
      });
      toast.success('Configurazione SMTP salvata e testata con successo!');
    } catch (error) {
      toast.error(`Errore configurazione SMTP: ${error.message}`);
      // Update with error status
      dispatch({
        type: 'UPDATE_INTEGRATION',
        payload: {
          key: integration.id,
          data: {
            ...formData,
            active: false,
            status: 'error',
            lastError: error.message
          }
        }
      });
      return;
    }
  }

  // ... rest of the code ...
};