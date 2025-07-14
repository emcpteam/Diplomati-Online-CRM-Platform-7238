import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CourseModal = ({ course, onClose, mode = 'add' }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    academicYear: '2024-2025',
    subjects: [],
    price: 2800,
    notes: '',
    ...course
  });

  useEffect(() => {
    if (course) {
      setFormData({ ...formData, ...course });
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'add') {
        const newCourse = {
          ...formData,
          id: Date.now(),
        };
        dispatch({ type: 'ADD_COURSE', payload: newCourse });
        toast.success('Corso aggiunto con successo!');
      } else {
        dispatch({ type: 'UPDATE_COURSE', payload: formData });
        toast.success('Corso aggiornato con successo!');
      }
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo corso?')) {
      setLoading(true);
      try {
        dispatch({ type: 'DELETE_COURSE', payload: course.id });
        toast.success('Corso eliminato con successo!');
        onClose();
      } catch (error) {
        toast.error('Errore durante l\'eliminazione');
      } finally {
        setLoading(false);
      }
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject('');
      toast.success('Materia aggiunta!');
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
    });
    toast.success('Materia rimossa!');
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
            <h2 className="text-2xl font-bold text-neutral-800">
              {mode === 'add' ? 'Aggiungi Nuovo Corso' : 'Modifica Corso'}
            </h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Corso *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Tipo Corso *"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="es. Liceo Scientifico"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Anno Accademico"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
            <Input
              label="Prezzo (€)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </div>

          {/* Subjects Management */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Materie del Corso
            </label>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Aggiungi materia..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <Button type="button" icon={FiIcons.FiPlus} onClick={addSubject}>
                Aggiungi
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((subject, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={() => removeSubject(subject)}
                >
                  {subject} ×
                </Badge>
              ))}
            </div>
            {formData.subjects.length === 0 && (
              <p className="text-sm text-neutral-500 mt-2">Nessuna materia aggiunta</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Note</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sul corso..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <div className="flex items-center space-x-3">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="danger"
                  icon={FiIcons.FiTrash2}
                  onClick={handleDelete}
                  loading={loading}
                >
                  Elimina
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit" icon={FiIcons.FiSave} loading={loading}>
                {mode === 'add' ? 'Aggiungi' : 'Salva'} Corso
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CourseModal;