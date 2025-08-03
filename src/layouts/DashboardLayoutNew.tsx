import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  CreditCard,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  MessageCircle,
  Building,
  Clock,
  PieChart,
  HelpCircle,
  FileText,
  ChevronDown,
} from "lucide-react";
import { formatUserNameForDisplay } from "../utils/dateUtils";
import VerificationBanner from "../components/VerificationBanner";
import ModernAlert from "../components/ModernAlert";
import ProfileMenu from "../components/ProfileMenu";
import { useKycSync } from "../hooks/useNotifications";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationBadge } from "../components/NotificationBadge";
import { NotificationToastManager } from "../components/NotificationToastManager";

const DashboardLayoutNew: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userStatus, syncKycStatus } = useKycSync();
  const { unreadCount, markAsRead } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showModernAlert, setShowModernAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success'
  });

  // Synchroniser le statut KYC au chargement
  useEffect(() => {
    syncKycStatus();
  }, [syncKycStatus]);

  // Fonction pour récupérer le nom de l'utilisateur connecté
  const getUserName = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return formatUserNameForDisplay(user.firstName || 'Client', user.lastName || 'AmCbunq');
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'Client AmCbunq';
  };

  // Fonction pour récupérer l'email de l'utilisateur connecté
  const getUserEmail = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email || 'client@amcbunq.com';
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'client@amcbunq.com';
  };

  // Fonction pour récupérer les initiales de l'utilisateur
  const getUserInitials = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const first = user.firstName || 'C';
        const last = user.lastName || 'A';
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'CA';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const showModernAlertMessage = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setAlertConfig({ title, message, type });
    setShowModernAlert(true);
  };

  const getPageTitle = (pathname: string): string => {
    const pathMap: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/dashboard/accounts': 'Comptes',
      '/dashboard/transactions': 'Transactions',
      '/dashboard/transfers': 'Virements',
      '/dashboard/iban': 'RIB',
      '/dashboard/messages': 'Messages',
      '/dashboard/settings': 'Paramètres',
      '/dashboard/help': 'Aide',
      '/dashboard/history': 'Historique',
      '/dashboard/documents': 'Documents',
      '/dashboard/billing': 'Facturation',
      '/dashboard/budgets': 'Budgets',
      '/dashboard/cards': 'Cartes',
      '/dashboard/kyc': 'Vérification d\'identité',
    };

    return pathMap[pathname] || 'Dashboard';
  };

  const navigationItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Comptes', href: '/dashboard/accounts', icon: Building },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Clock },
    { name: 'Virements', href: '/dashboard/transfers', icon: Send },
    { name: 'RIB', href: '/dashboard/iban', icon: CreditCard },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Budgets', href: '/dashboard/budgets', icon: PieChart },
    { name: 'Cartes', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Aide', href: '/dashboard/help', icon: HelpCircle },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-sm">A</span>
              </div>
              <span className="text-white font-semibold text-lg">AmCbunq</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{getUserName()}</p>
                <div className="flex items-center space-x-1">
                  {userStatus === 'verified' ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs">Vérifié</span>
                    </>
                  ) : userStatus === 'pending' ? (
                    <>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-xs">En cours</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-400 text-xs">Non vérifié</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700/50 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Messages */}
              {userStatus === 'verified' ? (
                <Link
                  to="/dashboard/messages"
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </Link>
              ) : (
                <button
                  onClick={() => showModernAlertMessage(
                    'Messages indisponibles',
                    'Pour accéder au chat, vous devez d\'abord valider votre identité.',
                    'warning'
                  )}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
              )}

              {/* Notifications */}
              <NotificationBadge 
                unreadCount={unreadCount}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2"
              />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
                    <p className="text-xs text-gray-500">Client Premium</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile Menu Component */}
                <ProfileMenu
                  isOpen={showProfileMenu}
                  onClose={() => setShowProfileMenu(false)}
                  userName={getUserName()}
                  userEmail={getUserEmail()}
                  userStatus={userStatus}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Verification Banner */}
          <VerificationBanner userStatus={userStatus} />
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Modern Alert */}
      <ModernAlert
        isOpen={showModernAlert}
        onClose={() => setShowModernAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showIcon={true}
      />

      {/* Notification Toast Manager */}
      <NotificationToastManager />
    </div>
  );
};

export default DashboardLayoutNew; 