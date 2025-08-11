import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useKycSync } from '../hooks/useNotifications';
import { logger } from '../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userStatus, hasInitialized } = useKycSync();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logger.debug('🔐 ProtectedRoute - État d\'authentification:', 'Connecté');
        logger.debug('✅ Utilisateur connecté:', user.email);
        setIsAuthenticated(true);
      } else {
        logger.debug('🔐 ProtectedRoute - État d\'authentification:', 'Non connecté');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Nettoyer l'écouteur lors du démontage
    return () => unsubscribe();
  }, []);

  // Afficher le loading tant que l'authentification ET le statut KYC ne sont pas chargés
  if (isLoading || !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de retour
    // Utiliser la langue actuelle depuis l'URL
    const currentLang = location.pathname.split('/')[1];
    const validLanguages = ['fr', 'en', 'es', 'it', 'de', 'nl', 'pt'];
    const lang = validLanguages.includes(currentLang) ? currentLang : 'fr';
    return <Navigate to={`/${lang}/connexion`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 