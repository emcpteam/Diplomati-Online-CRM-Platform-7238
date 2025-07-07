import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import DocumentUploadModal from '../components/modals/DocumentUploadModal';
import ExamRequestModal from '../components/modals/ExamRequestModal';
import PaymentModal from '../components/modals/PaymentModal';
import AppointmentModal from '../components/modals/AppointmentModal';
import { useApp } from '../context/AppContext';
import { generateStudentContract, sendEmail, emailTemplates } from '../utils';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showExamRequest, setShowExamRequest] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});

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
    { id: 'exams', label: 'Esami', icon: FiIcons.FiFileText },
    { id: 'communication', label: 'Comunicazioni', icon: FiIcons.FiMail },
    { id: 'calendar', label: 'Calendario', icon: FiIcons.FiCalendar },
  ];

  const getAssignedSchool = () => {
    return state.schools.find(school => school.id === student.assignedSchool);
  };

  const getPaymentProgress = () => {
    const percentage = (student.paidAmount / student.totalAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: student.totalAmount - student.paidAmount,
    };
  };

  const calculateInstallments = () => {
    const remainingAmount = student.totalAmount - student.paidAmount;
    const monthlyPayment = remainingAmount / 12; // Example: 12 months
    const installments = [];
    
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      installments.push({
        id: i + 1,
        amount: monthlyPayment,
        dueDate: dueDate.toISOString().split('T')[0],
        status: i === 0 ? 'upcoming' : 'pending',
        paid: false
      });
    }
    
    return installments;
  };

  const handleDocumentUpload = (document) => {
    const updatedStudent = {
      ...student,
      documents: [...(student.documents || []), document]
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Documento caricato con successo!');
  };

  const handleExamRequest = (examData, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Richiesta esame inviata con successo!');
  };

  const handlePaymentAdded = (payment, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Pagamento registrato con successo!');
  };

  const handleSendEmail = async (template) => {
    const toastId = toast.loading('Invio email in corso...');
    try {
      const emailData = emailTemplates[template](student);
      await sendEmail(student.email, emailData.subject, emailData.content, state.settings.emailSettings);
      
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
            status: 'sent'
          }
        ]
      };
      
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email', { id: toastId });
    }
  };

  const handleAppointmentSave = (appointmentData) => {
    const updatedStudent = {
      ...student,
      appointments: [...(student.appointments || []), appointmentData]
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Appuntamento salvato con successo!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Dati Anagrafici</h3>
                <Button
                  variant="outline"
                  icon={editingProfile ? FiIcons.FiSave : FiIcons.FiEdit}
                  onClick={() => {
                    if (editingProfile) {
                      // Save changes
                      dispatch({ type: 'UPDATE_STUDENT', payload: { ...student, ...profileData } });
                      toast.success('Profilo aggiornato!');
                    } else {
                      setProfileData(student);
                    }
                    setEditingProfile(!editingProfile);
                  }}
                >
                  {editingProfile ? 'Salva' : 'Modifica'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={editingProfile ? profileData.firstName : student.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  readOnly={!editingProfile}
                />
                <Input
                  label="Cognome"
                  value={editingProfile ? profileData.lastName : student.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  readOnly={!editingProfile}
                />
                <Input
                  label="Email"
                  value={editingProfile ? profileData.email : student.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  readOnly={!editingProfile}
                />
                <Input
                  label="Telefono"
                  value={editingProfile ? profileData.phone : student.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  readOnly={!editingProfile}
                />
                <Input
                  label="Codice Fiscale"
                  value={editingProfile ? profileData.codiceFiscale : student.codiceFiscale || ''}
                  onChange={(e) => setProfileData({ ...profileData, codiceFiscale: e.target.value })}
                  readOnly={!editingProfile}
                />
                <Input
                  label="Data di Nascita"
                  type="date"
                  value={editingProfile ? profileData.birthDate : student.birthDate || ''}
                  onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                  readOnly={!editingProfile}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Indirizzo Completo"
                  value={editingProfile ? profileData.address : student.address || ''}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  readOnly={!editingProfile}
                />
              </div>
            </Card>

            {/* Documents */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Documenti ({student.documents?.length || 0})
                </h3>
                <Button
                  icon={FiIcons.FiUpload}
                  onClick={() => setShowDocumentUpload(true)}
                >
                  Carica Documento
                </Button>
              </div>

              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <SafeIcon icon={FiIcons.FiFile} className="w-5 h-5 text-neutral-500" />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-800 text-sm">{doc.name}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={FiIcons.FiEye}>
                          Visualizza
                        </Button>
                        <Button variant="ghost" size="sm" icon={FiIcons.FiDownload}>
                          Scarica
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiIcons.FiFileText} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-500">Nessun documento caricato</p>
                </div>
              )}
            </Card>
          </div>
        );

      case 'subscription':
        const assignedSchool = getAssignedSchool();
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Dettagli Iscrizione</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500">Corso</label>
                    <p className="font-medium text-neutral-800">{student.course}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500">Anni da Recuperare</label>
                    <p className="font-medium text-neutral-800">{student.yearsToRecover}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500">Data Iscrizione</label>
                    <p className="font-medium text-neutral-800">
                      {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500">Stato</label>
                    <div className="mt-1">
                      <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                        {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500">Scuola per Esami</label>
                    <p className="font-medium text-neutral-800">
                      {assignedSchool ? assignedSchool.name : 'Non assegnata'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500">Tipo Pagamento</label>
                    <p className="font-medium text-neutral-800">
                      {student.paymentType === 'wire_transfer' ? 'Bonifico' : 
                       student.paymentType === 'installment' ? 'Rateale' : 'Finanziamento'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Subjects */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Materie del Corso</h3>
              {(() => {
                const course = state.courses.find(c => c.name === student.course);
                return course && course.subjects ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {course.subjects.map((subject, index) => (
                      <div key={index} className="p-3 bg-primary-50 rounded-xl text-center">
                        <span className="text-sm font-medium text-primary-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">Materie non configurate per questo corso</p>
                );
              })()}
            </Card>
          </div>
        );

      case 'payments':
        const paymentProgress = getPaymentProgress();
        const installments = calculateInstallments();
        
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

            {/* Dynamic Installment Tracker */}
            {student.paymentType === 'installment' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Piano Rate</h3>
                <div className="space-y-3">
                  {installments.map((installment) => (
                    <div key={installment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          installment.paid ? 'bg-accent-500' : 
                          installment.status === 'upcoming' ? 'bg-orange-500' : 'bg-neutral-300'
                        }`}>
                          <span className="text-white font-medium text-sm">{installment.id}</span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">
                            Rata {installment.id} - €{installment.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        installment.paid ? 'success' :
                        installment.status === 'upcoming' ? 'warning' : 'default'
                      }>
                        {installment.paid ? 'Pagata' : 
                         installment.status === 'upcoming' ? 'Prossima' : 'In attesa'}
                      </Badge>
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
                  {student.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div>
                        <p className="font-medium text-neutral-800">€{payment.amount}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(payment.date).toLocaleDateString('it-IT')} - {payment.method}
                        </p>
                      </div>
                      <Badge variant="success">Completato</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">Nessun pagamento registrato</p>
              )}
            </Card>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Gestione Esami</h3>
                <Button
                  icon={FiIcons.FiPlus}
                  onClick={() => setShowExamRequest(true)}
                  disabled={!student.assignedSchool}
                >
                  Richiesta Esame
                </Button>
              </div>

              {!student.assignedSchool && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Scuola non assegnata</p>
                      <p className="text-sm text-orange-700">
                        Assegna una scuola prima di creare richieste d'esame.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {student.exams && student.exams.length > 0 ? (
                <div className="space-y-4">
                  {student.exams.map((exam) => (
                    <div key={exam.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-neutral-800">
                          Esame - {exam.examType}
                        </h4>
                        <Badge variant={
                          exam.status === 'completed' ? 'success' :
                          exam.status === 'scheduled' ? 'warning' : 'default'
                        }>
                          {exam.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Data Esame:</p>
                          <p className="font-medium">{new Date(exam.examDate).toLocaleDateString('it-IT')}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Materie:</p>
                          <p className="font-medium">{exam.subjects.join(', ')}</p>
                        </div>
                      </div>
                      {exam.notes && (
                        <div className="mt-3">
                          <p className="text-neutral-500 text-sm">Note:</p>
                          <p className="text-neutral-700 text-sm">{exam.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiIcons.FiFileText} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-500">Nessun esame programmato</p>
                </div>
              )}
            </Card>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            {/* Email Templates */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Template Email</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  icon={FiIcons.FiMail}
                  onClick={() => handleSendEmail('welcome')}
                  className="justify-start"
                >
                  Email di Benvenuto
                </Button>
                <Button
                  variant="outline"
                  icon={FiIcons.FiCreditCard}
                  onClick={() => handleSendEmail('paymentReminder')}
                  className="justify-start"
                >
                  Promemoria Pagamento
                </Button>
                <Button
                  variant="outline"
                  icon={FiIcons.FiBookOpen}
                  onClick={() => handleSendEmail('examPreparation')}
                  className="justify-start"
                >
                  Preparazione Esame
                </Button>
                <Button
                  variant="outline"
                  icon={FiIcons.FiAward}
                  onClick={() => handleSendEmail('congratulations')}
                  className="justify-start"
                >
                  Congratulazioni
                </Button>
              </div>
            </Card>

            {/* Communication History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Storico Comunicazioni</h3>
              {student.communications && student.communications.length > 0 ? (
                <div className="space-y-3">
                  {student.communications.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <SafeIcon 
                          icon={comm.type === 'email' ? FiIcons.FiMail : FiIcons.FiMessageSquare} 
                          className="w-5 h-5 text-neutral-500" 
                        />
                        <div>
                          <p className="font-medium text-neutral-800">{comm.subject}</p>
                          <p className="text-sm text-neutral-500">
                            {new Date(comm.sentAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Inviato</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiIcons.FiMail} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-500">Nessuna comunicazione inviata</p>
                </div>
              )}
            </Card>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Appuntamenti e Tutoring</h3>
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

              {/* Calendar View */}
              <div className="mb-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                    <div key={day} className="text-center py-2 bg-neutral-100 rounded-lg">
                      <span className="text-sm font-medium text-neutral-600">{day}</span>
                    </div>
                  ))}
                </div>
                
                {/* Simple Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - date.getDay() + i - 6);
                    const hasAppointment = student.appointments?.some(apt => 
                      apt.date === date.toISOString().split('T')[0]
                    );
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-sm border border-neutral-200 rounded-lg cursor-pointer transition-colors ${
                          hasAppointment ? 'bg-primary-100 border-primary-300' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <span className={hasAppointment ? 'font-bold text-primary-700' : 'text-neutral-600'}>
                          {date.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Appointments List */}
              <div>
                <h4 className="font-medium text-neutral-800 mb-4">Prossimi Appuntamenti</h4>
                {student.appointments && student.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {student.appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{appointment.title}</p>
                            <p className="text-sm text-neutral-500">
                              {new Date(appointment.date).toLocaleDateString('it-IT')} alle {appointment.time}
                            </p>
                            <p className="text-sm text-neutral-600">{appointment.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={FiIcons.FiEdit}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowAppointmentModal(true);
                            }}
                          />
                          <Badge variant={
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'cancelled' ? 'danger' : 'warning'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SafeIcon icon={FiIcons.FiCalendar} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-500">Nessun appuntamento programmato</p>
                  </div>
                )}
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
              {student.convertedFromLead && (
                <span className="ml-2 text-accent-600 font-medium">• Convertito da Lead</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiPhone} onClick={() => window.open(`tel:${student.phone}`)}>
            Chiama
          </Button>
          <Button variant="outline" icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
            Email
          </Button>
          <Button icon={FiIcons.FiFileText} onClick={() => generateStudentContract(student)}>
            Contratto
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
            <p className="text-sm text-neutral-500">Pagato / €{student.totalAmount}</p>
          </div>
          <div className="text-center">
            <Badge 
              variant={student.status === 'active' ? 'success' : 'warning'} 
              className="text-base px-4 py-2"
            >
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

      {/* Modals */}
      <AnimatePresence>
        {showDocumentUpload && (
          <DocumentUploadModal
            onClose={() => setShowDocumentUpload(false)}
            onUpload={handleDocumentUpload}
            title="Carica Documento Studente"
          />
        )}
        {showExamRequest && (
          <ExamRequestModal
            student={student}
            onClose={() => setShowExamRequest(false)}
            onRequestCreated={handleExamRequest}
          />
        )}
        {showPaymentModal && (
          <PaymentModal
            student={student}
            onClose={() => setShowPaymentModal(false)}
            onPaymentAdded={handlePaymentAdded}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;