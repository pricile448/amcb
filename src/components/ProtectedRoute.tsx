import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useKycSync } from '../hooks/useNotifications';

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
      console.log('🔐 ProtectedRoute - État d\'authentification:', user ? 'Connecté' : 'Non connecté');
      if (user) {
        console.log('✅ Utilisateur connecté:', user.email);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Aucun utilisateur connecté');
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
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 