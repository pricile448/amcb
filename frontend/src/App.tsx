import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 🚨 URGENT: VERSION FORCÉE POUR VERCEL - $(Get-Date)
// 🔧 CORRECTION: Déploiement forcé pour résoudre localhost
// 📅 Dernière mise à jour: $(Get-Date)

import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import LanguageWrapper from './components/LanguageWrapper';
import LanguageRedirect from './components/LanguageRedirect';

// Public Pages
import HomePage from './pages/public/HomePage'
import FeaturesPage from './pages/public/FeaturesPage'
import PricingPage from './pages/public/PricingPage'
import HelpPage from './pages/public/HelpPage'
import TestLinksPage from './pages/TestLinksPage'
import TestAuthRoutesPage from './pages/TestAuthRoutesPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import VerificationPendingPage from './pages/auth/VerificationPendingPage'
import FirebaseActionPage from './pages/auth/FirebaseActionPage'

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
import KycSuccessPage from './pages/dashboard/KycSuccessPage'

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Root redirect to language */}
        <Route path="/" element={<LanguageRedirect />} />
        
        {/* Firebase Auth Routes - NO LANGUAGE PREFIX (pour compatibilité) */}
        <Route path="/verification-pending" element={<VerificationPendingPage />} />
        <Route path="/auth/action" element={<FirebaseActionPage />} />
        
        {/* Firebase Auth Routes AVEC PREFIXE DE LANGUE */}
        <Route path="/:lang/verification-pending" element={<VerificationPendingPage />} />
        <Route path="/:lang/auth/action" element={<FirebaseActionPage />} />
        
        {/* Language-prefixed routes */}
        <Route path="/:lang" element={<LanguageWrapper />}>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="fonctionnalites" element={<FeaturesPage />} />
            <Route path="tarifs" element={<PricingPage />} />
            <Route path="aide" element={<HelpPage />} />
            <Route path="test-liens" element={<TestLinksPage />} />
            <Route path="test-auth-routes" element={<TestAuthRoutesPage />} />
            <Route path="connexion" element={<LoginPage />} />
            <Route path="ouvrir-compte" element={<RegisterPage />} />
            <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route path="dashboard" element={
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
            <Route path="kyc-success" element={<KycSuccessPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App 