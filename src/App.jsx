import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';

// Context imports
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Layout components
import { Sidebar, Header, Footer } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import QuestProtectedRoute from './components/QuestProtectedRoute';

// Page imports
import {
  Dashboard,
  StudentsManagement,
  StudentProfile,
  SchoolsModule,
  CoursesSubjects,
  LeadManagement,
  CompanyConfig,
  APIIntegrations,
  UserRoles,
  InternalTools,
  TemplateCreator,
  Analytics,
  Login,
  ElectronicInvoicing,
  QuestLogin,
  QuestOnboarding
} from './pages';

import questConfig from './config/questConfig';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QuestProvider 
      apiKey={questConfig.APIKEY} 
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <div className="min-h-screen bg-gradient-to-br from-pastel-cream via-pastel-sky/20 to-pastel-mint/30">
        <div className="flex h-screen overflow-hidden">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header setSidebarOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                {/* Quest Authentication Routes */}
                <Route path="/quest-login" element={<QuestLogin />} />
                <Route path="/onboarding" element={
                  <QuestProtectedRoute>
                    <QuestOnboarding />
                  </QuestProtectedRoute>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                  <QuestProtectedRoute>
                    <Dashboard />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/students" element={
                  <QuestProtectedRoute>
                    <StudentsManagement />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/students/:id" element={
                  <QuestProtectedRoute>
                    <StudentProfile />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/schools" element={
                  <QuestProtectedRoute>
                    <SchoolsModule />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/courses" element={
                  <QuestProtectedRoute>
                    <CoursesSubjects />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/leads" element={
                  <QuestProtectedRoute>
                    <LeadManagement />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/templates" element={
                  <QuestProtectedRoute>
                    <TemplateCreator />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/invoicing" element={
                  <QuestProtectedRoute>
                    <ElectronicInvoicing />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/company" element={
                  <QuestProtectedRoute>
                    <CompanyConfig />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/integrations" element={
                  <QuestProtectedRoute>
                    <APIIntegrations />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/users" element={
                  <QuestProtectedRoute>
                    <UserRoles />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/tools" element={
                  <QuestProtectedRoute>
                    <InternalTools />
                  </QuestProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <QuestProtectedRoute>
                    <Analytics />
                  </QuestProtectedRoute>
                } />

                {/* Traditional Login Route */}
                <Route path="/login" element={<Login />} />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </div>
      </div>
    </QuestProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            className: 'bg-white shadow-soft border border-neutral-200 rounded-xl',
            duration: 4000,
          }} />
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;