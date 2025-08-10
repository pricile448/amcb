// Configuration des domaines par langue pour la production (Render)
export const DOMAIN_LANGUAGE_CONFIG = {
  // Domaine principal existant - Français par défaut
  'mybunq.amccredit.com': 'fr',           // Français - domaine principal existant
  'www.mybunq.amccredit.com': 'fr',
  
  // Sous-domaines par langue sur votre domaine principal
  'en.mybunq.amccredit.com': 'en',        // Anglais
  'es.mybunq.amccredit.com': 'es',        // Espagnol  
  'pt.mybunq.amccredit.com': 'pt',        // Portugais
  'it.mybunq.amccredit.com': 'it',        // Italien
  'nl.mybunq.amccredit.com': 'nl',        // Néerlandais
  'de.mybunq.amccredit.com': 'de',        // Allemand
  
  // Domaines alternatifs avec tiret (plus faciles à retenir)
  'mybunq-en.amccredit.com': 'en',
  'mybunq-es.amccredit.com': 'es',
  'mybunq-pt.amccredit.com': 'pt',
  'mybunq-it.amccredit.com': 'it',
  'mybunq-nl.amccredit.com': 'nl',
  'mybunq-de.amccredit.com': 'de',
  
  // Domaines Render pour testing/staging
  'mybunq-frontend-fr.onrender.com': 'fr',
  'mybunq-frontend-en.onrender.com': 'en',
  'mybunq-frontend-es.onrender.com': 'es',
  'mybunq-frontend-pt.onrender.com': 'pt',
  'mybunq-frontend-it.onrender.com': 'it',
  'mybunq-frontend-nl.onrender.com': 'nl',
  'mybunq-frontend-de.onrender.com': 'de',
} as const;

// Langues supportées
export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'pt', 'it', 'nl', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Langue par défaut
export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

/**
 * Détecte la langue basée sur le domaine actuel
 */
export function detectLanguageFromDomain(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const hostname = window.location.hostname;
  const language = DOMAIN_LANGUAGE_CONFIG[hostname as keyof typeof DOMAIN_LANGUAGE_CONFIG];
  
  if (language && SUPPORTED_LANGUAGES.includes(language)) {
    return language;
  }

  // Fallback: essayer de détecter depuis les sous-domaines
  const subdomain = hostname.split('.')[0];
  if (SUPPORTED_LANGUAGES.includes(subdomain as SupportedLanguage)) {
    return subdomain as SupportedLanguage;
  }

  // Fallback: détecter depuis l'URL path (ex: /es/*, /de/*)
  const pathLanguage = window.location.pathname.split('/')[1];
  if (SUPPORTED_LANGUAGES.includes(pathLanguage as SupportedLanguage)) {
    return pathLanguage as SupportedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Obtient l'URL canonique pour une langue donnée
 */
export function getCanonicalUrlForLanguage(language: SupportedLanguage, path: string = ''): string {
  const baseUrls = {
    fr: 'https://mybunq.amccredit.com',
    en: 'https://en.mybunq.amccredit.com', 
    es: 'https://es.mybunq.amccredit.com',
    pt: 'https://pt.mybunq.amccredit.com',
    it: 'https://it.mybunq.amccredit.com',
    nl: 'https://nl.mybunq.amccredit.com',
    de: 'https://de.mybunq.amccredit.com',
  };

  const baseUrl = baseUrls[language] || baseUrls.fr;
  return `${baseUrl}${path}`;
}

/**
 * Obtient toutes les URLs alternatives pour la page actuelle
 */
export function getAlternateUrls(currentPath: string = ''): Array<{ lang: SupportedLanguage; url: string }> {
  return SUPPORTED_LANGUAGES.map(lang => ({
    lang,
    url: getCanonicalUrlForLanguage(lang, currentPath)
  }));
}

/**
 * Redirige vers le bon domaine si nécessaire
 */
export function redirectToCorrectDomain(targetLanguage: SupportedLanguage): void {
  if (typeof window === 'undefined') return;

  const currentDomain = window.location.hostname;
  const currentLanguage = detectLanguageFromDomain();
  
  // Si on est déjà sur le bon domaine, pas de redirection
  if (currentLanguage === targetLanguage) return;

  // Si on est en développement local, ne pas rediriger
  if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
    return;
  }

  const targetUrl = getCanonicalUrlForLanguage(targetLanguage, window.location.pathname);
  window.location.href = targetUrl;
}

/**
 * Vérifie si on est sur le bon domaine pour la langue sélectionnée
 */
export function isOnCorrectDomain(language: SupportedLanguage): boolean {
  const detectedLanguage = detectLanguageFromDomain();
  return detectedLanguage === language;
}
