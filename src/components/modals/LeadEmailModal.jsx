import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import { sendEmail, emailTemplates } from '../../utils/emailService';
import toast from 'react-hot-toast';

const LeadEmailModal = ({ lead, onClose, onEmailSent }) => {
  const { state, dispatch } = useApp();
  const [emailData, setEmailData] = useState({
    subject: `Informazioni corso ${lead.studyPlan} - Diplomati Online`,
    content: emailTemplates.leadWelcome(lead).content,
    template: 'leadWelcome',
    scheduledFor: null
  });
  const [sending, setSending] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const availableTemplates = [
    { id: 'leadWelcome', name: 'Benvenuto Lead', description: 'Email di benvenuto per nuovi lead' },
    { id: 'leadFollowUp', name: 'Follow-up', description: 'Email di follow-up per lead esistenti' },
    { id: 'custom', name: 'Personalizzata', description: 'Email completamente personalizzata' }
  ];

  const handleTemplateChange = (templateId) => {
    if (templateId === 'custom') {
      setEmailData(prev => ({ ...prev, template: templateId }));
      return;
    }

    const template = emailTemplates[templateId]?.(lead);
    if (template) {
      setEmailData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template: templateId
      }));
    }
  };

  const handleSendNow = async () => {
    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast.error('Inserisci oggetto e contenuto email');
      return;
    }

    setSending(true);
    try {
      await sendEmail(lead.email, emailData.subject, emailData.content, state.settings.emailSettings);

      // Add communication record
      const communication = {
        id: Date.now(),
        type: 'email',
        subject: emailData.subject,
        content: emailData.content,
        sentAt: new Date().toISOString(),
        status: 'sent',
        template: emailData.template
      };

      const updatedLead = {
        ...lead,
        communications: [...(lead.communications || []), communication],
        lastContact: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });

      if (onEmailSent) {
        onEmailSent(updatedLead, communication);
      }

      toast.success('Email inviata con successo!');
      onClose();
    } catch (error) {
      toast.error('Errore nell\'invio email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendLater = () => {
    if (!emailData.scheduledFor) {
      toast.error('Seleziona data e ora per programmazione');
      return;
    }

    // Save as scheduled email
    const scheduledEmail = {
      id: Date.now(),
      leadId: lead.id,
      type: 'email',
      subject: emailData.subject,
      content: emailData.content,
      scheduledFor: emailData.scheduledFor,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    // In a real app, you would save this to a scheduled emails collection
    toast.success('Email programmata con successo!');
    onClose();
  };

  const handleSave = () => {
    // Save as draft
    const draft = {
      id: Date.now(),
      leadId: lead.id,
      type: 'email',
      subject: emailData.subject,
      content: emailData.content,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    // In a real app, you would save this to a drafts collection
    toast.success('Bozza salvata!');
    onClose();
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea[name="content"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = emailData.content.substring(0, start) + variable + emailData.content.substring(end);
      setEmailData(prev => ({ ...prev, content: newContent }));
    }
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
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiMail} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Componi Email
                </h2>
                <p className="text-neutral-600">
                  A: {lead.firstName} {lead.lastName} ({lead.email})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsHtmlMode(!isHtmlMode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isHtmlMode 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {isHtmlMode ? 'HTML' : 'Testo'}
              </button>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Seleziona Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${
                    emailData.template === template.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <h4 className="font-medium text-neutral-800">{template.name}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Email Subject */}
          <Input
            label="Oggetto Email"
            value={emailData.subject}
            onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Inserisci oggetto email..."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Contenuto Email
                </label>
                {isHtmlMode && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertVariable('{{firstName}}')}
                    >
                      + Nome
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => insertVariable('{{studyPlan}}')}
                    >
                      + Corso
                    </Button>
                  </div>
                )}
              </div>
              
              {isHtmlMode ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => document.execCommand('bold')}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <SafeIcon icon={FiIcons.FiBold} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => document.execCommand('italic')}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <SafeIcon icon={FiIcons.FiItalic} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => document.execCommand('createLink', false, prompt('URL:'))}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <SafeIcon icon={FiIcons.FiLink} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    contentEditable
                    className="p-4 min-h-64 focus:outline-none"
                    dangerouslySetInnerHTML={{ __html: emailData.content }}
                    onInput={(e) => setEmailData(prev => ({ ...prev, content: e.target.innerHTML }))}
                  />
                </div>
              ) : (
                <textarea
                  name="content"
                  value={emailData.content}
                  onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Scrivi il contenuto dell'email..."
                  className="w-full h-64 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              )}
            </div>

            {/* Variables & Preview */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-neutral-800 mb-2">Variabili Disponibili</h4>
                <div className="space-y-2">
                  {[
                    { var: '{{firstName}}', desc: 'Nome lead' },
                    { var: '{{lastName}}', desc: 'Cognome lead' },
                    { var: '{{studyPlan}}', desc: 'Piano di studi' },
                    { var: '{{phone}}', desc: 'Telefono' },
                    { var: '{{yearsToRecover}}', desc: 'Anni da recuperare' }
                  ].map((item) => (
                    <button
                      key={item.var}
                      onClick={() => insertVariable(item.var)}
                      className="w-full text-left p-2 text-sm bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <code className="font-mono font-medium">{item.var}</code>
                      <p className="text-neutral-600 text-xs mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Info */}
              <div className="bg-blue-50 rounded-xl p-3">
                <h4 className="font-medium text-blue-800 mb-2">Info Lead</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><strong>Piano:</strong> {lead.studyPlan}</p>
                  <p><strong>Anni:</strong> {lead.yearsToRecover}</p>
                  <p><strong>Fonte:</strong> {lead.source}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Programmazione Invio (Opzionale)
            </label>
            <Input
              type="datetime-local"
              value={emailData.scheduledFor || ''}
              onChange={(e) => setEmailData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Email sarà inviata a: {lead.email}
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
                Salva
              </Button>
              {emailData.scheduledFor && (
                <Button 
                  variant="outline" 
                  icon={FiIcons.FiClock} 
                  onClick={handleSendLater}
                >
                  Programma
                </Button>
              )}
              <Button 
                icon={FiIcons.FiSend} 
                onClick={handleSendNow}
                loading={sending}
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

export default LeadEmailModal;