import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { generatePaymentReceipt } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const PaymentModal = ({ student, onClose, onPaymentAdded }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0
  });

  const remainingAmount = student.totalAmount - student.paidAmount;
  const maxPayment = remainingAmount + (formData.discount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Inserisci un importo valido');
      return;
    }

    if (parseFloat(formData.amount) > maxPayment) {
      toast.error(`L'importo non può essere superiore a €${maxPayment}`);
      return;
    }

    setLoading(true);
    try {
      const payment = {
        id: Date.now(),
        studentId: student.id,
        amount: parseFloat(formData.amount),
        method: formData.method,
        date: formData.date,
        notes: formData.notes,
        discount: parseFloat(formData.discount) || 0,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      // Add payment
      dispatch({ type: 'ADD_PAYMENT', payload: payment });

      // Update student payment amount
      const newPaidAmount = student.paidAmount + parseFloat(formData.amount);
      const updatedStudent = {
        ...student,
        paidAmount: newPaidAmount,
        discount: (student.discount || 0) + (parseFloat(formData.discount) || 0),
        payments: [...(student.payments || []), payment]
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });

      // Generate receipt
      generatePaymentReceipt(updatedStudent, payment);

      toast.success('Pagamento registrato con successo!');
      
      if (onPaymentAdded) {
        onPaymentAdded(payment, updatedStudent);
      }
      
      onClose();
    } catch (error) {
      toast.error('Errore durante la registrazione del pagamento');
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'bank_transfer': return 'Bonifico Bancario';
      case 'card': return 'Carta di Credito';
      case 'cash': return 'Contanti';
      case 'check': return 'Assegno';
      case 'financing': return 'Finanziamento';
      default: return method;
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
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Registra Pagamento
              </h2>
              <p className="text-neutral-600">
                {student.firstName} {student.lastName} - {student.course}
              </p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 bg-neutral-50 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800 mb-3">Riepilogo Pagamenti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-neutral-500">Totale Corso</p>
              <p className="text-lg font-bold text-neutral-800">€{student.totalAmount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-neutral-500">Già Pagato</p>
              <p className="text-lg font-bold text-accent-600">€{student.paidAmount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-neutral-500">Rimanente</p>
              <p className="text-lg font-bold text-orange-600">€{remainingAmount}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Importo Pagamento (€) *"
              type="number"
              step="0.01"
              min="0.01"
              max={maxPayment}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label="Data Pagamento *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Metodo di Pagamento *
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="bank_transfer">Bonifico Bancario</option>
                <option value="card">Carta di Credito</option>
                <option value="cash">Contanti</option>
                <option value="check">Assegno</option>
                <option value="financing">Finanziamento</option>
              </select>
            </div>
            <Input
              label="Sconto Applicato (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note Pagamento
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sul pagamento..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Payment Preview */}
          {formData.amount && (
            <div className="p-4 bg-primary-50 rounded-xl">
              <h4 className="font-semibold text-primary-800 mb-2">Anteprima Pagamento</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Importo:</span>
                  <span className="font-medium">€{parseFloat(formData.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sconto:</span>
                  <span className="font-medium">€{parseFloat(formData.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metodo:</span>
                  <span className="font-medium">{getMethodLabel(formData.method)}</span>
                </div>
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Nuovo Saldo:</span>
                    <span>€{(student.paidAmount + parseFloat(formData.amount || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rimanente:</span>
                    <span>€{(remainingAmount - parseFloat(formData.amount || 0) + parseFloat(formData.discount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              icon={FiIcons.FiSave} 
              loading={loading}
              disabled={!formData.amount || parseFloat(formData.amount) <= 0}
            >
              Registra Pagamento
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;