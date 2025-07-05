import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';

const Analytics = () => {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState('30');

  // Calculate analytics data
  const analytics = {
    studentsPerYear: {
      '1-2 anni': state.students.filter(s => s.yearsToRecover <= 2).length,
      '2-3 anni': state.students.filter(s => s.yearsToRecover === 3).length,
      '3-4-5 anni': state.students.filter(s => s.yearsToRecover >= 4).length,
    },
    courseEnrollments: state.courses.map(course => ({
      name: course.name,
      enrollments: state.students.filter(s => s.course === course.name).length,
      revenue: state.students.filter(s => s.course === course.name).reduce((sum, s) => sum + s.paidAmount, 0)
    })),
    leadConversion: {
      total: state.leads.length,
      new: state.leads.filter(l => l.status === 'new').length,
      contacted: state.leads.filter(l => l.status === 'contacted').length,
      qualified: state.leads.filter(l => l.status === 'qualified').length,
      converted: state.leads.filter(l => l.status === 'converted').length,
      lost: state.leads.filter(l => l.status === 'lost').length,
    },
    finances: {
      totalRevenue: state.students.reduce((sum, s) => sum + s.paidAmount, 0),
      expectedRevenue: state.students.reduce((sum, s) => sum + s.totalAmount, 0),
      avgTicket: state.students.length > 0 ? state.students.reduce((sum, s) => sum + s.totalAmount, 0) / state.students.length : 0,
      pendingPayments: state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0),
    }
  };

  const conversionRate = analytics.leadConversion.total > 0 
    ? (analytics.leadConversion.converted / analytics.leadConversion.total * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Dashboard Analytics
          </h1>
          <p className="text-neutral-600 mt-2">
            Analisi dettagliate delle performance del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7">Ultimi 7 giorni</option>
            <option value="30">Ultimi 30 giorni</option>
            <option value="90">Ultimi 3 mesi</option>
            <option value="365">Ultimo anno</option>
          </select>
          <Button variant="outline" icon={FiIcons.FiDownload}>
            Esporta Report
          </Button>
          <Button icon={FiIcons.FiRefreshCw}>
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Fatturato Totale</p>
              <p className="text-2xl font-bold text-neutral-800">
                €{analytics.finances.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-accent-600 mt-1">+12% vs mese precedente</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiDollarSign} className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Tasso Conversione</p>
              <p className="text-2xl font-bold text-neutral-800">{conversionRate}%</p>
              <p className="text-sm text-primary-600 mt-1">
                {analytics.leadConversion.converted}/{analytics.leadConversion.total} lead
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiTrendingUp} className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Ticket Medio</p>
              <p className="text-2xl font-bold text-neutral-800">
                €{Math.round(analytics.finances.avgTicket).toLocaleString()}
              </p>
              <p className="text-sm text-secondary-600 mt-1">Per studente iscritto</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiTarget} className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Pagamenti Pendenti</p>
              <p className="text-2xl font-bold text-neutral-800">
                €{analytics.finances.pendingPayments.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600 mt-1">Da incassare</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiClock} className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Students per Year */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">
            Distribuzione Studenti per Anni da Recuperare
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.studentsPerYear).map(([range, count]) => {
              const total = Object.values(analytics.studentsPerYear).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
              
              return (
                <div key={range} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{range}</span>
                    <span className="text-sm text-neutral-500">{count} studenti ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Course Enrollments */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">
            Performance Corsi
          </h3>
          <div className="space-y-4">
            {analytics.courseEnrollments.map((course, index) => (
              <div key={course.name} className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-800">{course.name}</h4>
                  <Badge variant="primary">{course.enrollments} studenti</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Iscrizioni</p>
                    <p className="font-medium text-neutral-800">{course.enrollments}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Fatturato</p>
                    <p className="font-medium text-accent-600">€{course.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lead Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Funnel Conversione Lead
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Totali', value: analytics.leadConversion.total, color: 'bg-neutral-500' },
            { label: 'Nuovi', value: analytics.leadConversion.new, color: 'bg-blue-500' },
            { label: 'Contattati', value: analytics.leadConversion.contacted, color: 'bg-yellow-500' },
            { label: 'Qualificati', value: analytics.leadConversion.qualified, color: 'bg-orange-500' },
            { label: 'Convertiti', value: analytics.leadConversion.converted, color: 'bg-accent-500' },
            { label: 'Persi', value: analytics.leadConversion.lost, color: 'bg-red-500' },
          ].map((stage, index) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-full h-24 ${stage.color} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-2xl font-bold text-white">{stage.value}</span>
              </div>
              <p className="text-sm font-medium text-neutral-700">{stage.label}</p>
              {index > 0 && analytics.leadConversion.total > 0 && (
                <p className="text-xs text-neutral-500">
                  {((stage.value / analytics.leadConversion.total) * 100).toFixed(1)}%
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">
            Panoramica Finanziaria
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
              <div>
                <p className="text-sm text-accent-600">Fatturato Realizzato</p>
                <p className="text-xl font-bold text-accent-800">
                  €{analytics.finances.totalRevenue.toLocaleString()}
                </p>
              </div>
              <SafeIcon icon={FiIcons.FiCheckCircle} className="w-8 h-8 text-accent-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="text-sm text-orange-600">Da Incassare</p>
                <p className="text-xl font-bold text-orange-800">
                  €{analytics.finances.pendingPayments.toLocaleString()}
                </p>
              </div>
              <SafeIcon icon={FiIcons.FiClock} className="w-8 h-8 text-orange-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div>
                <p className="text-sm text-primary-600">Fatturato Totale Atteso</p>
                <p className="text-xl font-bold text-primary-800">
                  €{analytics.finances.expectedRevenue.toLocaleString()}
                </p>
              </div>
              <SafeIcon icon={FiIcons.FiTrendingUp} className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">
            Metriche Operative
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-2xl font-bold text-neutral-800">{state.students.length}</p>
              <p className="text-sm text-neutral-500">Studenti Totali</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-2xl font-bold text-neutral-800">{state.schools.length}</p>
              <p className="text-sm text-neutral-500">Scuole Partner</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-2xl font-bold text-neutral-800">{state.courses.length}</p>
              <p className="text-sm text-neutral-500">Corsi Attivi</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-2xl font-bold text-neutral-800">
                {state.students.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-neutral-500">Studenti Attivi</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;