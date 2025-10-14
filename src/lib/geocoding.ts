// Geocoding utility using Mapbox Geocoding API
import { extractCountryFromLocation, removeCountryFromLocation } from './countryMapping';

interface GeocodingResult {
  coordinates: [number, number];
  placeName: string; // Full place name from Mapbox (e.g., "Malmö, Skåne County, Sweden")
  shortName: string; // User's original input
  country?: string; // ISO country code if detected
}

const geocodingCache = new Map<string, GeocodingResult>();

export async function geocodeLocation(
  location: string,
  mapboxToken: string
): Promise<GeocodingResult | null> {
  // Check cache first
  const cacheKey = location.toLowerCase().trim();
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    // Extract country from location if provided (e.g., "Malmö, Sweden" -> "se")
    const countryCode = extractCountryFromLocation(location);
    const searchQuery = countryCode ? removeCountryFromLocation(location) : location;
    const encodedLocation = encodeURIComponent(searchQuery);
    
    // Build API URL with optional country filter
    let apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,address&limit=1`;
    
    if (countryCode) {
      apiUrl += `&country=${countryCode}`;
    }
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const result: GeocodingResult = {
        coordinates: feature.center as [number, number],
        placeName: feature.place_name,
        shortName: location,
        country: countryCode || undefined,
      };

      // Cache the result
      geocodingCache.set(cacheKey, result);

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Failed to geocode location "${location}":`, error);
    return null;
  }
}

export async function geocodeDriveRoute(
  driveLocation: string,
  mapboxToken: string
): Promise<{ 
  startResult: GeocodingResult | null; 
  endResult: GeocodingResult | null;
  midpoint?: [number, number];
} | null> {
  // Split drive route by " to " separator
  const parts = driveLocation.split(/\s+to\s+/i);
  
  if (parts.length !== 2) {
    console.error(`Invalid drive format: "${driveLocation}". Expected "Start to End"`);
    return null;
  }

  const [startLocation, endLocation] = parts.map(s => s.trim());
  
  // Geocode both locations
  const startResult = await geocodeLocation(startLocation, mapboxToken);
  const endResult = await geocodeLocation(endLocation, mapboxToken);

  if (!startResult || !endResult) {
    return { startResult, endResult };
  }

  // Calculate midpoint
  const midpoint: [number, number] = [
    (startResult.coordinates[0] + endResult.coordinates[0]) / 2,
    (startResult.coordinates[1] + endResult.coordinates[1]) / 2
  ];

  return { startResult, endResult, midpoint };
}

export async function geocodeMultipleLocations(
  locations: string[],
  mapboxToken: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();
  let completed = 0;

  for (const location of locations) {
    const result = await geocodeLocation(location, mapboxToken);
    if (result) {
      results.set(location, result);
    }
    completed++;
    if (onProgress) {
      onProgress(completed, locations.length);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
