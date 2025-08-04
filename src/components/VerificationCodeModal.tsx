import React, { useState, useEffect } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import { EmailVerificationService } from '../services/emailVerification';
import { FirebaseDataService } from '../services/firebaseData';

interface VerificationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerificationSuccess
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [canResend, setCanResend] = useState(false);

  // Timer pour l'expiration
  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

  // Permettre le renvoi après 60 secondes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setTimeLeft(900);
      setError('');
      setCanResend(false);
    }
  }, [isOpen]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Un seul caractère par champ
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const codeString = code.join('');
      
      // Récupérer l'userId de l'utilisateur connecté
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Utiliser le nouveau service de vérification
      const result = await EmailVerificationService.verifyCode(email, userId, codeString);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la vérification');
      }
      
      onVerificationSuccess();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Récupérer l'userId de l'utilisateur connecté
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Utiliser le nouveau service d'envoi
      const result = await EmailVerificationService.sendVerificationCode(email, userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi du code');
      }
      
      // En mode développement, afficher le code
      if (result.code) {
        console.log('🔍 CODE DE VÉRIFICATION (DEV):', result.code);
        alert(`Code de vérification (DEV): ${result.code}`);
      }
      
      setTimeLeft(900);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      
      // Réinitialiser le timer de renvoi
      setTimeout(() => setCanResend(true), 60000);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Vérification de votre email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Nous avons envoyé un code à 6 chiffres à
          </p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {email}
          </p>
        </div>

        {/* Champs de saisie du code */}
        <div className="flex justify-center space-x-2 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Code expiré dans {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>

        {/* Bouton de validation */}
        <button
          onClick={handleSubmit}
          disabled={code.join('').length !== 6 || isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Vérification...
            </div>
          ) : (
            'Valider le code'
          )}
        </button>

        {/* Renvoyer le code */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResendCode}
            disabled={!canResend || isLoading}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Renvoyer le code
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationCodeModal; 