import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import SafeIcon from '../../common/SafeIcon';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiIcons.FiHome },
    { name: 'Studenti', path: '/students', icon: FiIcons.FiUsers },
    { name: 'Scuole', path: '/schools', icon: FiIcons.FiMapPin },
    { name: 'Corsi', path: '/courses', icon: FiIcons.FiBookOpen },
    { name: 'Lead', path: '/leads', icon: FiIcons.FiTarget },
    { name: 'Template', path: '/templates', icon: FiIcons.FiFileText },
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

export default Sidebar;