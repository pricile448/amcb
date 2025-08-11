import React from 'react';

interface LogoProps {
  variant?: 'full' | 'simple' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showTagline?: boolean;
  responsive?: boolean;
  animated?: boolean;
  cardStyle?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className = '',
  showTagline = true,
  responsive = true,
  animated = true,
  cardStyle = false
}) => {
  // URL Cloudinary du logo
  const cloudinaryLogoUrl = "https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png";
  
  const sizeClasses = {
    sm: 'h-8 md:h-10',
    md: 'h-10 md:h-12',
    lg: 'h-14 md:h-18',
    xl: 'h-18 md:h-22',
    hero: 'h-24 md:h-36'
  };

  const sizeClass = sizeClasses[size];
  const animationClass = animated ? 'logo-hover' : '';
  const responsiveClass = responsive ? 'logo-responsive' : '';

  // Styles de carte adaptatifs
  const cardStyles = cardStyle ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-3 shadow-lg' : '';
  const cardPadding = cardStyle ? 'p-2' : '';

  if (variant === 'simple') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`${cardStyles} ${cardPadding}`}>
          <img 
            src={cloudinaryLogoUrl}
            alt="AmCbunq" 
            className={`${sizeClass} w-auto transition-all duration-300 ${animationClass} ${responsiveClass}`}
            onError={(e) => {
              console.error('Erreur de chargement du logo Cloudinary:', e);
              const target = e.target as HTMLImageElement;
              target.src = '/logo-simple.svg';
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`${cardStyles} ${cardPadding}`}>
          <img 
            src={cloudinaryLogoUrl}
            alt="AmCbunq" 
            className={`${sizeClass} w-auto transition-all duration-300 ${animationClass} ${responsiveClass}`}
            onError={(e) => {
              console.error('Erreur de chargement du logo Cloudinary:', e);
              const target = e.target as HTMLImageElement;
              target.src = '/favicon.svg';
            }}
          />
        </div>
      </div>
    );
  }

  // Variant 'full' par défaut
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${cardStyles} ${cardPadding}`}>
        <img 
          src={cloudinaryLogoUrl}
          alt="AmCbunq - The bank of the future, today" 
          className={`${sizeClass} w-auto transition-all duration-300 ${animationClass} ${responsiveClass} drop-shadow-lg`}
          onError={(e) => {
            console.error('Erreur de chargement du logo Cloudinary:', e);
            const target = e.target as HTMLImageElement;
            target.src = '/logo.svg';
          }}
        />
      </div>
      {showTagline && (
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2 font-light text-center max-w-xs animate-fade-in">
          The bank of the future, today
        </p>
      )}
    </div>
  );
};

export default Logo;
