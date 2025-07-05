import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CourseStudentsModal = ({ course, onClose, onUpdateCourse }) => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const studentsPerPage = 8;

  // Get students enrolled in this course
  const enrolledStudents = state.students.filter(student => 
    student.course === course.name &&
    (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(enrolledStudents.length / studentsPerPage);
  const currentStudents = enrolledStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo studente dal corso?')) {
      const student = state.students.find(s => s.id === studentId);
      const updatedStudent = { ...student, course: '' };
      
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Studente rimosso dal corso con successo!');
    }
  };

  const AddStudentToCourseModal = () => {
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [addSearchTerm, setAddSearchTerm] = useState('');

    // Get available students (not enrolled in any course or different course)
    const availableStudents = state.students.filter(student => 
      student.course !== course.name &&
      (student.firstName.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
       student.lastName.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
       student.email.toLowerCase().includes(addSearchTerm.toLowerCase()))
    );

    const handleStudentToggle = (studentId) => {
      setSelectedStudents(prev => 
        prev.includes(studentId) 
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    };

    const handleAddStudents = () => {
      selectedStudents.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        const updatedStudent = { ...student, course: course.name };
        dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      });

      toast.success(`${selectedStudents.length} studenti aggiunti al corso!`);
      setShowAddModal(false);
      setSelectedStudents([]);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
        onClick={() => setShowAddModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">
                Aggiungi Studenti al Corso
              </h3>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowAddModal(false)} />
            </div>
          </div>

          <div className="p-6">
            <Input
              placeholder="Cerca studenti disponibili..."
              value={addSearchTerm}
              onChange={(e) => setAddSearchTerm(e.target.value)}
              icon={FiIcons.FiSearch}
              className="mb-4"
            />

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedStudents.includes(student.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {student.course || 'Nessun corso'} • {student.email}
                        </p>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <SafeIcon icon={FiIcons.FiCheck} className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {availableStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500">Nessuno studente disponibile</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <Badge variant="primary">{selectedStudents.length} selezionati</Badge>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Annulla
                </Button>
                <Button 
                  onClick={handleAddStudents}
                  disabled={selectedStudents.length === 0}
                  icon={FiIcons.FiPlus}
                >
                  Aggiungi ({selectedStudents.length})
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">
                  Studenti del Corso
                </h2>
                <p className="text-neutral-600">{course.name} - {enrolledStudents.length} studenti iscritti</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  icon={FiIcons.FiPlus}
                  onClick={() => setShowAddModal(true)}
                >
                  Aggiungi Studenti
                </Button>
                <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Cerca studenti nel corso..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={FiIcons.FiSearch}
                className="max-w-md"
              />
            </div>

            {/* Students Table */}
            {currentStudents.length > 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Studente</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Data Iscrizione</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Anni da Recuperare</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Stato Pagamento</th>
                        <th className="text-left py-4 px-6 font-semibold text-neutral-800">Stato</th>
                        <th className="text-right py-4 px-6 font-semibold text-neutral-800">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudents.map((student) => (
                        <tr key={student.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="py-4 px-6">
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
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-neutral-800">
                              {new Date(student.enrollmentDate).toLocaleDateString('it-IT')}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary">{student.yearsToRecover} anni</Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>€{student.paidAmount} / €{student.totalAmount}</span>
                              </div>
                              <div className="w-24 bg-neutral-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full"
                                  style={{ width: `${(student.paidAmount / student.totalAmount) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                              {student.status === 'active' ? 'Attivo' : 'Sospeso'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={FiIcons.FiEye}
                                onClick={() => window.open(`#/students/${student.id}`, '_blank')}
                              >
                                Dettagli
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={FiIcons.FiTrash2}
                                onClick={() => handleRemoveStudent(student.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Rimuovi
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiUsers} className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500">
                  {searchTerm ? 'Nessuno studente trovato' : 'Nessuno studente iscritto al corso'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiIcons.FiChevronLeft}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Precedente
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiIcons.FiChevronRight}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Successivo
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Pagina {currentPage} di {totalPages} • {enrolledStudents.length} studenti totali
              </div>
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Student Modal */}
      {showAddModal && <AddStudentToCourseModal />}
    </>
  );
};

export default CourseStudentsModal;