import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Settings, User, Shield, Bell, Globe, CreditCard, Save } from "lucide-react";
import { FirebaseDataService } from "../../services/firebaseData";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeSelector from "../../components/ThemeSelector";
import LanguageSelector from "../../components/LanguageSelector";
import { logger } from "../../utils/logger";
import { toast } from "react-hot-toast";

  // Interface pour typer les données utilisateur
  interface UserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: any;
    birthPlace?: string;
    nationality?: string;
    residenceCountry?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    profession?: string;
    salary?: number;
    [key: string]: any; // Pour permettre d'autres propriétés
  }

  // Type pour les données utilisateur avec any pour éviter les erreurs TypeScript
  type UserDataAny = any;

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserDataAny>(null);
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
  const [manualBirthDate, setManualBirthDate] = useState('');
  const [manualBirthPlace, setManualBirthPlace] = useState('');
  const [isUpdatingBirthInfo, setIsUpdatingBirthInfo] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    birthPlace: '',
    nationality: '',
    residenceCountry: '',
    address: '',
    city: '',
    postalCode: '',
    profession: '',
    salary: ''
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
          
          // Vérifier spécifiquement les champs de naissance
          logger.debug('🔍 Vérification des champs de naissance:');
          logger.debug('dob:', completeUserData.dob);
          logger.debug('pob:', completeUserData.pob);
          logger.debug('birthDate:', completeUserData.birthDate);
          logger.debug('birthPlace:', completeUserData.birthPlace);
          
          // Vérifier si les champs de naissance sont manquants et les ajouter si nécessaire
          if (!(completeUserData as UserData)?.birthDate || !(completeUserData as UserData)?.birthPlace) {
            logger.warn('Champs de naissance manquants, tentative de récupération...');
            await updateUserWithBirthInfo(userId, completeUserData);
          }
          
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



  // Fonction pour sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    try {
      logger.debug('🔄 Début de la sauvegarde du profil...');
      setIsSaving(true);
      const userId = FirebaseDataService.getCurrentUserId();
      
      if (!userId) {
        logger.error('Aucun utilisateur connecté');
        return;
      }

      logger.debug('🔄 Sauvegarde des modifications du profil...');
      logger.debug('🔄 État isSaving:', isSaving);
      logger.debug('🔄 État loading:', loading);
      
      const updates: any = {};
      
      // Ajouter les champs modifiés
      if (formData.firstName && formData.firstName !== getUserFirstName()) {
        updates.firstName = formData.firstName;
      }
      if (formData.lastName && formData.lastName !== getUserLastName()) {
        updates.lastName = formData.lastName;
      }
      if (formData.phone && formData.phone !== getUserPhone()) {
        updates.phone = formData.phone;
      }
      if (formData.birthDate && formData.birthDate !== getUserDateOfBirth()) {
        updates.birthDate = new Date(formData.birthDate);
      }
      if (formData.birthPlace && formData.birthPlace !== getUserPlaceOfBirth()) {
        updates.birthPlace = formData.birthPlace;
      }
      if (formData.nationality && formData.nationality !== getUserNationality()) {
        updates.nationality = formData.nationality;
      }
      if (formData.residenceCountry && formData.residenceCountry !== getUserResidenceCountry()) {
        updates.residenceCountry = formData.residenceCountry;
      }
      if (formData.address && formData.address !== getUserAddress()) {
        updates.address = formData.address;
      }
      if (formData.city && formData.city !== getUserCity()) {
        updates.city = formData.city;
      }
      if (formData.postalCode && formData.postalCode !== getUserPostalCode()) {
        updates.postalCode = formData.postalCode;
      }
      if (formData.profession && formData.profession !== getUserProfession()) {
        updates.profession = formData.profession;
      }
      if (formData.salary && formData.salary !== getUserSalary()) {
        updates.salary = parseInt(formData.salary);
      }

      if (Object.keys(updates).length > 0) {
        // Mettre à jour dans Firestore
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../config/firebase');
        
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, updates);
        
        logger.success('✅ Modifications du profil sauvegardées:', updates);
        
        // Mettre à jour les données locales
        if (userData) {
          Object.assign(userData, updates);
          setUserData({ ...userData });
        }
        
        // Afficher un message de succès
        toast.success(t("settings.profileUpdatedSuccess"));
      } else {
        logger.info('Aucune modification à sauvegarder');
      }
      
    } catch (error) {
      logger.error('❌ Erreur lors de la sauvegarde du profil:', error);
      toast.error(t("settings.profileUpdateError"));
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour mettre à jour l'utilisateur avec les informations de naissance manquantes
  const updateUserWithBirthInfo = async (userId: string, userData: UserDataAny): Promise<void> => {
    try {
      setIsUpdatingBirthInfo(true);
      logger.debug('🔄 Tentative de mise à jour des informations de naissance pour userId:', userId);
      
      let birthInfo = null;
      
      // Priorité 1: Utiliser les valeurs saisies manuellement
      if (manualBirthDate || manualBirthPlace) {
        birthInfo = {
          birthDate: manualBirthDate,
          birthPlace: manualBirthPlace
        };
        logger.success('Utilisation des valeurs saisies manuellement:', birthInfo);
      }
      
      // Priorité 2: Essayer de récupérer depuis localStorage
      if (!birthInfo) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const localUser = JSON.parse(userStr);
            logger.debug('Données localStorage disponibles:', localUser);
            
            // Chercher les informations de naissance dans localStorage
            if (localUser.birthDate || localUser.birthPlace) {
              birthInfo = {
                birthDate: localUser.birthDate,
                birthPlace: localUser.birthPlace
              };
              logger.success('Informations de naissance trouvées dans localStorage:', birthInfo);
            }
          } catch (error) {
            logger.error('Erreur parsing localStorage:', error);
          }
        }
      }
      
      // Priorité 3: Essayer de récupérer depuis d'autres sources
      if (!birthInfo) {
        // Essayer de récupérer depuis les données utilisateur existantes
        const possibleBirthDateFields = ['birthDate', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
        const possibleBirthPlaceFields = ['birthPlace', 'placeOfBirth', 'birthplace', 'lieu_de_naissance'];
        
        for (const field of possibleBirthDateFields) {
          if (userData[field]) {
            birthInfo = birthInfo || {};
            (birthInfo as any).birthDate = userData[field];
            logger.success(`Date de naissance trouvée dans le champ '${field}':`, userData[field]);
            break;
          }
        }
        
        for (const field of possibleBirthPlaceFields) {
          if (userData[field]) {
            birthInfo = birthInfo || {};
            (birthInfo as any).birthPlace = userData[field];
            logger.success(`Lieu de naissance trouvé dans le champ '${field}':`, userData[field]);
            break;
          }
        }
      }
      
      // Si on a trouvé des informations, mettre à jour la base de données
      if (birthInfo) {
        const updates: any = {};
        
        if (birthInfo.birthDate && !(userData && userData.hasOwnProperty('birthDate') && userData.birthDate)) {
          // Convertir la date en format Date si c'est une string
          if (typeof birthInfo.birthDate === 'string') {
            updates.birthDate = new Date(birthInfo.birthDate);
          } else {
            updates.birthDate = birthInfo.birthDate;
          }
          logger.debug('Mise à jour birthDate avec:', updates.birthDate);
        }
        
        if (birthInfo.birthPlace && !(userData && userData.hasOwnProperty('birthPlace') && userData.birthPlace)) {
          updates.birthPlace = birthInfo.birthPlace;
          logger.debug('Mise à jour birthPlace avec:', updates.birthPlace);
        }
        
        if (Object.keys(updates).length > 0) {
          // Mettre à jour dans Firestore
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../../config/firebase');
          
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, updates);
          
          logger.success('✅ Informations de naissance mises à jour dans Firestore:', updates);
          
          // Mettre à jour le cache et les données locales
          Object.assign(userData, updates);
          setUserData({ ...userData });
          
          // Réinitialiser les champs manuels
          setManualBirthDate('');
          setManualBirthPlace('');
        }
      } else {
        logger.warn('Aucune information de naissance trouvée pour la mise à jour');
      }
      
    } catch (error) {
      logger.error('❌ Erreur lors de la mise à jour des informations de naissance:', error);
    } finally {
      setIsUpdatingBirthInfo(false);
    }
  };

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
    logger.debug('🔍 getUserDateOfBirth - userData:', userData);
    
    if (userData) {
      // Essayer différents noms de champs possibles (birthDate est le nom correct utilisé dans la DB)
      // Ordre de priorité : birthDate en premier car c'est le champ principal utilisé
      const possibleFields = ['birthDate', 'dob', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
      
      for (const field of possibleFields) {
        if (userData[field]) {
          logger.success(`📅 Date de naissance trouvée dans le champ '${field}':`, userData[field]);
          logger.debug(`🔍 Type de la valeur pour ${field}:`, typeof userData[field]);
          logger.debug(`🔍 Valeur complète pour ${field}:`, userData[field]);
          logger.debug(`🔍 JSON.stringify pour ${field}:`, JSON.stringify(userData[field]));
          
          // Log spécial pour le champ dob
          if (field === 'dob') {
            logger.debug(`🎯 CHAMP DOB DÉTECTÉ - Valeur:`, userData[field]);
            logger.debug(`🎯 CHAMP DOB - Type:`, typeof userData[field]);
            logger.debug(`🎯 CHAMP DOB - JSON:`, JSON.stringify(userData[field]));
          }
          
          let finalDate = null;
          
          // Si c'est un timestamp Firebase
          if (userData[field]._seconds) {
            const date = new Date(userData[field]._seconds * 1000);
            logger.debug('⏰ Timestamp converti en date:', date);
            logger.debug('⏰ Date.toISOString():', date.toISOString());
            finalDate = date.toISOString().split('T')[0];
          }
          // Si c'est déjà une date
          else if (userData[field] instanceof Date) {
            logger.debug('📅 Objet Date détecté:', userData[field]);
            logger.debug('📅 Date.toISOString():', userData[field].toISOString());
            finalDate = userData[field].toISOString().split('T')[0];
          }
          // Si c'est un objet Date Firestore avec toDate()
          else if (userData[field].toDate && typeof userData[field].toDate === 'function') {
            const date = userData[field].toDate();
            logger.debug('🔥 Date Firestore convertie:', date);
            logger.debug('🔥 Date.toISOString():', date.toISOString());
            finalDate = date.toISOString().split('T')[0];
          }
          // Si c'est une string
          else if (typeof userData[field] === 'string') {
            logger.debug('📝 String détectée:', userData[field]);
            // Essayer de parser la string en date si elle est dans un format valide
            const parsedDate = new Date(userData[field]);
            if (!isNaN(parsedDate.getTime())) {
              logger.debug('✅ String parsée en date valide:', parsedDate);
              logger.debug('✅ Date.toISOString():', parsedDate.toISOString());
              finalDate = parsedDate.toISOString().split('T')[0];
            } else {
              logger.debug('❌ String non parsable en date, utilisation directe');
              finalDate = userData[field];
            }
          }
          // Si c'est un objet avec des propriétés de date
          else if (typeof userData[field] === 'object' && userData[field] !== null) {
            logger.debug('📦 Objet détecté, propriétés:', Object.keys(userData[field]));
            // Essayer de créer une date à partir des propriétés
            if (userData[field].year && userData[field].month && userData[field].day) {
              const date = new Date(userData[field].year, userData[field].month - 1, userData[field].day);
              logger.debug('📅 Date créée à partir des propriétés:', date);
              logger.debug('📅 Date.toISOString():', date.toISOString());
              finalDate = date.toISOString().split('T')[0];
            }
          }
          
          if (finalDate) {
            logger.success(`✅ Date finale retournée pour ${field}:`, finalDate);
            return finalDate;
          }
        }
      }
      
      logger.warn('⚠️ Aucun champ de date de naissance trouvé dans userData');
      logger.debug('🔍 Champs disponibles dans userData:', Object.keys(userData));
      logger.debug('🔍 Valeurs des champs dans userData:', userData);
    }
    
    // Fallback vers localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        logger.debug('💾 getUserDateOfBirth - Fallback localStorage user:', user);
        
        const possibleFields = ['dob', 'birthDate', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
        for (const field of possibleFields) {
          if (user[field]) {
            logger.success(`💾 Date de naissance trouvée dans localStorage champ '${field}':`, user[field]);
            return user[field];
          }
        }
      } catch (error) {
        logger.error('❌ Erreur parsing user localStorage dans getUserDateOfBirth:', error);
      }
    }
    
    logger.debug('❌ Aucune date de naissance trouvée, retour d\'une chaîne vide');
    return '';
  };

  // Fonction pour récupérer le lieu de naissance de l'utilisateur connecté
  const getUserPlaceOfBirth = (): string => {
    logger.debug('getUserPlaceOfBirth - userData:', userData);
    
    if (userData) {
      // Essayer différents noms de champs possibles (birthPlace est le nom correct utilisé dans la DB)
      const possibleFields = ['birthPlace', 'pob', 'placeOfBirth', 'birthplace', 'lieu_de_naissance'];
      
      for (const field of possibleFields) {
        if (userData[field]) {
          logger.success(`Lieu de naissance trouvé dans le champ '${field}':`, userData[field]);
          return userData[field];
        }
      }
      
      logger.warn('Aucun champ de lieu de naissance trouvé dans userData');
      logger.debug('Champs disponibles dans userData:', Object.keys(userData));
      logger.debug('Valeurs des champs dans userData:', userData);
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
                        value={formData.firstName || getUserFirstName()}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                         value={getUserEmail()}
                         readOnly
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
                         value={formData.birthDate || getUserDateOfBirth() || manualBirthDate || ''}
                         onChange={(e) => {
                           setManualBirthDate(e.target.value);
                           setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                         }}
                         placeholder="Sélectionnez votre date de naissance"
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                       {!getUserDateOfBirth() && !manualBirthDate && (
                         <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           Veuillez sélectionner votre date de naissance
                         </p>
                       )}

                     </div>

                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t("settings.placeOfBirth")}
                       </label>
                       <input
                         type="text"
                         value={formData.birthPlace || getUserPlaceOfBirth() || manualBirthPlace}
                         onChange={(e) => {
                           setManualBirthPlace(e.target.value);
                           setFormData(prev => ({ ...prev, birthPlace: e.target.value }));
                         }}
                         placeholder="Ex: Paris, France"
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                       />
                     </div>

                     {/* Bouton pour mettre à jour les informations de naissance manquantes */}
                     {(!getUserDateOfBirth() || !getUserPlaceOfBirth()) && (
                       <div className="md:col-span-2">
                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                           <div className="flex items-center">
                             <div className="flex-shrink-0">
                               <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <div className="ml-3">
                               <h3 className="text-sm font-medium text-yellow-800">
                                 Informations de naissance manquantes
                               </h3>
                               <div className="mt-2 text-sm text-yellow-700">
                                 <p>
                                   Vos informations de naissance ne sont pas complètes. 
                                   Veuillez les saisir ci-dessus et cliquer sur "Mettre à jour".
                                 </p>
                               </div>
                               <div className="mt-4">
                                 <button
                                   type="button"
                                   disabled={isUpdatingBirthInfo}
                                                                       onClick={async () => {
                                      const userId = FirebaseDataService.getCurrentUserId();
                                      if (userId && userData) {
                                        await updateUserWithBirthInfo(userId, userData);
                                      }
                                    }}
                                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                   {isUpdatingBirthInfo ? (
                                     <>
                                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                                       Mise à jour...
                                     </>
                                   ) : (
                                     'Mettre à jour les informations'
                                   )}
                                 </button>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

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
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? t("settings.saving") : t("settings.saveChanges")}</span>
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
                    <LanguageSelector 
                      showLabel={true}
                      variant="buttons"
                      onLanguageChange={() => {
                        // Optionnel : ajouter une logique supplémentaire après le changement de langue
                        console.log('Langue changée dans les paramètres');
                      }}
                    />
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
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? t("settings.saving") : t("settings.saveChanges")}</span>
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