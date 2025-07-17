import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { generateStudentContract, sendEmail, emailTemplates } from '../utils';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (id && state.students) {
      const foundStudent = state.students.find(s => s.id === parseInt(id));
      setStudent(foundStudent);
      setLoading(false);
    }
  }, [id, state.students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Caricamento profilo studente...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiIcons.FiUser} className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">Studente non trovato</h3>
        <p className="text-neutral-500 mb-6">Lo studente richiesto non esiste o è stato eliminato.</p>
        <Link to="/students">
          <Button icon={FiIcons.FiArrowLeft}>Torna alla lista studenti</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: FiIcons.FiUser },
    { id: 'documents', label: 'Documenti', icon: FiIcons.FiFile },
    { id: 'payments', label: 'Pagamenti', icon: FiIcons.FiCreditCard },
    { id: 'exams', label: 'Esami', icon: FiIcons.FiAward },
    { id: 'communications', label: 'Comunicazioni', icon: FiIcons.FiMessageSquare }
  ];

  const getAssignedSchool = () => {
    if (!student.assignedSchool) return null;
    return state.schools.find(school => school.id === student.assignedSchool);
  };

  const getPaymentProgress = () => {
    const percentage = (student.paidAmount / student.totalAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: student.totalAmount - student.paidAmount
    };
  };

  const handleSendEmail = async (template) => {
    const toastId = toast.loading('Invio email in corso...');
    try {
      const emailData = emailTemplates[template](student);
      const smtpSettings = state.settings.integrations.smtp;

      if (!smtpSettings || !smtpSettings.active) {
        toast.error('SMTP non configurato. Configura SMTP nelle Integrazioni API', { id: toastId });
        return;
      }

      await sendEmail(student.email, emailData.subject, emailData.content, { smtp: smtpSettings });

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
      setStudent(updatedStudent);
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email', { id: toastId });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const assignedSchool = getAssignedSchool();
        const paymentProgress = getPaymentProgress();

        return (
          <div className="space-y-6">
            {/* Student Info Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-neutral-600">{student.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                        {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                      </Badge>
                      <span className="text-sm text-neutral-500">
                        Iscritto il {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
                    Invia Email
                  </Button>
                  <Button icon={FiIcons.FiEdit}>Modifica</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Corso</p>
                  <p className="font-semibold text-neutral-800">{student.course}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Anni da Recuperare</p>
                  <p className="font-semibold text-neutral-800">{student.yearsToRecover} anni</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Telefono</p>
                  <p className="font-semibold text-neutral-800">{student.phone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500">Tipo Pagamento</p>
                  <p className="font-semibold text-neutral-800">
                    {student.paymentType === 'wire_transfer' ? 'Bonifico' : 
                     student.paymentType === 'installment' ? 'Rateale' : 'Finanziamento'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Stato Pagamenti</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-800">€{student.totalAmount}</p>
                  <p className="text-sm text-neutral-500">Importo Totale</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-600">€{student.paidAmount}</p>
                  <p className="text-sm text-neutral-500">Pagato</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">€{paymentProgress.remaining}</p>
                  <p className="text-sm text-neutral-500">Rimanente</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progresso pagamenti</span>
                  <span>{Math.round(paymentProgress.percentage)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${paymentProgress.percentage}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* School Assignment */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">Scuola per Esami</h3>
                <Button variant="outline" size="sm" icon={FiIcons.FiMapPin}>
                  {assignedSchool ? 'Cambia Scuola' : 'Assegna Scuola'}
                </Button>
              </div>
              {assignedSchool ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiMapPin} className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">{assignedSchool.name}</p>
                    <p className="text-sm text-neutral-600">{assignedSchool.address}</p>
                    <p className="text-sm text-neutral-500">Contatto: {assignedSchool.contact}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500">Nessuna scuola assegnata per gli esami</p>
                </div>
              )}
            </Card>

            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500">Codice Fiscale</p>
                    <p className="font-medium text-neutral-800">{student.codiceFiscale || 'Non fornito'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Data di Nascita</p>
                    <p className="font-medium text-neutral-800">
                      {student.birthDate ? new Date(student.birthDate).toLocaleDateString('it-IT') : 'Non fornita'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Luogo di Nascita</p>
                    <p className="font-medium text-neutral-800">{student.birthPlace || 'Non fornito'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500">Indirizzo</p>
                    <p className="font-medium text-neutral-800">{student.address || 'Non fornito'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Città</p>
                    <p className="font-medium text-neutral-800">
                      {student.city} {student.province && `(${student.province})`} {student.cap}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'documents':
        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">Documenti Studente</h3>
              <Button icon={FiIcons.FiUpload}>Carica Documento</Button>
            </div>
            {student.documents && student.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.documents.map(doc => (
                  <div key={doc.id} className="p-4 border border-neutral-200 rounded-xl hover:shadow-soft transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <SafeIcon icon={FiIcons.FiFile} className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">{doc.name}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{doc.category || 'Generale'}</Badge>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={FiIcons.FiEye}>Visualizza</Button>
                        <Button variant="ghost" size="sm" icon={FiIcons.FiDownload}>Scarica</Button>
                      </div>
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

      case 'payments':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Gestione Pagamenti</h3>
                <Button icon={FiIcons.FiPlus}>Registra Pagamento</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-neutral-50 rounded-xl text-center">
                  <p className="text-sm text-neutral-500">Importo Totale</p>
                  <p className="text-2xl font-bold text-neutral-800">€{student.totalAmount}</p>
                </div>
                <div className="p-4 bg-accent-50 rounded-xl text-center">
                  <p className="text-sm text-accent-600">Importo Pagato</p>
                  <p className="text-2xl font-bold text-accent-800">€{student.paidAmount}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl text-center">
                  <p className="text-sm text-orange-600">Da Pagare</p>
                  <p className="text-2xl font-bold text-orange-800">
                    €{student.totalAmount - student.paidAmount}
                  </p>
                </div>
              </div>

              {student.payments && student.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Data</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Importo</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Metodo</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Stato</th>
                        <th className="text-right py-4 px-6 font-semibold text-neutral-800">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payments.map(payment => (
                        <tr key={payment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 px-6">
                            {new Date(payment.date).toLocaleDateString('it-IT')}
                          </td>
                          <td className="py-4 px-6 font-semibold">€{payment.amount}</td>
                          <td className="py-4 px-6">
                            {payment.method === 'bank_transfer'
                              ? 'Bonifico'
                              : payment.method === 'card'
                              ? 'Carta'
                              : payment.method === 'cash'
                              ? 'Contanti'
                              : 'Altro'}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>
                              {payment.status === 'completed' ? 'Completato' : 'In attesa'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button variant="ghost" size="sm" icon={FiIcons.FiDownload}>
                              Ricevuta
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiCreditCard} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun pagamento registrato</p>
                  <Button icon={FiIcons.FiPlus}>Registra Primo Pagamento</Button>
                </div>
              )}
            </Card>

            {/* Installment Plan if applicable */}
            {student.paymentType === 'installment' && student.installmentPlan && student.installmentPlan.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Piano Rateale</h3>
                <div className="space-y-3">
                  {student.installmentPlan.map((installment, index) => (
                    <div key={installment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-neutral-600">Rata {index + 1}</span>
                        <span className="text-sm text-neutral-500">
                          Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">€{installment.amount.toFixed(2)}</span>
                        <Badge variant={installment.paid ? 'success' : installment.status === 'overdue' ? 'danger' : 'warning'}>
                          {installment.paid ? 'Pagata' : installment.status === 'overdue' ? 'Scaduta' : 'In sospeso'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">Gestione Esami</h3>
                <Button icon={FiIcons.FiPlus}>Richiedi Esame</Button>
              </div>

              {student.exams && student.exams.length > 0 ? (
                <div className="space-y-4">
                  {student.exams.map(exam => (
                    <div
                      key={exam.id}
                      className="p-4 border border-neutral-200 rounded-xl hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <SafeIcon
                              icon={FiIcons.FiAward}
                              className="w-5 h-5 text-primary-600"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{exam.examType || 'Esame di Idoneità'}</p>
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
                              ? 'primary'
                              : exam.status === 'requested'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {exam.status === 'completed'
                            ? 'Completato'
                            : exam.status === 'scheduled'
                            ? 'Programmato'
                            : exam.status === 'requested'
                            ? 'Richiesto'
                            : 'In attesa'}
                        </Badge>
                      </div>
                      <div className="pl-13">
                        <p className="text-sm text-neutral-600 mb-2">
                          <strong>Materie:</strong> {exam.subjects ? exam.subjects.join(', ') : 'Non specificate'}
                        </p>
                        {exam.notes && (
                          <p className="text-sm text-neutral-500">
                            <strong>Note:</strong> {exam.notes}
                          </p>
                        )}
                        {exam.schoolId && (
                          <p className="text-sm text-neutral-500">
                            <strong>Scuola:</strong> {state.schools.find(s => s.id === exam.schoolId)?.name || 'Non specificata'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiIcons.FiAward} className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-4">Nessun esame programmato</p>
                  <Button icon={FiIcons.FiPlus}>Programma Primo Esame</Button>
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
                <h3 className="text-lg font-semibold text-neutral-800">Storico Comunicazioni</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
                    Invia Email
                  </Button>
                  <Button icon={FiIcons.FiMessageSquare}>Nuovo Messaggio</Button>
                </div>
              </div>

              {student.communications && student.communications.length > 0 ? (
                <div className="space-y-4">
                  {student.communications.map(comm => (
                    <div
                      key={comm.id}
                      className="p-4 border border-neutral-200 rounded-xl hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <SafeIcon
                            icon={comm.type === 'email' ? FiIcons.FiMail : FiIcons.FiMessageSquare}
                            className="w-5 h-5 text-primary-600"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-neutral-800">{comm.subject}</p>
                            <Badge
                              variant={
                                comm.status === 'sent'
                                  ? 'success'
                                  : comm.status === 'failed'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {comm.status === 'sent'
                                ? 'Inviato'
                                : comm.status === 'failed'
                                ? 'Fallito'
                                : 'In attesa'}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{comm.content}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-500">
                              {new Date(comm.sentAt).toLocaleString('it-IT')}
                            </p>
                            <Button variant="ghost" size="sm" icon={FiIcons.FiEye}>
                              Visualizza
                            </Button>
                          </div>
                        </div>
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
                  <Button icon={FiIcons.FiMail} onClick={() => handleSendEmail('welcome')}>
                    Invia Prima Email
                  </Button>
                </div>
              )}
            </Card>
          </div>
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
          <Link to="/students">
            <Button variant="ghost" icon={FiIcons.FiArrowLeft}>
              Torna alla lista
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800">
              Profilo Studente
            </h1>
            <p className="text-neutral-600 mt-2">
              Gestisci tutte le informazioni dello studente
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={() => generateStudentContract(student)}>
            Contratto
          </Button>
          <Button icon={FiIcons.FiEdit}>
            Modifica Studente
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

export default StudentProfile;