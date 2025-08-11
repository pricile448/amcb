import React from 'react';
import Logo from './Logo';

interface HeroLogoProps {
  className?: string;
  animated?: boolean;
  showTagline?: boolean;
  floating?: boolean;
}

const HeroLogo: React.FC<HeroLogoProps> = ({ 
  className = '', 
  animated = true,
  showTagline = true,
  floating = true
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo principal avec animation */}
      <div className={`relative ${animated ? 'animate-pulse-glow' : ''} ${floating ? 'animate-float' : ''}`}>
        <Logo 
          variant="full" 
          size="hero" 
          showTagline={false}
          animated={animated}
          responsive={true}
          className="drop-shadow-2xl"
        />
        
        {/* Effet de brillance */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine rounded-lg" />
        )}
      </div>
      
      {/* Tagline avec animation d'apparition */}
      {showTagline && (
        <div className={`mt-8 text-center ${animated ? 'animate-fade-in' : ''}`}>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            The bank of the future, today
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-light">
            La banque du futur, aujourd'hui
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroLogo;
