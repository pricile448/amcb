import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  isVisible,
  onClose,
  duration = 4000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out">
      <div className="bg-white rounded-xl shadow-2xl border border-green-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-600 transition-colors p-1 hover:bg-green-50 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-3 w-full bg-green-100 rounded-full h-1 overflow-hidden">
          <div 
            className="h-1 bg-green-500 rounded-full transition-all duration-300 ease-linear"
            style={{ 
              width: isAnimating ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
