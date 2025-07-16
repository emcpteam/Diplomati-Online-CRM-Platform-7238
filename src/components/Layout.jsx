import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import SafeIcon from '../common/SafeIcon';

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
  { name: 'Analytics', path: '/analytics', icon: FiIcons.FiBarChart2 }, // Changed from FiBarChart3 to FiBarChart2
];

// ... rest of the Layout component code ...