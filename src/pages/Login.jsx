import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Demo credentials
  const demoUsers = [
    {
      email: 'admin@diplomatonline.it',
      password: 'admin123',
      user: {
        id: 1,
        name: 'Emanuele Marchiori',
        email: 'admin@diplomatonline.it',
        role: 'Super Admin',
        permissions: ['all']
      }
    },
    {
      email: 'segreteria@diplomatonline.it',
      password: 'segreteria123',
      user: {
        id: 2,
        name: 'Anna Verdi',
        email: 'segreteria@diplomatonline.it',
        role: 'Secretary',
        permissions: ['students', 'communications']
      }
    },
    {
      email: 'sales@diplomatonline.it',
      password: 'sales123',
      user: {
        id: 3,
        name: 'Mario Rossi',
        email: 'sales@diplomatonline.it',
        role: 'Sales Manager',
        permissions: ['leads', 'quotes']
      }
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find user by credentials
      const foundUser = demoUsers.find(
        user => user.email === formData.email && user.password === formData.password
      );

      if (foundUser) {
        // Set authentication token
        const authToken = btoa(JSON.stringify({
          userId: foundUser.user.id,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(foundUser.user));

        // Update app context
        dispatch({ type: 'SET_USER', payload: foundUser.user });

        toast.success(`Benvenuto, ${foundUser.user.name}!`);
        navigate('/');
      } else {
        toast.error('Credenziali non valide');
      }
    } catch (error) {
      toast.error('Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userType) => {
    const demoUser = demoUsers.find(user => user.email.includes(userType));
    if (demoUser) {
      setFormData({
        email: demoUser.email,
        password: demoUser.password
      });
    }
  };

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
            <SafeIcon icon={FiIcons.FiGraduationCap} className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-neutral-800 mb-2">
            Diplomati Online
          </h1>
          <p className="text-neutral-600">
            Accedi al tuo account CRM
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="inserisci@email.com"
            icon={FiIcons.FiMail}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            icon={FiIcons.FiLock}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            icon={FiIcons.FiLogIn}
          >
            Accedi
          </Button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 text-center mb-4">
            Account Demo Disponibili:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-800">Super Admin</p>
                  <p className="text-xs text-primary-600">admin@diplomatonline.it</p>
                </div>
                <SafeIcon icon={FiIcons.FiShield} className="w-4 h-4 text-primary-600" />
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('segreteria')}
              className="w-full text-left p-3 bg-secondary-50 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-800">Segreteria</p>
                  <p className="text-xs text-secondary-600">segreteria@diplomatonline.it</p>
                </div>
                <SafeIcon icon={FiIcons.FiUser} className="w-4 h-4 text-secondary-600" />
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('sales')}
              className="w-full text-left p-3 bg-accent-50 hover:bg-accent-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-800">Sales Manager</p>
                  <p className="text-xs text-accent-600">sales@diplomatonline.it</p>
                </div>
                <SafeIcon icon={FiIcons.FiTarget} className="w-4 h-4 text-accent-600" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-xs text-neutral-500">
            © 2024 Diplomati Online - Powered by Copilots Srl
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;