import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { auth } from "../../config/firebase";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { logger } from "../../utils/logger";
import toast from "react-hot-toast";

const FirebaseActionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');

  // 🔧 AMÉLIORATION: Détection intelligente de la langue
  const detectLanguage = () => {
    // 1. Priorité: Paramètre de route
    if (lang) return lang;
    
    // 2. Priorité: Langue actuelle de i18n
    if (i18n.language) return i18n.language;
    
    // 3. Priorité: Langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(browserLang)) {
      return browserLang;
    }
    
    // 4. Défaut: Français
    return 'fr';
  };

  const currentLang = detectLanguage();

  // 🔧 AMÉLIORATION: Synchroniser la langue avec i18n
  useEffect(() => {
    if (currentLang && currentLang !== i18n.language) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang, i18n]);

  const getDashboardLink = (path: string) => {
    return `/${currentLang}/dashboard/${path}`;
  };

  useEffect(() => {
    const handleFirebaseAction = async () => {
      if (!oobCode) {
        setError('Code de vérification manquant');
        setIsProcessing(false);
        return;
      }

      try {
        logger.debug('🔄 Traitement de l\'action Firebase:', { mode, oobCode });

        // Vérifier le type d'action
        if (mode === 'verifyEmail') {
          try {
            // Appliquer le code de vérification email
            await applyActionCode(auth, oobCode);
            
                             logger.success('✅ Email vérifié avec succès');
                 setIsSuccess(true);
                 
                 // Déconnecter l'utilisateur pour forcer une nouvelle connexion
                 await auth.signOut();
                 
                 // Afficher le message de succès mais PAS de redirection automatique
                 toast.success('Email vérifié avec succès ! Vous pouvez maintenant vous connecter avec vos identifiants.');
          } catch (verifyError: any) {
            // Si l'erreur est auth/invalid-action-code, l'email est déjà vérifié
            if (verifyError.code === 'auth/invalid-action-code') {
                                 logger.info('✅ Email déjà vérifié');
                   setIsSuccess(true);
                   
                   // Déconnecter l'utilisateur si connecté
                   await auth.signOut();
                   
                   // Afficher le message mais PAS de redirection automatique
                   toast.success('Votre email est déjà vérifié ! Vous pouvez vous connecter avec vos identifiants.');
              return; // Sortir de la fonction
            } else {
              // Relancer l'erreur pour la gestion générale
              throw verifyError;
            }
          }
         
       } else if (mode === 'resetPassword') {
         // Pour la réinitialisation de mot de passe
         await checkActionCode(auth, oobCode);
         
         logger.success('✅ Code de réinitialisation valide');
         setIsSuccess(true);
         toast.success('Code de réinitialisation valide !');
         
         // Rediriger vers la page de nouveau mot de passe
         setTimeout(() => {
           navigate('/nouveau-mot-de-passe', { 
             state: { oobCode, continueUrl } 
           });
         }, 3000);
         
       } else {
         throw new Error(`Mode d'action non supporté: ${mode}`);
       }

      } catch (error: any) {
        logger.error('❌ Erreur lors du traitement de l\'action:', error);
        
        let errorMessage = 'Erreur lors du traitement de l\'action';
        let shouldRedirectToLogin = false;
        
        if (error.code === 'auth/invalid-action-code') {
          // Cette erreur est déjà gérée dans le bloc try/catch spécifique
          // Ne devrait plus arriver ici
          logger.warn('🔍 auth/invalid-action-code dans le catch général (non attendu)');
          errorMessage = 'Erreur de vérification email. Veuillez vous connecter directement.';
          shouldRedirectToLogin = true;
          
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'Ce compte a été désactivé';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.code === 'auth/expired-action-code') {
          errorMessage = 'Ce lien de vérification a expiré. Veuillez demander un nouveau lien.';
          shouldRedirectToLogin = true;
        } else if (error.code === 'auth/invalid-continue-uri') {
          errorMessage = 'URL de redirection invalide. Veuillez contacter le support.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Rediriger vers la connexion si nécessaire
        if (shouldRedirectToLogin) {
          setTimeout(() => {
            navigate('/connexion', { 
              state: { 
                message: 'Votre email semble déjà vérifié ou le lien a expiré. Veuillez vous connecter avec vos identifiants.',
                emailVerified: true 
              } 
            });
          }, 3000);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleFirebaseAction();
  }, [mode, oobCode, continueUrl, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">AmCbunq</span>
            </Link>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {t('auth.processing.title')}
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.processing.message')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">AmCbunq</span>
            </Link>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {mode === 'verifyEmail' ? t('auth.emailVerified') : t('auth.actionSuccess')}
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                {mode === 'verifyEmail' 
                  ? t('auth.emailVerifiedMessage')
                  : t('auth.actionSuccessMessage')
                }
              </p>
              
              {mode === 'verifyEmail' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm text-green-800 font-medium">
                        {t('auth.verificationComplete')}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/connexion"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {t('auth.loginWithCredentials')}
                  </Link>
                </div>
              )}
              
              {mode !== 'verifyEmail' && (
                <div className="mt-6">
                  <Link
                    to={getDashboardLink('')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('nav.dashboard')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AmCbunq</span>
          </Link>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('common.error')}
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            
            <div className="mt-6 space-y-3">
              <Link
                to="/connexion"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('nav.login')}
              </Link>
              
              <div>
                <Link
                  to="/ouvrir-compte"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {t('nav.openAccount')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseActionPage;
