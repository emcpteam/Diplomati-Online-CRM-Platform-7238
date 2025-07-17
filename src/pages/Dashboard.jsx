import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { generateMonthlyReport, exportToCSV } from '../utils';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { state } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = [
    {
      title: 'Studenti Attivi',
      value: state.students.filter(s => s.status === 'active').length,
      total: state.students.length,
      icon: FiIcons.FiUsers,
      color: 'from-primary-500 to-primary-600',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Lead Nuovi',
      value: state.leads.filter(l => l.status === 'new').length,
      total: state.leads.length,
      icon: FiIcons.FiTarget,
      color: 'from-secondary-500 to-secondary-600',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Scuole Partner',
      value: state.schools.length,
      total: state.schools.length,
      icon: FiIcons.FiMapPin,
      color: 'from-accent-500 to-accent-600',
      change: '+2',
      changeType: 'positive',
    },
    {
      title: 'Corsi Attivi',
      value: state.courses.length,
      total: state.courses.length,
      icon: FiIcons.FiBookOpen,
      color: 'from-orange-500 to-orange-600',
      change: '+1',
      changeType: 'positive',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'student',
      title: 'Nuovo studente iscritto',
      description: 'Marco Rossi si è iscritto al corso Diploma Scientifico',
      time: '2 ore fa',
      icon: FiIcons.FiUserPlus,
    },
    {
      id: 2,
      type: 'lead',
      title: 'Nuovo lead ricevuto',
      description: 'Andrea Verdi interessato al Diploma Tecnico',
      time: '4 ore fa',
      icon: FiIcons.FiTarget,
    },
    {
      id: 3,
      type: 'payment',
      title: 'Pagamento ricevuto',
      description: 'Giulia Bianchi ha completato il pagamento',
      time: '1 giorno fa',
      icon: FiIcons.FiCreditCard,
    },
    {
      id: 4,
      type: 'exam',
      title: 'Esame programmato',
      description: 'Esame di Matematica per il 15 marzo',
      time: '2 giorni fa',
      icon: FiIcons.FiCalendar,
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading('Aggiornamento dati...', { id: 'refresh' });
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dati aggiornati correttamente!', { id: 'refresh' });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Dashboard
          </h1>
          <p className="text-neutral-600 mt-2">
            Panoramica del sistema e statistiche
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiRefreshCw}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Aggiorna
          </Button>
          <Button
            icon={FiIcons.FiDownload}
            onClick={() => {
              generateMonthlyReport({
                totalStudents: state.students.length,
                activeStudents: state.students.filter(s => s.status === 'active').length,
                newLeads: state.leads.filter(l => l.status === 'new').length,
                monthlyRevenue: state.students.reduce((sum, s) => sum + s.paidAmount, 0),
                totalRevenue: state.students.reduce((sum, s) => sum + s.totalAmount, 0),
                topCourses: state.courses.map(c => ({
                  name: c.name,
                  enrollments: state.students.filter(s => s.course === c.name).length
                })),
                leadStats: {
                  total: state.leads.length,
                  converted: state.leads.filter(l => l.status === 'converted').length,
                  conversionRate: state.leads.length > 0
                    ? (state.leads.filter(l => l.status === 'converted').length / state.leads.length) * 100
                    : 0
                },
                pendingPayments: state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0)
              });
              toast.success('Report mensile generato!');
            }}
          >
            Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-neutral-800">{stat.value}</h3>
              <p className="text-sm text-neutral-500 mt-1">{stat.title}</p>
              <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Totale: {stat.total}</span>
                <span className="text-xs text-primary-600 font-medium">
                  {Math.round((stat.value / (stat.total || 1)) * 100)}%
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-800">
            Attività Recenti
          </h2>
          <Button variant="ghost" size="sm" icon={FiIcons.FiMoreHorizontal} />
        </div>
        <div className="space-y-6">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                activity.type === 'student'
                  ? 'bg-primary-100'
                  : activity.type === 'lead'
                  ? 'bg-secondary-100'
                  : activity.type === 'payment'
                  ? 'bg-accent-100'
                  : 'bg-orange-100'
              }`}>
                <SafeIcon
                  icon={activity.icon}
                  className={`w-5 h-5 ${
                    activity.type === 'student'
                      ? 'text-primary-600'
                      : activity.type === 'lead'
                      ? 'text-secondary-600'
                      : activity.type === 'payment'
                      ? 'text-accent-600'
                      : 'text-orange-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-800">{activity.title}</p>
                  <span className="text-xs text-neutral-500">{activity.time}</span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;