import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Settings, User, Shield, Bell, Globe, CreditCard, Save } from "lucide-react";
import { FirebaseDataService } from "../../services/firebaseData";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeSelector from "../../components/ThemeSelector";
import { logger } from "../../utils/logger";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    securityAlerts: true,
    marketingEmails: false,
    transactionAlerts: true,
    balanceAlerts: true,
    maintenanceAlerts: true
  });
  const { theme, setTheme } = useTheme();

  // Charger les données utilisateur complètes au montage du composant
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          return;
        }

        logger.debug('Chargement des données utilisateur complètes pour userId:', userId);
        const completeUserData = await FirebaseDataService.getUserData(userId);
        
        if (completeUserData) {
          logger.success('Données utilisateur complètes chargées:', completeUserData);
          logger.debug('Tous les champs disponibles dans completeUserData:', Object.keys(completeUserData));
          logger.debug('Valeurs des champs dans completeUserData:', completeUserData);
          setUserData(completeUserData);
        } else {
          logger.warn('Aucune donnée utilisateur complète trouvée, utilisation des données localStorage');
          // Fallback vers les données localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const localUserData = JSON.parse(userStr);
              logger.debug('Données localStorage utilisées comme fallback:', localUserData);
              logger.debug('Tous les champs disponibles dans localStorage:', Object.keys(localUserData));
              setUserData(localUserData);
            } catch (error) {
              logger.error('Erreur parsing user localStorage:', error);
            }
          }
        }
      } catch (error) {
        logger.error('Erreur lors du chargement des données utilisateur:', error);
        logger.debug('Utilisation des données localStorage comme fallback...');
        
        // Fallback vers les données localStorage en cas d'erreur
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const localUserData = JSON.parse(userStr);
            logger.success('Données localStorage utilisées comme fallback:', localUserData);
            logger.debug('Tous les champs disponibles dans localStorage:', Object.keys(localUserData));
            setUserData(localUserData);
          } catch (error) {
            logger.error('Erreur parsing user localStorage:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);



  // Fonction pour récupérer le nom de l'utilisateur connecté
  const getUserName = (): string => {
    if (userData) {
      return `${userData.firstName || 'Client'} ${userData.lastName || 'AmCbunq'}`;
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return `${user.firstName || 'Client'} ${user.lastName || 'AmCbunq'}`;
      } catch (error) {
        logger.error('Erreur parsing user dans getUserName:', error);
      }
    }
    return 'Client AmCbunq';
  };

  // Fonction pour récupérer l'email de l'utilisateur connecté
  const getUserEmail = (): string => {
    if (userData) {
      return userData.email || 'client@amcbunq.com';
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email || 'client@amcbunq.com';
      } catch (error) {
        logger.error('Erreur parsing user dans getUserEmail:', error);
      }
    }
    return 'client@amcbunq.com';
  };

  // Fonction pour récupérer le prénom de l'utilisateur connecté
  const getUserFirstName = (): string => {
    if (userData) {
      return userData.firstName || 'Client';
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.firstName || 'Client';
      } catch (error) {
        logger.error('Erreur parsing user dans getUserFirstName:', error);
      }
    }
    return 'Client';
  };

  // Fonction pour récupérer le nom de famille de l'utilisateur connecté
  const getUserLastName = (): string => {
    if (userData) {
      return userData.lastName || 'AmCbunq';
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.lastName || 'AmCbunq';
      } catch (error) {
        logger.error('Erreur parsing user dans getUserLastName:', error);
      }
    }
    return 'AmCbunq';
  };

  // Fonction pour récupérer le téléphone de l'utilisateur connecté
  const getUserPhone = (): string => {
    if (userData) {
      return userData.phone || '+33 6 12 34 56 78';
    }
    return '+33 6 12 34 56 78';
  };

  // Fonction pour récupérer la date de naissance de l'utilisateur connecté
  const getUserDateOfBirth = (): string => {
    logger.debug('getUserDateOfBirth - userData:', userData);
    
    if (userData) {
      // Essayer différents noms de champs possibles (dob est le nom correct utilisé dans la DB)
      const possibleFields = ['dob', 'birthDate', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
      
      for (const field of possibleFields) {
        if (userData[field]) {
          logger.success(`Date de naissance trouvée dans le champ '${field}':`, userData[field]);
          
          // Si c'est un timestamp Firebase
          if (userData[field]._seconds) {
            const date = new Date(userData[field]._seconds * 1000);
            logger.debug('Timestamp converti en date:', date);
            return date.toISOString().split('T')[0];
          }
          // Si c'est déjà une date
          if (userData[field] instanceof Date) {
            return userData[field].toISOString().split('T')[0];
          }
          // Si c'est une string
          if (typeof userData[field] === 'string') {
            return userData[field];
          }
        }
      }
      
      logger.warn('Aucun champ de date de naissance trouvé dans userData');
      logger.debug('Champs disponibles dans userData:', Object.keys(userData));
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        logger.debug('getUserDateOfBirth - Fallback localStorage user:', user);
        
        const possibleFields = ['dob', 'birthDate', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
        for (const field of possibleFields) {
          if (user[field]) {
            logger.success(`Date de naissance trouvée dans localStorage champ '${field}':`, user[field]);
            return user[field];
          }
        }
      } catch (error) {
        logger.error('Erreur parsing user localStorage dans getUserDateOfBirth:', error);
      }
    }
    
    return '';
  };

  // Fonction pour récupérer le lieu de naissance de l'utilisateur connecté
  const getUserPlaceOfBirth = (): string => {
    logger.debug('getUserPlaceOfBirth - userData:', userData);
    
    if (userData) {
      // Essayer différents noms de champs possibles (pob est le nom correct utilisé dans la DB)
      const possibleFields = ['pob', 'birthPlace', 'placeOfBirth', 'birthplace', 'lieu_de_naissance'];
      
      for (const field of possibleFields) {
        if (userData[field]) {
          logger.success(`Lieu de naissance trouvé dans le champ '${field}':`, userData[field]);
          return userData[field];
        }
      }
      
      logger.warn('Aucun champ de lieu de naissance trouvé dans userData');
      logger.debug('Champs disponibles dans userData:', Object.keys(userData));
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        logger.debug('getUserPlaceOfBirth - Fallback localStorage user:', user);
        
        const possibleFields = ['pob', 'birthPlace', 'placeOfBirth', 'birthplace', 'lieu_de_naissance'];
        for (const field of possibleFields) {
          if (user[field]) {
            logger.success(`Lieu de naissance trouvé dans localStorage champ '${field}':`, user[field]);
            return user[field];
          }
        }
      } catch (error) {
        logger.error('Erreur parsing user localStorage dans getUserPlaceOfBirth:', error);
      }
    }
    
    return '';
  };

  // Fonction pour récupérer la nationalité de l'utilisateur connecté
  const getUserNationality = (): string => {
    if (userData) {
      return userData.nationality || '';
    }
    return '';
  };

  // Fonction pour récupérer le pays de résidence de l'utilisateur connecté
  const getUserResidenceCountry = (): string => {
    if (userData) {
      return userData.residenceCountry || '';
    }
    return '';
  };

  // Fonction pour récupérer l'adresse de l'utilisateur connecté
  const getUserAddress = (): string => {
    if (userData) {
      return userData.address || '';
    }
    return '';
  };

  // Fonction pour récupérer la ville de l'utilisateur connecté
  const getUserCity = (): string => {
    if (userData) {
      return userData.city || '';
    }
    return '';
  };

  // Fonction pour récupérer le code postal de l'utilisateur connecté
  const getUserPostalCode = (): string => {
    if (userData) {
      return userData.postalCode || '';
    }
    return '';
  };

  // Fonction pour récupérer la profession de l'utilisateur connecté
  const getUserProfession = (): string => {
    if (userData) {
      return userData.profession || '';
    }
    return '';
  };

  // Fonction pour récupérer le salaire de l'utilisateur connecté
  const getUserSalary = (): string => {
    if (userData && userData.salary) {
      return userData.salary.toString();
    }
    return '';
  };

  const tabs = [
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "security", label: t("settings.security"), icon: Shield },
    { id: "notifications", label: t("settings.notifications"), icon: Bell },
    { id: "preferences", label: t("settings.preferences"), icon: Settings },
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value,
    }));
  };




  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Settings Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedTab === tab.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 p-6">
            {selectedTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.profileSettings")}
                </h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Chargement des données utilisateur...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("settings.firstName")}
                      </label>
                      <input
                        type="text"
                        defaultValue={getUserFirstName()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.lastName")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserLastName()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.email")}
                       </label>
                       <input
                         type="email"
                         defaultValue={getUserEmail()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.phone")}
                       </label>
                       <input
                         type="tel"
                         defaultValue={getUserPhone()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.dateOfBirth")}
                       </label>
                       <input
                         type="date"
                         defaultValue={getUserDateOfBirth()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.placeOfBirth")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserPlaceOfBirth()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.nationality")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserNationality()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.residenceCountry")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserResidenceCountry()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.address")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserAddress()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.city")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserCity()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.postalCode")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserPostalCode()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.profession")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserProfession()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.salary")}
                       </label>
                       <input
                         type="text"
                         defaultValue={getUserSalary()}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4" />
                    <span>{t("settings.saveChanges")}</span>
                  </button>
                </div>
              </div>
            )}

            {selectedTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.securitySettings")}
                </h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {t("settings.changePassword")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("settings.changePasswordDescription")}
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        {t("settings.change")}
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {t("settings.twoFactorAuth")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("settings.twoFactorAuthDescription")}
                        </p>
                      </div>
                      <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        {t("settings.enable")}
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {t("settings.loginHistory")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("settings.loginHistoryDescription")}
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        {t("settings.view")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.notificationSettings")}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {t("settings.emailNotifications")}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("settings.emailNotificationsDescription")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => handleNotificationChange("emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {t("settings.smsNotifications")}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("settings.smsNotificationsDescription")}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.smsNotifications}
                        onChange={(e) => handleNotificationChange("smsNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                                     <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                     <div>
                       <h3 className="font-medium text-gray-900 dark:text-gray-100">
                         {t("settings.pushNotifications")}
                       </h3>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         {t("settings.pushNotificationsDescription")}
                       </p>
                     </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => handleNotificationChange("pushNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                                     <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                     <div>
                       <h3 className="font-medium text-gray-900 dark:text-gray-100">
                         {t("settings.marketingEmails")}
                       </h3>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         {t("settings.marketingEmailsDescription")}
                       </p>
                     </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => handleNotificationChange("marketingEmails", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("settings.preferences")}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("settings.language")}
                    </label>
                    <select 
                      value={i18n.language}
                      onChange={(e) => {
                        i18n.changeLanguage(e.target.value);
                        localStorage.setItem('i18nextLng', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="fr">{t("languages.fr") as string}</option>
                      <option value="en">{t("languages.en") as string}</option>
                      <option value="es">{t("languages.es") as string}</option>
                      <option value="pt">{t("languages.pt") as string}</option>
                      <option value="it">{t("languages.it") as string}</option>
                      <option value="nl">{t("languages.nl") as string}</option>
                      <option value="de">{t("languages.de") as string}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("settings.currency")}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("settings.timezone")}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>

                  <ThemeSelector label={t("settings.theme") || "Thème"} />
                </div>

                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{t("settings.saveChanges")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 