import { corsHeaders } from '../_shared/cors.ts';

const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startLocation, endLocation } = await req.json();

    if (!startLocation || !endLocation) {
      return new Response(
        JSON.stringify({ error: 'Start and end locations are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!MAPBOX_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Geocode start location
    const startGeocode = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startLocation)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const startData = await startGeocode.json();

    if (!startData.features || startData.features.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not find start location" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Geocode end location
    const endGeocode = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const endData = await endGeocode.json();

    if (!endData.features || endData.features.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not find end location" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startCoords = startData.features[0].center;
    const endCoords = endData.features[0].center;

    // Get driving directions
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?access_token=${MAPBOX_TOKEN}&geometries=geojson`;
    
    const directionsResponse = await fetch(directionsUrl);
    const directionsData = await directionsResponse.json();

    if (!directionsData.routes || directionsData.routes.length === 0) {
      return new Response(
        JSON.stringify({ error: "No route found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const route = directionsData.routes[0];
    const durationMinutes = Math.round(route.duration / 60);
    const distanceKm = (route.distance / 1000).toFixed(1);
    const distanceMiles = (route.distance / 1609.34).toFixed(1);

    // Format duration
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const drivingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return new Response(
      JSON.stringify({
        drivingTime,
        distance: `${distanceKm} km (${distanceMiles} mi)`,
        startCoordinates: startCoords,
        endCoordinates: endCoords,
        geometry: route.geometry, // Include the actual route geometry
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating route:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
