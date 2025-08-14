import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { KycVisibilityService } from '../services/kycVisibilityService';
import { logger } from '../utils/logger';

interface ConditionalVisibilityProps {
  children: React.ReactNode;
  requireKyc?: boolean;
  requireEmailVerified?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

const ConditionalVisibility: React.FC<ConditionalVisibilityProps> = ({
  children,
  requireKyc = false,
  requireEmailVerified = false,
  fallback = null,
  className = ''
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkVisibility = async () => {
      if (!user?.uid) {
        setIsVisible(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const status = await KycVisibilityService.getVerificationStatus(user.uid);
        
        let shouldBeVisible = true;
        
        if (requireKyc) {
          shouldBeVisible = shouldBeVisible && status.kycStatus === 'verified';
        }
        
        if (requireEmailVerified) {
          shouldBeVisible = shouldBeVisible && status.emailVerified;
        }
        
        setIsVisible(shouldBeVisible);
      } catch (error) {
        logger.error('Erreur lors de la vérification de la visibilité:', error);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    checkVisibility();
  }, [user?.uid, requireKyc, requireEmailVerified]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!isVisible) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default ConditionalVisibility;
