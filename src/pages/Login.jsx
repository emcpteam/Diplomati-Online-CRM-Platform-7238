import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import * as HiIcons from 'react-icons/hi'; // Added HiIcons for graduation cap
import SafeIcon from '../common/SafeIcon';
import { Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  // ... other code ...

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-cream via-pastel-sky/20 to-pastel-mint/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-strong p-8 w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <SafeIcon icon={HiIcons.HiAcademicCap} className="w-8 h-8 text-white" /> {/* Changed from FiGraduationCap to HiAcademicCap */}
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-neutral-800 mb-2">
            Diplomati Online
          </h1>
          <p className="text-neutral-600">
            Accedi al tuo account CRM
          </p>
        </div>

        {/* ... rest of the component ... */}
      </motion.div>
    </div>
  );
};

export default Login;