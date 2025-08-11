// Configuration centralisée des logos - UNIQUEMENT Cloudinary
export const LOGO_CONFIG = {
  // Logo principal AmCbunq
  main: {
    url: import.meta.env.VITE_LOGO_URL || 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png',
    alt: 'AmCbunq - The bank of the future, today'
  },
  
  // Logo simple (sans tagline)
  simple: {
    url: import.meta.env.VITE_LOGO_SIMPLE_URL || 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png',
    alt: 'AmCbunq'
  },
  
  // Icône (favicon)
  icon: {
    url: import.meta.env.VITE_LOGO_ICON_URL || 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png',
    alt: 'AmCbunq Icon'
  },
  
  // Logo pour les cartes
  card: {
    url: import.meta.env.VITE_LOGO_CARD_URL || 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png',
    alt: 'AmCbunq Card'
  }
};

// Configuration Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxvbuhadg',
  version: import.meta.env.VITE_CLOUDINARY_VERSION || 'v1754875302',
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'logos'
};

// Générer une URL Cloudinary optimisée
export const getCloudinaryUrl = (
  logoName: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width, height, quality = 80, format = 'auto' } = options;
  
  let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  
  // Ajouter les transformations
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`;
  }
  
  url += `/${CLOUDINARY_CONFIG.version}/${logoName}`;
  return url;
};
