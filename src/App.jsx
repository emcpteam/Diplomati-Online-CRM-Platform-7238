import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Layout Components
import { Sidebar, Header, Footer } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import QuestProtectedRoute from './components/QuestProtectedRoute';

// Pages
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
  Analytics,
  TemplateCreator,
  Login,
  ElectronicInvoicing
} from './pages';

// Quest Pages
import QuestLogin from './pages/QuestLogin';
import QuestOnboarding from './pages/QuestOnboarding';

// Context
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { state } = useApp();
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated with Quest, show Quest auth flow
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/quest-login" element={<QuestLogin />} />
        <Route path="/onboarding" element={<QuestOnboarding />} />
        <Route path="*" element={<Navigate to="/quest-login" replace />} />
      </Routes>
    );
  }

  // If authenticated with Quest but not with legacy system, redirect to legacy login
  if (!state.isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quest-login" element={<Navigate to="/login" replace />} />
        <Route path="/onboarding" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-cream via-pastel-sky/20 to-pastel-mint/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <Sidebar sidebarOpen={true} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 overflow-y-auto bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-6 py-8"
            >
              <Routes>
                <Route path="/quest-login" element={<Navigate to="/" replace />} />
                <Route path="/onboarding" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                
                <Route path="/" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/students" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <StudentsManagement />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/students/:id" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/schools" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <SchoolsModule />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/courses" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <CoursesSubjects />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/leads" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <LeadManagement />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/company" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <CompanyConfig />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/integrations" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <APIIntegrations />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/users" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <UserRoles />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/tools" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <InternalTools />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/templates" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <TemplateCreator />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="/invoicing" element={
                  <QuestProtectedRoute>
                    <ProtectedRoute>
                      <ElectronicInvoicing />
                    </ProtectedRoute>
                  </QuestProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-white shadow-soft border border-neutral-200 rounded-xl',
              duration: 4000,
            }}
          />
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;