import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const ElectronicInvoicing = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('invoices');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [invoices] = useState([
    {
      id: 1,
      number: 'INV-2024-001',
      studentName: 'Marco Rossi',
      amount: 2800,
      status: 'paid',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      sdi: 'ABCDEFG',
      xml: true
    },
    {
      id: 2,
      number: 'INV-2024-002',
      studentName: 'Giulia Bianchi',
      amount: 2600,
      status: 'pending',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      sdi: 'HIJKLMN',
      xml: false
    }
  ]);

  const tabs = [
    { id: 'invoices', label: 'Fatture', icon: FiIcons.FiFileText },
    { id: 'settings', label: 'Configurazione', icon: FiIcons.FiSettings },
    { id: 'reports', label: 'Report', icon: FiIcons.FiBarChart }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Pagata</Badge>;
      case 'pending': return <Badge variant="warning">In attesa</Badge>;
      case 'overdue': return <Badge variant="danger">Scaduta</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return (
          <div className="space-y-6">
            {/* Invoices Table */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-800">
                    Fatture Elettroniche
                  </h3>
                  <Button 
                    icon={FiIcons.FiPlus}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Nuova Fattura
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">Numero</th>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">Cliente</th>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">Importo</th>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">Stato</th>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">Data Emissione</th>
                      <th className="text-left py-4 px-6 font-semibold text-neutral-800">XML</th>
                      <th className="text-right py-4 px-6 font-semibold text-neutral-800">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-4 px-6 font-medium text-neutral-800">
                          {invoice.number}
                        </td>
                        <td className="py-4 px-6 text-neutral-800">
                          {invoice.studentName}
                        </td>
                        <td className="py-4 px-6 text-neutral-800">
                          €{invoice.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-4 px-6 text-neutral-800">
                          {new Date(invoice.issueDate).toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-4 px-6">
                          {invoice.xml ? (
                            <SafeIcon icon={FiIcons.FiCheckCircle} className="w-5 h-5 text-accent-500" />
                          ) : (
                            <SafeIcon icon={FiIcons.FiXCircle} className="w-5 h-5 text-red-500" />
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" icon={FiIcons.FiEye}>
                              Visualizza
                            </Button>
                            <Button variant="ghost" size="sm" icon={FiIcons.FiDownload}>
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">
                Configurazione Fatturazione Elettronica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Codice SDI"
                  defaultValue="ABCDEFG"
                  placeholder="Inserisci codice SDI"
                />
                <Input
                  label="Regime Fiscale"
                  defaultValue="RF01"
                  placeholder="Codice regime fiscale"
                />
                <Input
                  label="Codice ATECO"
                  defaultValue="85.59.20"
                  placeholder="Codice attività"
                />
                <Input
                  label="Email PEC"
                  type="email"
                  defaultValue="fatture@pec.diplomatonline.it"
                  placeholder="PEC per fatturazione"
                />
              </div>
              
              <div className="mt-6">
                <Button icon={FiIcons.FiSave}>
                  Salva Configurazione
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiFileText} className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{invoices.length}</h3>
                <p className="text-neutral-500">Fatture Totali</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiDollarSign} className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">
                  €{invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </h3>
                <p className="text-neutral-500">Fatturato Totale</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiCheckCircle} className="w-6 h-6 text-secondary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">
                  {invoices.filter(inv => inv.status === 'paid').length}
                </h3>
                <p className="text-neutral-500">Fatture Pagate</p>
              </Card>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Fatturazione Elettronica
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci le fatture elettroniche e la configurazione SDI
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload}>
            Esporta
          </Button>
          <Button icon={FiIcons.FiSettings}>
            Configurazioni
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  Nuova Fattura Elettronica
                </h2>
                <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowCreateModal(false)} />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Cliente
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Seleziona cliente</option>
                    {state.students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Importo"
                  type="number"
                  placeholder="0.00"
                />
              </div>
              
              <Input
                label="Descrizione"
                placeholder="Descrizione servizio..."
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data Emissione"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Data Scadenza"
                  type="date"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-neutral-200">
              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annulla
                </Button>
                <Button icon={FiIcons.FiSave} onClick={() => {
                  toast.success('Fattura creata con successo!');
                  setShowCreateModal(false);
                }}>
                  Crea Fattura
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ElectronicInvoicing;