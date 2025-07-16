import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { sendEmail, emailTemplates } from '../utils/emailService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (state.students && id) {
      const foundStudent = state.students.find(s => s.id === parseInt(id) || s.id === id);
      setStudent(foundStudent || null);
    }
  }, [state.students, id]);

  const handleSendEmail = async (student, template) => {
    const toastId = toast.loading('Invio email in corso...');
    
    try {
      // Get the template data
      const emailData = emailTemplates[template](student);
      
      // Get SMTP settings from state
      const smtpSettings = state.settings.integrations.smtp;
      
      // Check if SMTP is configured
      if (!smtpSettings || !smtpSettings.active) {
        toast.error('SMTP non configurato. Configura SMTP nelle Integrazioni API', { id: toastId });
        return;
      }
      
      // Send the email using the SMTP settings
      await sendEmail(
        student.email,
        emailData.subject,
        emailData.content,
        { smtp: smtpSettings }
      );
      
      // Update student record with communication
      const updatedStudent = {
        ...student,
        communications: [
          ...(student.communications || []),
          {
            id: Date.now(),
            type: 'email',
            subject: emailData.subject,
            sentAt: new Date().toISOString(),
            status: 'sent',
          },
        ],
      };
      
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      setStudent(updatedStudent);
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      console.error('Email error:', error);
      toast.error(`Errore durante l'invio dell'email: ${error.message}`, { id: toastId });
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Caricamento studente...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: FiIcons.FiHome },
    { id: 'documents', label: 'Documenti', icon: FiIcons.FiFile },
    { id: 'payments', label: 'Pagamenti', icon: FiIcons.FiDollarSign },
    { id: 'exams', label: 'Esami', icon: FiIcons.FiAward },
    { id: 'communications', label: 'Comunicazioni', icon: FiIcons.FiMessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Nome Completo</p>
                  <p className="font-medium text-neutral-800">{student.firstName} {student.lastName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium text-neutral-800">{student.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Telefono</p>
                  <p className="font-medium text-neutral-800">{student.phone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Codice Fiscale</p>
                  <p className="font-medium text-neutral-800">{student.codiceFiscale || 'Non specificato'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Data di Nascita</p>
                  <p className="font-medium text-neutral-800">
                    {student.birthDate ? new Date(student.birthDate).toLocaleDateString('it-IT') : 'Non specificata'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Luogo di Nascita</p>
                  <p className="font-medium text-neutral-800">{student.birthPlace || 'Non specificato'}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Dettagli Corso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Corso</p>
                  <p className="font-medium text-neutral-800">{student.course}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Anni da Recuperare</p>
                  <p className="font-medium text-neutral-800">{student.yearsToRecover}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Data Iscrizione</p>
                  <p className="font-medium text-neutral-800">
                    {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Stato</p>
                  <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                    {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Pagamenti</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <p className="text-sm text-primary-600">Importo Totale</p>
                    <p className="text-xl font-bold text-primary-800">€{student.totalAmount}</p>
                  </div>
                  <div className="p-4 bg-accent-50 rounded-xl">
                    <p className="text-sm text-accent-600">Importo Pagato</p>
                    <p className="text-xl font-bold text-accent-800">€{student.paidAmount}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-sm text-orange-600">Da Pagare</p>
                    <p className="text-xl font-bold text-orange-800">
                      €{student.totalAmount - student.paidAmount}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Progresso Pagamenti</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {Math.round((student.paidAmount / student.totalAmount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full"
                      style={{ width: `${(student.paidAmount / student.totalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case 'documents':
        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Documenti Studente</h3>
              <Button icon={FiIcons.FiUpload}>Carica Documento</Button>
            </div>
            
            {student.documents && student.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.documents.map(doc => (
                  <div key={doc.id} className="p-4 border border-neutral-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <SafeIcon icon={FiIcons.FiFile} className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">{doc.name}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" icon={FiIcons.FiDownload} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiFile} className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 mb-4">Nessun documento caricato</p>
                <Button icon={FiIcons.FiUpload}>Carica Primo Documento</Button>
              </div>
            )}
          </Card>
        );
      
      default:
        return (
          <Card className="p-6 text-center">
            <p className="text-neutral-500">Contenuto in sviluppo</p>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-neutral-600 mt-1">
              {student.course} • {student.yearsToRecover} anni da recuperare
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            icon={FiIcons.FiMail}
            onClick={() => handleSendEmail(student, 'welcome')}
          >
            Email
          </Button>
          <Button icon={FiIcons.FiEdit}>Modifica</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default StudentProfile;