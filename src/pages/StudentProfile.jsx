import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button, Input, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';

const StudentProfile = () => {
  const { id } = useParams();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const student = state.students.find(s => s.id === parseInt(id));

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Studente non trovato
          </h2>
          <p className="text-neutral-500 mb-4">
            Lo studente richiesto non esiste nel sistema.
          </p>
          <Link to="/students">
            <Button icon={FiIcons.FiArrowLeft}>
              Torna alla Lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: FiIcons.FiUser },
    { id: 'subscription', label: 'Iscrizione', icon: FiIcons.FiBookOpen },
    { id: 'payments', label: 'Pagamenti', icon: FiIcons.FiCreditCard },
    { id: 'communication', label: 'Comunicazioni', icon: FiIcons.FiMail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Dati Anagrafici
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome" value={student.firstName} readOnly />
                <Input label="Cognome" value={student.lastName} readOnly />
                <Input label="Email" value={student.email} readOnly />
                <Input label="Telefono" value={student.phone} readOnly />
              </div>
            </Card>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Dettagli Iscrizione
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input label="Corso" value={student.course} readOnly />
                  <Input label="Anni da Recuperare" value={student.yearsToRecover} readOnly />
                  <Input
                    label="Data Iscrizione"
                    value={new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                    readOnly
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Stato:</span>
                    <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                      {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'payments':
        const paymentProgress = (student.paidAmount / student.totalAmount) * 100;
        
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Panoramica Pagamenti
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-800">€{student.totalAmount}</p>
                  <p className="text-sm text-neutral-500">Totale</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-600">€{student.paidAmount}</p>
                  <p className="text-sm text-neutral-500">Pagato</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">€{student.totalAmount - student.paidAmount}</p>
                  <p className="text-sm text-neutral-500">Rimanente</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-500">Progresso Pagamenti</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {paymentProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Storico Comunicazioni
              </h3>
              <div className="space-y-3">
                {[
                  { date: '2024-01-20', type: 'Email', subject: 'Benvenuto nel corso', status: 'sent' },
                  { date: '2024-01-15', type: 'SMS', subject: 'Conferma iscrizione', status: 'sent' },
                ].map((comm, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <SafeIcon
                        icon={comm.type === 'Email' ? FiIcons.FiMail : FiIcons.FiMessageSquare}
                        className="w-5 h-5 text-neutral-500"
                      />
                      <div>
                        <p className="font-medium text-neutral-800">{comm.subject}</p>
                        <p className="text-sm text-neutral-500">{comm.date}</p>
                      </div>
                    </div>
                    <Badge variant="success">Inviato</Badge>
                  </div>
                ))}
              </div>
            </Card>
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
        <div className="flex items-center space-x-4">
          <Link to="/students">
            <Button variant="ghost" icon={FiIcons.FiArrowLeft}>
              Indietro
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-neutral-600 mt-1">
              {student.course} • Iscritto il {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiPhone}>
            Chiama
          </Button>
          <Button variant="outline" icon={FiIcons.FiMail}>
            Email
          </Button>
          <Button icon={FiIcons.FiEdit}>
            Modifica
          </Button>
        </div>
      </div>

      {/* Student Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {student.firstName[0]}{student.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-neutral-800">{student.firstName} {student.lastName}</p>
              <p className="text-sm text-neutral-500">{student.email}</p>
              <p className="text-sm text-neutral-500">{student.phone}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-800">{student.yearsToRecover}</p>
            <p className="text-sm text-neutral-500">Anni da Recuperare</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-600">€{student.paidAmount}</p>
            <p className="text-sm text-neutral-500">Pagato</p>
          </div>
          <div className="text-center">
            <Badge variant={student.status === 'active' ? 'success' : 'warning'} className="text-base px-4 py-2">
              {student.status === 'active' ? 'Attivo' : 'Sospeso'}
            </Badge>
          </div>
        </div>
      </Card>

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

export default StudentProfile;