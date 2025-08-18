/**
 * Utilitaires avancés de formatage de nombres pour l'application
 * @module numberFormatters
 */

/**
 * Options pour le formatage des nombres
 */
export interface NumberFormatOptions {
  /** Locale à utiliser pour le formatage (par défaut: 'fr-FR') */
  locale?: string;
  /** Nombre de décimales à afficher */
  decimals?: number;
  /** Afficher ou non le séparateur de milliers */
  useGrouping?: boolean;
  /** Style de formatage (decimal, percent, currency, unit) */
  style?: 'decimal' | 'percent' | 'currency' | 'unit';
  /** Code de la devise (requis si style est 'currency') */
  currency?: string;
  /** Unité à utiliser (requis si style est 'unit') */
  unit?: string;
  /** Affichage de la devise (symbol, code, name) */
  currencyDisplay?: 'symbol' | 'code' | 'name';
  /** Notation à utiliser (standard, scientific, engineering, compact) */
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
}

/**
 * Formate un nombre selon les options spécifiées
 * @param {number} value - Le nombre à formater
 * @param {NumberFormatOptions} options - Options de formatage
 * @returns {string} Le nombre formaté
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const {
    locale = 'fr-FR',
    decimals,
    useGrouping = true,
    style = 'decimal',
    currency,
    unit,
    currencyDisplay = 'symbol',
    notation = 'standard'
  } = options;

  try {
    const formatOptions: Intl.NumberFormatOptions = {
      style,
      useGrouping,
      notation
    };

    if (decimals !== undefined) {
      formatOptions.minimumFractionDigits = decimals;
      formatOptions.maximumFractionDigits = decimals;
    }

    if (style === 'currency') {
      if (!currency) {
        throw new Error('Currency code is required when style is "currency"');
      }
      formatOptions.currency = currency;
      formatOptions.currencyDisplay = currencyDisplay;
    }

    if (style === 'unit') {
      if (!unit) {
        throw new Error('Unit is required when style is "unit"');
      }
      formatOptions.unit = unit;
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
}

/**
 * Formate un montant en devise
 * @param {number} amount - Le montant à formater
 * @param {string} currency - Le code de la devise (par défaut: 'EUR')
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @param {number} decimals - Le nombre de décimales à afficher (par défaut: 2)
 * @returns {string} Le montant formaté avec la devise
 */
export function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'fr-FR', decimals?: number): string {
  return formatNumber(amount, {
    locale,
    style: 'currency',
    currency,
    decimals
  });
}

/**
 * Formate un pourcentage
 * @param {number} value - La valeur à formater (0.1 pour 10%)
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @param {number} decimals - Le nombre de décimales à afficher (par défaut: 2)
 * @returns {string} Le pourcentage formaté
 */
export function formatPercent(value: number, locale: string = 'fr-FR', decimals: number = 2): string {
  return formatNumber(value, {
    locale,
    style: 'percent',
    decimals
  });
}

/**
 * Formate un nombre avec une unité
 * @param {number} value - La valeur à formater
 * @param {string} unit - L'unité à utiliser (e.g., 'kilometer', 'celsius')
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @param {number} decimals - Le nombre de décimales à afficher
 * @returns {string} Le nombre formaté avec l'unité
 */
export function formatUnit(value: number, unit: string, locale: string = 'fr-FR', decimals?: number): string {
  return formatNumber(value, {
    locale,
    style: 'unit',
    unit,
    decimals
  });
}

/**
 * Formate un nombre en notation compacte (ex: 1.2K, 1.2M)
 * @param {number} value - La valeur à formater
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @param {number} decimals - Le nombre de décimales à afficher (par défaut: 1)
 * @returns {string} Le nombre formaté en notation compacte
 */
export function formatCompact(value: number, locale: string = 'fr-FR', decimals: number = 1): string {
  return formatNumber(value, {
    locale,
    notation: 'compact',
    decimals
  });
}

/**
 * Analyse une chaîne de caractères pour en extraire un nombre
 * @param {string} value - La chaîne à analyser
 * @param {string} locale - La locale à utiliser (par défaut: 'fr-FR')
 * @returns {number|null} Le nombre extrait ou null si la chaîne n'est pas un nombre valide
 */
export function parseNumber(value: string, locale: string = 'fr-FR'): number | null {
  try {
    // Supprimer les espaces et caractères non numériques sauf les séparateurs
    const cleanValue = value.trim();
    
    // Utiliser Intl.NumberFormat pour déterminer les séparateurs de la locale
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1234.5);
    
    let decimalSeparator = '.';
    let groupSeparator = ',';
    
    for (const part of parts) {
      if (part.type === 'decimal') {
        decimalSeparator = part.value;
      }
      if (part.type === 'group') {
        groupSeparator = part.value;
      }
    }
    
    // Remplacer les séparateurs de groupe par rien et le séparateur décimal par un point
    const normalized = cleanValue
      .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.');
    
    const result = Number(normalized);
    return isNaN(result) ? null : result;
  } catch (error) {
    console.error('Error parsing number:', error);
    return null;
  }
}