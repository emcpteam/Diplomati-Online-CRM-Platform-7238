import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const InternalTools = () => {
  const [activeTab, setActiveTab] = useState('course-creation');
  const [courseProgress, setCourseProgress] = useState({
    name: 'Diploma Turistico',
    progress: 75,
    tasks: [
      { id: 1, name: 'Definizione materie', completed: true, deadline: '2024-01-15' },
      { id: 2, name: 'Creazione contenuti', completed: true, deadline: '2024-01-20' },
      { id: 3, name: 'Setup piattaforma', completed: true, deadline: '2024-01-25' },
      { id: 4, name: 'Test funzionalità', completed: false, deadline: '2024-01-30' },
      { id: 5, name: 'Pubblicazione', completed: false, deadline: '2024-02-01' },
    ]
  });

  const [autocompleteFields, setAutocompleteFields] = useState({
    subjects: ['Matematica', 'Fisica', 'Chimica', 'Biologia', 'Italiano', 'Storia', 'Filosofia', 'Inglese', 'Francese', 'Spagnolo'],
    courses: ['Diploma Scientifico', 'Diploma Linguistico', 'Diploma Tecnico', 'Diploma Classico'],
    cities: ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze'],
  });

  const [newField, setNewField] = useState({ category: 'subjects', value: '' });

  const tabs = [
    { id: 'course-creation', label: 'Creazione Corsi', icon: FiIcons.FiBookOpen },
    { id: 'autocomplete', label: 'Campi Autocomplete', icon: FiIcons.FiEdit3 },
    { id: 'lead-recycle', label: 'Riciclo Lead', icon: FiIcons.FiRecycle },
    { id: 'import-export', label: 'Import/Export', icon: FiIcons.FiDatabase },
    { id: 'pdf-tools', label: 'Strumenti PDF', icon: FiIcons.FiFileText },
    { id: 'file-repository', label: 'Repository File', icon: FiIcons.FiFolderOpen },
    { id: 'versioning', label: 'Versioning', icon: FiIcons.FiGitCommit },
  ];

  const handleAddAutocompleteField = () => {
    if (!newField.value.trim()) return;
    
    setAutocompleteFields(prev => ({
      ...prev,
      [newField.category]: [...prev[newField.category], newField.value]
    }));
    
    setNewField({ ...newField, value: '' });
    toast.success('Campo aggiunto con successo!');
  };

  const handleRemoveAutocompleteField = (category, index) => {
    setAutocompleteFields(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
    toast.success('Campo rimosso con successo!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'course-creation':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Corso in Creazione: {courseProgress.name}
              </h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-500">Progresso Completamento</span>
                  <span className="text-sm font-medium text-neutral-800">{courseProgress.progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-800">Lista Attività</h4>
                {courseProgress.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.completed ? 'bg-accent-500' : 'bg-neutral-300'
                      }`}>
                        {task.completed && (
                          <SafeIcon icon={FiIcons.FiCheck} className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-neutral-600 line-through' : 'text-neutral-800'}`}>
                          {task.name}
                        </p>
                        <p className="text-sm text-neutral-500">Scadenza: {task.deadline}</p>
                      </div>
                    </div>
                    <Badge variant={task.completed ? 'success' : 'warning'}>
                      {task.completed ? 'Completata' : 'In corso'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'autocomplete':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Configurazione Campi Autocomplete
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                  value={newField.category}
                  onChange={(e) => setNewField({...newField, category: e.target.value})}
                  className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="subjects">Materie</option>
                  <option value="courses">Corsi</option>
                  <option value="cities">Città</option>
                </select>
                <Input
                  placeholder="Nuovo valore..."
                  value={newField.value}
                  onChange={(e) => setNewField({...newField, value: e.target.value})}
                />
                <Button icon={FiIcons.FiPlus} onClick={handleAddAutocompleteField}>
                  Aggiungi
                </Button>
              </div>

              {Object.entries(autocompleteFields).map(([category, fields]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-medium text-neutral-800 mb-3 capitalize">
                    {category === 'subjects' ? 'Materie' : category === 'courses' ? 'Corsi' : 'Città'} ({fields.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <span className="text-sm font-medium text-neutral-800">{field}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FiIcons.FiX}
                          onClick={() => handleRemoveAutocompleteField(category, index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        );

      case 'lead-recycle':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Centro Riciclo Lead
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Lead Inattivi (30+ giorni)</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Marco Bianchi', days: 45, source: 'Google Ads' },
                      { name: 'Anna Rossi', days: 38, source: 'Facebook' },
                      { name: 'Luigi Verdi', days: 52, source: 'Instagram' },
                    ].map((lead, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div>
                          <p className="font-medium text-neutral-800">{lead.name}</p>
                          <p className="text-sm text-neutral-500">{lead.days} giorni fa • {lead.source}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" icon={FiIcons.FiMail}>
                            Email
                          </Button>
                          <Button variant="ghost" size="sm" icon={FiIcons.FiMessageSquare}>
                            SMS
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Azioni Automatiche</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" icon={FiIcons.FiMail}>
                      Invia Email Riattivazione
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiMessageSquare}>
                      Invia SMS Promozionale
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiTag}>
                      Applica Tag "Ricontatto"
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiUserPlus}>
                      Assegna a Sales Manager
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'import-export':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Strumenti Import/Export
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Importa Dati</h4>
                  <div className="space-y-3">
                    <Button variant="outline" icon={FiIcons.FiUpload} className="w-full justify-start">
                      Importa Studenti (Excel/CSV)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiUpload} className="w-full justify-start">
                      Importa Lead (Google Sheets)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiUpload} className="w-full justify-start">
                      Importa Scuole (CSV)
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Esporta Dati</h4>
                  <div className="space-y-3">
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Tutti gli Studenti
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Report Pagamenti
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Analytics Lead
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'pdf-tools':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Generatore Documenti PDF
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Contratto Iscrizione</span>
                </Button>
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Preventivo Personalizzato</span>
                </Button>
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Certificato Corso</span>
                </Button>
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Ricevuta Pagamento</span>
                </Button>
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Lettera Scuola</span>
                </Button>
                <Button variant="outline" icon={FiIcons.FiFileText} className="h-24 flex-col">
                  <span className="mt-2">Report Mensile</span>
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'file-repository':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Repository Documenti
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Contratti Studenti', files: 45, size: '12.3 MB', type: 'folder' },
                  { name: 'Documenti Scuole', files: 23, size: '8.7 MB', type: 'folder' },
                  { name: 'Template Email', files: 15, size: '2.1 MB', type: 'folder' },
                  { name: 'Backup Database', files: 1, size: '156.8 MB', type: 'file' },
                  { name: 'Log Sistema', files: 30, size: '45.2 MB', type: 'folder' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <SafeIcon 
                        icon={item.type === 'folder' ? FiIcons.FiFolderOpen : FiIcons.FiFile} 
                        className="w-6 h-6 text-primary-600" 
                      />
                      <div>
                        <p className="font-medium text-neutral-800">{item.name}</p>
                        <p className="text-sm text-neutral-500">
                          {item.files} {item.type === 'folder' ? 'file' : 'elemento'} • {item.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" icon={FiIcons.FiDownload} />
                      <Button variant="ghost" size="sm" icon={FiIcons.FiShare2} />
                      <Button variant="ghost" size="sm" icon={FiIcons.FiMoreVertical} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'versioning':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Sistema di Versioning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-xl border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary-800">Versione Corrente</h4>
                      <Badge variant="primary">v1.0.0</Badge>
                    </div>
                    <p className="text-sm text-primary-700 mt-2">
                      Sistema base con tutte le funzionalità principali
                    </p>
                    <p className="text-xs text-primary-600 mt-1">
                      Rilasciato il 20 Gennaio 2024
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-800">Storico Versioni</h4>
                    {[
                      { version: 'v0.9.5', date: '15 Gen 2024', changes: 'Bugfix sistema pagamenti' },
                      { version: 'v0.9.0', date: '10 Gen 2024', changes: 'Aggiunto modulo lead management' },
                      { version: 'v0.8.0', date: '05 Gen 2024', changes: 'Implementate integrazioni API' },
                    ].map((release, index) => (
                      <div key={index} className="p-3 bg-neutral-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-neutral-800">{release.version}</span>
                          <span className="text-sm text-neutral-500">{release.date}</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{release.changes}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Strumenti Sviluppo</h4>
                  <div className="space-y-3">
                    <Button variant="outline" icon={FiIcons.FiGitCommit} className="w-full justify-start">
                      Genera Backup Completo
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiRefreshCw} className="w-full justify-start">
                      Rigenera Core Logic
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiPackage} className="w-full justify-start">
                      Crea Package Estensione
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiCode} className="w-full justify-start">
                      Debug Mode
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-neutral-50 rounded-xl mt-6">
                    <h5 className="font-medium text-neutral-800 mb-2">Informazioni Sistema</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Ambiente:</span>
                        <span className="font-medium">Produzione</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Database:</span>
                        <span className="font-medium">PostgreSQL 14</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Ultimo Deploy:</span>
                        <span className="font-medium">20 Gen 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return <div>Seleziona una scheda</div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Strumenti Interni
          </h1>
          <p className="text-neutral-600 mt-2">
            Strumenti avanzati per la gestione e configurazione del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiSettings}>
            Configurazioni
          </Button>
          <Button icon={FiIcons.FiTool}>
            Nuova Utility
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default InternalTools;