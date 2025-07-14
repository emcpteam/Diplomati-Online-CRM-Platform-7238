import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import StudentModal from '../components/modals/StudentModal';
import PaymentModal from '../components/modals/PaymentModal';
import AppointmentModal from '../components/modals/AppointmentModal';
import DocumentUploadModal from '../components/modals/DocumentUploadModal';
import AssignSchoolModal from '../components/modals/AssignSchoolModal';
import ExamRequestModal from '../components/modals/ExamRequestModal';
import { useApp } from '../context/AppContext';
import { generateStudentContract, sendEmail, emailTemplates } from '../utils';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAssignSchoolModal, setShowAssignSchoolModal] = useState(false);
  const [showExamRequestModal, setShowExamRequestModal] = useState(false);

  // Find student by ID
  const student = state.students.find((s) => s.id === parseInt(id)) || null;

  useEffect(() => {
    if (!student) {
      toast.error('Studente non trovato');
      navigate('/students');
    }
  }, [student, navigate]);

  if (!student) return null;

  const getAssignedSchool = () => {
    if (!student.assignedSchool) return null;
    return state.schools.find((school) => school.id === student.assignedSchool);
  };

  const handleEditStudent = () => {
    setModalType('student');
    setShowModal(true);
  };

  const handleAddPayment = () => {
    setModalType('payment');
    setShowModal(true);
  };

  const handleAddAppointment = () => {
    setModalType('appointment');
    setShowModal(true);
  };

  const handleUploadDocument = () => {
    setModalType('document');
    setShowModal(true);
  };

  const handleAssignSchool = () => {
    setShowAssignSchoolModal(true);
  };

  const handleRequestExam = () => {
    setShowExamRequestModal(true);
  };

  const handleGenerateContract = () => {
    generateStudentContract(student);
    toast.success('Contratto generato e scaricato con successo!');
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
            sentAt: new Date().toISOString(),
            status: 'sent',
          },
        ],
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email', { id: toastId });
    }
  };

  const handleDocumentUpload = (document) => {
    const updatedStudent = {
      ...student,
      documents: [...(student.documents || []), document],
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Documento caricato con successo!');
  };

  const handlePaymentAdded = (payment, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success(`Pagamento di €${payment.amount} registrato con successo!`);
  };

  const handleAppointmentAdded = (appointment) => {
    const updatedStudent = {
      ...student,
      appointments: [...(student.appointments || []), appointment],
    };
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Appuntamento aggiunto con successo!');
  };

  const handleSchoolAssigned = (updatedStudent) => {
    const assignedSchool = getAssignedSchool();
    toast.success(`Studente assegnato a ${assignedSchool?.name || 'nessuna scuola'} per gli esami!`);
  };

  const handleExamRequest = (examRequest, updatedStudent) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    toast.success('Richiesta esame creata con successo!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Nome Completo</p>
                  <p className="font-medium text-neutral-800">
                    {student.firstName} {student.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Codice Fiscale</p>
                  <p className="font-medium text-neutral-800">{student.codiceFiscale || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium text-neutral-800">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Telefono</p>
                  <p className="font-medium text-neutral-800">{student.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Data di Nascita</p>
                  <p className="font-medium text-neutral-800">
                    {student.birthDate ? new Date(student.birthDate).toLocaleDateString('it-IT') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Luogo di Nascita</p>
                  <p className="font-medium text-neutral-800">{student.birthPlace || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Indirizzo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Indirizzo</p>
                  <p className="font-medium text-neutral-800">{student.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Città</p>
                  <p className="font-medium text-neutral-800">{student.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Provincia</p>
                  <p className="font-medium text-neutral-800">{student.province || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">CAP</p>
                  <p className="font-medium text-neutral-800">{student.cap || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Course Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Corso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Corso</p>
                  <p className="font-medium text-neutral-800">{student.course}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Anni da Recuperare</p>
                  <p className="font-medium text-neutral-800">{student.yearsToRecover}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Data Iscrizione</p>
                  <p className="font-medium text-neutral-800">
                    {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Stato</p>
                  <Badge
                    variant={
                      student.status === 'active'
                        ? 'success'
                        : student.status === 'suspended'
                        ? 'warning'
                        : 'primary'
                    }
                  >
                    {student.status === 'active'
                      ? 'Attivo'
                      : student.status === 'suspended'
                      ? 'Sospeso'
                      : 'Completato'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Pagamento</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-neutral-500">Importo Totale</p>
                    <p className="font-medium text-neutral-800">€{student.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Importo Pagato</p>
                    <p className="font-medium text-accent-600">€{student.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Da Pagare</p>
                    <p className="font-medium text-orange-600">
                      €{(student.totalAmount - student.paidAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-2">Progresso Pagamenti</p>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${((student.paidAmount / student.totalAmount) * 100).toFixed(1)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {((student.paidAmount / student.totalAmount) * 100).toFixed(1)}% completato
                  </p>
                </div>

                {student.paymentType === 'installment' && student.installmentPlan && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Piano Rate</p>
                    <div className="space-y-2">
                      {student.installmentPlan.map((installment, index) => (
                        <div
                          key={installment.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-neutral-800">
                              Rata {index + 1} - €{installment.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-neutral-500">
                              Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <Badge
                            variant={
                              installment.paid
                                ? 'success'
                                : new Date(installment.dueDate) < new Date()
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {installment.paid ? 'Pagata' : 'In Attesa'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* School Assignment */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">Scuola Assegnata</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiIcons.FiMapPin}
                  onClick={() => handleAssignSchool(student)}
                >
                  {student.assignedSchool ? 'Cambia Scuola' : 'Assegna Scuola'}
                </Button>
              </div>
              {student.assignedSchool ? (
                <div className="space-y-4">
                  {(() => {
                    const school = state.schools.find((s) => s.id === student.assignedSchool);
                    return school ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-neutral-500">Nome Scuola</p>
                            <p className="font-medium text-neutral-800">{school.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Indirizzo</p>
                            <p className="font-medium text-neutral-800">{school.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Contatto</p>
                            <p className="font-medium text-neutral-800">{school.contact}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">Email</p>
                            <p className="font-medium text-neutral-800">{school.email}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-neutral-500">Scuola non trovata</p>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiMapPin} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500">Nessuna scuola assegnata</p>
                  <Button
                    variant="outline"
                    icon={FiIcons.FiMapPin}
                    onClick={() => handleAssignSchool(student)}
                    className="mt-4"
                  >
                    Assegna Scuola
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Pagamenti</h3>
                <Button icon={FiIcons.FiPlus} onClick={handleAddPayment}>
                  Nuovo Pagamento
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                  <div>
                    <p className="text-sm text-primary-600">Riepilogo Pagamenti</p>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-primary-500">Importo Totale</p>
                        <p className="text-lg font-semibold text-primary-800">
                          €{student.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-500">Pagato</p>
                        <p className="text-lg font-semibold text-primary-800">
                          €{student.paidAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-500">Rimanente</p>
                        <p className="text-lg font-semibold text-primary-800">
                          €{(student.totalAmount - student.paidAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 h-20">
                    <div className="relative w-full h-full">
                      <div className="w-full h-full rounded-full bg-primary-100"></div>
                      <div
                        className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary-500"
                        style={{
                          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                          transform: `rotate(${
                            ((student.paidAmount / student.totalAmount) * 100 * 3.6).toFixed(1)
                          }deg)`,
                        }}
                      ></div>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-700">
                          {((student.paidAmount / student.totalAmount) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {student.payments && student.payments.length > 0 ? (
                  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-neutral-800">Data</th>
                          <th className="text-left py-4 px-6 font-semibold text-neutral-800">Importo</th>
                          <th className="text-left py-4 px-6 font-semibold text-neutral-800">Metodo</th>
                          <th className="text-left py-4 px-6 font-semibold text-neutral-800">Stato</th>
                          <th className="text-right py-4 px-6 font-semibold text-neutral-800">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.payments
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((payment) => (
                            <tr
                              key={payment.id}
                              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                {new Date(payment.date).toLocaleDateString('it-IT')}
                              </td>
                              <td className="py-4 px-6 font-medium text-neutral-800">
                                €{payment.amount.toLocaleString()}
                              </td>
                              <td className="py-4 px-6">
                                {payment.method === 'bank_transfer'
                                  ? 'Bonifico'
                                  : payment.method === 'card'
                                  ? 'Carta'
                                  : payment.method === 'cash'
                                  ? 'Contanti'
                                  : payment.method}
                              </td>
                              <td className="py-4 px-6">
                                <Badge variant="success">Completato</Badge>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button variant="ghost" size="sm" icon={FiIcons.FiDownload}>
                                    Ricevuta
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <SafeIcon icon={FiIcons.FiDollarSign} className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 mb-6">Nessun pagamento registrato</p>
                    <Button icon={FiIcons.FiPlus} onClick={handleAddPayment}>
                      Aggiungi Primo Pagamento
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {student.paymentType === 'installment' && student.installmentPlan && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-6">Piano Rate</h3>
                <div className="space-y-4">
                  {student.installmentPlan.map((installment, index) => (
                    <div
                      key={installment.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        installment.paid
                          ? 'border-accent-300 bg-accent-50'
                          : new Date(installment.dueDate) < new Date()
                          ? 'border-red-300 bg-red-50'
                          : 'border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              installment.paid
                                ? 'bg-accent-500'
                                : new Date(installment.dueDate) < new Date()
                                ? 'bg-red-500'
                                : 'bg-neutral-200'
                            }`}
                          >
                            <span className="text-white font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">
                              Rata {index + 1} - €{installment.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-neutral-500">
                              Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            installment.paid
                              ? 'success'
                              : new Date(installment.dueDate) < new Date()
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {installment.paid ? 'Pagata' : 'In Attesa'}
                        </Badge>
                      </div>
                      {installment.paid && installment.paidDate && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 text-sm">
                          <p className="text-accent-600">
                            Pagata il {new Date(installment.paidDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Documenti</h3>
                <Button icon={FiIcons.FiUpload} onClick={handleUploadDocument}>
                  Carica Documento
                </Button>
              </div>

              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {student.documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                          <SafeIcon
                            icon={
                              doc.type?.startsWith('image/')
                                ? FiIcons.FiImage
                                : doc.type?.includes('pdf')
                                ? FiIcons.FiFileText
                                : FiIcons.FiFile
                            }
                            className="w-5 h-5 text-neutral-500"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{doc.name}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FiIcons.FiEye}
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          Visualizza
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FiIcons.FiDownload}
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          Scarica
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiFile} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-6">Nessun documento caricato</p>
                  <Button icon={FiIcons.FiUpload} onClick={handleUploadDocument}>
                    Carica Primo Documento
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Documenti di Sistema</h3>
                <Button variant="outline" icon={FiIcons.FiFileText} onClick={handleGenerateContract}>
                  Genera Contratto
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiFileText} className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-800">Contratto di Iscrizione</p>
                      <p className="text-sm text-primary-600">
                        Contratto di iscrizione al corso {student.course}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiDownload}
                      onClick={handleGenerateContract}
                    >
                      Genera
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Esami</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    icon={FiIcons.FiMapPin}
                    onClick={handleAssignSchool}
                    disabled={student.assignedSchool ? false : true}
                  >
                    {student.assignedSchool ? 'Cambia Scuola' : 'Assegna Scuola'}
                  </Button>
                  <Button
                    icon={FiIcons.FiFileText}
                    onClick={handleRequestExam}
                    disabled={student.assignedSchool ? false : true}
                  >
                    Richiedi Esame
                  </Button>
                </div>
              </div>

              {!student.assignedSchool ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiMapPin} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-2">Nessuna scuola assegnata</p>
                  <p className="text-neutral-500 mb-6">
                    Per richiedere un esame è necessario assegnare una scuola allo studente
                  </p>
                  <Button icon={FiIcons.FiMapPin} onClick={handleAssignSchool}>
                    Assegna Scuola
                  </Button>
                </div>
              ) : student.exams && student.exams.length > 0 ? (
                <div className="space-y-4">
                  {student.exams.map((exam) => {
                    const school = state.schools.find((s) => s.id === exam.schoolId);
                    return (
                      <div
                        key={exam.id}
                        className="p-4 bg-white border-2 border-neutral-200 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                              <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800">
                                Esame {exam.examType === 'idoneity' ? 'di Idoneità' : 'di Maturità'}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {new Date(exam.examDate).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              exam.status === 'completed'
                                ? 'success'
                                : exam.status === 'scheduled'
                                ? 'warning'
                                : 'primary'
                            }
                          >
                            {exam.status === 'completed'
                              ? 'Completato'
                              : exam.status === 'scheduled'
                              ? 'Programmato'
                              : 'Richiesto'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-neutral-500">Scuola</p>
                            <p className="text-sm font-medium text-neutral-800">{school?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Anno Accademico</p>
                            <p className="text-sm font-medium text-neutral-800">{exam.academicYear}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-neutral-500 mb-2">Materie d'esame</p>
                          <div className="flex flex-wrap gap-2">
                            {exam.subjects.map((subject) => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {exam.notes && (
                          <div className="p-3 bg-neutral-50 rounded-lg text-sm text-neutral-700 mb-4">
                            <p className="font-medium text-neutral-800 mb-1">Note:</p>
                            <p>{exam.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" icon={FiIcons.FiFileText}>
                            Richiesta
                          </Button>
                          <Button variant="ghost" size="sm" icon={FiIcons.FiMail}>
                            Email
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiCalendar} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-6">Nessun esame richiesto</p>
                  <Button icon={FiIcons.FiFileText} onClick={handleRequestExam}>
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
                <h3 className="text-lg font-semibold text-neutral-800">Appuntamenti</h3>
                <Button icon={FiIcons.FiPlus} onClick={handleAddAppointment}>
                  Nuovo Appuntamento
                </Button>
              </div>

              {student.appointments && student.appointments.length > 0 ? (
                <div className="space-y-4">
                  {student.appointments
                    .sort(
                      (a, b) =>
                        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
                    )
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-4 border-2 rounded-xl ${
                          appointment.status === 'completed'
                            ? 'border-accent-200 bg-accent-50'
                            : appointment.status === 'cancelled'
                            ? 'border-red-200 bg-red-50'
                            : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                appointment.status === 'completed'
                                  ? 'bg-accent-500'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-500'
                                  : 'bg-primary-500'
                              }`}
                            >
                              <SafeIcon
                                icon={
                                  appointment.type === 'tutoring'
                                    ? FiIcons.FiBook
                                    : appointment.type === 'exam'
                                    ? FiIcons.FiClipboard
                                    : appointment.type === 'meeting'
                                    ? FiIcons.FiUsers
                                    : FiIcons.FiCalendar
                                }
                                className="w-6 h-6 text-white"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-neutral-800">{appointment.title}</h4>
                              <p className="text-sm text-neutral-500">
                                {appointment.date} - {appointment.time}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              appointment.status === 'completed'
                                ? 'success'
                                : appointment.status === 'cancelled'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {appointment.status === 'completed'
                              ? 'Completato'
                              : appointment.status === 'cancelled'
                              ? 'Cancellato'
                              : 'Programmato'}
                          </Badge>
                        </div>

                        {appointment.description && (
                          <p className="text-sm text-neutral-600 mb-3">{appointment.description}</p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-neutral-500">Durata:</span>{' '}
                              <span className="font-medium text-neutral-700">
                                {appointment.duration} min
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500">Tipo:</span>{' '}
                              <span className="font-medium text-neutral-700">
                                {appointment.type === 'tutoring'
                                  ? 'Tutoring'
                                  : appointment.type === 'exam'
                                  ? 'Esame'
                                  : appointment.type === 'meeting'
                                  ? 'Riunione'
                                  : 'Consultazione'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" icon={FiIcons.FiEdit2}>
                              Modifica
                            </Button>
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
                  <p className="text-neutral-500 mb-6">Nessun appuntamento programmato</p>
                  <Button icon={FiIcons.FiPlus} onClick={handleAddAppointment}>
                    Aggiungi Primo Appuntamento
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case 'communications':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Comunicazioni</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
                    Invia Email
                  </Button>
                  <Button variant="outline" icon={FiIcons.FiPhone}>
                    Registra Chiamata
                  </Button>
                </div>
              </div>

              {student.communications && student.communications.length > 0 ? (
                <div className="space-y-4">
                  {student.communications
                    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                    .map((comm) => (
                      <div key={comm.id} className="p-4 bg-white border border-neutral-200 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                comm.type === 'email'
                                  ? 'bg-primary-100'
                                  : comm.type === 'phone'
                                  ? 'bg-accent-100'
                                  : 'bg-neutral-100'
                              }`}
                            >
                              <SafeIcon
                                icon={
                                  comm.type === 'email'
                                    ? FiIcons.FiMail
                                    : comm.type === 'phone'
                                    ? FiIcons.FiPhone
                                    : FiIcons.FiMessageSquare
                                }
                                className={`w-5 h-5 ${
                                  comm.type === 'email'
                                    ? 'text-primary-600'
                                    : comm.type === 'phone'
                                    ? 'text-accent-600'
                                    : 'text-neutral-600'
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-neutral-800">{comm.subject || 'Comunicazione'}</h4>
                              <p className="text-sm text-neutral-500">
                                {new Date(comm.sentAt).toLocaleString('it-IT')}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              comm.status === 'sent' || comm.status === 'completed'
                                ? 'success'
                                : comm.status === 'failed'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {comm.status === 'sent' || comm.status === 'completed'
                              ? 'Inviato'
                              : comm.status === 'failed'
                              ? 'Fallito'
                              : 'In Attesa'}
                          </Badge>
                        </div>

                        {comm.content && <p className="text-sm text-neutral-600 mb-3">{comm.content}</p>}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiMail} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-6">Nessuna comunicazione registrata</p>
                  <Button icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
                    Invia Prima Email
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Email Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiMail} className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-neutral-800">Email di Benvenuto</h4>
                  </div>
                  <p className="text-sm text-neutral-600">Benvenuto nel corso e informazioni iniziali</p>
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiSend}
                      onClick={() => handleSendEmail('welcome')}
                    >
                      Invia
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiDollarSign} className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-neutral-800">Promemoria Pagamento</h4>
                  </div>
                  <p className="text-sm text-neutral-600">Ricorda allo studente di completare i pagamenti</p>
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiSend}
                      onClick={() => handleSendEmail('paymentReminder')}
                    >
                      Invia
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-neutral-800">Preparazione Esame</h4>
                  </div>
                  <p className="text-sm text-neutral-600">Informazioni per la preparazione all'esame</p>
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiSend}
                      onClick={() => handleSendEmail('examPreparation')}
                    >
                      Invia
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiAward} className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-neutral-800">Congratulazioni</h4>
                  </div>
                  <p className="text-sm text-neutral-600">Congratulazioni per il diploma ottenuto</p>
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiSend}
                      onClick={() => handleSendEmail('congratulations')}
                    >
                      Invia
                    </Button>
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
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-neutral-600 mt-2">{student.course} • {student.email}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiMail}
            onClick={() => handleSendEmail('welcome')}
          >
            Email
          </Button>
          <Button icon={FiIcons.FiEdit} onClick={handleEditStudent}>
            Modifica
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Stato</p>
              <Badge
                variant={
                  student.status === 'active'
                    ? 'success'
                    : student.status === 'suspended'
                    ? 'warning'
                    : 'primary'
                }
                className="mt-1"
              >
                {student.status === 'active'
                  ? 'Attivo'
                  : student.status === 'suspended'
                  ? 'Sospeso'
                  : 'Completato'}
              </Badge>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiUser} className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Pagamento</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-lg font-semibold text-accent-600">
                  €{student.paidAmount.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500">
                  / €{student.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiDollarSign} className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Scuola Esami</p>
              {student.assignedSchool ? (
                <p className="text-sm font-medium text-neutral-800 mt-1 line-clamp-1">
                  {getAssignedSchool()?.name || 'Non trovata'}
                </p>
              ) : (
                <Badge variant="warning" className="mt-1">
                  Non Assegnata
                </Badge>
              )}
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiMapPin} className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Anni da Recuperare</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-lg font-semibold text-secondary-600">{student.yearsToRecover}</p>
                <p className="text-sm text-neutral-500">anni</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Panoramica', icon: FiIcons.FiHome },
            { id: 'payments', label: 'Pagamenti', icon: FiIcons.FiDollarSign },
            { id: 'documents', label: 'Documenti', icon: FiIcons.FiFile },
            { id: 'exams', label: 'Esami', icon: FiIcons.FiClipboard },
            { id: 'appointments', label: 'Appuntamenti', icon: FiIcons.FiCalendar },
            { id: 'communications', label: 'Comunicazioni', icon: FiIcons.FiMail },
          ].map((tab) => (
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && modalType === 'student' && (
          <StudentModal
            student={student}
            onClose={() => setShowModal(false)}
            mode="edit"
          />
        )}

        {showModal && modalType === 'payment' && (
          <PaymentModal
            student={student}
            onClose={() => setShowModal(false)}
            onPaymentAdded={handlePaymentAdded}
          />
        )}

        {showModal && modalType === 'appointment' && (
          <AppointmentModal
            onClose={() => setShowModal(false)}
            mode="add"
            studentId={student.id}
            onAppointmentAdded={handleAppointmentAdded}
          />
        )}

        {showModal && modalType === 'document' && (
          <DocumentUploadModal
            onClose={() => setShowModal(false)}
            onUpload={handleDocumentUpload}
            title="Carica Documento"
          />
        )}

        {showAssignSchoolModal && (
          <AssignSchoolModal
            student={student}
            onClose={() => setShowAssignSchoolModal(false)}
            onAssign={handleSchoolAssigned}
          />
        )}

        {showExamRequestModal && (
          <ExamRequestModal
            student={student}
            onClose={() => setShowExamRequestModal(false)}
            onRequestCreated={handleExamRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;