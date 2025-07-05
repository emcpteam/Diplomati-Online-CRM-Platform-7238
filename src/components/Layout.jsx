import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import SafeIcon from '../utils/SafeIcon';
import { Button, Input } from './UI';
import { useApp } from '../context/AppContext';

// Sidebar Component
export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiIcons.FiHome },
    { name: 'Studenti', path: '/students', icon: FiIcons.FiUsers },
    { name: 'Scuole', path: '/schools', icon: FiIcons.FiMapPin },
    { name: 'Corsi', path: '/courses', icon: FiIcons.FiBookOpen },
    { name: 'Lead', path: '/leads', icon: FiIcons.FiTarget },
    { name: 'Template', path: '/templates', icon: FiIcons.FiFileText },
    { name: 'Fatturazione', path: '/invoicing', icon: FiIcons.FiFileText },
    { name: 'Azienda', path: '/company', icon: FiIcons.FiSettings },
    { name: 'Integrazioni', path: '/integrations', icon: FiIcons.FiLink },
    { name: 'Utenti', path: '/users', icon: FiIcons.FiUserCheck },
    { name: 'Strumenti', path: '/tools', icon: FiIcons.FiTool },
    { name: 'Analytics', path: '/analytics', icon: FiIcons.FiBarChart3 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-strong z-50 lg:relative lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-8 border-b border-neutral-200/50">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-medium">
                <SafeIcon icon={LuIcons.LuGraduationCap} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-neutral-800">
                  Diplomati Online
                </h1>
                <p className="text-sm text-neutral-500">CRM Platform v1.2.0</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-medium'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-3 w-full"
                    >
                      <SafeIcon
                        icon={item.icon}
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-neutral-500 group-hover:text-neutral-700'
                        }`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200/50">
            <div className="text-center">
              <p className="text-xs text-neutral-500">v1.2.0 - Powered by</p>
              <p className="text-sm font-medium text-neutral-700">Copilots Srl</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// Header Component
export const Header = ({ setSidebarOpen }) => {
  const { state, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleGlobalSearch = (term) => {
    if (!term.trim()) return [];

    const results = [];

    // Search students
    state.students.forEach(student => {
      if (student.firstName.toLowerCase().includes(term.toLowerCase()) ||
          student.lastName.toLowerCase().includes(term.toLowerCase()) ||
          student.email.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          type: 'student',
          id: student.id,
          title: `${student.firstName} ${student.lastName}`,
          subtitle: student.email,
          link: `/students/${student.id}`,
          icon: FiIcons.FiUser
        });
      }
    });

    // Search schools
    state.schools.forEach(school => {
      if (school.name.toLowerCase().includes(term.toLowerCase()) ||
          school.address.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          type: 'school',
          id: school.id,
          title: school.name,
          subtitle: school.address,
          link: '/schools',
          icon: FiIcons.FiMapPin
        });
      }
    });

    // Search courses
    state.courses.forEach(course => {
      if (course.name.toLowerCase().includes(term.toLowerCase()) ||
          course.type.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          type: 'course',
          id: course.id,
          title: course.name,
          subtitle: course.type,
          link: '/courses',
          icon: FiIcons.FiBookOpen
        });
      }
    });

    // Search leads
    state.leads.forEach(lead => {
      if (lead.firstName.toLowerCase().includes(term.toLowerCase()) ||
          lead.lastName.toLowerCase().includes(term.toLowerCase()) ||
          lead.email.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          type: 'lead',
          id: lead.id,
          title: `${lead.firstName} ${lead.lastName}`,
          subtitle: `Lead - ${lead.studyPlan}`,
          link: '/leads',
          icon: FiIcons.FiTarget
        });
      }
    });

    return results.slice(0, 10);
  };

  const searchResults = searchTerm.length > 2 ? handleGlobalSearch(searchTerm) : [];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const QuickActionsModal = () => {
    const quickActions = [
      {
        title: 'Aggiungi Studente',
        description: 'Iscrivi un nuovo studente',
        icon: FiIcons.FiUserPlus,
        color: 'from-blue-500 to-blue-600',
        action: () => window.location.hash = '/students'
      },
      {
        title: 'Nuovo Lead',
        description: 'Gestisci nuovi contatti',
        icon: FiIcons.FiTarget,
        color: 'from-green-500 to-green-600',
        action: () => window.location.hash = '/leads'
      },
      {
        title: 'Aggiungi Scuola',
        description: 'Partner per esami',
        icon: FiIcons.FiMapPin,
        color: 'from-purple-500 to-purple-600',
        action: () => window.location.hash = '/schools'
      },
      {
        title: 'Crea Corso',
        description: 'Nuovo corso di studi',
        icon: FiIcons.FiBookOpen,
        color: 'from-orange-500 to-orange-600',
        action: () => window.location.hash = '/courses'
      },
      {
        title: 'Genera Report',
        description: 'Analytics e statistiche',
        icon: FiIcons.FiFileText,
        color: 'from-red-500 to-red-600',
        action: () => window.location.hash = '/analytics'
      },
      {
        title: 'Email Massiva',
        description: 'Comunicazioni bulk',
        icon: FiIcons.FiMail,
        color: 'from-indigo-500 to-indigo-600',
        action: () => console.log('Email massiva')
      },
      {
        title: 'Backup Dati',
        description: 'Esporta tutti i dati',
        icon: FiIcons.FiDatabase,
        color: 'from-gray-500 to-gray-600',
        action: () => console.log('Backup')
      },
      {
        title: 'Sincronizza Lead',
        description: 'Aggiorna da fonti esterne',
        icon: FiIcons.FiRefreshCw,
        color: 'from-teal-500 to-teal-600',
        action: () => window.location.hash = '/leads'
      },
      {
        title: 'Template Manager',
        description: 'Gestisci template',
        icon: FiIcons.FiEdit3,
        color: 'from-pink-500 to-pink-600',
        action: () => window.location.hash = '/templates'
      },
      {
        title: 'Integrazioni',
        description: 'Configura API esterne',
        icon: FiIcons.FiLink,
        color: 'from-yellow-500 to-yellow-600',
        action: () => window.location.hash = '/integrations'
      },
      {
        title: 'Strumenti Sviluppo',
        description: 'Tools per sviluppatori',
        icon: FiIcons.FiTool,
        color: 'from-cyan-500 to-cyan-600',
        action: () => window.location.hash = '/tools'
      },
      {
        title: 'Impostazioni Azienda',
        description: 'Configura dati aziendali',
        icon: FiIcons.FiSettings,
        color: 'from-violet-500 to-violet-600',
        action: () => window.location.hash = '/company'
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowQuickActions(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-neutral-800">Azioni Rapide</h2>
                <p className="text-neutral-600 mt-2">Accesso veloce alle funzioni principali del CRM</p>
              </div>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowQuickActions(false)} />
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="p-6 bg-white border-2 border-neutral-200 rounded-2xl hover:border-primary-500 hover:shadow-medium transition-all group text-left"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <SafeIcon icon={action.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">{action.title}</h3>
                  <p className="text-sm text-neutral-600">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <SafeIcon icon={FiIcons.FiMenu} className="w-6 h-6 text-neutral-600" />
          </motion.button>

          <div>
            <h2 className="text-lg font-display font-semibold text-neutral-800">
              Benvenuto, {state.user?.name}
            </h2>
            <p className="text-sm text-neutral-500">
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <SafeIcon icon={FiIcons.FiSearch} className="w-6 h-6 text-neutral-600" />
            </motion.button>

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-strong border border-neutral-200 z-50"
                >
                  <div className="p-4">
                    <Input
                      placeholder="Cerca in tutto il CRM..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={FiIcons.FiSearch}
                      autoFocus
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border-t border-neutral-200 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <motion.a
                          key={`${result.type}-${result.id}`}
                          href={`#${result.link}`}
                          onClick={() => setShowSearch(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <SafeIcon icon={result.icon} className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">{result.title}</p>
                            <p className="text-xs text-neutral-500">{result.subtitle}</p>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  )}

                  {searchTerm.length > 2 && searchResults.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-neutral-500">Nessun risultato trovato</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuickActions(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <SafeIcon icon={FiIcons.FiZap} className="w-6 h-6 text-neutral-600" />
          </motion.button>

          {/* User menu */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {state.user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-neutral-800">{state.user?.name}</p>
                <p className="text-xs text-neutral-500">{state.user?.role}</p>
              </div>
              <SafeIcon icon={FiIcons.FiChevronDown} className="w-4 h-4 text-neutral-500" />
            </motion.div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-strong border border-neutral-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="font-medium text-neutral-800">{state.user?.name}</p>
                    <p className="text-sm text-neutral-500">{state.user?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => window.location.hash = '/company'}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiUser} className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Profilo</span>
                    </button>
                    
                    <div className="border-t border-neutral-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
                      >
                        <SafeIcon icon={FiIcons.FiLogOut} className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      <AnimatePresence>
        {showQuickActions && <QuickActionsModal />}
      </AnimatePresence>
    </header>
  );
};

// Footer Component
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = '1.2.0';
  const buildDate = new Date().toLocaleDateString('it-IT');

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-neutral-200/50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0"
      >
        <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4">
          <p className="text-sm text-neutral-600">
            © {currentYear} Diplomati Online - Powered by{' '}
            <span className="font-medium text-primary-600">Copilots Srl</span>
          </p>
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <span>P.IVA: IT12345678901</span>
            <span>•</span>
            <span>SDI: ABCDEFG</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-neutral-500">
            <span>Sviluppato da Emanuele Marchiori</span>
            <span>•</span>
            <span className="font-medium text-primary-600">v{version}</span>
            <span>•</span>
            <span>{buildDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-accent-600 font-medium">PROD</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};