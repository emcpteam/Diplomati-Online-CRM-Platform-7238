import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';
import Card from './ui/Card';

const EmailSetupGuide = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('netlify');

  if (!isOpen) return null;

  const setupMethods = [
    {
      id: 'netlify',
      name: 'Netlify Functions',
      icon: FiIcons.FiCloud,
      difficulty: 'Facile',
      description: 'Soluzione serverless per Netlify (consigliata)'
    },
    {
      id: 'supabase',
      name: 'Supabase Edge Functions',
      icon: FiIcons.FiDatabase,
      difficulty: 'Medio',
      description: 'Usa Supabase per le funzioni backend'
    },
    {
      id: 'emailjs',
      name: 'EmailJS',
      icon: FiIcons.FiMail,
      difficulty: 'Molto Facile',
      description: 'Servizio email client-side'
    },
    {
      id: 'backend',
      name: 'Backend Custom',
      icon: FiIcons.FiServer,
      difficulty: 'Avanzato',
      description: 'Server Node.js personalizzato'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'netlify':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">✅ Setup Automatico Completato</h4>
              <p className="text-blue-700 text-sm">
                Le Netlify Functions sono già state create automaticamente nella cartella <code>netlify/functions/</code>
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800">Passaggi per l'attivazione:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-neutral-800">Deploy su Netlify</p>
                    <p className="text-sm text-neutral-600">Fai il deploy del progetto su Netlify per attivare le Functions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-neutral-800">Installa dipendenze</p>
                    <p className="text-sm text-neutral-600">Netlify installerà automaticamente <code>nodemailer</code></p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-neutral-800">Configura SMTP</p>
                    <p className="text-sm text-neutral-600">Vai su Integrazioni API e configura le tue credenziali SMTP</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                  <div>
                    <p className="font-medium text-green-800">Pronto!</p>
                    <p className="text-sm text-green-700">Le email verranno inviate tramite le Netlify Functions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">📋 Checklist Finale:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ Deploy fatto su Netlify</li>
                <li>✅ SMTP configurato nelle Integrazioni</li>
                <li>✅ Test di invio email completato</li>
              </ul>
            </div>
          </div>
        );

      case 'supabase':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🗄️ Supabase Edge Functions</h4>
              <p className="text-purple-700 text-sm">
                Usa Supabase per creare funzioni backend serverless
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800">Passaggi:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-neutral-800">Installa Supabase CLI</p>
                    <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block mt-1">npm install -g supabase</code>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-neutral-800">Crea Edge Function</p>
                    <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block mt-1">supabase functions new send-email</code>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-neutral-800">Deploy la funzione</p>
                    <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block mt-1">supabase functions deploy send-email</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'emailjs':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">📧 EmailJS Setup</h4>
              <p className="text-orange-700 text-sm">
                Servizio gratuito per inviare email direttamente dal frontend
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800">Passaggi:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-neutral-800">Registrati su EmailJS</p>
                    <p className="text-sm text-neutral-600">
                      Vai su <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">emailjs.com</a> e crea un account gratuito
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-neutral-800">Configura il servizio email</p>
                    <p className="text-sm text-neutral-600">Collega il tuo provider email (Gmail, Outlook, etc.)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-neutral-800">Aggiungi lo script</p>
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg text-green-400 text-sm font-mono">
                      &lt;script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"&gt;&lt;/script&gt;
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <p className="font-medium text-neutral-800">Configura le chiavi</p>
                    <p className="text-sm text-neutral-600">Sostituisci YOUR_SERVICE_ID, YOUR_TEMPLATE_ID e YOUR_PUBLIC_KEY nel codice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'backend':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Backend Custom</h4>
              <p className="text-red-700 text-sm">
                Richiede conoscenze avanzate di sviluppo backend
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800">Opzioni:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800">Node.js + Express</p>
                  <p className="text-sm text-neutral-600">Crea un server Express con endpoint /api/send-email</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800">Vercel Functions</p>
                  <p className="text-sm text-neutral-600">Usa Vercel per le serverless functions</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="font-medium text-neutral-800">AWS Lambda</p>
                  <p className="text-sm text-neutral-600">Implementa con AWS Lambda + API Gateway</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                📧 Guida Setup Email
              </h2>
              <p className="text-neutral-600">
                Configura l'invio email per il tuo CRM
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6">
          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {setupMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setActiveTab(method.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  activeTab === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={method.icon} className="w-6 h-6 text-primary-600" />
                  <span className="font-semibold text-neutral-800">{method.name}</span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{method.description}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  method.difficulty === 'Molto Facile' ? 'bg-green-100 text-green-800' :
                  method.difficulty === 'Facile' ? 'bg-blue-100 text-blue-800' :
                  method.difficulty === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {method.difficulty}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <Card className="p-6">
            {renderTabContent()}
          </Card>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              💡 Consiglio: Usa Netlify Functions per la massima compatibilità
            </div>
            <Button onClick={onClose}>
              Chiudi Guida
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailSetupGuide;