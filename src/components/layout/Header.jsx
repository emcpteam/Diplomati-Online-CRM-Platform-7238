import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';

const Header = ({ setSidebarOpen }) => {
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
          link: `/students/${student.id}`
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
          link: '/leads'
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
          link: '/schools'
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

  const QuickActionsModal = () => {
    const quickActions = [
      { title: 'Add Student', icon: FiIcons.FiUserPlus, color: 'from-blue-500 to-blue-600', action: () => window.location.hash = '/students' },
      { title: 'New Lead', icon: FiIcons.FiTarget, color: 'from-green-500 to-green-600', action: () => window.location.hash = '/leads' },
      { title: 'Add School', icon: FiIcons.FiMapPin, color: 'from-purple-500 to-purple-600', action: () => window.location.hash = '/schools' },
      { title: 'Create Course', icon: FiIcons.FiBookOpen, color: 'from-orange-500 to-orange-600', action: () => window.location.hash = '/courses' },
      { title: 'Generate Report', icon: FiIcons.FiFileText, color: 'from-red-500 to-red-600', action: () => window.location.hash = '/analytics' },
      { title: 'Mass Email', icon: FiIcons.FiMail, color: 'from-indigo-500 to-indigo-600', action: () => console.log('Mass email') },
      { title: 'Data Backup', icon: FiIcons.FiDatabase, color: 'from-gray-500 to-gray-600', action: () => console.log('Backup') },
      { title: 'Sync Leads', icon: FiIcons.FiRefreshCw, color: 'from-teal-500 to-teal-600', action: () => window.location.hash = '/leads' }
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
          className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Quick Actions</h2>
              <Button
                variant="ghost"
                icon={FiIcons.FiX}
                onClick={() => setShowQuickActions(false)}
              />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:shadow-medium transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-neutral-800 text-center">{action.title}</p>
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
              Welcome, {state.user.name}
            </h2>
            <p className="text-sm text-neutral-500">
              {new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative"
            >
              <SafeIcon icon={FiIcons.FiBell} className="w-6 h-6 text-neutral-600" />
              {state.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                  {state.notifications.length}
                </span>
              )}
            </motion.button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-strong border border-neutral-200 py-4 z-50"
              >
                <div className="px-4 pb-2 border-b border-neutral-200">
                  <h3 className="font-medium text-neutral-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-8">
                      No notifications
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
                      placeholder="Search throughout CRM..."
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
                            <SafeIcon icon={getTypeIcon(result.type)} className="w-4 h-4 text-neutral-600" />
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
                      <p className="text-sm text-neutral-500">No results found</p>
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
              whileTap={{ scale: 0.98 }}
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
                    <p className="font-medium text-neutral-800">{state.user.name}</p>
                    <p className="text-sm text-neutral-500">{state.user.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => window.location.hash = '/company'}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiUser} className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Profile</span>
                    </button>
                    <button
                      onClick={() => window.location.hash = '/integrations'}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiSettings} className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Settings</span>
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

export default Header;