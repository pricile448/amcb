import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { auth } from "../../config/firebase";
import { sendEmailVerification } from "firebase/auth";
import { logger } from "../../utils/logger";
import toast from "react-hot-toast";

const VerificationPendingPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  
  const email = location.state?.email || "votre email";
  const message = location.state?.message || "Vérifiez votre email pour activer votre compte";

  useEffect(() => {
    // Vérifier périodiquement si l'email a été vérifié
    const checkEmailVerification = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Recharger les données utilisateur pour obtenir le statut à jour
          await user.reload();
          
          // Vérifier aussi dans Firestore pour synchroniser les statuts
          const { doc, getDoc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../../config/firebase');
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const authVerified = user.emailVerified;
            const firestoreVerified = userData.emailVerified || false;
            
            logger.debug('🔍 Vérification synchronisation:', {
              authVerified,
              firestoreVerified
            });
            
            // Si Firebase Auth dit que l'email est vérifié, synchroniser Firestore
            if (authVerified && !firestoreVerified) {
              logger.warn('🔄 Synchronisation nécessaire dans VerificationPending');
              try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                  emailVerified: true,
                  isEmailVerified: true
                });
                logger.success('✅ Firestore synchronisé depuis VerificationPending');
              } catch (updateError) {
                logger.error('❌ Erreur synchronisation Firestore:', updateError);
              }
            }
            
            // Rediriger si vérifié (soit Auth soit Firestore)
            if (authVerified || firestoreVerified) {
              logger.success('✅ Email vérifié, redirection vers le dashboard');
              toast.success('Email vérifié avec succès !');
              navigate('/dashboard');
            }
          }
        } catch (error) {
          logger.error('Erreur lors de la vérification du statut:', error);
        }
      }
    };

    // Vérifier toutes les 3 secondes (plus réactif)
    const interval = setInterval(checkEmailVerification, 3000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleResendEmail = async () => {
    setIsChecking(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Utiliser Firebase Auth natif pour renvoyer l'email
        await sendEmailVerification(user, {
          url: `${window.location.origin}/auth/action`,
          handleCodeInApp: false
        });
        
        toast.success('Email de vérification renvoyé !');
      }
    } catch (error: any) {
      logger.error('Erreur lors du renvoi de l\'email:', error);
      toast.error('Erreur lors du renvoi de l\'email');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceRefresh = () => {
    logger.info('🔄 Actualisation forcée de la page');
    window.location.reload();
  };

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
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Vérifiez votre email
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email :</strong> {email}
              </p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Vérification automatique en cours...</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleResendEmail}
                  disabled={isChecking}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Renvoyer l'email
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleForceRefresh}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/connexion"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingPage;
