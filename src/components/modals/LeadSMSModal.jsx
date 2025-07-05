import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import { sendSMS } from '../../utils/emailService';
import toast from 'react-hot-toast';

const LeadSMSModal = ({ lead, onClose, onSmsSent }) => {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState(`Ciao ${lead.firstName}, grazie per l'interesse in Diplomati Online! Ti contatteremo presto per maggiori informazioni sul corso ${lead.studyPlan}.`);
  const [sending, setSending] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);

  const maxLength = 160;
  const remainingChars = maxLength - message.length;

  const quickTemplates = [
    `Ciao ${lead.firstName}! Grazie per l'interesse. Ti contatteremo presto per ${lead.studyPlan}. Info: 02-1234567`,
    `${lead.firstName}, la tua richiesta per ${lead.studyPlan} è stata ricevuta. Chiamaci per un preventivo gratuito: 02-1234567`,
    `Ciao ${lead.firstName}! Offerta speciale per ${lead.studyPlan}. Sconto 10% se chiami entro oggi: 02-1234567`,
    `${lead.firstName}, ti ricordiamo la tua richiesta per ${lead.studyPlan}. Contattaci per non perdere il posto: 02-1234567`
  ];

  const handleSendNow = async () => {
    if (!message.trim()) {
      toast.error('Inserisci un messaggio');
      return;
    }

    if (message.length > maxLength) {
      toast.error(`Il messaggio è troppo lungo (max ${maxLength} caratteri)`);
      return;
    }

    setSending(true);
    try {
      await sendSMS(lead.phone, message, state.settings.smsSettings);

      // Add communication record
      const communication = {
        id: Date.now(),
        type: 'sms',
        message: message,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      const updatedLead = {
        ...lead,
        communications: [...(lead.communications || []), communication],
        lastContact: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });

      if (onSmsSent) {
        onSmsSent(updatedLead, communication);
      }

      toast.success('SMS inviato con successo!');
      onClose();
    } catch (error) {
      toast.error('Errore nell\'invio SMS: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSave = () => {
    // Save as draft
    const draft = {
      id: Date.now(),
      leadId: lead.id,
      type: 'sms',
      message: message,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    // In a real app, you would save this to a drafts collection
    toast.success('Bozza salvata!');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiMessageSquare} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Invia SMS
                </h2>
                <p className="text-neutral-600">
                  A: {lead.firstName} {lead.lastName} ({lead.phone})
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Template Rapidi
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(template)}
                  className="text-left p-3 text-sm bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Message Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">
                Messaggio SMS
              </label>
              <span className={`text-sm ${remainingChars < 0 ? 'text-red-600' : 'text-neutral-500'}`}>
                {remainingChars} caratteri rimanenti
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi il tuo messaggio SMS..."
              className={`w-full h-32 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 resize-none ${
                remainingChars < 0 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-neutral-200 focus:ring-primary-500'
              }`}
            />
          </div>

          {/* Message Preview */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <h4 className="font-medium text-neutral-800 mb-2">Anteprima SMS</h4>
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiMessageSquare} className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-800">{message || 'Il tuo messaggio apparirà qui...'}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Da: Diplomati Online • A: {lead.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-2">Informazioni Lead</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Piano di Studi:</span>
                <p className="font-medium text-blue-800">{lead.studyPlan}</p>
              </div>
              <div>
                <span className="text-blue-600">Fonte:</span>
                <p className="font-medium text-blue-800">{lead.source}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={saveTemplate}
                  onChange={(e) => setSaveTemplate(e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">Salva come template</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                variant="outline" 
                icon={FiIcons.FiSave} 
                onClick={handleSave}
              >
                Salva Bozza
              </Button>
              <Button 
                icon={FiIcons.FiSend} 
                onClick={handleSendNow}
                loading={sending}
                disabled={!message.trim() || remainingChars < 0}
              >
                Invia Ora
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeadSMSModal;