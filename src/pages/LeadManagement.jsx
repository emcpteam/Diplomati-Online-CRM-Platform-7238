import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { sendEmail, emailTemplates } from '../utils/emailService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const LeadManagement = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState(null);

  const handleSendEmail = async (lead, template) => {
    const toastId = toast.loading('Invio email in corso...');
    try {
      // Get the template data
      const emailData = emailTemplates[template](lead);
      
      // Get SMTP settings from state
      const smtpSettings = state.settings.integrations.smtp;
      
      // Check if SMTP is configured
      if (!smtpSettings || !smtpSettings.active) {
        toast.error('SMTP non configurato. Configura SMTP nelle Integrazioni API', { id: toastId });
        return;
      }
      
      // Send the email using the SMTP settings
      await sendEmail(
        lead.email,
        emailData.subject,
        emailData.content,
        { smtp: smtpSettings }
      );
      
      // Update lead record with communication
      const updatedLead = {
        ...lead,
        communications: [
          ...(lead.communications || []),
          {
            id: Date.now(),
            type: 'email',
            subject: emailData.subject,
            sentAt: new Date().toISOString(),
            status: 'sent',
          },
        ],
        lastContact: new Date().toISOString()
      };
      
      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      console.error('Email error:', error);
      toast.error(`Errore durante l'invio dell'email: ${error.message}`, { id: toastId });
    }
  };

  // Filter leads based on search term and status filter
  const filteredLeads = state.leads ? state.leads.filter(lead => {
    const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Gestione Lead
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i potenziali clienti e le conversioni
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            icon={FiIcons.FiDownload}
            onClick={() => toast.success('Export completato!')}
          >
            Esporta
          </Button>
          <Button icon={FiIcons.FiPlus}>
            Nuovo Lead
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Cerca lead..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              icon={FiIcons.FiSearch} 
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="new">Nuovi</option>
            <option value="contacted">Contattati</option>
            <option value="qualified">Qualificati</option>
            <option value="converted">Convertiti</option>
            <option value="lost">Persi</option>
          </select>
        </div>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => (
            <Card key={lead.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-medium">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-800">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <span>{lead.email}</span>
                      <span>•</span>
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      lead.status === 'new' ? 'primary' :
                      lead.status === 'contacted' ? 'secondary' :
                      lead.status === 'qualified' ? 'success' :
                      lead.status === 'converted' ? 'accent' :
                      'warning'
                    }
                  >
                    {lead.status === 'new' ? 'Nuovo' :
                     lead.status === 'contacted' ? 'Contattato' :
                     lead.status === 'qualified' ? 'Qualificato' :
                     lead.status === 'converted' ? 'Convertito' :
                     'Perso'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={FiIcons.FiMail}
                    onClick={() => handleSendEmail(lead, 'welcome')}
                  >
                    Email
                  </Button>
                  <Button variant="ghost" size="sm" icon={FiIcons.FiEye}>
                    Dettagli
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-neutral-500">Piano di Studi</span>
                    <p className="font-medium text-neutral-800">{lead.studyPlan || 'Non specificato'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Fonte</span>
                    <p className="font-medium text-neutral-800">{lead.source || 'Sconosciuta'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">Creato il</span>
                    <p className="font-medium text-neutral-800">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('it-IT') : 'N/D'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiIcons.FiTarget} className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">
              Nessun lead trovato
            </h3>
            <p className="text-neutral-500 mb-6">
              Non ci sono lead che corrispondono ai filtri selezionati.
            </p>
            <Button icon={FiIcons.FiPlus}>
              Aggiungi Primo Lead
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadManagement;