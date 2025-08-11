// Service de gestion des logos - UNIQUEMENT Cloudinary
import { logger } from '../utils/logger';
import { LOGO_CONFIG, CLOUDINARY_CONFIG, getCloudinaryUrl } from '../config/logos';

export interface LogoConfig {
  url: string;
  cloudName: string;
}

class LogoService {
  private config: LogoConfig;

  constructor() {
    this.config = {
      url: LOGO_CONFIG.main.url,
      cloudName: CLOUDINARY_CONFIG.cloudName
    };

    logger.debug('LogoService - Configuration:', this.config);
  }

  /**
   * Obtenir l'URL du logo principal
   */
  getMainLogoUrl(): string {
    return LOGO_CONFIG.main.url;
  }

  /**
   * Obtenir l'URL du logo simple
   */
  getSimpleLogoUrl(): string {
    return LOGO_CONFIG.simple.url;
  }

  /**
   * Obtenir l'URL de l'icône
   */
  getIconLogoUrl(): string {
    return LOGO_CONFIG.icon.url;
  }

  /**
   * Obtenir l'URL du logo pour les cartes
   */
  getCardLogoUrl(): string {
    return LOGO_CONFIG.card.url;
  }

  /**
   * Obtenir l'URL du logo avec des transformations Cloudinary
   */
  getOptimizedLogoUrl(logoName: string = 'logo_xjrpnj.png', options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    return getCloudinaryUrl(logoName, options);
  }

  /**
   * Vérifier si l'URL du logo est valide
   */
  async validateLogoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.warn('LogoService.validateLogoUrl - Erreur validation:', error);
      return false;
    }
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): LogoConfig {
    return { ...this.config };
  }

  /**
   * Obtenir toutes les configurations de logos
   */
  getAllLogoConfigs() {
    return LOGO_CONFIG;
  }

  /**
   * Obtenir la configuration Cloudinary
   */
  getCloudinaryConfig() {
    return CLOUDINARY_CONFIG;
  }
}

export const logoService = new LogoService();
export default logoService;
