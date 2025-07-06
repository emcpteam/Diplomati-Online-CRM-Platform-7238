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
      permissions: {
        dashboard: true,
        students: true,
        schools: true,
        courses: true,
        leads: true,
        templates: true,
        company: true,
        integrations: true,
        users: true,
        tools: true,
        analytics: true,
        invoicing: true
      },
      avatar: null
    },
    {
      id: 2,
      name: 'Mario Rossi',
      email: 'mario.rossi@diplomatonline.it',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-19 16:45:00',
      permissions: {
        dashboard: true,
        students: true,
        schools: true,
        courses: true,
        leads: true,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: true
      },
      avatar: null
    },
    {
      id: 3,
      name: 'Anna Verdi',
      email: 'anna.verdi@diplomatonline.it',
      role: 'Secretary',
      status: 'active',
      lastLogin: '2024-01-20 09:15:00',
      permissions: {
        dashboard: true,
        students: true,
        schools: false,
        courses: false,
        leads: false,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: false,
        invoicing: false
      },
      avatar: null
    },
    {
      id: 4,
      name: 'Giuseppe Bianchi',
      email: 'giuseppe.bianchi@diplomatonline.it',
      role: 'Accountant',
      status: 'active',
      lastLogin: '2024-01-19 14:20:00',
      permissions: {
        dashboard: true,
        students: true,
        schools: false,
        courses: false,
        leads: false,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: true
      },
      avatar: null
    },
    {
      id: 5,
      name: 'Laura Neri',
      email: 'laura.neri@diplomatonline.it',
      role: 'Sales Manager',
      status: 'active',
      lastLogin: '2024-01-20 08:50:00',
      permissions: {
        dashboard: true,
        students: false,
        schools: false,
        courses: false,
        leads: true,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: false
      },
      avatar: null
    }
  ]);

  const [roles] = useState([
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Accesso completo a tutte le funzionalità del sistema',
      color: 'from-red-500 to-red-600',
      defaultPermissions: {
        dashboard: true,
        students: true,
        schools: true,
        courses: true,
        leads: true,
        templates: true,
        company: true,
        integrations: true,
        users: true,
        tools: true,
        analytics: true,
        invoicing: true
      }
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Gestione operativa di studenti, scuole e corsi',
      color: 'from-primary-500 to-primary-600',
      defaultPermissions: {
        dashboard: true,
        students: true,
        schools: true,
        courses: true,
        leads: true,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: true
      }
    },
    {
      id: 'secretary',
      name: 'Secretary',
      description: 'Gestione studenti e comunicazioni',
      color: 'from-secondary-500 to-secondary-600',
      defaultPermissions: {
        dashboard: true,
        students: true,
        schools: false,
        courses: false,
        leads: false,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: false,
        invoicing: false
      }
    },
    {
      id: 'accountant',
      name: 'Accountant',
      description: 'Gestione pagamenti e report finanziari',
      color: 'from-accent-500 to-accent-600',
      defaultPermissions: {
        dashboard: true,
        students: true,
        schools: false,
        courses: false,
        leads: false,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: true
      }
    },
    {
      id: 'sales_manager',
      name: 'Sales Manager',
      description: 'Gestione lead e attività commerciali',
      color: 'from-orange-500 to-orange-600',
      defaultPermissions: {
        dashboard: true,
        students: false,
        schools: false,
        courses: false,
        leads: true,
        templates: false,
        company: false,
        integrations: false,
        users: false,
        tools: false,
        analytics: true,
        invoicing: false
      }
    }
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const pagePermissions = [
    { key: 'dashboard', label: 'Dashboard', icon: FiIcons.FiHome },
    { key: 'students', label: 'Studenti', icon: FiIcons.FiUsers },
    { key: 'schools', label: 'Scuole', icon: FiIcons.FiMapPin },
    { key: 'courses', label: 'Corsi', icon: FiIcons.FiBookOpen },
    { key: 'leads', label: 'Lead', icon: FiIcons.FiTarget },
    { key: 'templates', label: 'Template', icon: FiIcons.FiFileText },
    { key: 'company', label: 'Azienda', icon: FiIcons.FiSettings },
    { key: 'integrations', label: 'Integrazioni', icon: FiIcons.FiLink },
    { key: 'users', label: 'Utenti', icon: FiIcons.FiUserCheck },
    { key: 'tools', label: 'Strumenti', icon: FiIcons.FiTool },
    { key: 'analytics', label: 'Analytics', icon: FiIcons.FiBarChart },
    { key: 'invoicing', label: 'Fatturazione', icon: FiIcons.FiFileText }
  ];

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
      'Sales Manager': 'warning'
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success">Attivo</Badge>;
      case 'inactive': return <Badge variant="warning">Inattivo</Badge>;
      case 'suspended': return <Badge variant="danger">Sospeso</Badge>;
      default: return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getPermissionsCount = (permissions) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const UserModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      status: user?.status || 'active',
      permissions: user?.permissions || {}
    });

    const handleRoleChange = (newRole) => {
      const roleConfig = roles.find(r => r.name === newRole);
      if (roleConfig) {
        setFormData(prev => ({
          ...prev,
          role: newRole,
          permissions: { ...roleConfig.defaultPermissions }
        }));
      }
    };

    const handlePermissionToggle = (permission) => {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: !prev.permissions[permission]
        }
      }));
    };

    const handleSave = () => {
      if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
        toast.error('Compila tutti i campi obbligatori');
        return;
      }

      if (user) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...formData } : u));
        toast.success('Utente aggiornato con successo!');
      } else {
        const newUser = {
          id: Date.now(),
          ...formData,
          lastLogin: null,
          avatar: null
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('Utente creato con successo!');
      }
      
      onClose();
    };

    const handleDelete = () => {
      if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast.success('Utente eliminato con successo!');
        onClose();
      }
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
          className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                {user ? 'Modifica Utente' : 'Nuovo Utente'}
              </h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@diplomatonline.it"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ruolo *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleziona ruolo</option>
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                  <option value="suspended">Sospeso</option>
                </select>
              </div>
            </div>

            {/* Permissions Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Permessi Pagine ({getPermissionsCount(formData.permissions)}/{pagePermissions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagePermissions.map((page) => (
                  <div
                    key={page.key}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.permissions[page.key]
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => handlePermissionToggle(page.key)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.permissions[page.key] ? 'bg-primary-500' : 'bg-neutral-100'
                      }`}>
                        <SafeIcon 
                          icon={page.icon} 
                          className={`w-5 h-5 ${
                            formData.permissions[page.key] ? 'text-white' : 'text-neutral-400'
                          }`} 
                        />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          formData.permissions[page.key] ? 'text-primary-800' : 'text-neutral-700'
                        }`}>
                          {page.label}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            formData.permissions[page.key] ? 'bg-primary-500' : 'bg-neutral-300'
                          }`} />
                          <span className="text-xs text-neutral-500">
                            {formData.permissions[page.key] ? 'Consentito' : 'Negato'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Info */}
            {formData.role && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2">Informazioni Ruolo</h4>
                <p className="text-sm text-blue-700">
                  {roles.find(r => r.name === formData.role)?.description}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                {user && (
                  <Button
                    variant="danger"
                    icon={FiIcons.FiTrash2}
                    onClick={handleDelete}
                  >
                    Elimina Utente
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button icon={FiIcons.FiSave} onClick={handleSave}>
                  {user ? 'Salva Modifiche' : 'Crea Utente'}
                </Button>
              </div>
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
            Gestisci gli utenti del CRM e i loro permessi di accesso
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload}>
            Esporta
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddUser(true)}>
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
              <div className="text-sm text-neutral-600">
                <span className="font-medium">
                  {getPermissionsCount(role.defaultPermissions)}/{pagePermissions.length}
                </span> pagine accessibili
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
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'Mai'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Permessi:</span>
                  <span className="font-medium text-neutral-800">
                    {getPermissionsCount(user.permissions)}/{pagePermissions.length} pagine
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={FiIcons.FiMail}>
                    Email
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
      {(selectedUser || showAddUser) && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setShowAddUser(false);
          }}
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