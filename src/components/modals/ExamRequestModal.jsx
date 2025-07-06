import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { generateExamRequest } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const ExamRequestModal = ({ student, onClose, onRequestCreated }) => {
  const { state } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: student.assignedSchool || '',
    examDate: '',
    examType: 'idoneity',
    subjects: [],
    notes: '',
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
  });

  // Get course subjects
  const studentCourse = state.courses.find(c => c.name === student.course);
  const availableSubjects = studentCourse ? studentCourse.subjects : [];

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.schoolId) {
      toast.error('Seleziona una scuola');
      return;
    }

    if (!formData.examDate) {
      toast.error('Seleziona una data per l\'esame');
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error('Seleziona almeno una materia');
      return;
    }

    setLoading(true);
    try {
      const selectedSchool = state.schools.find(s => s.id === parseInt(formData.schoolId));
      if (!selectedSchool) {
        throw new Error('Scuola non trovata');
      }

      // Generate exam request document
      generateExamRequest(student, selectedSchool, formData.subjects, formData.examDate);

      // Create exam record
      const examRequest = {
        id: Date.now(),
        studentId: student.id,
        schoolId: parseInt(formData.schoolId),
        examDate: formData.examDate,
        examType: formData.examType,
        subjects: formData.subjects,
        notes: formData.notes,
        academicYear: formData.academicYear,
        status: 'requested',
        createdAt: new Date().toISOString()
      };

      // Update student with exam info
      const updatedStudent = {
        ...student,
        exams: [...(student.exams || []), examRequest]
      };

      if (onRequestCreated) {
        onRequestCreated(examRequest, updatedStudent);
      }

      toast.success('Richiesta esame generata con successo!');
      onClose();
    } catch (error) {
      toast.error('Errore durante la generazione della richiesta');
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
        className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Richiesta Esame
              </h2>
              <p className="text-neutral-600">
                {student.firstName} {student.lastName} - {student.course}
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Scuola per l'Esame *
              </label>
              <select
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Seleziona Scuola</option>
                {state.schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Data Esame Richiesta *"
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo di Esame
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="idoneity">Esame di Idoneità</option>
                <option value="final">Esame di Maturità</option>
                <option value="integration">Esame Integrativo</option>
              </select>
            </div>
            <Input
              label="Anno Accademico"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="2024/2025"
            />
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Materie d'Esame * ({formData.subjects.length} selezionate)
            </label>
            {availableSubjects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableSubjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.subjects.includes(subject)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-800">{subject}</span>
                      {formData.subjects.includes(subject) && (
                        <FiIcons.FiCheck className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">Nessuna materia disponibile per questo corso</p>
            )}
          </div>

          {/* Selected Subjects Summary */}
          {formData.subjects.length > 0 && (
            <div className="p-4 bg-primary-50 rounded-xl">
              <h4 className="font-semibold text-primary-800 mb-2">
                Materie Selezionate ({formData.subjects.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="primary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note per la scuola o informazioni aggiuntive..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* School Info Preview */}
          {formData.schoolId && (
            <div className="p-4 bg-neutral-50 rounded-xl">
              {(() => {
                const selectedSchool = state.schools.find(s => s.id === parseInt(formData.schoolId));
                return selectedSchool ? (
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">
                      Scuola Selezionata
                    </h4>
                    <div className="text-sm text-neutral-600 space-y-1">
                      <p><strong>Nome:</strong> {selectedSchool.name}</p>
                      <p><strong>Indirizzo:</strong> {selectedSchool.address}</p>
                      <p><strong>Telefono:</strong> {selectedSchool.phone}</p>
                      <p><strong>Email:</strong> {selectedSchool.email}</p>
                      <p><strong>Referente:</strong> {selectedSchool.contact}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              icon={FiIcons.FiFileText} 
              loading={loading}
              disabled={!formData.schoolId || !formData.examDate || formData.subjects.length === 0}
            >
              Genera Richiesta
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ExamRequestModal;