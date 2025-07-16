import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Button } from './UI';

const toolbarButtons = [
  { command: 'bold', icon: FiIcons.FiBold, title: 'Grassetto' },
  { command: 'italic', icon: FiIcons.FiItalic, title: 'Corsivo' },
  { command: 'underline', icon: FiIcons.FiUnderline, title: 'Sottolineato' },
  { command: 'separator' },
  { command: 'justifyLeft', icon: FiIcons.FiAlignLeft, title: 'Allinea a sinistra' },
  { command: 'justifyCenter', icon: FiIcons.FiAlignCenter, title: 'Centra' },
  { command: 'justifyRight', icon: FiIcons.FiAlignRight, title: 'Allinea a destra' },
  { command: 'separator' },
  { command: 'insertUnorderedList', icon: FiIcons.FiList, title: 'Elenco puntato' },
  { command: 'insertOrderedList', icon: FiIcons.FiHash, title: 'Elenco numerato' },
  { command: 'separator' },
  { command: 'createLink', icon: FiIcons.FiLink, title: 'Inserisci link', needsInput: true },
  { command: 'unlink', icon: FiIcons.FiSlash, title: 'Rimuovi link' }, // Changed from FiLinkOff to FiSlash
];

// ... rest of the HTMLEditor component code ...