import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AuthLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

const AuthLink: React.FC<AuthLinkProps> = ({ to, children, className, onClick, ...props }) => {
  const location = useLocation();
  
  // Déterminer si nous sommes dans une page d'authentification Firebase
  const isFirebaseAuthPage = location.pathname === '/verification-pending' || 
                            location.pathname === '/auth/action';
  
  // Si nous sommes dans une page Firebase, utiliser des liens directs
  // Sinon, essayer de détecter la langue depuis l'URL
  const getAuthPath = (path: string) => {
    if (isFirebaseAuthPage) {
      // Pages Firebase : utiliser des liens directs
      return path;
    }
    
    // Autres pages : essayer de détecter la langue
    const pathSegments = location.pathname.split('/');
    if (pathSegments.length > 1 && pathSegments[1].match(/^(fr|en|es|pt|it|de|nl)$/)) {
      const lang = pathSegments[1];
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `/${lang}${cleanPath}`;
    }
    
    // Pas de langue détectée : utiliser le lien direct
    return path;
  };

  return (
    <Link
      to={getAuthPath(to)}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default AuthLink;
