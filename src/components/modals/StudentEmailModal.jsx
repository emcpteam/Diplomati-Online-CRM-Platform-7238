import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { sendEmail, emailTemplates } from '../../utils/emailService';
import toast from 'react-hot-toast';

const StudentEmailModal = ({ student, onClose, onEmailSent }) => {
  const { dispatch } = useApp();
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    template: null
  });

  const handleTemplateSelect = (templateName) => {
    const template = emailTemplates[templateName](student);
    setEmailData({
      subject: template.subject,
      content: template.content,
      template: templateName
    });
  };

  const handleSendNow = async () => {
    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast.error('Inserisci oggetto e contenuto email');
      return;
    }

    setSending(true);
    try {
      // Send email
      await sendEmail(
        student.email,
        emailData.subject,
        emailData.content
      );

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

      const updatedStudent = {
        ...student,
        communications: [...(student.communications || []), communication]
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });

      if (onEmailSent) {
        onEmailSent(updatedStudent, communication);
      }

      toast.success('Email inviata con successo!');
      onClose();
    } catch (error) {
      console.error('Email error:', error);
      toast.error(`Errore nell'invio email: ${error.message}`);
    } finally {
      setSending(false);
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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <FiIcons.FiMail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Invia Email
                </h2>
                <p className="text-neutral-600">
                  {student.firstName} {student.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Template Email
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTemplateSelect('welcome')}
                className="p-4 border-2 rounded-xl hover:border-primary-500 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <FiIcons.FiUserPlus className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Benvenuto</span>
                </div>
                <p className="text-sm text-neutral-500">
                  Email di benvenuto per nuovi studenti
                </p>
              </button>
              
              <button
                onClick={() => handleTemplateSelect('paymentReminder')}
                className="p-4 border-2 rounded-xl hover:border-primary-500 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <FiIcons.FiDollarSign className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Promemoria Pagamento</span>
                </div>
                <p className="text-sm text-neutral-500">
                  Sollecito per pagamenti in sospeso
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Oggetto Email *
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Inserisci oggetto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Contenuto Email *
            </label>
            <textarea
              value={emailData.content}
              onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
              className="w-full h-64 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Scrivi il contenuto dell'email..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <FiIcons.FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  L'email verrà inviata a: <strong>{student.email}</strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Puoi utilizzare i template predefiniti o personalizzare il contenuto.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              icon={FiIcons.FiSend}
              onClick={handleSendNow}
              loading={sending}
              disabled={!emailData.subject.trim() || !emailData.content.trim()}
            >
              Invia Ora
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentEmailModal;