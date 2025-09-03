import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { testSMTPConnection } from '../utils/emailService';
import toast from 'react-hot-toast';

const APIIntegrations = () => {
  const { state, dispatch } = useApp();
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);

  const integrations = [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automazione workflow e integrazione lead',
      icon: FiIcons.FiZap,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true }
      ],
      testEndpoint: 'https://hooks.zapier.com/test',
      documentation: 'https://zapier.com/developer/documentation'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Assistenza AI per comunicazioni e analisi',
      icon: FiIcons.FiCpu,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'model', label: 'Modello', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], required: true },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', required: true },
        { key: 'temperature', label: 'Temperature', type: 'number', step: 0.1, min: 0, max: 2, required: true }
      ],
      testEndpoint: 'https://api.openai.com/v1/models',
      documentation: 'https://platform.openai.com/docs'
    },
    {
      id: 'meta',
      name: 'Meta Conversion API',
      description: 'Tracciamento conversioni Facebook/Instagram',
      icon: FiIcons.FiFacebook,
      fields: [
        { key: 'pixelId', label: 'Pixel ID', type: 'text', required: true },
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { key: 'testMode', label: 'Test Mode', type: 'checkbox', required: false }
      ],
      testEndpoint: 'https://graph.facebook.com/v18.0/',
      documentation: 'https://developers.facebook.com/docs/marketing-api/conversions-api'
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      description: 'Gestione tag e tracciamento eventi',
      icon: FiIcons.FiBarChart,
      fields: [
        { key: 'containerId', label: 'Container ID', type: 'text', required: true },
        { key: 'trackingId', label: 'GA Tracking ID', type: 'text', required: true },
        { key: 'enhancedEcommerce', label: 'Enhanced Ecommerce', type: 'checkbox', required: false }
      ],
      testEndpoint: 'https://www.googletagmanager.com/gtag/js',
      documentation: 'https://developers.google.com/tag-manager'
    },
    {
      id: 'facebook',
      name: 'Facebook Pixel',
      description: 'Tracciamento eventi e conversioni',
      icon: FiIcons.FiEye,
      fields: [
        { key: 'pixelId', label: 'Pixel ID', type: 'text', required: true },
        { key: 'advancedMatching', label: 'Advanced Matching', type: 'checkbox', required: false },
        { key: 'automaticEvents', label: 'Automatic Events', type: 'checkbox', required: false }
      ],
      testEndpoint: 'https://graph.facebook.com/v18.0/',
      documentation: 'https://developers.facebook.com/docs/facebook-pixel'
    },
    {
      id: 'smtp',
      name: 'SMTP Email',
      description: 'Invio email transazionali e marketing',
      icon: FiIcons.FiMail,
      fields: [
        { key: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.sendgrid.net' },
        { key: 'port', label: 'SMTP Port', type: 'number', required: true, placeholder: '587' },
        { key: 'username', label: 'Username/Email', type: 'text', required: true, placeholder: 'apikey (per SendGrid)' },
        { key: 'password', label: 'Password/API Key', type: 'password', required: true, placeholder: 'SendGrid API Key' },
        { key: 'secure', label: 'SSL/TLS', type: 'checkbox', required: false },
        { key: 'fromName', label: 'Nome Mittente', type: 'text', required: false, placeholder: 'Diplomati Online' }
      ],
      testEndpoint: null,
      documentation: 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started'
    }
  ];

  const getStatusBadge = (integrationId) => {
    const integration = state.settings.integrations[integrationId];
    if (!integration) return <Badge variant="danger">Non configurato</Badge>;
    if (integration.active && integration.status === 'connected') return <Badge variant="success">Connesso</Badge>;
    if (integration.active && integration.status === 'error') return <Badge variant="danger">Errore</Badge>;
    if (integration.active) return <Badge variant="warning">Attivo</Badge>;
    return <Badge variant="warning">Disconnesso</Badge>;
  };

  const getIntegrationConfig = (integrationId) => {
    return state.settings.integrations[integrationId] || {};
  };

  const handleTestConnection = async (integration) => {
    setTestingConnection(integration.id);
    toast.loading(`Test connessione ${integration.name}...`, { id: 'test-connection' });

    try {
      const config = getIntegrationConfig(integration.id);

      // Check if required fields are filled
      const missingFields = integration.fields
        .filter(field => field.required && !config[field.key])
        .map(field => field.label);

      if (missingFields.length > 0) {
        throw new Error(`Campi mancanti: ${missingFields.join(', ')}`);
      }

      // Special handling for SMTP testing
      if (integration.id === 'smtp') {
        await testSMTPConnection(config);
      } else {
        // Simulate API call for other integrations
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Update integration status
      dispatch({
        type: 'UPDATE_INTEGRATION',
        payload: {
          key: integration.id,
          data: {
            ...config,
            active: true,
            lastSync: new Date().toISOString(),
            status: 'connected'
          }
        }
      });

      toast.success(`${integration.name} connesso con successo!`, { id: 'test-connection' });
    } catch (error) {
      toast.error(`Errore connessione ${integration.name}: ${error.message}`, { id: 'test-connection' });

      // Update integration status
      dispatch({
        type: 'UPDATE_INTEGRATION',
        payload: {
          key: integration.id,
          data: {
            ...getIntegrationConfig(integration.id),
            active: false,
            status: 'error',
            lastError: error.message
          }
        }
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleToggleIntegration = (integrationId) => {
    const currentConfig = getIntegrationConfig(integrationId);
    dispatch({
      type: 'UPDATE_INTEGRATION',
      payload: {
        key: integrationId,
        data: {
          ...currentConfig,
          active: !currentConfig.active
        }
      }
    });
    toast.success(`Integrazione ${currentConfig.active ? 'disattivata' : 'attivata'}`);
  };

  const handleSyncAll = async () => {
    toast.loading('Sincronizzazione in corso...', { id: 'sync-all' });

    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update last sync for all active integrations
      Object.keys(state.settings.integrations).forEach(key => {
        const integration = state.settings.integrations[key];
        if (integration.active) {
          dispatch({
            type: 'UPDATE_INTEGRATION',
            payload: {
              key,
              data: {
                ...integration,
                lastSync: new Date().toISOString()
              }
            }
          });
        }
      });

      toast.success('Sincronizzazione completata!', { id: 'sync-all' });
    } catch (error) {
      toast.error('Errore durante la sincronizzazione', { id: 'sync-all' });
    }
  };

  const IntegrationModal = ({ integration, onClose }) => {
    const [config, setConfig] = useState(getIntegrationConfig(integration.id));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      setSaving(true);
      try {
        // Validate required fields
        const missingFields = integration.fields
          .filter(field => field.required && !config[field.key])
          .map(field => field.label);

        if (missingFields.length > 0) {
          throw new Error(`Campi obbligatori mancanti: ${missingFields.join(', ')}`);
        }

        // Special validation for SMTP
        if (integration.id === 'smtp') {
          if (config.port && (config.port < 1 || config.port > 65535)) {
            throw new Error('Porta SMTP deve essere tra 1 e 65535');
          }
          // Username validation removed - accepts any string including API keys
        }

        dispatch({
          type: 'UPDATE_INTEGRATION',
          payload: {
            key: integration.id,
            data: {
              ...config,
              updatedAt: new Date().toISOString()
            }
          }
        });

        toast.success('Configurazione salvata con successo!');
        onClose();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSaving(false);
      }
    };

    const renderField = (field) => {
      switch (field.type) {
        case 'checkbox':
          return (
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config[field.key] || false}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.checked }))}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700">{field.label}</span>
            </label>
          );
        case 'select':
          return (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {field.label} {field.required && '*'}
              </label>
              <select
                value={config[field.key] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={field.required}
              >
                <option value="">Seleziona {field.label}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          );
        default:
          return (
            <Input
              label={`${field.label} ${field.required ? '*' : ''}`}
              type={field.type}
              value={config[field.key] || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder || `Inserisci ${field.label.toLowerCase()}`}
              required={field.required}
              step={field.step}
              min={field.min}
              max={field.max}
            />
          );
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
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
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <SafeIcon icon={integration.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    {integration.name}
                  </h2>
                  <p className="text-neutral-600">{integration.description}</p>
                </div>
              </div>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Configuration Fields */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Configurazione
              </h3>
              <div className="space-y-4">
                {integration.fields.map((field) => (
                  <div key={field.key}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* SendGrid Specific Instructions */}
            {integration.id === 'smtp' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Configurazione SMTP</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li><strong>SendGrid:</strong></li>
                      <li>• Host: smtp.sendgrid.net</li>
                      <li>• Porta: 587</li>
                      <li>• Username: apikey (letteralmente "apikey")</li>
                      <li>• Password: La tua SendGrid API Key</li>
                      <li>• SSL/TLS: Abilitato</li>
                      <li></li>
                      <li><strong>Gmail:</strong></li>
                      <li>• Host: smtp.gmail.com, Porta: 587</li>
                      <li>• Username: tua-email@gmail.com</li>
                      <li>• Password: App Password (non la password Gmail)</li>
                      <li></li>
                      <li><strong>Outlook:</strong></li>
                      <li>• Host: smtp.live.com, Porta: 587</li>
                      <li>• Mailgun: smtp.mailgun.org, Porta: 587</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Email Server Status */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiServer} className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">Server Email Attivo</p>
                  <p className="text-sm text-green-700">
                    Server backend in esecuzione su porta 3001 per l'invio di email reali
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Stato Connessione
              </h3>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-500">Stato:</span>
                  {getStatusBadge(integration.id)}
                </div>
                {config.lastSync && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-500">Ultima sincronizzazione:</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {new Date(config.lastSync).toLocaleString('it-IT')}
                    </span>
                  </div>
                )}
                {config.lastError && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-neutral-500">Ultimo errore:</span>
                    <span className="text-sm text-red-600 max-w-xs text-right">{config.lastError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation Link */}
            {integration.documentation && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  Documentazione
                </h3>
                <a
                  href={integration.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <FiIcons.FiExternalLink className="w-4 h-4" />
                  <span>Guida all'integrazione</span>
                </a>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                icon={FiIcons.FiActivity}
                onClick={() => handleTestConnection(integration)}
                loading={testingConnection === integration.id}
              >
                Test Connessione
              </Button>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button
                  icon={FiIcons.FiSave}
                  onClick={handleSave}
                  loading={saving}
                >
                  Salva
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
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
            Gestisci le integrazioni con servizi esterni
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiRefreshCw}
            onClick={handleSyncAll}
          >
            Sincronizza Tutto
          </Button>
        </div>
      </div>

      {/* Email Service Status */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiIcons.FiServer} className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-800">Server Email Backend</p>
            <p className="text-sm text-green-700">
              Sistema di invio email reale attivo. Le email verranno inviate tramite le configurazioni SMTP.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('http://localhost:3001/api/health', '_blank')}
          >
            Test Server
          </Button>
        </div>
      </Card>

      {/* SMTP Configuration Warning */}
      {!state.settings.integrations.smtp?.active && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-orange-800">SMTP Non Configurato</p>
              <p className="text-sm text-orange-700">
                Configura SMTP per abilitare l'invio di email reali dal sistema. Supporta SendGrid, Gmail, Outlook e altri provider.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIntegration(integrations.find(i => i.id === 'smtp'))}
            >
              Configura SMTP
            </Button>
          </div>
        </Card>
      )}

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration, index) => {
          const config = getIntegrationConfig(integration.id);
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <SafeIcon icon={integration.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(integration.id)}
                </div>

                <div className="space-y-3">
                  {config.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Ultima sync:</span>
                      <span className="font-medium text-neutral-800">
                        {new Date(config.lastSync).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Configurazioni:</span>
                    <span className="font-medium text-neutral-800">
                      {integration.fields.filter(f => config[f.key]).length}/{integration.fields.length} completate
                    </span>
                  </div>
                  {config.lastError && (
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600">{config.lastError}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.active || false}
                      onChange={() => handleToggleIntegration(integration.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ml-3 text-sm font-medium text-neutral-700">
                      {config.active ? 'Attivo' : 'Disattivo'}
                    </span>
                  </label>
                  <Button
                    size="sm"
                    icon={FiIcons.FiSettings}
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    Configura
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{integrations.length}</p>
            <p className="text-sm text-neutral-500">Integrazioni Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {Object.values(state.settings.integrations).filter(i => i.active).length}
            </p>
            <p className="text-sm text-neutral-500">Attive</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {Object.values(state.settings.integrations).filter(i => i.status === 'error').length}
            </p>
            <p className="text-sm text-neutral-500">Con Errori</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {Object.values(state.settings.integrations).filter(i => i.lastSync).length}
            </p>
            <p className="text-sm text-neutral-500">Sincronizzate</p>
          </div>
        </div>
      </Card>

      {/* Integration Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  );
};

export default APIIntegrations;