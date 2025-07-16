import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import HTMLEditor from '../components/HTMLEditor';
import { uploadFile, validateFile } from '../utils';
import toast from 'react-hot-toast';

const TemplateCreator = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Benvenuto Studenti',
      type: 'email',
      category: 'onboarding',
      lastEdited: '2024-01-15',
      content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0ea5e9;">Benvenuto in Diplomati Online!</h1>
        <p>Ciao {{firstName}},</p>
        <p>Siamo felici di averti con noi per il corso <strong>{{course}}</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2>📚 DETTAGLI ISCRIZIONE:</h2>
          <ul>
            <li><strong>Corso:</strong> {{course}}</li>
            <li><strong>Anni da recuperare:</strong> {{yearsToRecover}}</li>
            <li><strong>Data iscrizione:</strong> {{enrollmentDate}}</li>
          </ul>
        </div>
        <p>Cordiali saluti,<br><strong>Il team di Diplomati Online</strong></p>
      </div>`
    },
    {
      id: 2,
      name: 'Promemoria Pagamento',
      type: 'email',
      category: 'payments',
      lastEdited: '2024-01-20',
      content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b;">💰 Promemoria Pagamento</h1>
        <p>Ciao {{firstName}},</p>
        <p>Ti ricordiamo che hai un pagamento in sospeso per il corso <strong>{{course}}</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h2>💳 DETTAGLI PAGAMENTO:</h2>
          <ul>
            <li><strong>Importo totale:</strong> €{{totalAmount}}</li>
            <li><strong>Già pagato:</strong> €{{paidAmount}}</li>
            <li><strong>Rimanente:</strong> €{{remainingAmount}}</li>
          </ul>
        </div>
        <p>Grazie per la collaborazione,<br><strong>Il team di Diplomati Online</strong></p>
      </div>`
    },
    {
      id: 3,
      name: 'Contratto Standard',
      type: 'document',
      category: 'contracts',
      lastEdited: '2024-01-10',
      content: `<h1>CONTRATTO DI ISCRIZIONE</h1>
      <p>Tra Diplomati Online Srl e lo studente {{firstName}} {{lastName}}, si stipula il seguente contratto:</p>
      
      <h2>DATI STUDENTE:</h2>
      <p>Nome: {{firstName}} {{lastName}}<br>
      Codice Fiscale: {{codiceFiscale}}<br>
      Email: {{email}}<br>
      Telefono: {{phone}}</p>
      
      <h2>DETTAGLI CORSO:</h2>
      <p>Corso: {{course}}<br>
      Anni da Recuperare: {{yearsToRecover}}<br>
      Importo Totale: €{{totalAmount}}</p>
      
      <p>Data: {{currentDate}}</p>
      <p>Firma: ________________</p>`
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs = [
    { id: 'email', label: 'Email', icon: FiIcons.FiMail },
    { id: 'document', label: 'Documenti', icon: FiIcons.FiFileText },
    { id: 'sms', label: 'SMS', icon: FiIcons.FiMessageSquare }
  ];

  const filteredTemplates = templates.filter(
    template => 
      (template.type === activeTab) && 
      (template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo template?')) {
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template eliminato con successo!');
    }
  };

  const handleDuplicateTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copia)`,
      lastEdited: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, newTemplate]);
    toast.success('Template duplicato con successo!');
  };

  const TemplateEditorModal = ({ template, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: template?.name || '',
      type: template?.type || activeTab,
      category: template?.category || '',
      content: template?.content || '',
    });

    const variables = [
      { key: '{{firstName}}', label: 'Nome studente' },
      { key: '{{lastName}}', label: 'Cognome studente' },
      { key: '{{email}}', label: 'Email studente' },
      { key: '{{course}}', label: 'Nome corso' },
      { key: '{{yearsToRecover}}', label: 'Anni da recuperare' },
      { key: '{{enrollmentDate}}', label: 'Data iscrizione' },
      { key: '{{totalAmount}}', label: 'Importo totale' },
      { key: '{{paidAmount}}', label: 'Importo pagato' },
      { key: '{{remainingAmount}}', label: 'Importo rimanente' },
      { key: '{{currentDate}}', label: 'Data corrente' },
    ];

    const handleSave = () => {
      if (!formData.name.trim() || !formData.category.trim() || !formData.content.trim()) {
        toast.error('Compila tutti i campi obbligatori');
        return;
      }

      const updatedTemplate = {
        id: template?.id || Date.now(),
        ...formData,
        lastEdited: new Date().toISOString().split('T')[0]
      };

      if (template) {
        setTemplates(templates.map(t => t.id === template.id ? updatedTemplate : t));
        toast.success('Template aggiornato con successo!');
      } else {
        setTemplates([...templates, updatedTemplate]);
        toast.success('Template creato con successo!');
      }
      
      onSave(updatedTemplate);
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
          className="bg-white rounded-2xl shadow-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                {template ? 'Modifica Template' : 'Nuovo Template'}
              </h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Template *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome del template"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleziona categoria</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="payments">Pagamenti</option>
                  <option value="exams">Esami</option>
                  <option value="contracts">Contratti</option>
                  <option value="other">Altro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contenuto Template *
              </label>
              <HTMLEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                variables={variables}
                placeholder="Inserisci il contenuto del template..."
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Variabili Disponibili</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variables.map((variable) => (
                      <Badge key={variable.key} variant="primary">
                        {variable.key}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button icon={FiIcons.FiSave} onClick={handleSave}>
                {template ? 'Aggiorna' : 'Salva'} Template
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
            Template Manager
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i template per email, documenti e comunicazioni
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            icon={FiIcons.FiPlus}
            onClick={() => {
              setSelectedTemplate(null);
              setShowCreateModal(true);
            }}
          >
            Nuovo Template
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <Input
            placeholder="Cerca template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiIcons.FiSearch}
            className="md:w-64"
          />
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <SafeIcon
                    icon={
                      template.type === 'email'
                        ? FiIcons.FiMail
                        : template.type === 'document'
                        ? FiIcons.FiFileText
                        : FiIcons.FiMessageSquare
                    }
                    className="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 line-clamp-1">{template.name}</h3>
                  <p className="text-sm text-neutral-500 capitalize">{template.category}</p>
                </div>
              </div>
              <Badge
                variant={
                  template.type === 'email'
                    ? 'primary'
                    : template.type === 'document'
                    ? 'secondary'
                    : 'success'
                }
              >
                {template.type}
              </Badge>
            </div>

            <div className="h-32 overflow-hidden bg-neutral-50 rounded-lg p-3 mb-4 text-sm text-neutral-600">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: template.content.substring(0, 200) + '...' }}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
              <span>Ultima modifica:</span>
              <span>{template.lastEdited}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiIcons.FiCopy}
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  Duplica
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiIcons.FiTrash2}
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Elimina
                </Button>
              </div>
              <Button
                size="sm"
                icon={FiIcons.FiEdit}
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowCreateModal(true);
                }}
              >
                Modifica
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={
              activeTab === 'email'
                ? FiIcons.FiMail
                : activeTab === 'document'
                ? FiIcons.FiFileText
                : FiIcons.FiMessageSquare
            } className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Nessun template trovato
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm ? 'Nessun risultato per la tua ricerca.' : `Non hai ancora creato template per ${
              activeTab === 'email' ? 'email' : activeTab === 'document' ? 'documenti' : 'SMS'
            }.`}
          </p>
          <Button
            icon={FiIcons.FiPlus}
            onClick={() => {
              setSelectedTemplate(null);
              setShowCreateModal(true);
            }}
          >
            Crea Primo Template
          </Button>
        </Card>
      )}

      {/* Template Editor Modal */}
      {showCreateModal && (
        <TemplateEditorModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSave={(updatedTemplate) => {
            console.log('Template saved:', updatedTemplate);
          }}
        />
      )}
    </div>
  );
};

export default TemplateCreator;