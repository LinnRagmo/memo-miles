// Geocoding utility using Mapbox Geocoding API

interface GeocodingResult {
  coordinates: [number, number];
  placeName: string;
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
    const encodedLocation = encodeURIComponent(location);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${mapboxToken}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const result: GeocodingResult = {
        coordinates: feature.center as [number, number],
        placeName: feature.place_name,
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
