import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import LeadNoteModal from '../components/modals/LeadNoteModal';
import LeadReminderModal from '../components/modals/LeadReminderModal';
import LeadEmailModal from '../components/modals/LeadEmailModal';
import ConvertLeadModal from '../components/modals/ConvertLeadModal';
import { useApp } from '../context/AppContext';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { sendEmail } from '../utils/emailService';
import toast from 'react-hot-toast';

const LeadManagement = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const filteredLeads = state.leads
    .filter(lead => {
      const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge variant="primary">Nuovo</Badge>;
      case 'contacted': return <Badge variant="warning">Contattato</Badge>;
      case 'qualified': return <Badge variant="success">Qualificato</Badge>;
      case 'converted': return <Badge variant="success">Convertito</Badge>;
      case 'lost': return <Badge variant="danger">Perso</Badge>;
      case 'da_ricontattare': return <Badge variant="warning">Da Ricontattare</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Google Ads': return FiIcons.FiSearch;
      case 'Facebook': return FiIcons.FiFacebook;
      case 'Instagram': return FiIcons.FiInstagram;
      case 'Referral': return FiIcons.FiUsers;
      default: return FiIcons.FiGlobe;
    }
  };

  const updateLeadStatus = (leadId, newStatus) => {
    if (newStatus === 'da_ricontattare') {
      const lead = state.leads.find(l => l.id === leadId);
      setSelectedLead(lead);
      setShowReminderModal(true);
    } else {
      dispatch({ type: 'UPDATE_LEAD', payload: { id: leadId, status: newStatus } });
      toast.success('Status lead aggiornato!');
    }
  };

  const handleConvertLead = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  const handleConvertSuccess = (newStudent) => {
    toast.success(`Lead convertito! Vai alla pagina studente?`, {
      action: {
        label: 'Vai allo Studente',
        onClick: () => navigate(`/students/${newStudent.id}`)
      },
      duration: 6000
    });
  };

  const handleSyncZapier = () => {
    toast.loading('Sincronizzazione in corso...', { id: 'sync' });
    setTimeout(() => {
      const newLeads = [
        {
          id: Date.now(),
          firstName: 'Lucia',
          lastName: 'Verdi',
          email: 'lucia.verdi@email.com',
          phone: '+39 345 678 9012',
          city: 'Firenze',
          studyPlan: 'Diploma Artistico',
          yearsToRecover: 2,
          availableTime: 'Pomeriggio',
          status: 'new',
          source: 'Google Ads',
          createdAt: new Date().toISOString(),
          assignedTo: null,
          notes: 'Interessata al corso artistico',
          communications: []
        }
      ];

      newLeads.forEach(lead => {
        dispatch({ type: 'ADD_LEAD', payload: lead });
      });

      toast.success(`Sincronizzazione completata! ${newLeads.length} nuovi lead importati.`, { id: 'sync' });
    }, 2000);
  };

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Cognome', 'Email', 'Telefono', 'Città', 'Piano Studi', 'Status', 'Fonte', 'Data Creazione'],
      ...state.leads.map(lead => [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.city,
        lead.studyPlan,
        lead.status,
        lead.source,
        new Date(lead.createdAt).toLocaleDateString('it-IT')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lead-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      availableTime: 'Sera',
      source: 'Manuale',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        toast.error('Compila i campi obbligatori');
        return;
      }

      const newLead = {
        id: Date.now(),
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString(),
        assignedTo: null,
        communications: []
      };

      dispatch({ type: 'ADD_LEAD', payload: newLead });
      toast.success('Lead aggiunto con successo!');
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        studyPlan: '',
        yearsToRecover: 1,
        availableTime: 'Sera',
        source: 'Manuale',
        notes: ''
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowAddModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Aggiungi Nuovo Lead</h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowAddModal(false)} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              <Input
                label="Anni da Recuperare"
                type="number"
                min="1"
                max="5"
                value={formData.yearsToRecover}
                onChange={(e) => setFormData({ ...formData, yearsToRecover: parseInt(e.target.value) })}
              />
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
                  <option value="Manuale">Manuale</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Sito Web">Sito Web</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Note</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Note aggiuntive..."
                className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowAddModal(false)}
              >
                Annulla
              </Button>
              <Button type="submit" icon={FiIcons.FiSave}>
                Salva Lead
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const QuoteBuilder = ({ lead, onClose }) => {
    const [quote, setQuote] = useState({
      studentName: `${lead.firstName} ${lead.lastName}`,
      course: '',
      paymentMethod: 'wire_transfer',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      promoPrice: 0,
      basePrice: 2800,
      advancePayment: 0,
      installments: 12,
      installmentAmount: 0,
      startDate: '',
      endDate: ''
    });

    React.useEffect(() => {
      if (quote.paymentMethod === 'hybrid' && quote.installments > 0) {
        const remaining = (quote.basePrice - quote.promoPrice - quote.advancePayment);
        setQuote(prev => ({
          ...prev,
          installmentAmount: Math.round(remaining / quote.installments)
        }));
      }
    }, [quote.basePrice, quote.promoPrice, quote.advancePayment, quote.installments, quote.paymentMethod]);

    const handleCourseChange = (courseName) => {
      const selectedCourse = state.courses.find(c => c.name === courseName);
      setQuote(prev => ({
        ...prev,
        course: courseName,
        basePrice: selectedCourse ? selectedCourse.price : 2800
      }));
    };

    const handleGenerateQuote = () => {
      if (!quote.course) {
        toast.error('Seleziona un corso');
        return;
      }

      generateQuotePDF(quote);
      toast.success('Preventivo generato e scaricato!');
      updateLeadStatus(lead.id, 'qualified');
      onClose();
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
          className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                Genera Preventivo
              </h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Studente"
                value={quote.studentName}
                onChange={(e) => setQuote({ ...quote, studentName: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Corso *</label>
                <select
                  value={quote.course}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleziona Corso</option>
                  {state.courses.map(course => (
                    <option key={course.id} value={course.name}>
                      {course.name} - €{course.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Metodo di Pagamento
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wire_transfer"
                    checked={quote.paymentMethod === 'wire_transfer'}
                    onChange={(e) => setQuote({ ...quote, paymentMethod: e.target.value })}
                    className="text-primary-600"
                  />
                  <span>Bonifico Completo</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="financing"
                    checked={quote.paymentMethod === 'financing'}
                    onChange={(e) => setQuote({ ...quote, paymentMethod: e.target.value })}
                    className="text-primary-600"
                  />
                  <span>Finanziamento Banca Sella</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="hybrid"
                    checked={quote.paymentMethod === 'hybrid'}
                    onChange={(e) => setQuote({ ...quote, paymentMethod: e.target.value })}
                    className="text-primary-600"
                  />
                  <span>Piano Ibrido</span>
                </label>
              </div>
            </div>

            {quote.paymentMethod === 'hybrid' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
                <h4 className="font-medium text-blue-800">Configurazione Piano Ibrido</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Anticipo (€)"
                    type="number"
                    value={quote.advancePayment}
                    onChange={(e) => setQuote({ ...quote, advancePayment: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max={quote.basePrice - quote.promoPrice}
                  />
                  <Input
                    label="Numero Rate"
                    type="number"
                    value={quote.installments}
                    onChange={(e) => setQuote({ ...quote, installments: parseInt(e.target.value) || 12 })}
                    min="1"
                    max="36"
                  />
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-neutral-800 mb-2">Riepilogo Piano Ibrido</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Anticipo:</span>
                      <span className="font-medium">€{quote.advancePayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importo da rateizzare:</span>
                      <span className="font-medium">€{quote.basePrice - quote.promoPrice - quote.advancePayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importo per rata:</span>
                      <span className="font-medium">€{quote.installmentAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Valido fino al"
                type="date"
                value={quote.validUntil}
                onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
              />
              <Input
                label="Sconto Promo (€)"
                type="number"
                value={quote.promoPrice}
                onChange={(e) => setQuote({ ...quote, promoPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl">
              <h3 className="font-medium text-neutral-800 mb-2">Riepilogo Preventivo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prezzo Base:</span>
                  <span>€{quote.basePrice}</span>
                </div>
                {quote.promoPrice > 0 && (
                  <div className="flex justify-between text-accent-600">
                    <span>Sconto Promo:</span>
                    <span>-€{quote.promoPrice}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Totale:</span>
                  <span>€{quote.basePrice - quote.promoPrice}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button icon={FiIcons.FiDownload} onClick={handleGenerateQuote}>
                Genera PDF
              </Button>
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
            Gestione Lead
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i lead ricevuti da Google/Meta via Zapier
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={handleExport}>
            Esporta
          </Button>
          <Button variant="outline" icon={FiIcons.FiRefreshCw} onClick={handleSyncZapier}>
            Sincronizza
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddModal(true)}>
            Nuovo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Cerca lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiIcons.FiSearch}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="new">Nuovi</option>
            <option value="contacted">Contattati</option>
            <option value="qualified">Qualificati</option>
            <option value="converted">Convertiti</option>
            <option value="da_ricontattare">Da Ricontattare</option>
            <option value="lost">Persi</option>
          </select>
          <Button variant="outline" icon={FiIcons.FiFilter}>
            Filtri Avanzati
          </Button>
        </div>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead, index) => (
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
                  <span className="text-neutral-500">Piano di studi:</span>
                  <span className="font-medium text-neutral-800">{lead.studyPlan}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Anni da recuperare:</span>
                  <span className="font-medium text-neutral-800">{lead.yearsToRecover}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Città:</span>
                  <span className="font-medium text-neutral-800">{lead.city}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Fonte:</span>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={getSourceIcon(lead.source)} className="w-4 h-4 text-neutral-500" />
                    <span className="font-medium text-neutral-800">{lead.source}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Ricevuto:</span>
                  <span className="font-medium text-neutral-800">
                    {new Date(lead.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiPhone}
                    onClick={() => window.open(`tel:${lead.phone}`)}
                  >
                    Chiama
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiMail}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowEmailModal(true);
                    }}
                  >
                    Email
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiFileText}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowQuoteBuilder(true);
                    }}
                  >
                    Preventivo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiEdit3}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowNoteModal(true);
                    }}
                  >
                    Note
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="text-xs px-2 py-1 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="new">Nuovo</option>
                    <option value="contacted">Contattato</option>
                    <option value="qualified">Qualificato</option>
                    <option value="converted">Convertito</option>
                    <option value="da_ricontattare">Da Ricontattare</option>
                    <option value="lost">Perso</option>
                  </select>

                  {lead.status !== 'converted' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiUserCheck}
                      onClick={() => handleConvertLead(lead)}
                      className="text-accent-600 hover:text-accent-700"
                    >
                      Converti
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiExternalLink}
                      onClick={() => {
                        if (lead.convertedToStudentId) {
                          navigate(`/students/${lead.convertedToStudentId}`);
                        }
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Studente
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
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
          <Button icon={FiIcons.FiRefreshCw} onClick={handleSyncZapier}>
            Sincronizza da Zapier
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <AddLeadModal />}
        {showQuoteBuilder && selectedLead && (
          <QuoteBuilder
            lead={selectedLead}
            onClose={() => {
              setShowQuoteBuilder(false);
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
            onReminderSet={(updatedLead, calendarUrl) => {
              dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
            }}
          />
        )}
        {showEmailModal && selectedLead && (
          <LeadEmailModal
            lead={selectedLead}
            onClose={() => {
              setShowEmailModal(false);
              setSelectedLead(null);
            }}
            onEmailSent={(updatedLead, communication) => {
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
            onConvert={handleConvertSuccess}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{state.leads.length}</p>
            <p className="text-sm text-neutral-500">Lead Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {state.leads.filter(l => l.status === 'new').length}
            </p>
            <p className="text-sm text-neutral-500">Nuovi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning-600">
              {state.leads.filter(l => l.status === 'contacted').length}
            </p>
            <p className="text-sm text-neutral-500">Contattati</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.leads.filter(l => l.status === 'qualified').length}
            </p>
            <p className="text-sm text-neutral-500">Qualificati</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {state.leads.filter(l => l.status === 'converted').length}
            </p>
            <p className="text-sm text-neutral-500">Convertiti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {state.leads.length > 0 ? ((state.leads.filter(l => l.status === 'converted').length / state.leads.length) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-neutral-500">Tasso Conversione</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LeadManagement;