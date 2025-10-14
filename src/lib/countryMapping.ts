// Country name to ISO 3166-1 alpha-2 code mapping
const COUNTRY_CODES: Record<string, string> = {
  // Scandinavia
  'sweden': 'se',
  'sverige': 'se',
  'norway': 'no',
  'norge': 'no',
  'denmark': 'dk',
  'danmark': 'dk',
  'finland': 'fi',
  'suomi': 'fi',
  'iceland': 'is',
  'ísland': 'is',
  
  // Western Europe
  'france': 'fr',
  'germany': 'de',
  'deutschland': 'de',
  'spain': 'es',
  'españa': 'es',
  'italy': 'it',
  'italia': 'it',
  'portugal': 'pt',
  'netherlands': 'nl',
  'belgium': 'be',
  'belgië': 'be',
  'belgique': 'be',
  'austria': 'at',
  'österreich': 'at',
  'switzerland': 'ch',
  'schweiz': 'ch',
  'suisse': 'ch',
  
  // UK & Ireland
  'uk': 'gb',
  'united kingdom': 'gb',
  'great britain': 'gb',
  'england': 'gb',
  'scotland': 'gb',
  'wales': 'gb',
  'ireland': 'ie',
  
  // Eastern Europe
  'poland': 'pl',
  'polska': 'pl',
  'czech republic': 'cz',
  'czechia': 'cz',
  'hungary': 'hu',
  'magyarország': 'hu',
  'romania': 'ro',
  'românia': 'ro',
  'bulgaria': 'bg',
  'българия': 'bg',
  
  // North America
  'usa': 'us',
  'united states': 'us',
  'america': 'us',
  'canada': 'ca',
  'mexico': 'mx',
  'méxico': 'mx',
  
  // Asia
  'japan': 'jp',
  '日本': 'jp',
  'china': 'cn',
  '中国': 'cn',
  'south korea': 'kr',
  'korea': 'kr',
  'india': 'in',
  'thailand': 'th',
  'vietnam': 'vn',
  
  // Oceania
  'australia': 'au',
  'new zealand': 'nz',
  
  // South America
  'brazil': 'br',
  'brasil': 'br',
  'argentina': 'ar',
  'chile': 'cl',
};

/**
 * Get ISO 3166-1 alpha-2 country code from country name
 * @param countryName - Full or partial country name
 * @returns ISO country code (lowercase) or null if not found
 */
export function getCountryCode(countryName: string): string | null {
  const normalized = countryName.toLowerCase().trim();
  return COUNTRY_CODES[normalized] || null;
}

/**
 * Extract country from location string (e.g., "Malmö, Sweden" -> "se")
 * Supports formats: "City, Country" or "City Country"
 */
export function extractCountryFromLocation(location: string): string | null {
  // Try comma-separated format first (e.g., "Malmö, Sweden")
  if (location.includes(',')) {
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const code = getCountryCode(lastPart);
      if (code) return code;
    }
  }
  
  // Try space-separated format (e.g., "Malmö Sweden")
  const words = location.trim().split(/\s+/);
  if (words.length >= 2) {
    const lastWord = words[words.length - 1];
    const code = getCountryCode(lastWord);
    if (code) return code;
  }
  
  return null;
}

/**
 * Remove country from location string to get just the place name
 * e.g., "Malmö, Sweden" -> "Malmö"
 */
export function removeCountryFromLocation(location: string): string {
  const countryCode = extractCountryFromLocation(location);
  if (!countryCode) return location;
  
  // Remove comma-separated country
  if (location.includes(',')) {
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      parts.pop(); // Remove last part (country)
      return parts.join(', ');
    }
  }
  
  // Remove space-separated country
  const words = location.trim().split(/\s+/);
  if (words.length >= 2) {
    words.pop(); // Remove last word (country)
    return words.join(' ');
  }
  
  return location;
}
