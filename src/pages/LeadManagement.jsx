import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import LeadEmailModal from '../components/modals/LeadEmailModal';
import LeadSMSModal from '../components/modals/LeadSMSModal';
import LeadNoteModal from '../components/modals/LeadNoteModal';
import LeadReminderModal from '../components/modals/LeadReminderModal';
import ConvertLeadModal from '../components/modals/ConvertLeadModal';
import { useApp } from '../context/AppContext';
import { sendEmail, emailTemplates, exportToCSV } from '../utils';
import toast from 'react-hot-toast';

const LeadManagement = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  const leadsPerPage = 9;
  const leads = state.leads || [];

  // Filter and sort leads
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      const matchesSource = filterSource === 'all' || lead.source === filterSource;
      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const currentLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  // Get unique sources for filter
  const sources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="primary">Nuovo</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contattato</Badge>;
      case 'qualified':
        return <Badge variant="success">Qualificato</Badge>;
      case 'converted':
        return <Badge variant="success">Convertito</Badge>;
      case 'lost':
        return <Badge variant="danger">Perso</Badge>;
      case 'da_ricontattare':
        return <Badge variant="warning">Da Ricontattare</Badge>;
      default:
        return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'google ads':
        return FiIcons.FiSearch;
      case 'facebook':
        return FiIcons.FiShare2;
      case 'instagram':
        return FiIcons.FiCamera;
      case 'website':
        return FiIcons.FiGlobe;
      case 'referral':
        return FiIcons.FiUsers;
      default:
        return FiIcons.FiHelpCircle;
    }
  };

  const handleStatusChange = (lead, newStatus) => {
    const updatedLead = {
      ...lead,
      status: newStatus,
      lastUpdate: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
    toast.success(`Status lead aggiornato a: ${newStatus}`);
  };

  const handleSendEmail = (lead) => {
    setSelectedLead(lead);
    setShowEmailModal(true);
  };

  const handleSendSMS = (lead) => {
    setSelectedLead(lead);
    setShowSMSModal(true);
  };

  const handleAddNote = (lead) => {
    setSelectedLead(lead);
    setShowNoteModal(true);
  };

  const handleSetReminder = (lead) => {
    setSelectedLead(lead);
    setShowReminderModal(true);
  };

  const handleConvertLead = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  const handleExport = () => {
    const data = filteredLeads.map(lead => ({
      Nome: lead.firstName,
      Cognome: lead.lastName,
      Email: lead.email,
      Telefono: lead.phone,
      'Piano di Studi': lead.studyPlan,
      'Anni da Recuperare': lead.yearsToRecover,
      Fonte: lead.source,
      Stato: lead.status,
      'Data Creazione': new Date(lead.createdAt).toLocaleDateString('it-IT'),
      'Ultimo Contatto': lead.lastContact ? new Date(lead.lastContact).toLocaleDateString('it-IT') : 'Mai',
      Città: lead.city,
      'Disponibilità': lead.availableTime
    }));

    exportToCSV(data, `lead-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Export completato con successo!');
  };

  const AddLeadModal = () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      studyPlan: '',
      yearsToRecover: 1,
      availableTime: 'Mattina',
      source: 'Website',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error('Compila tutti i campi obbligatori');
        return;
      }

      const newLead = {
        ...formData,
        id: Date.now(),
        status: 'new',
        createdAt: new Date().toISOString(),
        communications: [],
        tasks: []
      };

      dispatch({ type: 'ADD_LEAD', payload: newLead });
      toast.success('Lead aggiunto con successo!');
      setShowAddLeadModal(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowAddLeadModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Nuovo Lead</h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowAddLeadModal(false)} />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Cognome *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Telefono *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Città"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Piano di Studi"
                value={formData.studyPlan}
                onChange={(e) => setFormData({ ...formData, studyPlan: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Anni da Recuperare</label>
                <select
                  value={formData.yearsToRecover}
                  onChange={(e) => setFormData({ ...formData, yearsToRecover: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5].map(year => (
                    <option key={year} value={year}>{year} {year === 1 ? 'anno' : 'anni'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Disponibilità</label>
                <select
                  value={formData.availableTime}
                  onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Mattina">Mattina</option>
                  <option value="Pomeriggio">Pomeriggio</option>
                  <option value="Sera">Sera</option>
                  <option value="Weekend">Weekend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Fonte</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Website">Website</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Altro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Note</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Note aggiuntive..."
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
              <Button variant="outline" type="button" onClick={() => setShowAddLeadModal(false)}>
                Annulla
              </Button>
              <Button type="submit" icon={FiIcons.FiPlus}>
                Aggiungi Lead
              </Button>
            </div>
          </form>
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
            Gestione Lead
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i potenziali clienti e le conversioni
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={handleExport}>
            Esporta CSV
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddLeadModal(true)}>
            Nuovo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Cerca lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiIcons.FiSearch}
          />
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
            <option value="da_ricontattare">Da Ricontattare</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tutte le fonti</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Più recenti</option>
            <option value="oldest">Più vecchi</option>
            <option value="name">Per nome</option>
            <option value="status">Per stato</option>
          </select>
          <div className="text-sm text-neutral-500 flex items-center">
            {filteredLeads.length} di {leads.length} lead
          </div>
        </div>
      </Card>

      {/* Lead Cards Grid */}
      {currentLeads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-medium">
                        {lead.firstName[0]}{lead.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <p className="text-sm text-neutral-500">{lead.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(lead.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Piano di Studi:</span>
                    <span className="font-medium text-neutral-800">{lead.studyPlan || 'Non specificato'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Anni da recuperare:</span>
                    <Badge variant="secondary">{lead.yearsToRecover} {lead.yearsToRecover === 1 ? 'anno' : 'anni'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Fonte:</span>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={getSourceIcon(lead.source)} className="w-4 h-4 text-neutral-500" />
                      <span className="font-medium text-neutral-800">{lead.source || 'Sconosciuta'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Creato il:</span>
                    <span className="font-medium text-neutral-800">
                      {new Date(lead.createdAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {lead.city && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Città:</span>
                      <span className="font-medium text-neutral-800">{lead.city}</span>
                    </div>
                  )}
                  {lead.reminder && (
                    <div className="flex items-center space-x-2 text-sm">
                      <SafeIcon icon={FiIcons.FiClock} className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        Promemoria: {new Date(lead.reminder.datetime).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Change Dropdown */}
                <div className="mt-4">
                  <label className="block text-xs text-neutral-500 mb-2">Cambia Stato:</label>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="new">Nuovo</option>
                    <option value="contacted">Contattato</option>
                    <option value="qualified">Qualificato</option>
                    <option value="converted">Convertito</option>
                    <option value="lost">Perso</option>
                    <option value="da_ricontattare">Da Ricontattare</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiMail}
                      onClick={() => handleSendEmail(lead)}
                    >
                      Email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiMessageSquare}
                      onClick={() => handleSendSMS(lead)}
                    >
                      SMS
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiEdit3}
                      onClick={() => handleAddNote(lead)}
                    >
                      Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiClock}
                      onClick={() => handleSetReminder(lead)}
                    >
                      Promemoria
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiUserCheck}
                      onClick={() => handleConvertLead(lead)}
                      disabled={lead.status === 'converted'}
                    >
                      {lead.status === 'converted' ? 'Convertito' : 'Converti'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={FiIcons.FiPhone}
                      onClick={() => window.open(`tel:${lead.phone}`)}
                    >
                      Chiama
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiTarget} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            {leads.length === 0 ? 'Nessun lead presente' : 'Nessun lead trovato'}
          </h3>
          <p className="text-neutral-500 mb-6">
            {leads.length === 0 
              ? 'Aggiungi il primo lead per iniziare a gestire i potenziali clienti.'
              : 'Non ci sono lead che corrispondono ai filtri selezionati.'
            }
          </p>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddLeadModal(true)}>
            {leads.length === 0 ? 'Aggiungi Primo Lead' : 'Aggiungi Lead'}
          </Button>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Pagina {currentPage} di {totalPages} • {filteredLeads.length} lead totali
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={FiIcons.FiChevronLeft}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Precedente
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary-500 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={FiIcons.FiChevronRight}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Successivo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      {leads.length > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-neutral-800">{leads.length}</p>
              <p className="text-sm text-neutral-500">Lead Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {leads.filter(l => l.status === 'new').length}
              </p>
              <p className="text-sm text-neutral-500">Nuovi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-600">
                {leads.filter(l => l.status === 'contacted').length}
              </p>
              <p className="text-sm text-neutral-500">Contattati</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-600">
                {leads.filter(l => l.status === 'qualified').length}
              </p>
              <p className="text-sm text-neutral-500">Qualificati</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {leads.filter(l => l.status === 'converted').length}
              </p>
              <p className="text-sm text-neutral-500">Convertiti</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {leads.filter(l => l.status === 'da_ricontattare').length}
              </p>
              <p className="text-sm text-neutral-500">Da Ricontattare</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddLeadModal && <AddLeadModal />}
        {showEmailModal && selectedLead && (
          <LeadEmailModal
            lead={selectedLead}
            onClose={() => {
              setShowEmailModal(false);
              setSelectedLead(null);
            }}
            onEmailSent={(updatedLead) => {
              dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
            }}
          />
        )}
        {showSMSModal && selectedLead && (
          <LeadSMSModal
            lead={selectedLead}
            onClose={() => {
              setShowSMSModal(false);
              setSelectedLead(null);
            }}
          />
        )}
        {showNoteModal && selectedLead && (
          <LeadNoteModal
            lead={selectedLead}
            onClose={() => {
              setShowNoteModal(false);
              setSelectedLead(null);
            }}
            onNoteSaved={(updatedLead) => {
              dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
            }}
          />
        )}
        {showReminderModal && selectedLead && (
          <LeadReminderModal
            lead={selectedLead}
            onClose={() => {
              setShowReminderModal(false);
              setSelectedLead(null);
            }}
            onReminderSet={(updatedLead) => {
              dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
            }}
          />
        )}
        {showConvertModal && selectedLead && (
          <ConvertLeadModal
            lead={selectedLead}
            onClose={() => {
              setShowConvertModal(false);
              setSelectedLead(null);
            }}
            onConvert={(newStudent) => {
              // Lead will be updated in the modal
              toast.success('Lead convertito in studente con successo!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadManagement;