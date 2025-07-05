import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const StudentModal = ({ student, onClose, mode = 'add' }) => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    codiceFiscale: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    city: '',
    province: '',
    cap: '',
    course: '',
    yearsToRecover: 1,
    paymentType: 'wire_transfer',
    totalAmount: 2800,
    status: 'active',
    ...student
  });

  useEffect(() => {
    if (student) {
      setFormData({ ...formData, ...student });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'add') {
        const newStudent = {
          ...formData,
          id: Date.now(),
          enrollmentDate: new Date().toISOString(),
          paidAmount: 0,
          documents: [],
          exams: [],
          communications: [],
          appointments: [],
        };
        dispatch({ type: 'ADD_STUDENT', payload: newStudent });
        toast.success('Studente aggiunto con successo!');
      } else {
        dispatch({ type: 'UPDATE_STUDENT', payload: formData });
        toast.success('Studente aggiornato con successo!');
      }
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo studente?')) {
      setLoading(true);
      try {
        dispatch({ type: 'DELETE_STUDENT', payload: student.id });
        toast.success('Studente eliminato con successo!');
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
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">
              {mode === 'add' ? 'Aggiungi Nuovo Studente' : 'Modifica Studente'}
            </h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Cognome *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Telefono *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Codice Fiscale"
              value={formData.codiceFiscale}
              onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value })}
            />
            <Input
              label="Data di Nascita"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <Input
            label="Luogo di Nascita"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
          />

          <Input
            label="Indirizzo"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Città"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Provincia"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            />
            <Input
              label="CAP"
              value={formData.cap}
              onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Corso *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Seleziona corso</option>
                {state.courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Anni da Recuperare"
              type="number"
              min="1"
              max="5"
              value={formData.yearsToRecover}
              onChange={(e) => setFormData({ ...formData, yearsToRecover: parseInt(e.target.value) })}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Stato</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Attivo</option>
                <option value="suspended">Sospeso</option>
                <option value="completed">Completato</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo Pagamento</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="wire_transfer">Bonifico</option>
                <option value="installment">Rateale</option>
                <option value="financing">Finanziamento</option>
              </select>
            </div>
            <Input
              label="Importo Totale (€)"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
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
                {mode === 'add' ? 'Aggiungi' : 'Salva'} Studente
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default StudentModal;