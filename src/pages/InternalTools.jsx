import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const tabs = [
  { id: 'course-creation', label: 'Creazione Corsi', icon: FiIcons.FiBookOpen },
  { id: 'autocomplete', label: 'Campi Autocomplete', icon: FiIcons.FiEdit3 },
  { id: 'import-export', label: 'Import/Export', icon: FiIcons.FiDatabase },
  { id: 'pdf-tools', label: 'Strumenti PDF', icon: FiIcons.FiFileText },
  { id: 'file-repository', label: 'Repository File', icon: FiIcons.FiFolder },
  { id: 'versioning', label: 'Versioning', icon: FiIcons.FiGitCommit }
];

const InternalTools = () => {
  const [activeTab, setActiveTab] = useState('course-creation');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'course-creation':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Creazione Corsi Automatica</h3>
              <p className="text-neutral-600 mb-6">
                Crea corsi completi con materie automaticamente in base al tipo di diploma selezionato.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tipo Diploma
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="scientifico">Liceo Scientifico</option>
                    <option value="classico">Liceo Classico</option>
                    <option value="linguistico">Liceo Linguistico</option>
                    <option value="tecnico">Istituto Tecnico</option>
                    <option value="professionale">Istituto Professionale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Anno Accademico
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prezzo Base
                  </label>
                  <input
                    type="number"
                    defaultValue="2800"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mt-6 text-right">
                <Button icon={FiIcons.FiPlus}>Crea Corso Automaticamente</Button>
              </div>
            </Card>
          </div>
        );

      case 'import-export':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Importazione/Esportazione Dati</h3>
              <p className="text-neutral-600 mb-6">
                Importa o esporta dati in diversi formati per backup o migrazione.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Esporta Dati</h4>
                  <div className="space-y-2">
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Studenti (CSV)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Corsi (CSV)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Scuole (CSV)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Esporta Lead (CSV)
                    </Button>
                    <Button variant="outline" icon={FiIcons.FiDownload} className="w-full justify-start">
                      Backup Completo (JSON)
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800">Importa Dati</h4>
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center">
                    <SafeIcon icon={FiIcons.FiUpload} className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-800 font-medium mb-2">Trascina i file o fai click per caricare</p>
                    <p className="text-neutral-500 text-sm mb-4">Supporta CSV, JSON e Excel</p>
                    <Button variant="outline">Seleziona File</Button>
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
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Strumenti PDF</h3>
              <p className="text-neutral-600 mb-6">
                Genera e personalizza documenti PDF per studenti e scuole.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-neutral-800 font-medium mb-2">Contratti</h4>
                  <p className="text-neutral-600 text-sm mb-4">
                    Genera contratti personalizzati per gli studenti
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Apri Editor
                  </Button>
                </Card>
                <Card className="p-4 hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <SafeIcon icon={FiIcons.FiFilePlus} className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-neutral-800 font-medium mb-2">Certificati</h4>
                  <p className="text-neutral-600 text-sm mb-4">
                    Crea certificati di completamento e attestati
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Apri Editor
                  </Button>
                </Card>
                <Card className="p-4 hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-neutral-800 font-medium mb-2">Ricevute</h4>
                  <p className="text-neutral-600 text-sm mb-4">
                    Genera ricevute di pagamento personalizzate
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Apri Editor
                  </Button>
                </Card>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiIcons.FiTool} className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">Funzionalità in sviluppo</p>
            </div>
          </div>
        );
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
            Strumenti avanzati per la gestione della piattaforma
          </p>
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