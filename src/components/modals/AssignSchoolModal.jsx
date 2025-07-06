import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AssignSchoolModal = ({ student, onClose, onAssign }) => {
  const { state, dispatch } = useApp();
  const [selectedSchool, setSelectedSchool] = useState(student.assignedSchool || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredSchools = state.schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedSchool) {
      toast.error('Seleziona una scuola');
      return;
    }

    setLoading(true);
    try {
      // Update student with assigned school
      const updatedStudent = {
        ...student,
        assignedSchool: parseInt(selectedSchool)
      };
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });

      // Update school's assigned students list
      const school = state.schools.find(s => s.id === parseInt(selectedSchool));
      if (school && !school.assignedStudents.includes(student.id)) {
        const updatedSchool = {
          ...school,
          assignedStudents: [...school.assignedStudents, student.id]
        };
        dispatch({ type: 'UPDATE_SCHOOL', payload: updatedSchool });
      }

      // Remove student from previous school if existed
      if (student.assignedSchool && student.assignedSchool !== parseInt(selectedSchool)) {
        const previousSchool = state.schools.find(s => s.id === student.assignedSchool);
        if (previousSchool) {
          const updatedPreviousSchool = {
            ...previousSchool,
            assignedStudents: previousSchool.assignedStudents.filter(id => id !== student.id)
          };
          dispatch({ type: 'UPDATE_SCHOOL', payload: updatedPreviousSchool });
        }
      }

      toast.success('Scuola assegnata con successo!');
      onAssign(updatedStudent);
      onClose();
    } catch (error) {
      toast.error('Errore durante l\'assegnazione');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!student.assignedSchool) return;

    setLoading(true);
    try {
      // Remove school assignment from student
      const updatedStudent = {
        ...student,
        assignedSchool: null
      };
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });

      // Remove student from school's assigned list
      const school = state.schools.find(s => s.id === student.assignedSchool);
      if (school) {
        const updatedSchool = {
          ...school,
          assignedStudents: school.assignedStudents.filter(id => id !== student.id)
        };
        dispatch({ type: 'UPDATE_SCHOOL', payload: updatedSchool });
      }

      toast.success('Assegnazione rimossa con successo!');
      onAssign(updatedStudent);
      onClose();
    } catch (error) {
      toast.error('Errore durante la rimozione');
    } finally {
      setLoading(false);
    }
  };

  const currentAssignedSchool = student.assignedSchool 
    ? state.schools.find(s => s.id === student.assignedSchool)
    : null;

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
        className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Assegna Scuola per Esami
              </h2>
              <p className="text-neutral-600">
                {student.firstName} {student.lastName} - {student.course}
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Assignment */}
          {currentAssignedSchool && (
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-primary-800">Scuola Attualmente Assegnata</h4>
                  <p className="text-primary-700 mt-1">{currentAssignedSchool.name}</p>
                  <p className="text-sm text-primary-600">{currentAssignedSchool.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiIcons.FiTrash2}
                  onClick={handleRemoveAssignment}
                  loading={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Rimuovi
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <Input
              placeholder="Cerca scuole..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiIcons.FiSearch}
            />
          </div>

          {/* Schools List */}
          <div>
            <h4 className="font-medium text-neutral-800 mb-4">
              Seleziona Scuola ({filteredSchools.length} disponibili)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSchools.map((school) => (
                <motion.div
                  key={school.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSchool === school.id.toString()
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedSchool(school.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                        <SafeIcon icon={FiIcons.FiMapPin} className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-neutral-800">{school.name}</h5>
                        <p className="text-sm text-neutral-600">{school.address}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-neutral-500">
                            <SafeIcon icon={FiIcons.FiPhone} className="w-3 h-3 inline mr-1" />
                            {school.phone}
                          </span>
                          <span className="text-xs text-neutral-500">
                            <SafeIcon icon={FiIcons.FiMail} className="w-3 h-3 inline mr-1" />
                            {school.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-800">
                        {school.assignedStudents.length} studenti
                      </p>
                      <p className="text-xs text-neutral-500">assegnati</p>
                      {selectedSchool === school.id.toString() && (
                        <div className="mt-2">
                          <SafeIcon icon={FiIcons.FiCheck} className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {school.contact && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        <strong>Referente:</strong> {school.contact}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiMapPin} className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500">
                  {searchTerm ? 'Nessuna scuola trovata' : 'Nessuna scuola disponibile'}
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Informazioni</p>
                <p className="text-sm text-orange-700 mt-1">
                  L'assegnazione della scuola è necessaria per organizzare gli esami dello studente. 
                  Puoi modificare l'assegnazione in qualsiasi momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              icon={FiIcons.FiCheck}
              onClick={handleAssign}
              loading={loading}
              disabled={!selectedSchool || selectedSchool === student.assignedSchool?.toString()}
            >
              Assegna Scuola
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignSchoolModal;