import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import StudentModal from '../components/modals/StudentModal';
import ExamRequestModal from '../components/modals/ExamRequestModal';
import AppointmentModal from '../components/modals/AppointmentModal';
import PaymentModal from '../components/modals/PaymentModal';
import DocumentUploadModal from '../components/modals/DocumentUploadModal';
import AssignSchoolModal from '../components/modals/AssignSchoolModal';
import { useApp } from '../context/AppContext';
import { generatePaymentReceipt, generateExamRequest } from '../utils/pdfGenerator';
import { sendEmail, emailTemplates } from '../utils/emailService';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAssignSchoolModal, setShowAssignSchoolModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newCommunication, setNewCommunication] = useState({
    type: 'email',
    subject: '',
    content: '',
    recipient: ''
  });

  const student = state.students.find(s => s.id === parseInt(id));

  useEffect(() => {
    if (!student) {
      toast.error('Studente non trovato');
      navigate('/students');
    }
  }, [student, navigate]);

  if (!student) return null;

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: FiIcons.FiHome },
    { id: 'documents', label: 'Documenti', icon: FiIcons.FiFileText },
    { id: 'exams', label: 'Esami', icon: FiIcons.FiBookOpen },
    { id: 'appointments', label: 'Appuntamenti', icon: FiIcons.FiCalendar },
    { id: 'payments', label: 'Pagamenti', icon: FiIcons.FiDollarSign },
    { id: 'communications', label: 'Comunicazioni', icon: FiIcons.FiMessageSquare }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success">Attivo</Badge>;
      case 'suspended': return <Badge variant="warning">Sospeso</Badge>;
      case 'completed': return <Badge variant="primary">Completato</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getExamStatusBadge = (status) => {
    switch (status) {
      case 'requested': return <Badge variant="warning">Richiesto</Badge>;
      case 'scheduled': return <Badge variant="primary">Programmato</Badge>;
      case 'completed': return <Badge variant="success">Completato</Badge>;
      case 'failed': return <Badge variant="danger">Non Superato</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getAppointmentStatusBadge = (status) => {
    switch (status) {
      case 'scheduled': return <Badge variant="primary">Programmato</Badge>;
      case 'completed': return <Badge variant="success">Completato</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancellato</Badge>;
      case 'rescheduled': return <Badge variant="warning">Riprogrammato</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getPaymentProgress = () => {
    const percentage = (student.paidAmount / student.totalAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: student.totalAmount - student.paidAmount,
    };
  };

  const getAssignedSchool = () => {
    if (!student.assignedSchool) return null;
    return state.schools.find(school => school.id === student.assignedSchool);
  };

  const handleUploadDocument = (document) => {
    const updatedStudent = {
      ...student,
      documents: [...(student.documents || []), document]
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Documento caricato con successo!');
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      const updatedStudent = {
        ...student,
        documents: student.documents.filter(doc => doc.id !== documentId)
      };
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Documento eliminato con successo!');
    }
  };

  const handleExamRequested = (examRequest, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Richiesta esame creata con successo!');
  };

  const handleAppointmentAdded = (appointment) => {
    const updatedStudent = {
      ...student,
      appointments: [...(student.appointments || []), appointment]
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Appuntamento aggiunto con successo!');
  };

  const handleAppointmentEdited = (appointment) => {
    const updatedStudent = {
      ...student,
      appointments: student.appointments.map(apt => 
        apt.id === appointment.id ? appointment : apt
      )
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Appuntamento aggiornato con successo!');
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      const updatedStudent = {
        ...student,
        appointments: student.appointments.filter(apt => apt.id !== appointmentId)
      };
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Appuntamento eliminato con successo!');
    }
  };

  const handlePaymentAdded = (payment, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Pagamento registrato con successo!');
  };

  const handleSchoolAssigned = (updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    const assignedSchool = getAssignedSchool();
    toast.success(
      `Studente assegnato a ${assignedSchool?.name || 'nessuna scuola'} per gli esami!`
    );
  };

  const handleSendCommunication = async () => {
    if (!newCommunication.subject.trim() || !newCommunication.content.trim()) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const communication = {
        id: Date.now(),
        type: newCommunication.type,
        subject: newCommunication.subject,
        content: newCommunication.content,
        recipient: newCommunication.recipient || student.email,
        sentAt: new Date().toISOString(),
        status: 'sent',
        sentBy: state.user.name
      };

      if (newCommunication.type === 'email') {
        await sendEmail(
          student.email,
          newCommunication.subject,
          newCommunication.content,
          state.settings.emailSettings
        );
      }

      const updatedStudent = {
        ...student,
        communications: [...(student.communications || []), communication]
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Comunicazione inviata con successo!');
      
      setNewCommunication({
        type: 'email',
        subject: '',
        content: '',
        recipient: ''
      });
    } catch (error) {
      toast.error('Errore durante l\'invio della comunicazione');
    }
  };

  const calculateInstallments = () => {
    if (student.installmentPlan) return student.installmentPlan;

    if (student.paymentType === 'installment') {
      const remainingAmount = student.totalAmount - (student.initialPayment || 0);
      const installmentsCount = 12;
      const amountPerInstallment = remainingAmount / installmentsCount;
      const startDate = new Date();
      const installments = [];

      for (let i = 0; i < installmentsCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        installments.push({
          id: Date.now() + i,
          amount: amountPerInstallment,
          dueDate: dueDate.toISOString().split('T')[0],
          status: i === 0 ? 'upcoming' : 'pending',
          paid: false
        });
      }
      return installments;
    }
    return [];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Info */}
              <Card className="p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-800">Dati Anagrafici</h3>
                  <Button icon={FiIcons.FiEdit} onClick={() => setShowEditModal(true)}>
                    Modifica
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">Nome Completo</p>
                    <p className="font-medium text-neutral-800">
                      {student.firstName} {student.lastName}
                    </p>
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
                    <p className="font-medium text-neutral-800">
                      {student.codiceFiscale || 'Non specificato'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">Data di Nascita</p>
                    <p className="font-medium text-neutral-800">
                      {student.birthDate 
                        ? new Date(student.birthDate).toLocaleDateString('it-IT')
                        : 'Non specificata'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">Luogo di Nascita</p>
                    <p className="font-medium text-neutral-800">
                      {student.birthPlace || 'Non specificato'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">Indirizzo</p>
                    <p className="font-medium text-neutral-800">
                      {student.address ? (
                        <>
                          {student.address}, {student.city} {student.province} {student.cap}
                        </>
                      ) : (
                        'Non specificato'
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Course Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-6">Informazioni Corso</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Corso</span>
                    <span className="font-medium text-neutral-800">{student.course}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Anni da Recuperare</span>
                    <span className="font-medium text-neutral-800">{student.yearsToRecover}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Data Iscrizione</span>
                    <span className="font-medium text-neutral-800">
                      {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Stato</span>
                    {getStatusBadge(student.status)}
                  </div>
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Scuola Esami</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-neutral-800">
                          {getAssignedSchool()?.name || 'Non assegnata'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FiIcons.FiMapPin}
                          onClick={() => setShowAssignSchoolModal(true)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Pagamenti</p>
                    <p className="text-2xl font-bold text-accent-600">
                      €{student.paidAmount} / €{student.totalAmount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiDollarSign} className="w-6 h-6 text-accent-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Esami</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {student.exams?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiBookOpen} className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Appuntamenti</p>
                    <p className="text-2xl font-bold text-secondary-600">
                      {student.appointments?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiCalendar} className="w-6 h-6 text-secondary-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Documenti</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {student.documents?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Azioni Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                  icon={FiIcons.FiUpload}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setShowDocumentModal(true)}
                >
                  Carica Documento
                </Button>
                <Button
                  icon={FiIcons.FiBookOpen}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setShowExamModal(true)}
                >
                  Richiedi Esame
                </Button>
                <Button
                  icon={FiIcons.FiCalendar}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setShowAppointmentModal(true);
                  }}
                >
                  Nuovo Appuntamento
                </Button>
                <Button
                  icon={FiIcons.FiDollarSign}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Registra Pagamento
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Documenti ({student.documents?.length || 0})
                </h3>
                <Button
                  icon={FiIcons.FiUpload}
                  onClick={() => setShowDocumentModal(true)}
                >
                  Carica Documento
                </Button>
              </div>

              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.documents.map((doc) => (
                    <div key={doc.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <SafeIcon
                              icon={doc.type?.startsWith('image/') ? FiIcons.FiImage : FiIcons.FiFile}
                              className="w-5 h-5 text-primary-600"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{doc.name}</p>
                            <p className="text-sm text-neutral-500">
                              {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={FiIcons.FiEye}
                            onClick={() => window.open(doc.url, '_blank')}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={FiIcons.FiDownload}
                            onClick={() => window.open(doc.url, '_blank')}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={FiIcons.FiTrash2}
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          />
                        </div>
                      </div>
                      {doc.type?.startsWith('image/') && (
                        <div className="mt-3">
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun documento caricato</p>
                  <Button
                    icon={FiIcons.FiUpload}
                    onClick={() => setShowDocumentModal(true)}
                  >
                    Carica Primo Documento
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Esami ({student.exams?.length || 0})
                </h3>
                <Button
                  icon={FiIcons.FiPlus}
                  onClick={() => setShowExamModal(true)}
                >
                  Richiedi Esame
                </Button>
              </div>

              {student.exams && student.exams.length > 0 ? (
                <div className="space-y-4">
                  {student.exams.map((exam) => (
                    <div key={exam.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <SafeIcon icon={FiIcons.FiBookOpen} className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800">
                                Esame {exam.examType === 'idoneity' ? 'di Idoneità' : 'di Maturità'}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {state.schools.find(s => s.id === exam.schoolId)?.name || 'Scuola non trovata'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-neutral-500">Data Richiesta</p>
                              <p className="font-medium text-neutral-800">
                                {new Date(exam.examDate).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-500">Anno Accademico</p>
                              <p className="font-medium text-neutral-800">{exam.academicYear}</p>
                            </div>
                          </div>

                          {exam.subjects && exam.subjects.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-neutral-500 mb-2">Materie ({exam.subjects.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {exam.subjects.map((subject, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {exam.notes && (
                            <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                              <p className="text-sm text-neutral-600">{exam.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 text-right">
                          {getExamStatusBadge(exam.status)}
                          <p className="text-sm text-neutral-500 mt-2">
                            {new Date(exam.createdAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiBookOpen} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun esame richiesto</p>
                  <Button
                    icon={FiIcons.FiPlus}
                    onClick={() => setShowExamModal(true)}
                  >
                    Richiedi Primo Esame
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Appuntamenti ({student.appointments?.length || 0})
                </h3>
                <Button
                  icon={FiIcons.FiPlus}
                  onClick={() => {
                    setSelectedAppointment(null);
                    setShowAppointmentModal(true);
                  }}
                >
                  Nuovo Appuntamento
                </Button>
              </div>

              {student.appointments && student.appointments.length > 0 ? (
                <div className="space-y-4">
                  {student.appointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                              <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-secondary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800">{appointment.title}</p>
                              <p className="text-sm text-neutral-500">{appointment.type}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-neutral-500">Data</p>
                              <p className="font-medium text-neutral-800">
                                {new Date(appointment.date).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-500">Ora</p>
                              <p className="font-medium text-neutral-800">{appointment.time}</p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-500">Durata</p>
                              <p className="font-medium text-neutral-800">{appointment.duration} min</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-neutral-500">Modalità</p>
                              <p className="font-medium text-neutral-800">
                                {appointment.location === 'online' ? 'Online' : 
                                 appointment.location === 'in-person' ? 'Presenza' : 'Telefono'}
                              </p>
                            </div>
                          </div>

                          {appointment.description && (
                            <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                              <p className="text-sm text-neutral-600">{appointment.description}</p>
                            </div>
                          )}

                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-600">{appointment.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 text-right">
                          {getAppointmentStatusBadge(appointment.status)}
                          <div className="flex items-center space-x-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={FiIcons.FiEdit}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowAppointmentModal(true);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={FiIcons.FiTrash2}
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiCalendar} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun appuntamento programmato</p>
                  <Button
                    icon={FiIcons.FiPlus}
                    onClick={() => {
                      setSelectedAppointment(null);
                      setShowAppointmentModal(true);
                    }}
                  >
                    Crea Primo Appuntamento
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'payments':
        const paymentProgress = getPaymentProgress();
        const installments = student.installmentPlan || calculateInstallments();

        return (
          <div className="space-y-6">
            {/* Payment Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Panoramica Pagamenti</h3>
                <Button
                  icon={FiIcons.FiPlus}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Registra Pagamento
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-neutral-50 rounded-xl">
                  <p className="text-2xl font-bold text-neutral-800">€{student.totalAmount}</p>
                  <p className="text-sm text-neutral-500">Totale</p>
                </div>
                <div className="text-center p-4 bg-accent-50 rounded-xl">
                  <p className="text-2xl font-bold text-accent-600">€{student.paidAmount}</p>
                  <p className="text-sm text-neutral-500">Pagato</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">€{paymentProgress.remaining}</p>
                  <p className="text-sm text-neutral-500">Rimanente</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-500">Progresso Pagamenti</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {paymentProgress.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${paymentProgress.percentage}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Installment Plan */}
            {student.paymentType === 'installment' && student.installmentPlan && student.installmentPlan.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Piano Rateale</h3>
                
                <div className="mb-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Acconto Iniziale:</span>
                      <span className="font-medium">€{student.initialPayment || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Numero Rate:</span>
                      <span className="font-medium">{student.installmentPlan.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Data Inizio:</span>
                      <span className="font-medium">
                        {new Date(student.installmentPlan[0]?.dueDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Data Fine:</span>
                      <span className="font-medium">
                        {new Date(student.installmentPlan[student.installmentPlan.length - 1]?.dueDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {student.installmentPlan.map((installment, index) => (
                    <div
                      key={installment.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          installment.paid 
                            ? 'bg-accent-500' 
                            : installment.status === 'upcoming' 
                              ? 'bg-orange-500' 
                              : 'bg-neutral-300'
                        }`}>
                          <span className="text-white font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${
                            installment.paid 
                              ? 'text-neutral-600 line-through' 
                              : 'text-neutral-800'
                          }`}>
                            Rata {index + 1} - €{installment.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                          </p>
                          {installment.paid && installment.paidDate && (
                            <p className="text-xs text-accent-600">
                              Pagata il: {new Date(installment.paidDate).toLocaleDateString('it-IT')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          installment.paid 
                            ? 'success' 
                            : installment.status === 'upcoming' 
                              ? 'warning' 
                              : new Date(installment.dueDate) < new Date() 
                                ? 'danger' 
                                : 'default'
                        }>
                          {installment.paid 
                            ? 'Pagata' 
                            : installment.status === 'upcoming' 
                              ? 'Prossima' 
                              : new Date(installment.dueDate) < new Date() 
                                ? 'Scaduta' 
                                : 'In attesa'}
                        </Badge>
                        {installment.paidAmount && !installment.paid && (
                          <p className="text-xs text-neutral-500 mt-1">
                            Parziale: €{installment.paidAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Payment History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Storico Pagamenti</h3>
              
              {student.payments && student.payments.length > 0 ? (
                <div className="space-y-3">
                  {student.payments.map(payment => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">€{payment.amount}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(payment.date).toLocaleDateString('it-IT')} - {' '}
                          {payment.method === 'bank_transfer' ? 'Bonifico' :
                           payment.method === 'card' ? 'Carta' :
                           payment.method === 'cash' ? 'Contanti' :
                           payment.method === 'check' ? 'Assegno' : 'Finanziamento'}
                        </p>
                        {payment.installmentId && (
                          <p className="text-xs text-primary-600">
                            Rata {student.installmentPlan?.findIndex(inst => inst.id === payment.installmentId) + 1 || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="success">Completato</Badge>
                        {payment.notes && (
                          <p className="text-xs text-neutral-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiDollarSign} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun pagamento registrato</p>
                  <Button
                    icon={FiIcons.FiPlus}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Registra Primo Pagamento
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'communications':
        return (
          <div className="space-y-6">
            {/* New Communication Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Nuova Comunicazione</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                    <select
                      value={newCommunication.type}
                      onChange={(e) => setNewCommunication(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="call">Telefonata</option>
                      <option value="meeting">Riunione</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Destinatario"
                    value={newCommunication.recipient}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder={student.email}
                  />
                </div>

                <Input
                  label="Oggetto"
                  value={newCommunication.subject}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Oggetto della comunicazione"
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Contenuto</label>
                  <textarea
                    value={newCommunication.content}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Scrivi il contenuto della comunicazione..."
                    className="w-full h-32 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    icon={FiIcons.FiSend}
                    onClick={handleSendCommunication}
                  >
                    Invia Comunicazione
                  </Button>
                </div>
              </div>
            </Card>

            {/* Communications History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Storico Comunicazioni ({student.communications?.length || 0})
              </h3>

              {student.communications && student.communications.length > 0 ? (
                <div className="space-y-4">
                  {student.communications.map((comm) => (
                    <div key={comm.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <SafeIcon
                              icon={
                                comm.type === 'email' ? FiIcons.FiMail :
                                comm.type === 'sms' ? FiIcons.FiMessageSquare :
                                comm.type === 'call' ? FiIcons.FiPhone :
                                FiIcons.FiUsers
                              }
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{comm.subject}</p>
                            <p className="text-sm text-neutral-500">
                              {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} - {' '}
                              {new Date(comm.sentAt).toLocaleDateString('it-IT')} {' '}
                              {new Date(comm.sentAt).toLocaleTimeString('it-IT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={comm.status === 'sent' ? 'success' : 'warning'}>
                            {comm.status === 'sent' ? 'Inviato' : 'In sospeso'}
                          </Badge>
                          {comm.sentBy && (
                            <p className="text-xs text-neutral-500 mt-1">da {comm.sentBy}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">{comm.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiMessageSquare} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessuna comunicazione inviata</p>
                </div>
              )}
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
        <div>
          <div className="flex items-center space-x-3">
            <Link
              to="/students"
              className="inline-flex items-center text-neutral-500 hover:text-neutral-700"
            >
              <SafeIcon icon={FiIcons.FiChevronLeft} className="w-5 h-5 mr-1" />
              <span>Torna agli studenti</span>
            </Link>
            {getStatusBadge(student.status)}
          </div>
          <h1 className="text-3xl font-display font-bold text-neutral-800 mt-2">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-neutral-600 mt-1">
            {student.course} - {student.yearsToRecover} anni da recuperare
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiMail}>
            Email
          </Button>
          <Button icon={FiIcons.FiEdit} onClick={() => setShowEditModal(true)}>
            Modifica
          </Button>
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
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showEditModal && (
          <StudentModal
            student={student}
            onClose={() => setShowEditModal(false)}
            mode="edit"
          />
        )}

        {showExamModal && (
          <ExamRequestModal
            student={student}
            onClose={() => setShowExamModal(false)}
            onRequestCreated={handleExamRequested}
          />
        )}

        {showAppointmentModal && (
          <AppointmentModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowAppointmentModal(false);
              setSelectedAppointment(null);
            }}
            mode={selectedAppointment ? 'edit' : 'add'}
            studentId={student.id}
            onSave={selectedAppointment ? handleAppointmentEdited : handleAppointmentAdded}
          />
        )}

        {showPaymentModal && (
          <PaymentModal
            student={student}
            onClose={() => setShowPaymentModal(false)}
            onPaymentAdded={handlePaymentAdded}
          />
        )}

        {showDocumentModal && (
          <DocumentUploadModal
            onClose={() => setShowDocumentModal(false)}
            onUpload={handleUploadDocument}
            title="Carica Documento Studente"
          />
        )}

        {showAssignSchoolModal && (
          <AssignSchoolModal
            student={student}
            onClose={() => setShowAssignSchoolModal(false)}
            onAssign={handleSchoolAssigned}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;