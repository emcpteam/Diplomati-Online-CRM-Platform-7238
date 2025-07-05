import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QuestProvider, QuestLogin } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import questConfig from '../config/questConfig';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = ({ userId, token, newUser }) => {
    const userData = {
      userId,
      token,
      isNewUser: newUser,
      loginTime: new Date().toISOString()
    };

    login(userData, token);
    toast.success('Login successful!');

    if (newUser) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  return (
    <QuestProvider 
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <div className="min-h-screen flex">
        {/* Left Section - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8"
            >
              <SafeIcon icon={FiIcons.FiGraduationCap} className="w-12 h-12" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl font-bold mb-4"
            >
              Bentornato in Diplomati Online
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl opacity-90 mb-8 max-w-md"
            >
              La piattaforma CRM completa per la gestione studenti e corsi di recupero anni scolastici
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="grid grid-cols-2 gap-6 text-sm"
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiUsers} className="w-5 h-5" />
                <span>Gestione Studenti</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiTarget} className="w-5 h-5" />
                <span>Lead Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiMapPin} className="w-5 h-5" />
                <span>Scuole Partner</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiBarChart} className="w-5 h-5" />
                <span>Analytics Avanzate</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiIcons.FiGraduationCap} className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">Diplomati Online</h1>
              <p className="text-neutral-600">CRM Platform</p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                Accedi al tuo Account
              </h2>
              <p className="text-neutral-600">
                Inserisci le tue credenziali per continuare
              </p>
            </div>

            {/* Quest Login Component */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-soft">
              <QuestLogin
                onSubmit={handleLogin}
                email={true}
                google={false}
                accent={questConfig.PRIMARY_COLOR}
                style={{
                  width: '100%',
                  height: '400px'
                }}
              />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-neutral-500">
                © 2024 Diplomati Online - Powered by Copilots Srl
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-neutral-400">
                <span>P.IVA: IT12345678901</span>
                <span>•</span>
                <span>v1.2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </QuestProvider>
  );
};

export default LoginPage;