import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AssignStudentModal = ({ school, onClose, onAssign }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const studentsPerPage = 6;

  // Get available students (not already assigned to this school)
  const availableStudents = state.students.filter(student => 
    !school.assignedStudents.includes(student.id) &&
    (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(availableStudents.length / studentsPerPage);
  const currentStudents = availableStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const currentStudentIds = currentStudents.map(s => s.id);
    const allCurrentSelected = currentStudentIds.every(id => selectedStudents.includes(id));
    
    if (allCurrentSelected) {
      setSelectedStudents(prev => prev.filter(id => !currentStudentIds.includes(id)));
    } else {
      setSelectedStudents(prev => [...new Set([...prev, ...currentStudentIds])]);
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Seleziona almeno uno studente');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAssign(selectedStudents);
      toast.success(`${selectedStudents.length} studenti assegnati con successo!`);
      onClose();
    } catch (error) {
      toast.error('Errore durante l\'assegnazione');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Assegna Studenti
              </h2>
              <p className="text-neutral-600">
                {school.name} - Seleziona gli studenti da assegnare
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6">
          {/* Search and Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Cerca studenti..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={FiIcons.FiSearch}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={currentStudents.length === 0}
              >
                {currentStudents.every(s => selectedStudents.includes(s.id)) ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
              </Button>
              <Badge variant="primary">
                {selectedStudents.length} selezionati
              </Badge>
            </div>
          </div>

          {/* Students Grid */}
          {currentStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentStudents.map((student) => (
                <motion.div
                  key={student.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedStudents.includes(student.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      {selectedStudents.includes(student.id) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiIcons.FiCheck} className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">{student.course}</p>
                      <p className="text-xs text-neutral-400">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Anni da recuperare:</span>
                    <Badge variant="secondary">{student.yearsToRecover}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiIcons.FiUsers} className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">
                {searchTerm ? 'Nessuno studente trovato con i criteri di ricerca' : 'Tutti gli studenti sono già assegnati'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mb-6">
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

          {/* Summary */}
          {availableStudents.length > 0 && (
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">
                  Studenti disponibili: {availableStudents.length}
                </span>
                <span className="text-neutral-600">
                  Pagina {currentPage} di {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              {selectedStudents.length > 0 && (
                `${selectedStudents.length} studenti selezionati per l'assegnazione`
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button
                icon={FiIcons.FiUserCheck}
                onClick={handleAssign}
                loading={loading}
                disabled={selectedStudents.length === 0}
              >
                Assegna Studenti ({selectedStudents.length})
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignStudentModal;