import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmailLogsViewer from '../components/EmailLogsViewer';
import EmailSetupGuide from '../components/EmailSetupGuide';
import { useApp } from '../context/AppContext';
import { testSmtpConnection } from '../utils';
import toast from 'react-hot-toast';

const APIIntegrations = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [showEmailLogs, setShowEmailLogs] = useState(false);
  const [showEmailGuide, setShowEmailGuide] = useState(false);

  const integrations = [
    {
      id: 'smtp',
      name: 'SMTP Email',
      description: 'Configurazione server SMTP per invio email',
      icon: FiIcons.FiMail,
      color: 'from-blue-500 to-blue-600',
      status: state.settings?.integrations?.smtp?.active ? 'connected' : 'disconnected',
      fields: [
        { key: 'host', label: 'Host SMTP', type: 'text', placeholder: 'smtp.gmail.com', required: true },
        { key: 'port', label: 'Porta', type: 'number', placeholder: '587', required: true },
        { key: 'secure', label: 'Connessione Sicura', type: 'checkbox', description: 'Usa SSL/TLS' },
        { key: 'username', label: 'Username/Email', type: 'email', placeholder: 'noreply@diplomatonline.it', required: true },
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        { key: 'fromName', label: 'Nome Mittente', type: 'text', placeholder: 'Diplomati Online', required: true }
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automazione workflow con Zapier',
      icon: FiIcons.FiZap,
      color: 'from-orange-500 to-orange-600',
      status: state.settings?.integrations?.zapier?.active ? 'connected' : 'disconnected',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'zap_...', required: true },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.zapier.com/...', required: true }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Integrazione AI per contenuti automatici',
      icon: FiIcons.FiCpu,
      color: 'from-green-500 to-green-600',
      status: state.settings?.integrations?.openai?.active ? 'connected' : 'disconnected',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
        { key: 'model', label: 'Modello', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], required: true },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', placeholder: '1000' },
        { key: 'temperature', label: 'Temperature', type: 'number', placeholder: '0.7', step: '0.1', min: '0', max: '1' }
      ]
    }
  ];

  const handleEdit = (integrationData) => {
    setIntegration(integrationData);
    setFormData(state.settings?.integrations?.[integrationData.id] || {});
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (!formData || !integration) return;

    // Validate required fields
    const requiredFields = integration.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.key]);

    if (missingFields.length > 0) {
      toast.error(`Campi obbligatori mancanti: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      // Test SMTP connection if SMTP settings are being saved
      if (integration.id === 'smtp') {
        console.log('🧪 Testing SMTP connection before saving...');
        try {
          await testSmtpConnection(formData);
          console.log('✅ SMTP test successful, saving configuration...');
          
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
          console.error('❌ SMTP test failed:', error);
          
          // Show setup guide for better user experience
          if (error.message.includes('backend') || error.message.includes('Netlify') || error.message.includes('EmailJS')) {
            toast.error('SMTP configurato ma servizio email non attivo. Apri la guida setup.');
            setShowEmailGuide(true);
          } else {
            toast.error(`Errore configurazione SMTP: ${error.message}`);
          }
          
          // Update with error status but still save the config
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
        }
      } else {
        // Handle other integrations
        dispatch({
          type: 'UPDATE_INTEGRATION',
          payload: {
            key: integration.id,
            data: {
              ...formData,
              active: true,
              lastUpdate: new Date().toISOString()
            }
          }
        });
        toast.success(`Configurazione ${integration.name} aggiornata con successo!`);
      }

      setSubmitting(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Errore durante il salvataggio: ${error.message}`);
      setSubmitting(false);
    }
  };

  const handleTestConnection = async (integrationData) => {
    if (integrationData.id === 'smtp') {
      const smtpConfig = state.settings?.integrations?.smtp;
      if (!smtpConfig || !smtpConfig.active) {
        toast.error('Configura prima le impostazioni SMTP');
        return;
      }

      toast.loading('Test connessione SMTP...', { id: 'smtp-test' });
      try {
        await testSmtpConnection(smtpConfig);
        toast.success('Connessione SMTP testata con successo!', { id: 'smtp-test' });
      } catch (error) {
        if (error.message.includes('backend') || error.message.includes('servizio')) {
          toast.error('SMTP configurato ma servizio non attivo. Consulta la guida setup.', { id: 'smtp-test' });
          setShowEmailGuide(true);
        } else {
          toast.error(`Test SMTP fallito: ${error.message}`, { id: 'smtp-test' });
        }
      }
    }
  };

  const renderField = (field) => {
    const value = formData?.[field.key] || '';

    switch (field.type) {
      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={field.key}
              checked={!!value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor={field.key} className="text-sm font-medium text-neutral-700">
              {field.label}
            </label>
            {field.description && (
              <span className="text-xs text-neutral-500">({field.description})</span>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {field.label} {field.required && '*'}
            </label>
            <select
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={field.required}
            >
              <option value="">Seleziona...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <Input
            key={field.key}
            label={`${field.label} ${field.required ? '*' : ''}`}
            type={field.type}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
            step={field.step}
            min={field.min}
            max={field.max}
          />
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connesso</Badge>;
      case 'error':
        return <Badge variant="danger">Errore</Badge>;
      default:
        return <Badge variant="default">Disconnesso</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Integrazioni API
          </h1>
          <p className="text-neutral-600 mt-2">
            Configura le integrazioni esterne per il CRM
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiHelpCircle}
            onClick={() => setShowEmailGuide(true)}
          >
            Guida Setup
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiMail}
            onClick={() => setShowEmailLogs(true)}
          >
            Log Email
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiRefreshCw}
          >
            Sincronizza
          </Button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integrationData, index) => (
          <motion.div
            key={integrationData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integrationData.color} flex items-center justify-center`}>
                    <SafeIcon icon={integrationData.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{integrationData.name}</h3>
                    <p className="text-sm text-neutral-500">{integrationData.description}</p>
                  </div>
                </div>
                {getStatusBadge(integrationData.status)}
              </div>

              <div className="space-y-3">
                {integrationData.status === 'connected' && (
                  <div className="text-sm text-neutral-600">
                    <p>✅ Configurazione attiva</p>
                    {state.settings?.integrations?.[integrationData.id]?.lastSync && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Ultima sincronizzazione: {new Date(state.settings.integrations[integrationData.id].lastSync).toLocaleString('it-IT')}
                      </p>
                    )}
                  </div>
                )}

                {integrationData.status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ❌ {state.settings?.integrations?.[integrationData.id]?.lastError || 'Errore di configurazione'}
                    </p>
                    {integrationData.id === 'smtp' && (
                      <button
                        onClick={() => setShowEmailGuide(true)}
                        className="text-xs text-red-600 underline mt-1"
                      >
                        Vedi guida setup →
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  icon={FiIcons.FiSettings}
                  onClick={() => handleEdit(integrationData)}
                >
                  Configura
                </Button>
                {integrationData.status === 'connected' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiPlay}
                    onClick={() => handleTestConnection(integrationData)}
                  >
                    Test
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Configuration Modal */}
      {isEditMode && integration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditMode(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                    <SafeIcon icon={integration.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800">
                      Configura {integration.name}
                    </h2>
                    <p className="text-neutral-600">{integration.description}</p>
                  </div>
                </div>
                <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setIsEditMode(false)} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {integration.fields.map(renderField)}

              {integration.id === 'smtp' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Configurazione SMTP</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Per Gmail: smtp.gmail.com, porta 587, attiva "App meno sicure"</li>
                        <li>• Per Outlook: smtp-mail.outlook.com, porta 587</li>
                        <li>• Assicurati che il server SMTP supporti STARTTLS</li>
                      </ul>
                      <button
                        onClick={() => setShowEmailGuide(true)}
                        className="text-blue-600 underline text-sm mt-2"
                      >
                        📧 Vedi guida completa setup email →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200">
              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Annulla
                </Button>
                <Button icon={FiIcons.FiSave} onClick={handleSave} loading={submitting}>
                  Salva Configurazione
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Email Logs Modal */}
      <EmailLogsViewer
        isOpen={showEmailLogs}
        onClose={() => setShowEmailLogs(false)}
      />

      {/* Email Setup Guide Modal */}
      <EmailSetupGuide
        isOpen={showEmailGuide}
        onClose={() => setShowEmailGuide(false)}
      />
    </div>
  );
};

export default APIIntegrations;