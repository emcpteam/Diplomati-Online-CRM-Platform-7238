```javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { generatePaymentReceipt } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import SafeIcon from '../../common/SafeIcon';

const PaymentModal = ({ student, onClose, onPaymentAdded }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0,
    installmentId: ''
  });

  // Calculate max payment possible
  const maxPayment = student.totalAmount - student.paidAmount;

  // Get installment options if applicable
  const installmentOptions = student.installmentPlan 
    ? student.installmentPlan.filter(installment => !installment.paid)
    : [];

  // Function to recalculate installments after a payment
  const recalculateInstallments = (totalPaid, installmentPlan) => {
    // Calculate remaining total amount after the payment
    const totalAmount = student.totalAmount;
    const initialPayment = student.initialPayment || 0;
    const remainingTotal = totalAmount - initialPayment - totalPaid;
    
    // Get number of remaining installments (unpaid ones)
    const remainingInstallments = installmentPlan.filter(inst => !inst.paid);
    const remainingCount = remainingInstallments.length;

    if (remainingCount === 0) return installmentPlan;

    // Calculate new amount per remaining installment
    const newInstallmentAmount = remainingTotal / remainingCount;

    // Update installment plan
    return installmentPlan.map(installment => {
      if (installment.paid) {
        // Keep paid installments unchanged
        return installment;
      } else {
        // Update unpaid installments with new amount
        return {
          ...installment,
          amount: newInstallmentAmount,
          status: 'pending'
        };
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      const paymentAmount = parseFloat(formData.amount);
      const newPaidAmount = student.paidAmount + paymentAmount;

      const payment = {
        id: Date.now(),
        studentId: student.id,
        amount: paymentAmount,
        method: formData.method,
        date: formData.date,
        notes: formData.notes,
        discount: parseFloat(formData.discount) || 0,
        status: 'completed',
        installmentId: formData.installmentId || null,
        createdAt: new Date().toISOString()
      };

      // Update installment plan if this is an installment payment
      let updatedInstallmentPlan = student.installmentPlan ? [...student.installmentPlan] : [];

      if (student.paymentType === 'installment' && student.installmentPlan) {
        if (formData.installmentId) {
          // Payment for specific installment
          const selectedInstallment = student.installmentPlan.find(
            inst => inst.id.toString() === formData.installmentId
          );

          // Update the selected installment
          updatedInstallmentPlan = updatedInstallmentPlan.map(installment => {
            if (installment.id.toString() === formData.installmentId) {
              return {
                ...installment,
                paid: paymentAmount >= installment.amount,
                paidAmount: paymentAmount,
                paidDate: formData.date,
                paymentId: payment.id,
                status: paymentAmount >= installment.amount ? 'paid' : 'partial'
              };
            }
            return installment;
          });

          // Recalculate remaining installments
          updatedInstallmentPlan = recalculateInstallments(newPaidAmount, updatedInstallmentPlan);
          payment.notes = `${payment.notes || ''} [Pagamento rata - Rate ricalcolate]`.trim();
        } else {
          // Generic payment - distribute and recalculate
          updatedInstallmentPlan = recalculateInstallments(newPaidAmount, updatedInstallmentPlan);
          payment.notes = `${payment.notes || ''} [Pagamento generico - Rate ricalcolate]`.trim();
        }
      }

      // Update student record
      const updatedStudent = {
        ...student,
        paidAmount: newPaidAmount,
        discount: (student.discount || 0) + (parseFloat(formData.discount) || 0),
        payments: [...(student.payments || []), payment],
        installmentPlan: updatedInstallmentPlan
      };

      // Add payment and update student
      dispatch({ type: 'ADD_PAYMENT', payload: payment });
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });

      // Generate receipt
      generatePaymentReceipt(updatedStudent, payment);

      toast.success('Pagamento registrato con successo!');

      if (onPaymentAdded) {
        onPaymentAdded(payment, updatedStudent);
      }

      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Errore durante la registrazione del pagamento');
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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">
              Registra Pagamento
            </h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Importo (€) *" 
              type="number" 
              step="0.01" 
              min="0" 
              max={maxPayment} 
              value={formData.amount} 
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required 
            />
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Metodo di Pagamento
              </label>
              <select
                value={formData.method}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="bank_transfer">Bonifico</option>
                <option value="card">Carta di Credito</option>
                <option value="cash">Contanti</option>
                <option value="check">Assegno</option>
                <option value="financing">Finanziamento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Data Pagamento" 
              type="date" 
              value={formData.date} 
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            
            <Input 
              label="Sconto (€)" 
              type="number" 
              min="0" 
              step="0.01" 
              value={formData.discount} 
              onChange={(e) => handleInputChange('discount', e.target.value)}
            />
          </div>

          {student.paymentType === 'installment' && installmentOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rata Specifica (opzionale)
              </label>
              <select
                value={formData.installmentId}
                onChange={(e) => handleInputChange('installmentId', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Pagamento generico</option>
                {installmentOptions.map((installment, index) => (
                  <option key={installment.id} value={installment.id}>
                    Rata {index + 1} - €{installment.amount.toFixed(2)} - 
                    Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Note aggiuntive sul pagamento..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl">
            <h3 className="font-medium text-neutral-800 mb-2">Riepilogo</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Importo Totale:</span>
                <span className="font-medium">€{student.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Già Pagato:</span>
                <span className="font-medium">€{student.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Da Pagare:</span>
                <span className="font-medium">€{maxPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Pagamento Attuale:</span>
                <span className="font-medium text-accent-600">
                  €{parseFloat(formData.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              icon={FiIcons.FiDollarSign} 
              loading={loading}
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
```