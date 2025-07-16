import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const tabs = [
  { id: 'course-creation', label: 'Creazione Corsi', icon: FiIcons.FiBookOpen },
  { id: 'autocomplete', label: 'Campi Autocomplete', icon: FiIcons.FiEdit3 },
  { id: 'import-export', label: 'Import/Export', icon: FiIcons.FiDatabase },
  { id: 'pdf-tools', label: 'Strumenti PDF', icon: FiIcons.FiFileText },
  { id: 'file-repository', label: 'Repository File', icon: FiIcons.FiFolder }, // Changed from FiFolderOpen to FiFolder
  { id: 'versioning', label: 'Versioning', icon: FiIcons.FiGitCommit }
];

// ... rest of the InternalTools component code ...