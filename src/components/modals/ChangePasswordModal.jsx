import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({ user, onClose, onPasswordChanged }) => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('La password deve essere di almeno 8 caratteri');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('La password deve contenere almeno una lettera maiuscola');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('La password deve contenere almeno una lettera minuscola');
    }
    if (!/\d/.test(password)) {
      errors.push('La password deve contenere almeno un numero');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La password deve contenere almeno un carattere speciale');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate current password (in a real app, this would be verified server-side)
      if (!formData.currentPassword.trim()) {
        toast.error('Inserisci la password corrente');
        return;
      }

      // Validate new password
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        toast.error(passwordErrors[0]);
        return;
      }

      // Check password confirmation
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Le password non corrispondono');
        return;
      }

      // Check if new password is different from current
      if (formData.currentPassword === formData.newPassword) {
        toast.error('La nuova password deve essere diversa da quella corrente');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would:
      // 1. Verify current password with server
      // 2. Hash new password
      // 3. Update user record
      // 4. Invalidate current sessions if needed

      // Update user's last password change date
      const updatedUser = {
        ...user,
        lastPasswordChange: new Date().toISOString(),
        passwordChangeRequired: false
      };

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });

      // Log password change activity
      const activity = {
        id: Date.now(),
        userId: user.id,
        action: 'password_changed',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1', // In real app, get actual IP
        userAgent: navigator.userAgent
      };

      // In real app, save to activity log
      console.log('Password change activity:', activity);

      toast.success('Password cambiata con successo!');
      
      if (onPasswordChanged) {
        onPasswordChanged(updatedUser);
      }

      onClose();

      // Optional: Force re-login for security
      if (window.confirm('Password cambiata con successo! Vuoi effettuare un nuovo login per sicurezza?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.reload();
      }

    } catch (error) {
      toast.error('Errore durante il cambio password');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Debole' };
    if (strength <= 3) return { level: 'medium', color: 'bg-yellow-500', text: 'Media' };
    if (strength <= 4) return { level: 'good', color: 'bg-blue-500', text: 'Buona' };
    return { level: 'strong', color: 'bg-accent-500', text: 'Forte' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-strong max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiLock} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Cambia Password
                </h2>
                <p className="text-neutral-600">
                  {user.name}
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Password */}
          <div className="relative">
            <Input
              label="Password Corrente *"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Inserisci password corrente"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
            >
              <SafeIcon 
                icon={showPasswords.current ? FiIcons.FiEyeOff : FiIcons.FiEye} 
                className="w-5 h-5" 
              />
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input
              label="Nuova Password *"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Inserisci nuova password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
            >
              <SafeIcon 
                icon={showPasswords.new ? FiIcons.FiEyeOff : FiIcons.FiEye} 
                className="w-5 h-5" 
              />
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Sicurezza Password</span>
                <span className={`text-sm font-medium ${
                  passwordStrength.level === 'weak' ? 'text-red-600' :
                  passwordStrength.level === 'medium' ? 'text-yellow-600' :
                  passwordStrength.level === 'good' ? 'text-blue-600' :
                  'text-accent-600'
                }`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.level === 'weak' ? 20 : passwordStrength.level === 'medium' ? 40 : passwordStrength.level === 'good' ? 70 : 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Conferma Nuova Password *"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Conferma nuova password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
            >
              <SafeIcon 
                icon={showPasswords.confirm ? FiIcons.FiEyeOff : FiIcons.FiEye} 
                className="w-5 h-5" 
              />
            </button>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Requisiti Password</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li className={validatePassword(formData.newPassword).some(e => e.includes('8 caratteri')) ? 'text-red-600' : 'text-accent-600'}>
                    • Almeno 8 caratteri
                  </li>
                  <li className={!/[A-Z]/.test(formData.newPassword) && formData.newPassword ? 'text-red-600' : 'text-accent-600'}>
                    • Una lettera maiuscola
                  </li>
                  <li className={!/[a-z]/.test(formData.newPassword) && formData.newPassword ? 'text-red-600' : 'text-accent-600'}>
                    • Una lettera minuscola
                  </li>
                  <li className={!/\d/.test(formData.newPassword) && formData.newPassword ? 'text-red-600' : 'text-accent-600'}>
                    • Un numero
                  </li>
                  <li className={!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) && formData.newPassword ? 'text-red-600' : 'text-accent-600'}>
                    • Un carattere speciale
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiShield} className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Nota di Sicurezza</p>
                <p className="text-sm text-orange-700 mt-1">
                  Dopo aver cambiato la password, potresti dover effettuare nuovamente l'accesso per motivi di sicurezza.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              icon={FiIcons.FiLock} 
              loading={loading}
              disabled={
                !formData.currentPassword || 
                !formData.newPassword || 
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword ||
                validatePassword(formData.newPassword).length > 0
              }
            >
              Cambia Password
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChangePasswordModal;