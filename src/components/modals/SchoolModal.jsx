import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SchoolModal = ({ school, onClose, mode = 'add' }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    contact: '',
    notes: '',
    assignedStudents: [],
    documents: [],
    examCalendar: [],
    ...school
  });

  useEffect(() => {
    if (school) {
      setFormData({ ...formData, ...school });
    }
  }, [school]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'add') {
        const newSchool = {
          ...formData,
          id: Date.now(),
        };
        dispatch({ type: 'ADD_SCHOOL', payload: newSchool });
        toast.success('Scuola aggiunta con successo!');
      } else {
        dispatch({ type: 'UPDATE_SCHOOL', payload: formData });
        toast.success('Scuola aggiornata con successo!');
      }
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questa scuola?')) {
      setLoading(true);
      try {
        dispatch({ type: 'DELETE_SCHOOL', payload: school.id });
        toast.success('Scuola eliminata con successo!');
        onClose();
      } catch (error) {
        toast.error('Errore durante l\'eliminazione');
      } finally {
        setLoading(false);
      }
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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">
              {mode === 'add' ? 'Aggiungi Nuova Scuola' : 'Modifica Scuola'}
            </h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Nome Scuola *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Indirizzo Completo *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefono *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Persona di Contatto"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Note</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sulla scuola..."
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
                {mode === 'add' ? 'Aggiungi' : 'Salva'} Scuola
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SchoolModal;