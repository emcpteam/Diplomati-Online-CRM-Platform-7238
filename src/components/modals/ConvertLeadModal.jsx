import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ConvertLeadModal = ({ lead, onClose, onConvert }) => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    codiceFiscale: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    city: lead.city || '',
    province: '',
    cap: '',
    course: lead.studyPlan || '',
    yearsToRecover: lead.yearsToRecover || 1,
    paymentType: 'wire_transfer',
    totalAmount: 2800,
    assignedSchool: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new student from lead data
      const newStudent = {
        ...formData,
        id: Date.now(),
        enrollmentDate: new Date().toISOString(),
        paidAmount: 0,
        discount: 0,
        documents: [],
        exams: [],
        communications: [{
          id: Date.now(),
          type: 'conversion',
          subject: 'Lead convertito in studente',
          content: `Lead ${lead.firstName} ${lead.lastName} convertito in studente il ${new Date().toLocaleDateString('it-IT')}`,
          sentAt: new Date().toISOString(),
          status: 'completed'
        }],
        appointments: [],
        payments: [],
        convertedFromLead: lead.id,
        convertedAt: new Date().toISOString()
      };

      // Add student to the system
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });

      // Update lead status to converted
      const updatedLead = {
        ...lead,
        status: 'converted',
        convertedToStudentId: newStudent.id,
        convertedAt: new Date().toISOString()
      };
      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });

      // If school is assigned, update school's assigned students
      if (formData.assignedSchool) {
        const school = state.schools.find(s => s.id === parseInt(formData.assignedSchool));
        if (school) {
          const updatedSchool = {
            ...school,
            assignedStudents: [...school.assignedStudents, newStudent.id]
          };
          dispatch({ type: 'UPDATE_SCHOOL', payload: updatedSchool });
        }
      }

      toast.success('Lead convertito in studente con successo!');
      onConvert(newStudent);
      onClose();
    } catch (error) {
      toast.error('Errore durante la conversione');
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
                Converti Lead in Studente
              </h2>
              <p className="text-neutral-600">
                {lead.firstName} {lead.lastName} - {lead.studyPlan}
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Dati Anagrafici</h3>
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
              <Input
                label="Codice Fiscale"
                value={formData.codiceFiscale}
                onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value })}
                placeholder="RSSMRC90A01H501Z"
              />
              <Input
                label="Data di Nascita"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Luogo di Nascita"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="Roma"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Indirizzo</h3>
            <div className="space-y-4">
              <Input
                label="Indirizzo"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Via Roma 123"
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
                  placeholder="RM"
                />
                <Input
                  label="CAP"
                  value={formData.cap}
                  onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                  placeholder="00100"
                />
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Corso</h3>
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">Scuola per Esami</label>
                <select
                  value={formData.assignedSchool}
                  onChange={(e) => setFormData({ ...formData, assignedSchool: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleziona scuola</option>
                  {state.schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informazioni Pagamento</h3>
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
          </div>

          {/* Summary */}
          <div className="p-4 bg-primary-50 rounded-xl">
            <h4 className="font-semibold text-primary-800 mb-2">Riepilogo Conversione</h4>
            <div className="space-y-1 text-sm text-primary-700">
              <p><strong>Lead:</strong> {lead.firstName} {lead.lastName}</p>
              <p><strong>Corso:</strong> {formData.course}</p>
              <p><strong>Importo:</strong> €{formData.totalAmount}</p>
              {formData.assignedSchool && (
                <p><strong>Scuola Esami:</strong> {state.schools.find(s => s.id === parseInt(formData.assignedSchool))?.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" icon={FiIcons.FiUserCheck} loading={loading}>
              Converti in Studente
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ConvertLeadModal;