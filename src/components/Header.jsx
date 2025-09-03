import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';

const Header = ({ setSidebarOpen }) => {
  const { state, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGlobalSearch = (term) => {
    if (!term.trim()) return [];

    const results = [];

    // Search students
    state.students.forEach(student => {
      if (
        student.firstName.toLowerCase().includes(term.toLowerCase()) ||
        student.lastName.toLowerCase().includes(term.toLowerCase()) ||
        student.email.toLowerCase().includes(term.toLowerCase())
      ) {
        results.push({
          type: 'student',
          id: student.id,
          title: `${student.firstName} ${student.lastName}`,
          subtitle: student.email,
          link: `/students/${student.id}`
        });
      }
    });

    // Search leads
    state.leads.forEach(lead => {
      if (
        lead.firstName.toLowerCase().includes(term.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(term.toLowerCase()) ||
        lead.email.toLowerCase().includes(term.toLowerCase())
      ) {
        results.push({
          type: 'lead',
          id: lead.id,
          title: `${lead.firstName} ${lead.lastName}`,
          subtitle: `Lead - ${lead.studyPlan}`,
          link: '/leads'
        });
      }
    });

    // Search schools
    state.schools.forEach(school => {
      if (
        school.name.toLowerCase().includes(term.toLowerCase()) ||
        school.address.toLowerCase().includes(term.toLowerCase())
      ) {
        results.push({
          type: 'school',
          id: school.id,
          title: school.name,
          subtitle: school.address,
          link: '/schools'
        });
      }
    });

    // Search courses
    state.courses.forEach(course => {
      if (
        course.name.toLowerCase().includes(term.toLowerCase()) ||
        course.type.toLowerCase().includes(term.toLowerCase())
      ) {
        results.push({
          type: 'course',
          id: course.id,
          title: course.name,
          subtitle: course.type,
          link: '/courses'
        });
      }
    });

    return results.slice(0, 10);
  };

  const searchResults = searchTerm.length > 2 ? handleGlobalSearch(searchTerm) : [];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'student': return FiIcons.FiUser;
      case 'lead': return FiIcons.FiTarget;
      case 'school': return FiIcons.FiMapPin;
      case 'course': return FiIcons.FiBookOpen;
      default: return FiIcons.FiFile;
    }
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <SafeIcon icon={FiIcons.FiMenu} className="w-6 h-6 text-neutral-600" />
          </button>

          <div>
            <h2 className="text-lg font-display font-semibold text-neutral-800">
              Benvenuto, {state.user.name}
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
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative"
            >
              <SafeIcon icon={FiIcons.FiBell} className="w-6 h-6 text-neutral-600" />
              {state.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                  {state.notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-strong border border-neutral-200 py-4 z-50"
              >
                <div className="px-4 pb-2 border-b border-neutral-200">
                  <h3 className="font-medium text-neutral-800">Notifiche</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-8">
                      Nessuna notifica
                    </p>
                  ) : (
                    state.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                      >
                        <p className="text-sm text-neutral-800">{notification.message}</p>
                        <p className="text-xs text-neutral-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <SafeIcon icon={FiIcons.FiSearch} className="w-6 h-6 text-neutral-600" />
            </button>

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
                            <SafeIcon
                              icon={getTypeIcon(result.type)}
                              className="w-4 h-4 text-neutral-600"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">
                              {result.title}
                            </p>
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

          {/* User menu */}
          <div className="relative">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {state.user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-neutral-800">{state.user.name}</p>
                <p className="text-xs text-neutral-500">{state.user.role}</p>
              </div>
              <SafeIcon icon={FiIcons.FiChevronDown} className="w-4 h-4 text-neutral-500" />
            </div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-strong border border-neutral-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="font-medium text-neutral-800">{state.user.name}</p>
                    <p className="text-sm text-neutral-500">{state.user.email}</p>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => window.location.hash = '/company'}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiUser} className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Profilo</span>
                    </button>

                    <button
                      onClick={() => window.location.hash = '/integrations'}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiSettings} className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Impostazioni</span>
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
    </header>
  );
};

export default Header;