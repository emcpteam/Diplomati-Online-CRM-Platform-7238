import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QuestProvider, OnBoarding } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import questConfig from '../config/questConfig';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const userId = localStorage.getItem('questUserId');
  const token = localStorage.getItem('questAuthToken');

  const getAnswers = () => {
    toast.success('Onboarding completato con successo!');
    navigate('/');
  };

  if (!user || !userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <QuestProvider 
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <div className="min-h-screen flex">
        {/* Left Section - Visual/Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-accent-600 to-primary-600 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-32 left-24 w-40 h-40 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-32 right-24 w-56 h-56 bg-white rounded-full blur-2xl"></div>
            <div className="absolute top-2/3 left-1/4 w-28 h-28 bg-white rounded-full blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8"
            >
              <SafeIcon icon={FiIcons.FiSettings} className="w-14 h-14" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl font-bold mb-6"
            >
              Configuriamo il tuo Account
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl opacity-90 mb-8 max-w-md leading-relaxed"
            >
              Personalizza la tua esperienza con Diplomati Online. Questo processo richiede solo pochi minuti.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="space-y-4 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <span>Configura le tue preferenze</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
                <span>Personalizza il dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">3</span>
                </div>
                <span>Inizia a utilizzare la piattaforma</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Onboarding Component */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiIcons.FiSettings} className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">Setup Account</h1>
              <p className="text-neutral-600">Configurazione iniziale</p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                Benvenuto!
              </h2>
              <p className="text-neutral-600">
                Completa la configurazione per iniziare
              </p>
            </div>

            {/* Quest Onboarding Component */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-soft">
              <OnBoarding
                userId={userId}
                token={token}
                questId={questConfig.QUEST_ONBOARDING_QUESTID}
                answer={answers}
                setAnswer={setAnswers}
                getAnswers={getAnswers}
                accent={questConfig.PRIMARY_COLOR}
                singleChoose="modal1"
                multiChoice="modal2"
                style={{
                  width: '100%',
                  height: '400px'
                }}
              >
                <OnBoarding.Header />
                <OnBoarding.Content />
                <OnBoarding.Footer />
              </OnBoarding>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
                <span>Progresso configurazione</span>
                <span>{Object.keys(answers).length > 0 ? '75%' : '25%'}</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent-500 to-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: Object.keys(answers).length > 0 ? '75%' : '25%' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-neutral-500">
                Puoi modificare queste impostazioni in qualsiasi momento
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </QuestProvider>
  );
};

export default OnboardingPage;