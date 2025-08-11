import React from 'react';
import { Link, useParams } from 'react-router-dom';

interface LocalizedLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, children, className, onClick, ...props }) => {
  const { lang } = useParams<{ lang: string }>();

  // Construire le lien avec préfixe de langue
  const getLocalizedPath = (path: string) => {
    if (!lang) return path;
    // Éviter les doubles slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };

  return (
    <Link
      to={getLocalizedPath(to)}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LocalizedLink;
