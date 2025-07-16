import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { sendEmail } from '../../utils/emailService';
import toast from 'react-hot-toast';

const LeadEmailModal = ({ lead, onClose, onEmailSent }) => {
  const { state, dispatch } = useApp();
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    template: null
  });

  const handleSendNow = async () => {
    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast.error('Inserisci oggetto e contenuto email');
      return;
    }
    
    setSending(true);
    
    try {
      // Get SMTP settings from state
      const smtpSettings = state.settings.integrations.smtp;
      
      // Check if SMTP is configured
      if (!smtpSettings || !smtpSettings.active) {
        toast.error('SMTP non configurato. Configura SMTP nelle Integrazioni API');
        setSending(false);
        return;
      }
      
      // Send the email
      await sendEmail(
        lead.email,
        emailData.subject,
        emailData.content,
        { smtp: smtpSettings }
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
      console.error('Email error:', error);
      toast.error('Errore nell\'invio email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // ... rest of the component code

  return (
    // ... component JSX
  );
};

export default LeadEmailModal;