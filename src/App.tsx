import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// 🚨 URGENT: VERSION FORCÉE POUR VERCEL - $(Get-Date)
// 🔧 CORRECTION: Déploiement forcé pour résoudre localhost
// 📅 Dernière mise à jour: $(Get-Date)

import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage'
import FeaturesPage from './pages/public/FeaturesPage'
import PricingPage from './pages/public/PricingPage'
import HelpPage from './pages/public/HelpPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import AccountsPage from './pages/dashboard/AccountsPage'
import IbanPage from './pages/dashboard/IbanPage'
import TransfersPage from './pages/dashboard/TransfersPage'
import CardsPage from './pages/dashboard/CardsPage'
import BillingPage from './pages/dashboard/BillingPage'
import KycPage from './pages/dashboard/KycPage'
import HistoryPage from './pages/dashboard/HistoryPage'
import BudgetsPage from './pages/dashboard/BudgetsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import DashboardHelpPage from './pages/dashboard/HelpPage'
import DocumentsPage from './pages/dashboard/DocumentsPage'
import MessagesPage from './pages/dashboard/MessagesPage'
import VerificationPage from './pages/dashboard/VerificationPage'

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fonctionnalites" element={<FeaturesPage />} />
          <Route path="tarifs" element={<PricingPage />} />
          <Route path="aide" element={<HelpPage />} />
          <Route path="connexion" element={<LoginPage />} />
          <Route path="ouvrir-compte" element={<RegisterPage />} />
          <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="comptes" element={<AccountsPage />} />
          <Route path="iban" element={<IbanPage />} />
          <Route path="virements" element={<TransfersPage />} />
          <Route path="cartes" element={<CardsPage />} />
          <Route path="facturation" element={<BillingPage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="historique" element={<HistoryPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="parametres" element={<SettingsPage />} />
          <Route path="aide" element={<DashboardHelpPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="verification" element={<VerificationPage />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App 