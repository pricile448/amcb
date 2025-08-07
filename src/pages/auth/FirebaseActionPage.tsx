import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { auth } from "../../config/firebase";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { logger } from "../../utils/logger";
import toast from "react-hot-toast";

const FirebaseActionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');

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
            toast.success('Email vérifié avec succès !');
            
            // Déconnecter l'utilisateur pour forcer une nouvelle connexion
            await auth.signOut();
            
            // Rediriger vers la page de connexion avec un message
            setTimeout(() => {
              navigate('/connexion', { 
                state: { 
                  message: 'Email vérifié avec succès ! Veuillez vous connecter avec vos identifiants pour accéder à votre compte.',
                  emailVerified: true 
                } 
              });
            }, 2000);
          } catch (verifyError: any) {
            // Si l'erreur est auth/invalid-action-code, l'email est déjà vérifié
            if (verifyError.code === 'auth/invalid-action-code') {
              logger.info('✅ Email déjà vérifié - redirection vers connexion');
              setIsSuccess(true);
              toast.success('Votre email est déjà vérifié ! Vous pouvez vous connecter directement.');
              
              // Rediriger vers la connexion immédiatement
              setTimeout(() => {
                navigate('/connexion', { 
                  state: { 
                    message: 'Votre email est déjà vérifié. Veuillez vous connecter avec vos identifiants.',
                    emailVerified: true 
                  } 
                });
              }, 2000);
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
                Traitement en cours...
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Veuillez patienter pendant que nous traitons votre demande.
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
                {mode === 'verifyEmail' ? 'Email vérifié !' : 'Action réussie !'}
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                {mode === 'verifyEmail' 
                  ? 'Votre email a été vérifié avec succès. Vous allez être redirigé vers votre tableau de bord.'
                  : 'Votre action a été traitée avec succès.'
                }
              </p>
              
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Aller au tableau de bord
                </Link>
              </div>
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
              Erreur
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            
            <div className="mt-6 space-y-3">
              <Link
                to="/connexion"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aller à la connexion
              </Link>
              
              <div>
                <Link
                  to="/ouvrir-compte"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Créer un nouveau compte
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
