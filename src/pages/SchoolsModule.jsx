import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import SchoolModal from '../components/modals/SchoolModal';
import UploadDocumentSchoolModal from '../components/modals/UploadDocumentSchoolModal';
import ExamTemplateModal from '../components/modals/ExamTemplateModal';
import { useApp } from '../context/AppContext';
import { sendEmail } from '../utils/emailService';
import toast from 'react-hot-toast';

const SchoolsModule = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredSchools = state.schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignedStudentsCount = (schoolId) => {
    return state.students.filter(student =>
      student.assignedSchool === schoolId
    ).length;
  };

  const handleAddSchool = () => {
    setSelectedSchool(null);
    setModalMode('add');
    setShowSchoolModal(true);
  };

  const handleEditSchool = (school) => {
    setSelectedSchool(school);
    setModalMode('edit');
    setShowSchoolModal(true);
  };

  const handleUploadDocument = (school) => {
    setSelectedSchool(school);
    setShowUploadModal(true);
  };

  const handleCreateTemplate = (school) => {
    setSelectedSchool(school);
    setShowTemplateModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Indirizzo', 'Telefono', 'Email', 'Contatto', 'Studenti Assegnati'],
      ...state.schools.map(school => [
        school.name,
        school.address,
        school.phone,
        school.email,
        school.contact,
        school.assignedStudents.length
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scuole-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export completato con successo!');
  };

  const handleSendEmail = async (school) => {
    const toastId = toast.loading('Invio email in corso...');
    try {
      const subject = 'Comunicazione da Diplomati Online';
      const content = `
Gentile ${school.contact},

Vi scriviamo per comunicarvi informazioni importanti riguardo ai nostri studenti.

Cordiali saluti,
Il team di Diplomati Online
      `;

      await sendEmail(school.email, subject, content, state.settings.emailSettings);
      toast.success('Email inviata con successo!', { id: toastId });
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email', { id: toastId });
    }
  };

  const handleDocumentUploaded = (document) => {
    // Update school with new document
    const updatedSchool = {
      ...selectedSchool,
      documents: [...(selectedSchool.documents || []), document]
    };
    dispatch({ type: 'UPDATE_SCHOOL', payload: updatedSchool });
    toast.success('Documento caricato con successo!');
  };

  const handleTemplateSaved = (template) => {
    // Update school with new template
    const updatedSchool = {
      ...selectedSchool,
      examTemplates: [...(selectedSchool.examTemplates || []), template]
    };
    dispatch({ type: 'UPDATE_SCHOOL', payload: updatedSchool });
    toast.success('Template salvato con successo!');
  };

  const SchoolDetailsModal = ({ school, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">{school.name}</h2>
              <p className="text-neutral-600">{school.address}</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni di Contatto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Referente</p>
                <p className="font-medium text-neutral-800">{school.contact}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Telefono</p>
                <p className="font-medium text-neutral-800">{school.phone}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-neutral-800">{school.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Indirizzo</p>
                <p className="font-medium text-neutral-800">{school.address}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">
                Documenti ({school.documents?.length || 0})
              </h3>
              <Button
                size="sm"
                icon={FiIcons.FiUpload}
                onClick={() => {
                  onClose();
                  handleUploadDocument(school);
                }}
              >
                Carica Documento
              </Button>
            </div>
            {school.documents && school.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {school.documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiIcons.FiFile} className="w-5 h-5 text-neutral-500" />
                      <div>
                        <p className="font-medium text-neutral-800 text-sm">{doc.name}</p>
                        <p className="text-xs text-neutral-500">{doc.category}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={FiIcons.FiDownload} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">Nessun documento caricato</p>
            )}
          </div>

          {/* Exam Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">
                Template Esami ({school.examTemplates?.length || 0})
              </h3>
              <Button
                size="sm"
                icon={FiIcons.FiFileText}
                onClick={() => {
                  onClose();
                  handleCreateTemplate(school);
                }}
              >
                Crea Template
              </Button>
            </div>
            {school.examTemplates && school.examTemplates.length > 0 ? (
              <div className="space-y-3">
                {school.examTemplates.map((template) => (
                  <div key={template.id} className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-800">{template.name}</p>
                        <p className="text-sm text-neutral-500">
                          Creato il {new Date(template.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={FiIcons.FiEdit} />
                        <Button variant="ghost" size="sm" icon={FiIcons.FiEye} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">Nessun template creato</p>
            )}
          </div>

          {/* Assigned Students */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Studenti Assegnati ({school.assignedStudents.length})
            </h3>
            <div className="space-y-3">
              {school.assignedStudents.map(studentId => {
                const student = state.students.find(s => s.id === studentId);
                return student ? (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">{student.course}</p>
                      </div>
                    </div>
                    <Badge variant="primary">{student.yearsToRecover} anni</Badge>
                  </div>
                ) : null;
              })}
              {school.assignedStudents.length === 0 && (
                <p className="text-neutral-500 text-center py-8">Nessuno studente assegnato</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {school.notes && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Note</h3>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-neutral-700">{school.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>Chiudi</Button>
            <Button
              icon={FiIcons.FiEdit}
              onClick={() => {
                onClose();
                handleEditSchool(school);
              }}
            >
              Modifica Scuola
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Gestione Scuole
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci le scuole partner per gli esami
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={handleExport}>
            Esporta CSV
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={handleAddSchool}>
            Nuova Scuola
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Cerca scuole..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiIcons.FiSearch}
          className="max-w-md"
        />
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchools.map((school, index) => (
          <motion.div
            key={school.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiMapPin} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 line-clamp-2">
                      {school.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{school.contact}</p>
                  </div>
                </div>
                <Badge variant="primary">
                  {school.assignedStudents.length} studenti
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <SafeIcon icon={FiIcons.FiMapPin} className="w-4 h-4 text-neutral-400 mt-1" />
                  <p className="text-sm text-neutral-600">{school.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiIcons.FiMail} className="w-4 h-4 text-neutral-400" />
                  <p className="text-sm text-neutral-600">{school.email}</p>
                </div>
                {school.notes && (
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-4 h-4 text-neutral-400 mt-1" />
                    <p className="text-sm text-neutral-600 line-clamp-2">{school.notes}</p>
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
                    onClick={() => handleSendEmail(school)}
                  >
                    Email
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiUpload}
                    onClick={() => handleUploadDocument(school)}
                  >
                    Documenti
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiFileText}
                    onClick={() => handleCreateTemplate(school)}
                  >
                    Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiEdit}
                    onClick={() => handleEditSchool(school)}
                  >
                    Modifica
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    icon={FiIcons.FiEye}
                    onClick={() => {
                      setSelectedSchool(school);
                      setShowDetailsModal(true);
                    }}
                  >
                    Dettagli
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiMapPin} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Nessuna scuola trovata
          </h3>
          <p className="text-neutral-500 mb-6">
            Non ci sono scuole che corrispondono ai criteri di ricerca.
          </p>
          <Button icon={FiIcons.FiPlus} onClick={handleAddSchool}>
            Aggiungi Prima Scuola
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showSchoolModal && (
          <SchoolModal
            school={selectedSchool}
            onClose={() => setShowSchoolModal(false)}
            mode={modalMode}
          />
        )}
        {showUploadModal && selectedSchool && (
          <UploadDocumentSchoolModal
            school={selectedSchool}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleDocumentUploaded}
          />
        )}
        {showTemplateModal && selectedSchool && (
          <ExamTemplateModal
            school={selectedSchool}
            onClose={() => setShowTemplateModal(false)}
            onTemplateSaved={handleTemplateSaved}
          />
        )}
        {showDetailsModal && selectedSchool && (
          <SchoolDetailsModal
            school={selectedSchool}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{state.schools.length}</p>
            <p className="text-sm text-neutral-500">Scuole Partner</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {state.schools.reduce((sum, school) => sum + school.assignedStudents.length, 0)}
            </p>
            <p className="text-sm text-neutral-500">Studenti Assegnati</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.schools.filter(school => school.assignedStudents.length > 0).length}
            </p>
            <p className="text-sm text-neutral-500">Scuole Attive</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {state.schools.reduce((sum, school) => sum + (school.documents?.length || 0), 0)}
            </p>
            <p className="text-sm text-neutral-500">Documenti Caricati</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SchoolsModule;