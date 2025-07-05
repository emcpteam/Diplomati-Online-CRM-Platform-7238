import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import CourseModal from '../components/modals/CourseModal';
import CourseStudentsModal from '../components/modals/CourseStudentsModal';
import SubjectExpandModal from '../components/modals/SubjectExpandModal';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CoursesSubjects = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');

  const filteredCourses = state.courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnrolledStudentsCount = (courseId) => {
    return state.students.filter(student => 
      student.course === state.courses.find(c => c.id === courseId)?.name
    ).length;
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalMode('add');
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setModalMode('edit');
    setShowCourseModal(true);
  };

  const handleViewStudents = (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
  };

  const handleExpandSubjects = (course) => {
    setSelectedCourse(course);
    setShowSubjectsModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Tipo', 'Anno Accademico', 'Prezzo', 'Materie', 'Studenti Iscritti'],
      ...state.courses.map(course => [
        course.name,
        course.type,
        course.academicYear,
        course.price,
        course.subjects.join(';'),
        getEnrolledStudentsCount(course.id)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corsi-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Export completato con successo!');
  };

  const handleDuplicateCourse = (course) => {
    const newCourse = {
      ...course,
      id: Date.now(),
      name: `${course.name} (Copia)`,
      academicYear: '2024-2025'
    };

    dispatch({ type: 'ADD_COURSE', payload: newCourse });
    toast.success('Corso duplicato con successo!');
  };

  const CourseDetailsModal = ({ course, onClose }) => (
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
              <h2 className="text-2xl font-bold text-neutral-800">
                {course.name}
              </h2>
              <p className="text-neutral-600">{course.type}</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Informazioni Corso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Nome Corso</p>
                <p className="font-medium text-neutral-800">{course.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Tipo</p>
                <p className="font-medium text-neutral-800">{course.type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Anno Accademico</p>
                <p className="font-medium text-neutral-800">{course.academicYear}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Prezzo</p>
                <p className="font-medium text-neutral-800">€{course.price}</p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Materie ({course.subjects.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {course.subjects.map((subject) => (
                <div key={subject} className="p-3 bg-primary-50 rounded-xl text-center">
                  <span className="text-sm font-medium text-primary-700">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">
                Studenti Iscritti ({getEnrolledStudentsCount(course.id)})
              </h3>
              <Button 
                size="sm" 
                icon={FiIcons.FiUsers}
                onClick={() => {
                  onClose();
                  handleViewStudents(course);
                }}
              >
                Gestisci Studenti
              </Button>
            </div>
            
            <div className="space-y-3">
              {state.students
                .filter(student => student.course === course.name)
                .slice(0, 3)
                .map((student) => (
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
                        <p className="text-sm text-neutral-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                        {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                      </Badge>
                      <p className="text-xs text-neutral-500 mt-1">
                        {student.yearsToRecover} anni da recuperare
                      </p>
                    </div>
                  </div>
                ))}

              {getEnrolledStudentsCount(course.id) > 3 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      onClose();
                      handleViewStudents(course);
                    }}
                  >
                    Vedi tutti ({getEnrolledStudentsCount(course.id) - 3} altri)
                  </Button>
                </div>
              )}

              {getEnrolledStudentsCount(course.id) === 0 && (
                <p className="text-neutral-500 text-center py-8">Nessuno studente iscritto</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {course.notes && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Note
              </h3>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-neutral-700">{course.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={FiIcons.FiCopy}
                onClick={() => {
                  handleDuplicateCourse(course);
                  onClose();
                }}
              >
                Duplica
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
              <Button
                icon={FiIcons.FiEdit}
                onClick={() => {
                  onClose();
                  handleEditCourse(course);
                }}
              >
                Modifica Corso
              </Button>
            </div>
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
            Corsi e Materie
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i corsi offerti dalla piattaforma
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload} onClick={handleExport}>
            Esporta
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={handleAddCourse}>
            Nuovo Corso
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Cerca corsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiIcons.FiSearch}
          className="max-w-md"
        />
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiBookOpen} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 line-clamp-2">
                      {course.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{course.type}</p>
                  </div>
                </div>
                <Badge variant="primary">
                  {getEnrolledStudentsCount(course.id)} studenti
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Anno Accademico:</span>
                  <span className="font-medium text-neutral-800">{course.academicYear}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Prezzo:</span>
                  <span className="font-medium text-neutral-800">€{course.price}</span>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-2">Materie ({course.subjects.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {course.subjects.slice(0, 3).map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {course.subjects.length > 3 && (
                      <button
                        onClick={() => handleExpandSubjects(course)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                      >
                        +{course.subjects.length - 3} altre
                      </button>
                    )}
                  </div>
                </div>

                {course.notes && (
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiIcons.FiFileText} className="w-4 h-4 text-neutral-400 mt-1" />
                    <p className="text-sm text-neutral-600 line-clamp-2">{course.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiUsers}
                    onClick={() => handleViewStudents(course)}
                  >
                    Studenti
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiIcons.FiEdit}
                    onClick={() => handleEditCourse(course)}
                  >
                    Modifica
                  </Button>
                </div>
                <Button
                  size="sm"
                  icon={FiIcons.FiEye}
                  onClick={() => setSelectedCourse(course)}
                >
                  Dettagli
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiBookOpen} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Nessun corso trovato
          </h3>
          <p className="text-neutral-500 mb-6">
            Non ci sono corsi che corrispondono ai criteri di ricerca.
          </p>
          <Button icon={FiIcons.FiPlus} onClick={handleAddCourse}>
            Aggiungi Primo Corso
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCourseModal && (
          <CourseModal
            course={selectedCourse}
            onClose={() => setShowCourseModal(false)}
            mode={modalMode}
          />
        )}

        {showStudentsModal && selectedCourse && (
          <CourseStudentsModal
            course={selectedCourse}
            onClose={() => setShowStudentsModal(false)}
            onUpdateCourse={(updatedCourse) => {
              dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
            }}
          />
        )}

        {showSubjectsModal && selectedCourse && (
          <SubjectExpandModal
            course={selectedCourse}
            onClose={() => setShowSubjectsModal(false)}
          />
        )}

        {selectedCourse && !showCourseModal && !showStudentsModal && !showSubjectsModal && (
          <CourseDetailsModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{state.courses.length}</p>
            <p className="text-sm text-neutral-500">Corsi Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {state.courses.reduce((sum, course) => sum + course.subjects.length, 0)}
            </p>
            <p className="text-sm text-neutral-500">Materie Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.students.length}
            </p>
            <p className="text-sm text-neutral-500">Studenti Iscritti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {state.courses.reduce((sum, course) => sum + course.price, 0).toLocaleString()}€
            </p>
            <p className="text-sm text-neutral-500">Valore Totale</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CoursesSubjects;