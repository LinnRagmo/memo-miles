/**
 * Fetches sunrise and sunset times for a given location and date
 * Uses the free sunrise-sunset.org API
 */
export async function fetchSunriseSunset(
  lat: number,
  lng: number,
  date: Date
): Promise<{ sunrise: string; sunset: string } | null> {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`
    );
    
    if (!response.ok) {
      console.error('Failed to fetch sunrise/sunset data');
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Invalid sunrise/sunset API response');
      return null;
    }
    
    // Convert UTC times to local time strings
    const sunriseTime = new Date(data.results.sunrise);
    const sunsetTime = new Date(data.results.sunset);
    
    return {
      sunrise: sunriseTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      sunset: sunsetTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  } catch (error) {
    console.error('Error fetching sunrise/sunset:', error);
    return null;
  }
}

/**
 * Parse date string in various formats to Date object
 */
export function parseDate(dateStr: string): Date {
  // Try to parse "Jun 15, 2024" format
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Fallback to current date if parsing fails
  return new Date();
}
