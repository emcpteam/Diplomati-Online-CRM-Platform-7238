import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { generatePDF } from '../utils';
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
            Panoramica generale del sistema CRM
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-neutral-800">
                    {stat.value}
                    {stat.total !== stat.value && (
                      <span className="text-sm text-neutral-500 font-normal">
                        /{stat.total}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-accent-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      questo mese
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">
                Attività Recenti
              </h3>
              <Link to="/activities">
                <Button variant="ghost" size="sm">
                  Vedi tutto
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  whileHover={{ x: 4 }}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                    <SafeIcon
                      icon={activity.icon}
                      className="w-5 h-5 text-primary-600"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-800">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">
              Azioni Rapide
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Aggiungi Studente',
                  icon: FiIcons.FiUserPlus,
                  path: '/students',
                },
                {
                  title: 'Gestisci Lead',
                  icon: FiIcons.FiTarget,
                  path: '/leads',
                },
                {
                  title: 'Nuova Scuola',
                  icon: FiIcons.FiMapPin,
                  path: '/schools',
                },
                {
                  title: 'Crea Corso',
                  icon: FiIcons.FiBookOpen,
                  path: '/courses',
                },
              ].map((action) => (
                <Link key={action.title} to={action.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon
                        icon={action.icon}
                        className="w-5 h-5 text-primary-600"
                      />
                    </div>
                    <span className="font-medium text-neutral-800">
                      {action.title}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              €{state.students
                .reduce((sum, s) => sum + s.paidAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">Fatturato Mese</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {
                state.leads.filter((l) => {
                  const today = new Date();
                  const leadDate = new Date(l.createdAt);
                  return leadDate.getMonth() === today.getMonth();
                }).length
              }
            </p>
            <p className="text-sm text-neutral-500">Lead Questo Mese</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.students.filter((s) => s.status === 'active').length}
            </p>
            <p className="text-sm text-neutral-500">Studenti Attivi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {(
                (state.leads.filter((l) => l.status === 'converted').length /
                  Math.max(state.leads.length, 1)) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-sm text-neutral-500">Tasso Conversione</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;