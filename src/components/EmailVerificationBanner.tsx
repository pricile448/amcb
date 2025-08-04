import React, { useState, useEffect } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { EmailVerificationService } from '../services/emailVerification';
import { FirebaseDataService } from '../services/firebaseData';
import toast from 'react-hot-toast';

interface EmailVerificationBannerProps {
  userEmail: string;
  onVerificationComplete?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  userEmail,
  onVerificationComplete
}) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    checkEmailVerificationStatus();
  }, []);

  const checkEmailVerificationStatus = async () => {
    try {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) return;

      const userData = await FirebaseDataService.getUserData(userId);
      if (userData && userData.emailVerified) {
        setIsEmailVerified(true);
        setShowBanner(false);
        onVerificationComplete?.();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut email:', error);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const result = await EmailVerificationService.sendVerificationCode(userEmail, userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi du code');
      }

      // En mode développement, afficher le code
      if (result.code) {
        console.log('🔍 CODE DE VÉRIFICATION (DEV):', result.code);
        alert(`Code de vérification (DEV): ${result.code}`);
      }

      toast.success('Code de vérification envoyé ! Vérifiez votre email.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBanner || isEmailVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Vérification email requise
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Veuillez vérifier votre adresse email <strong>{userEmail}</strong> pour activer votre compte.
                </p>
                <p className="mt-1">
                  Si vous n'avez pas reçu l'email, vérifiez vos spams ou cliquez sur "Renvoyer".
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Renvoyer'
                )}
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="text-yellow-400 hover:text-yellow-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner; 