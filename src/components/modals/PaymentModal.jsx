// ... previous imports stay the same

const PaymentModal = ({ student, onClose, onPaymentAdded }) => {
  // ... previous state and constants remain the same

  const recalculateRemainingInstallments = (installmentPlan, currentInstallmentId, paidAmount) => {
    // Find the current installment and all future unpaid installments
    const currentIndex = installmentPlan.findIndex(inst => inst.id.toString() === currentInstallmentId);
    const remainingInstallments = installmentPlan.slice(currentIndex + 1).filter(inst => !inst.paid);
    
    // Calculate remaining total amount for all future installments
    const originalInstallment = installmentPlan[currentIndex];
    const remainingFromCurrent = originalInstallment.amount - paidAmount;
    const totalRemainingAmount = remainingFromCurrent + 
      remainingInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    
    // Calculate new amount per remaining installment
    const newAmountPerInstallment = totalRemainingAmount / (remainingInstallments.length + 1);

    // Update the installment plan
    return installmentPlan.map((installment, index) => {
      if (index === currentIndex) {
        // Current installment gets marked as partially paid
        return {
          ...installment,
          paidAmount: paidAmount,
          amount: originalInstallment.amount,
          paid: paidAmount >= originalInstallment.amount,
          status: paidAmount >= originalInstallment.amount ? 'paid' : 'partial',
          lastPaymentDate: new Date().toISOString()
        };
      } else if (index > currentIndex && !installment.paid) {
        // Future unpaid installments get recalculated
        return {
          ...installment,
          amount: newAmountPerInstallment,
          paidAmount: 0,
          status: 'pending'
        };
      }
      // Keep past installments unchanged
      return installment;
    });
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

      // Add payment
      dispatch({ type: 'ADD_PAYMENT', payload: payment });

      // Update student payment amount
      const newPaidAmount = student.paidAmount + paymentAmount;
      
      // Update installment plan if this is an installment payment
      let updatedInstallmentPlan = student.installmentPlan ? [...student.installmentPlan] : [];
      
      if (student.paymentType === 'installment' && student.installmentPlan) {
        if (formData.installmentId) {
          // Get the selected installment
          const selectedInstallment = student.installmentPlan.find(
            inst => inst.id.toString() === formData.installmentId
          );

          if (paymentAmount < selectedInstallment.amount) {
            // Partial payment - recalculate remaining installments
            updatedInstallmentPlan = recalculateRemainingInstallments(
              student.installmentPlan,
              formData.installmentId,
              paymentAmount
            );

            // Add note about recalculation
            payment.notes = `${payment.notes || ''} [Pagamento parziale - Rate ricalcolate]`.trim();
          } else {
            // Full payment or overpayment
            updatedInstallmentPlan = student.installmentPlan.map(installment => {
              if (installment.id.toString() === formData.installmentId) {
                return {
                  ...installment,
                  paid: true,
                  paidAmount: paymentAmount,
                  paidDate: formData.date,
                  paymentId: payment.id,
                  status: 'paid'
                };
              }
              return installment;
            });
          }
        } else {
          // Auto-assign payment to next pending installment(s)
          let remainingPayment = paymentAmount;
          let lastPaidInstallmentIndex = -1;
          
          updatedInstallmentPlan = student.installmentPlan.map((installment, index) => {
            if (!installment.paid && remainingPayment > 0) {
              const currentPayment = Math.min(remainingPayment, installment.amount);
              remainingPayment -= currentPayment;
              lastPaidInstallmentIndex = index;
              
              return {
                ...installment,
                paidAmount: currentPayment,
                paid: currentPayment >= installment.amount,
                paidDate: formData.date,
                paymentId: payment.id,
                status: currentPayment >= installment.amount ? 'paid' : 'partial'
              };
            }
            return installment;
          });

          // If there's still remaining payment and partial payments were made
          if (remainingPayment > 0 && lastPaidInstallmentIndex >= 0) {
            // Recalculate remaining installments
            const futureInstallments = updatedInstallmentPlan.slice(lastPaidInstallmentIndex + 1);
            const totalRemaining = futureInstallments.reduce((sum, inst) => sum + inst.amount, 0);
            
            if (totalRemaining > 0) {
              const newAmountPerInstallment = totalRemaining / futureInstallments.length;
              
              updatedInstallmentPlan = updatedInstallmentPlan.map((installment, index) => {
                if (index > lastPaidInstallmentIndex) {
                  return {
                    ...installment,
                    amount: newAmountPerInstallment,
                    paidAmount: 0,
                    status: 'pending'
                  };
                }
                return installment;
              });
            }
          }
        }
      }

      const updatedStudent = {
        ...student,
        paidAmount: newPaidAmount,
        discount: (student.discount || 0) + (parseFloat(formData.discount) || 0),
        payments: [...(student.payments || []), payment],
        installmentPlan: updatedInstallmentPlan
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
      console.error('Payment error:', error);
      toast.error('Errore durante la registrazione del pagamento');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component remains the same
};

export default PaymentModal;