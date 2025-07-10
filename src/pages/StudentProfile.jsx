// Find the renderTabContent function in the existing file and update the 'payments' case section
// by adding the installment plan display. Replace only the payments case in the switch statement.

// Inside the renderTabContent function, replace the 'payments' case with:
case 'payments':
  const paymentProgress = getPaymentProgress();
  
  // Get installment plan from student data or generate it if not available
  const installments = student.installmentPlan || calculateInstallments();
  
  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">Panoramica Pagamenti</h3>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowPaymentModal(true)}>
            Registra Pagamento
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-2xl font-bold text-neutral-800">€{student.totalAmount}</p>
            <p className="text-sm text-neutral-500">Totale</p>
          </div>
          <div className="text-center p-4 bg-accent-50 rounded-xl">
            <p className="text-2xl font-bold text-accent-600">€{student.paidAmount}</p>
            <p className="text-sm text-neutral-500">Pagato</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-600">€{paymentProgress.remaining}</p>
            <p className="text-sm text-neutral-500">Rimanente</p>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">Progresso Pagamenti</span>
            <span className="text-sm font-medium text-neutral-800">
              {paymentProgress.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${paymentProgress.percentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Installment Plan - Show when payment type is 'installment' */}
      {student.paymentType === 'installment' && student.installmentPlan && student.installmentPlan.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Piano Rateale
          </h3>
          <div className="mb-4 p-4 bg-neutral-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Acconto Iniziale:</span>
                <span className="font-medium">€{student.initialPayment || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Numero Rate:</span>
                <span className="font-medium">{student.installmentPlan.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Data Inizio:</span>
                <span className="font-medium">
                  {new Date(student.installmentPlan[0]?.dueDate).toLocaleDateString('it-IT')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Data Fine:</span>
                <span className="font-medium">
                  {new Date(student.installmentPlan[student.installmentPlan.length - 1]?.dueDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {student.installmentPlan.map((installment, index) => (
              <div
                key={installment.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      installment.paid
                        ? 'bg-accent-500'
                        : installment.status === 'upcoming'
                        ? 'bg-orange-500'
                        : 'bg-neutral-300'
                    }`}
                  >
                    <span className="text-white font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${installment.paid ? 'text-neutral-600 line-through' : 'text-neutral-800'}`}>
                      Rata {index + 1} - €{installment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Scadenza: {new Date(installment.dueDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    installment.paid
                      ? 'success'
                      : installment.status === 'upcoming'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {installment.paid ? 'Pagata' : installment.status === 'upcoming' ? 'Prossima' : 'In attesa'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Storico Pagamenti</h3>
        {student.payments && student.payments.length > 0 ? (
          <div className="space-y-3">
            {student.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl"
              >
                <div>
                  <p className="font-medium text-neutral-800">€{payment.amount}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(payment.date).toLocaleDateString('it-IT')} - {payment.method}
                  </p>
                </div>
                <Badge variant="success">Completato</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">Nessun pagamento registrato</p>
        )}
      </Card>
    </div>
  );