// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageProvider from './components/LanguageProvider';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { theme } from './theme';
import logger from './utils/logger';
import './i18n';

export default function App() {
  const { t } = useTranslation();

  // Log application initialization
  React.useEffect(() => {
    logger.info('Application initialized', { 
      environment: process.env.NODE_ENV,
      version: process.env.REACT_APP_VERSION || '1.0.0'
    });
  }, []);
  return (
    <ErrorBoundary 
      fullPage={true} 
      message={t('errors.somethingWrong')}
      componentName="App"
    >
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary componentName="Home">
                    <Home/>
                  </ErrorBoundary>
                }/>
                <Route path="/register" element={
                  <ErrorBoundary componentName="Register">
                    <Register/>
                  </ErrorBoundary>
                }/>
                <Route path="/dashboard" element={
                  <ErrorBoundary componentName="Dashboard">
                    <Dashboard/>
                  </ErrorBoundary>
                }/>
                <Route path="/admin" element={
                  <ErrorBoundary componentName="AdminPanel">
                    <AdminPanel/>
                  </ErrorBoundary>
                }/>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
