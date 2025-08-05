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
  Bell,
  User,
  MessageCircle,
  Building,
  Clock,
  PieChart,
  HelpCircle,
  FileText,
  ChevronDown,
  Check,
  AlertCircle,
  Info,
  Shield,
  CreditCard as CardIcon,
  Download,
  Eye,
  EyeOff,
  Receipt,
  Heart,
} from "lucide-react";
import { formatUserNameForDisplay } from "../utils/dateUtils";
import VerificationBanner from "../components/VerificationBanner";
import ModernAlert from "../components/ModernAlert";
import ProfileMenu from "../components/ProfileMenu";
import { useKycSync } from "../hooks/useNotifications";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "../components/NotificationDropdown";
import { FirebaseDataService } from "../services/firebaseData";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { logger } from "../utils/logger";


const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userStatus, syncKycStatus, hasInitialized } = useKycSync();
  const { unreadCount: hookUnreadCount, markAsRead, notifications } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showModernAlert, setShowModernAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success'
  });

  // Synchroniser le statut KYC au chargement UNE SEULE FOIS
  useEffect(() => {
    if (!hasInitialized) {
      syncKycStatus();
    }
  }, [hasInitialized, syncKycStatus]);

  const [userName, setUserName] = useState('Client AmCbunq');
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Charger les données utilisateur UNE SEULE FOIS
  useEffect(() => {
    const loadUserData = async () => {
      if (userDataLoaded) return;
      
      try {
        const userId = FirebaseDataService.getCurrentUserId();
        if (userId) {
          const userData = await FirebaseDataService.getUserData(userId);
          if (userData && userData.firstName && userData.lastName) {
            const fullName = formatUserNameForDisplay(userData.firstName, userData.lastName);
            setUserName(fullName);
          }
        }
        setUserDataLoaded(true);
      } catch (error) {
        console.error('❌ Erreur chargement données utilisateur:', error);
        setUserDataLoaded(true);
      }
    };
    
    loadUserData();
  }, [userDataLoaded]);

  // Fonction pour récupérer le nom de l'utilisateur pour la sidebar (troncature agressive)
  const getSidebarUserName = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const first = user.firstName || 'Client';
        const last = user.lastName || 'AmCbunq';
        
        // Pour la sidebar, utiliser une troncature très agressive
        if (first.length > 8 || last.length > 8) {
          return `${first.charAt(0)}. ${last.charAt(0)}.`;
        }
        
        return `${first} ${last}`;
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'Client A.';
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
        const firstName = user.firstName || 'C';
        const lastName = user.lastName || 'A';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'CA';
  };



  const navigation = [
    { name: "Mon espace client", href: "/dashboard", icon: Home },
    { name: t("nav.accounts"), href: "/dashboard/comptes", icon: CreditCard },
    { name: t("nav.iban"), href: "/dashboard/iban", icon: Building },
    { name: t("nav.transfers"), href: "/dashboard/virements", icon: Send },
    { name: t("nav.cards"), href: "/dashboard/cartes", icon: CreditCard },
    { name: t("nav.billing"), href: "/dashboard/facturation", icon: Receipt },
    { name: t("nav.history"), href: "/dashboard/historique", icon: Clock },
    { name: t("nav.budgets"), href: "/dashboard/budgets", icon: PieChart },
  ];

  const settingsNavigation = [
    { name: t("nav.settings"), href: "/dashboard/parametres", icon: Settings },
    { name: t("nav.help"), href: "/dashboard/aide", icon: HelpCircle },
    { name: t("nav.documents"), href: "/dashboard/documents", icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      logger.success('✅ Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour fermer la sidebar sur mobile lors du clic sur un lien
  const handleNavigationClick = () => {
    // Fermer la sidebar seulement sur mobile (écrans < lg)
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const showModernAlertMessage = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setAlertConfig({ title, message, type });
    setShowModernAlert(true);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const markAllNotificationsAsRead = async () => {
    // This will be handled by the useNotifications hook
  };



  const handleNotificationAction = (notification: any) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Fonction pour obtenir le titre de la page
  const getPageTitle = (pathname: string): string => {
    // Navigation principale
    const mainNavItem = navigation.find(item => item.href === pathname);
    if (mainNavItem) {
      return mainNavItem.name;
    }

    // Navigation des paramètres
    const settingsNavItem = settingsNavigation.find(item => item.href === pathname);
    if (settingsNavItem) {
      return settingsNavItem.name;
    }

    // Pages spéciales
    switch (pathname) {
      case '/dashboard/messages':
        return 'Messages';
      case '/dashboard/kyc':
        return 'Vérification d\'identité';
      case '/dashboard/verification':
        return 'Vérification d\'identité';
      default:
        return 'Mon espace client';
    }
  };



  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-blue-500/30">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm md:text-lg">A</span>
              </div>
              <span className="text-white font-bold text-lg md:text-xl">AmCbunq</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <X className="w-5 md:w-6 h-5 md:h-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1">
            {/* Mon Compte Section */}
            <div className="p-3 md:p-4">
              <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                Mon Compte
              </h3>
              <nav className="space-y-0.5">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleNavigationClick}
                      className={`flex items-center px-2 md:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-700/50 text-white shadow-sm"
                          : "text-blue-100 hover:bg-blue-700/30 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3" />
                      <span className="text-xs md:text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Paramètres & Plus Section */}
            <div className="p-3 md:p-4 border-t border-blue-500/30">
              <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                Paramètres & Plus
              </h3>
              <nav className="space-y-0.5">
                {settingsNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleNavigationClick}
                      className={`flex items-center px-2 md:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-700/50 text-white shadow-sm"
                          : "text-blue-100 hover:bg-blue-700/30 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3" />
                      <span className="text-xs md:text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 md:p-4 border-t border-blue-500/30">
            <div className="flex items-center space-x-2 md:space-x-3 mb-2">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs md:text-sm">{getUserInitials()}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-xs md:text-sm">{userName}</p>
                <div className="flex items-center space-x-1">
                  {userStatus === 'verified' ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs">Vérifié</span>
                    </>
                  ) : userStatus === 'pending' ? (
                    <>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-xs">{t('kyc.pending')}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-400 text-xs">{t('kyc.unverified')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout();
                handleNavigationClick();
              }}
              className="flex items-center w-full px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-blue-100 hover:bg-blue-700/30 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="w-4 md:w-5 h-4 md:h-5 mr-2 md:mr-3" />
              <span className="text-xs md:text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Menu className="w-5 md:w-6 h-5 md:h-6" />
              </button>
                             <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                 {getPageTitle(location.pathname)}
               </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Messages */}
              {userStatus === 'verified' ? (
                <Link
                  to="/dashboard/messages"
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 md:w-6 h-5 md:h-6" />
                  <div className="absolute -top-1 -right-1 w-2 md:w-3 h-2 md:h-3 bg-red-500 rounded-full"></div>
                </Link>
              ) : (
                <button
                  onClick={() => showModernAlertMessage(
                    userStatus === 'pending' ? 'Messages temporairement indisponibles' : 'Messages indisponibles',
                    userStatus === 'pending' 
                      ? 'La messagerie sera disponible une fois votre vérification d\'identité terminée. Votre dossier est en cours d\'examen.'
                      : 'Pour accéder au chat avec notre support, vous devez d\'abord valider votre identité.',
                    'warning'
                  )}
                  className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-all duration-200 group"
                  title={userStatus === 'pending' ? 'Messages temporairement indisponibles' : 'Messages indisponibles - Vérifiez votre identité'}
                >
                  <MessageCircle className="w-5 md:w-6 h-5 md:h-6 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 md:w-3 h-2 md:h-3 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-400 transition-colors"></div>
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}

              {/* Notifications */}
              <NotificationDropdown
                notifications={notifications}
                unreadCount={hookUnreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
              />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 md:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-6 md:w-8 h-6 md:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 md:w-4 h-3 md:h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Client Premium</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>

                {/* Profile Menu Component */}
                <ProfileMenu
                  isOpen={showProfileMenu}
                  onClose={() => setShowProfileMenu(false)}
                  userName={userName}
                  userEmail={getUserEmail()}
                  userStatus={userStatus}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 dark:bg-gray-900">
          {/* Verification Banner */}
          <VerificationBanner userStatus={userStatus} />
          <Outlet />
        </main>
      </div>

      {/* Modern Alert */}
      <ModernAlert
        isOpen={showModernAlert}
        onClose={() => setShowModernAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showIcon={true}
      />


    </div>
  );
};

export default DashboardLayout; 