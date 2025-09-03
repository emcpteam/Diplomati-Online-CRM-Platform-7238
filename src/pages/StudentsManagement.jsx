import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import StudentModal from '../components/modals/StudentModal';
import AssignSchoolModal from '../components/modals/AssignSchoolModal';
import { useApp } from '../context/AppContext';
import { generateStudentContract, sendEmail, emailTemplates, exportToCSV } from '../utils';
import toast from 'react-hot-toast';

const StudentsManagement = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAssignSchoolModal, setShowAssignSchoolModal] = useState(false);

  const filteredStudents = state.students
    .filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
      return matchesSearch && matchesStatus && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'enrollment':
          return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
        case 'course':
          return a.course.localeCompare(b.course);
        case 'payment':
          return (b.paidAmount / b.totalAmount) - (a.paidAmount / a.totalAmount);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success">Attivo</Badge>;
      case 'suspended': return <Badge variant="warning">Sospeso</Badge>;
      case 'completed': return <Badge variant="primary">Completato</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getPaymentProgress = (student) => {
    const percentage = (student.paidAmount / student.totalAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: student.totalAmount - student.paidAmount,
    };
  };

  const getAssignedSchool = (student) => {
    if (!student.assignedSchool) return null;
    return state.schools.find(school => school.id === student.assignedSchool);
  };

  const handleExport = () => {
    const data = filteredStudents.map(student => ({
      Nome: student.firstName,
      Cognome: student.lastName,
      Email: student.email,
      Telefono: student.phone,
      Corso: student.course,
      Stato: student.status,
      'Importo Totale': student.totalAmount,
      'Importo Pagato': student.paidAmount,
      'Data Iscrizione': new Date(student.enrollmentDate).toLocaleDateString('it-IT'),
      'Scuola Esami': getAssignedSchool(student)?.name || 'Non assegnata'
    }));

    exportToCSV(data, `studenti-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Export completato con successo!');
  };

  const handleSendEmail = async (student, template) => {
    // Check SMTP configuration before attempting to send
    const smtpConfig = state.settings.integrations.smtp;
    if (!smtpConfig || !smtpConfig.active) {
      toast.error('SMTP non configurato. Vai in Integrazioni > SMTP Email per configurare l\'invio email');
      return;
    }

    const requiredFields = ['host', 'port', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !smtpConfig[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Configurazione SMTP incompleta. Campi mancanti: ${missingFields.join(', ')}`);
      return;
    }

    const toastId = toast.loading('Invio email in corso...');
    try {
      const emailData = emailTemplates[template](student);
      
      // Use the actual SMTP settings from integrations
      await sendEmail(student.email, emailData.subject, emailData.content, smtpConfig);

      const updatedStudent = {
        ...student,
        communications: [
          ...(student.communications || []),
          {
            id: Date.now(),
            type: 'email',
            subject: emailData.subject,
            content: emailData.content,
            sentAt: new Date().toISOString(),
            status: 'sent',
            template: template,
            smtpUsed: smtpConfig.host
          }
        ]
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email: ' + error.message, { id: toastId });
    }
  };

  const handleAssignSchool = (student) => {
    setSelectedStudent(student);
    setShowAssignSchoolModal(true);
  };

  const handleSchoolAssigned = (updatedStudent) => {
    const assignedSchool = getAssignedSchool(updatedStudent);
    toast.success(
      `Studente assegnato a ${assignedSchool?.name || 'nessuna scuola'} per gli esami!`
    );
  };

  // Check if SMTP is configured for UI feedback
  const smtpConfig = state.settings.integrations.smtp;
  const isSmtpConfigured = smtpConfig && smtpConfig.active && smtpConfig.host && smtpConfig.username && smtpConfig.password;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Gestione Studenti
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci tutti gli studenti iscritti ai corsi
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={handleExport}>
            Esporta CSV
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={() => {
            setModalType('student');
            setSelectedStudent(null);
            setShowModal(true);
          }}>
            Nuovo Studente
          </Button>
        </div>
      </div>

      {/* SMTP Configuration Warning */}
      {!isSmtpConfigured && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800">SMTP Non Configurato</p>
                <p className="text-sm text-orange-700">
                  Configura SMTP nelle integrazioni per abilitare l'invio di email agli studenti.
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.hash = '/integrations'}
            >
              Configura SMTP
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Cerca studenti..."
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
            <option value="active">Attivi</option>
            <option value="suspended">Sospesi</option>
            <option value="completed">Completati</option>
          </select>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tutti i corsi</option>
            {state.courses.map(course => (
              <option key={course.id} value={course.name}>{course.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">Ordina per nome</option>
            <option value="enrollment">Data iscrizione</option>
            <option value="course">Corso</option>
            <option value="payment">Stato pagamento</option>
          </select>
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          const paymentProgress = getPaymentProgress(student);
          const assignedSchool = getAssignedSchool(student);

          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-medium">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-neutral-500">{student.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Corso:</span>
                    <span className="font-medium text-neutral-800">{student.course}</span>
                  </div>

                  {/* School Assignment */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Scuola Esami:</span>
                    <div className="flex items-center space-x-2">
                      {assignedSchool ? (
                        <span className="font-medium text-neutral-800 text-xs">
                          {assignedSchool.name}
                        </span>
                      ) : (
                        <span className="text-orange-600 text-xs">Non assegnata</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={assignedSchool ? FiIcons.FiEdit : FiIcons.FiMapPin}
                        onClick={() => handleAssignSchool(student)}
                        className="p-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Pagamenti:</span>
                      <span className="font-medium text-neutral-800">
                        €{student.paidAmount} / €{student.totalAmount}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${paymentProgress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {student.convertedFromLead && (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiIcons.FiTarget} className="w-4 h-4 text-accent-500" />
                      <span className="text-xs text-accent-600 font-medium">
                        Convertito da Lead
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiMail}
                      onClick={() => handleSendEmail(student, 'welcome')}
                      disabled={!isSmtpConfigured}
                      title={!isSmtpConfigured ? 'Configura SMTP per inviare email' : 'Invia email di benvenuto'}
                    >
                      {isSmtpConfigured ? 'Email' : 'Email (SMTP?)'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiEdit}
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalType('student');
                        setShowModal(true);
                      }}
                    >
                      Modifica
                    </Button>
                    <Link to={`/students/${student.id}`}>
                      <Button size="sm" icon={FiIcons.FiEye}>Dettagli</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiUsers} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Nessuno studente trovato
          </h3>
          <p className="text-neutral-500 mb-6">
            Non ci sono studenti che corrispondono ai filtri selezionati.
          </p>
          <Button icon={FiIcons.FiPlus} onClick={() => {
            setModalType('student');
            setSelectedStudent(null);
            setShowModal(true);
          }}>
            Aggiungi Primo Studente
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && modalType === 'student' && (
          <StudentModal
            student={selectedStudent}
            onClose={() => {
              setShowModal(false);
              setSelectedStudent(null);
            }}
            mode={selectedStudent ? 'edit' : 'add'}
          />
        )}

        {showAssignSchoolModal && selectedStudent && (
          <AssignSchoolModal
            student={selectedStudent}
            onClose={() => {
              setShowAssignSchoolModal(false);
              setSelectedStudent(null);
            }}
            onAssign={handleSchoolAssigned}
          />
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{state.students.length}</p>
            <p className="text-sm text-neutral-500">Totale Studenti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.students.filter(s => s.status === 'active').length}
            </p>
            <p className="text-sm text-neutral-500">Attivi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              €{state.students.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">Incassi Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              €{state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">Da Incassare</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {state.students.filter(s => s.assignedSchool).length}
            </p>
            <p className="text-sm text-neutral-500">Con Scuola Esami</p>
          </div>
        </div>
        
        {/* SMTP Status in Stats */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSmtpConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-neutral-600">
                SMTP: {isSmtpConfigured ? `Configurato (${smtpConfig.host})` : 'Non configurato'}
              </span>
            </div>
            {!isSmtpConfigured && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.hash = '/integrations'}
              >
                Configura
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentsManagement;