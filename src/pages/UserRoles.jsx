import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const UserRoles = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Emanuele Marchiori',
      email: 'emanuele@copilots.it',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2024-01-20 10:30:00',
      permissions: ['all'],
      avatar: null,
    },
    {
      id: 2,
      name: 'Mario Rossi',
      email: 'mario.rossi@diplomatonline.it',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-19 16:45:00',
      permissions: ['students', 'schools', 'courses', 'leads'],
      avatar: null,
    },
    {
      id: 3,
      name: 'Anna Verdi',
      email: 'anna.verdi@diplomatonline.it',
      role: 'Secretary',
      status: 'active',
      lastLogin: '2024-01-20 09:15:00',
      permissions: ['students', 'communications'],
      avatar: null,
    },
    {
      id: 4,
      name: 'Giuseppe Bianchi',
      email: 'giuseppe.bianchi@diplomatonline.it',
      role: 'Accountant',
      status: 'active',
      lastLogin: '2024-01-19 14:20:00',
      permissions: ['payments', 'reports'],
      avatar: null,
    },
    {
      id: 5,
      name: 'Laura Neri',
      email: 'laura.neri@diplomatonline.it',
      role: 'Sales Lead Manager',
      status: 'active',
      lastLogin: '2024-01-20 08:50:00',
      permissions: ['leads', 'quotes'],
      avatar: null,
    },
  ]);

  const [roles] = useState([
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Accesso completo a tutte le funzionalità',
      permissions: ['all'],
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Accesso a gestione studenti, scuole e corsi',
      permissions: ['students', 'schools', 'courses', 'leads', 'analytics'],
      color: 'from-primary-500 to-primary-600',
    },
    {
      id: 'secretary',
      name: 'Secretary',
      description: 'Gestione studenti e comunicazioni',
      permissions: ['students', 'communications', 'calendar'],
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      id: 'accountant',
      name: 'Accountant',
      description: 'Gestione pagamenti e report finanziari',
      permissions: ['payments', 'reports', 'analytics'],
      color: 'from-accent-500 to-accent-600',
    },
    {
      id: 'sales_lead_manager',
      name: 'Sales Lead Manager',
      description: 'Gestione lead e preventivi',
      permissions: ['leads', 'quotes', 'communications'],
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'basic_user',
      name: 'Basic User',
      description: 'Accesso limitato alle funzionalità base',
      permissions: ['dashboard', 'profile'],
      color: 'from-neutral-500 to-neutral-600',
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const variants = {
      'Super Admin': 'danger',
      'Admin': 'primary',
      'Secretary': 'secondary',
      'Accountant': 'success',
      'Sales Lead Manager': 'warning',
      'Basic User': 'default',
    };
    
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Attivo</Badge>;
      case 'inactive':
        return <Badge variant="warning">Inattivo</Badge>;
      case 'suspended':
        return <Badge variant="danger">Sospeso</Badge>;
      default:
        return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const UserModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    const handleSave = () => {
      setUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, ...formData }
            : u
        )
      );
      toast.success('Utente aggiornato con successo!');
      onClose();
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                Modifica Utente
              </h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ruolo
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Stato
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                  <option value="suspended">Sospeso</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Permessi Ruolo
              </h3>
              <div className="p-4 bg-neutral-50 rounded-xl">
                {roles.find(r => r.name === formData.role)?.permissions.map(permission => (
                  <Badge key={permission} variant="primary" className="mr-2 mb-2">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button icon={FiIcons.FiSave} onClick={handleSave}>
                Salva Modifiche
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Gestione Utenti e Ruoli
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci gli utenti del sistema e i loro permessi
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload}>
            Esporta
          </Button>
          <Button icon={FiIcons.FiPlus}>
            Nuovo Utente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Cerca utenti..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiIcons.FiSearch}
          className="max-w-md"
        />
      </Card>

      {/* Roles Overview */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Ruoli Disponibili</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                  <SafeIcon icon={FiIcons.FiShield} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">{role.name}</h3>
                  <p className="text-sm text-neutral-500">{role.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map(permission => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="default" className="text-xs">
                    +{role.permissions.length - 3}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{user.name}</h3>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                </div>
                {getStatusBadge(user.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Ruolo:</span>
                  {getRoleBadge(user.role)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Ultimo accesso:</span>
                  <span className="font-medium text-neutral-800">
                    {new Date(user.lastLogin).toLocaleDateString('it-IT')}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 mb-2">Permessi:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission} variant="primary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {user.permissions.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{user.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={FiIcons.FiMail}>
                    Email
                  </Button>
                  <Button variant="ghost" size="sm" icon={FiIcons.FiPhone}>
                    Chiama
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  icon={FiIcons.FiEdit}
                  onClick={() => setSelectedUser(user)}
                >
                  Modifica
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Modal */}
      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{users.length}</p>
            <p className="text-sm text-neutral-500">Utenti Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-sm text-neutral-500">Utenti Attivi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">{roles.length}</p>
            <p className="text-sm text-neutral-500">Ruoli Configurati</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {users.filter(u => u.role === 'Admin' || u.role === 'Super Admin').length}
            </p>
            <p className="text-sm text-neutral-500">Amministratori</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserRoles;