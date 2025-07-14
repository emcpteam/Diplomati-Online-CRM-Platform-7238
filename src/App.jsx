import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Layout Components
import { Sidebar, Header, Footer } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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

// Context
import { AppProvider, useApp } from './context/AppContext';

const AppContent = () => {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated, show login page
  if (!state.isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <StudentsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/:id"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schools"
                  element={
                    <ProtectedRoute>
                      <SchoolsModule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <CoursesSubjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leads"
                  element={
                    <ProtectedRoute>
                      <LeadManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company"
                  element={
                    <ProtectedRoute>
                      <CompanyConfig />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute>
                      <APIIntegrations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserRoles />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools"
                  element={
                    <ProtectedRoute>
                      <InternalTools />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute>
                      <TemplateCreator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoicing"
                  element={
                    <ProtectedRoute>
                      <ElectronicInvoicing />
                    </ProtectedRoute>
                  }
                />
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
  );
}

export default App;