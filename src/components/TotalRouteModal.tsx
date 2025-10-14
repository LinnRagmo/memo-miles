import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, MapPin } from "lucide-react";
import { Trip } from "@/types/trip";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { geocodeMultipleLocations, geocodeDriveRoute, getRouteGeometry } from "@/lib/geocoding";

interface TotalRouteModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onCoordinatesGeocoded?: (dayId: string, stopId: string, coordinates: [number, number], endCoordinates?: [number, number]) => void;
}

const TotalRouteModal = ({ trip, isOpen, onClose, onCoordinatesGeocoded }: TotalRouteModalProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem("mapboxToken") || "";
  });
  const [tokenInput, setTokenInput] = useState("");
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [geocodedStops, setGeocodedStops] = useState<Map<string, [number, number]>>(new Map());
  const [geocodedDriveRoutes, setGeocodedDriveRoutes] = useState<Map<string, { start: [number, number], end: [number, number] }>>(new Map());
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [routeGeometries, setRouteGeometries] = useState<any[]>([]);
  const [isFetchingRoutes, setIsFetchingRoutes] = useState(false);
  const { toast } = useToast();

  const handleTokenSubmit = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("mapboxToken", tokenInput.trim());
    setMapboxToken(tokenInput.trim());
    toast({
      title: "Success",
      description: "Mapbox token saved successfully",
    });
  };

  // Geocode stops without coordinates
  useEffect(() => {
    if (!isOpen || !mapboxToken || isGeocoding) return;

    // Split stops into drive and regular stops
    const allStopsNeedingGeocode = trip.days.flatMap(day =>
      day.stops
        .filter(stop => !stop.coordinates && stop.location)
        .map(stop => ({ ...stop, dayId: day.id }))
    );

    const driveStops = allStopsNeedingGeocode.filter(stop => 
      stop.type === 'drive' && stop.location.includes(' to ') && !geocodedDriveRoutes.has(stop.id)
    );
    
    const regularStops = allStopsNeedingGeocode.filter(stop => 
      stop.type !== 'drive' && !geocodedStops.has(stop.id)
    );

    if (driveStops.length === 0 && regularStops.length === 0) return;

    const geocodeStops = async () => {
      setIsGeocoding(true);

      // Geocode drive routes
      const newGeocodedDriveRoutes = new Map(geocodedDriveRoutes);
      for (const stop of driveStops) {
        const result = await geocodeDriveRoute(stop.location, mapboxToken);
        if (result && result.startResult && result.endResult) {
          const driveRoute = {
            start: result.startResult.coordinates,
            end: result.endResult.coordinates
          };
          newGeocodedDriveRoutes.set(stop.id, driveRoute);
          onCoordinatesGeocoded?.(stop.dayId, stop.id, driveRoute.start, driveRoute.end);
        }
      }
      setGeocodedDriveRoutes(newGeocodedDriveRoutes);

      // Geocode regular stops
      if (regularStops.length > 0) {
        const locationsToGeocode = regularStops.map(stop => stop.location);
        const results = await geocodeMultipleLocations(locationsToGeocode, mapboxToken);

        const newGeocodedStops = new Map(geocodedStops);
        regularStops.forEach(stop => {
          const result = results.get(stop.location);
          if (result) {
            newGeocodedStops.set(stop.id, result.coordinates);
            onCoordinatesGeocoded?.(stop.dayId, stop.id, result.coordinates);
          }
        });
        setGeocodedStops(newGeocodedStops);
      }

      setIsGeocoding(false);
    };

    geocodeStops();
  }, [isOpen, mapboxToken, trip.days.length]);

  // Fetch actual route geometries between consecutive stops
  useEffect(() => {
    if (!isOpen || !mapboxToken || isFetchingRoutes) return;

    // Get all stops in order with coordinates
    const orderedStops = trip.days.flatMap(day => 
      day.stops
        .map(stop => {
          const driveRoute = geocodedDriveRoutes.get(stop.id);
          return {
            ...stop,
            coordinates: stop.coordinates || geocodedStops.get(stop.id) || driveRoute?.start,
            startCoordinates: driveRoute?.start,
            endCoordinates: driveRoute?.end,
            location: stop.location,
          };
        })
        .filter(stop => stop.coordinates)
    );

    if (orderedStops.length < 2) {
      console.log('Not enough stops to fetch routes');
      return;
    }

    const fetchRouteGeometries = async () => {
      console.log('Starting route geometry fetch for', orderedStops.length, 'stops');
      setIsFetchingRoutes(true);
      
      const geometries: any[] = [];

      // Fetch route geometry for each consecutive pair of stops
      for (let i = 0; i < orderedStops.length - 1; i++) {
        const currentStop = orderedStops[i];
        const nextStop = orderedStops[i + 1];
        
        // Use end coordinates for drive stops, otherwise use regular coordinates
        const startCoords = currentStop.endCoordinates || currentStop.coordinates!;
        const endCoords = nextStop.startCoordinates || nextStop.coordinates!;
        
        console.log(`Fetching route ${i + 1}/${orderedStops.length - 1}: ${currentStop.location} to ${nextStop.location}`);
        
        const geometry = await getRouteGeometry(
          startCoords,
          endCoords,
          currentStop.location,
          nextStop.location,
          mapboxToken
        );
        
        if (geometry) {
          console.log('Got geometry with', geometry.coordinates?.length, 'points');
          geometries.push(geometry);
        } else {
          console.log('No geometry returned for this segment');
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Finished fetching', geometries.length, 'route geometries');
      setRouteGeometries(geometries);
      setIsFetchingRoutes(false);
    };

    fetchRouteGeometries();
  }, [isOpen, mapboxToken, geocodedStops.size, geocodedDriveRoutes.size]);

  useEffect(() => {
    console.log('TotalRouteModal useEffect triggered:', { isOpen, hasToken: !!mapboxToken });
    
    // Only check isOpen and token, NOT container
    if (!isOpen || !mapboxToken) {
      setIsMapLoading(false);
      console.log('Early return - modal closed or no token');
      return;
    }

    // Small delay to ensure Dialog is fully rendered
    const timer = setTimeout(() => {
      console.log('Checking container after timeout:', { hasContainer: !!mapContainer.current });
      
      if (!mapContainer.current) {
        console.log('Container still not ready after timeout');
        setIsMapLoading(false);
        return;
      }
      
      console.log('Container ready, initializing map...');

      // Get all stops with coordinates from all days (including geocoded)
      const allStops = trip.days.flatMap(day => 
        day.stops
          .map(stop => {
            const driveRoute = geocodedDriveRoutes.get(stop.id);
            return {
              ...stop,
              coordinates: stop.coordinates || geocodedStops.get(stop.id) || driveRoute?.start,
              startCoordinates: driveRoute?.start,
              endCoordinates: driveRoute?.end,
              date: day.date
            };
          })
          .filter(stop => stop.coordinates)
      );

      console.log('All stops with coordinates:', allStops.length);

      if (allStops.length === 0) {
        setIsMapLoading(false);
        return;
      }

      // Initialize map
      setIsMapLoading(true);
      mapboxgl.accessToken = mapboxToken;
      console.log('Initializing Mapbox map...');

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: allStops[0].coordinates!,
        zoom: 5,
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setTokenError(true);
        toast({
          title: "Map Error",
          description: "Failed to load map. Please check your Mapbox token is valid.",
          variant: "destructive",
        });
        setIsMapLoading(false);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Wait for map to load before adding route
      map.current.on("load", () => {
        console.log('Map loaded successfully');
        if (!map.current) return;
        setIsMapLoading(false);

        // Build route using actual geometries if available
        let routeCoordinates: [number, number][] = [];
        
        if (routeGeometries.length > 0) {
          // Use actual route geometries from Mapbox Directions API
          routeGeometries.forEach(geometry => {
            if (geometry && geometry.coordinates) {
              routeCoordinates.push(...geometry.coordinates);
            }
          });
          console.log('Using actual route geometries:', routeCoordinates.length, 'points');
        } else {
          // Fallback to straight lines between stops
          allStops.forEach(stop => {
            const driveRoute = geocodedDriveRoutes.get(stop.id);
            if (driveRoute) {
              routeCoordinates.push(driveRoute.start);
              routeCoordinates.push(driveRoute.end);
            } else if (stop.coordinates) {
              routeCoordinates.push(stop.coordinates);
            }
          });
          console.log('Using fallback coordinates:', routeCoordinates.length, 'points');
        }

        // Add route line
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          },
        });

        // Get computed primary color from CSS
        const primaryColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim();
        
        console.log('Primary color:', primaryColor);
        const lineColor = primaryColor ? `hsl(${primaryColor})` : '#FF6B35';
        console.log('Using line color:', lineColor);
        
        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": lineColor,
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });
        console.log('Route layer added successfully');

        // Add markers for each stop
        allStops.forEach((stop, index) => {
          const driveRoute = geocodedDriveRoutes.get(stop.id);
          const markerCoordinates = driveRoute ? driveRoute.start : stop.coordinates!;
          
          const el = document.createElement("div");
          el.className = "custom-marker";
          el.style.width = "32px";
          el.style.height = "32px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = "hsl(var(--primary))";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.color = "white";
          el.style.fontWeight = "bold";
          el.style.fontSize = "12px";
          el.textContent = (index + 1).toString();

          const popupContent = driveRoute 
            ? `<div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">📍 ${stop.location}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${stop.date}</p>
                <p style="font-size: 12px; color: #666;">${stop.time}</p>
                ${stop.drivingTime ? `<p style="font-size: 12px; margin-top: 4px;">⏱️ ${stop.drivingTime}</p>` : ""}
                ${stop.notes ? `<p style="font-size: 12px; margin-top: 4px;">${stop.notes}</p>` : ""}
              </div>`
            : `<div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${stop.location}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${stop.date}</p>
                <p style="font-size: 12px; color: #666;">${stop.time}</p>
                ${stop.notes ? `<p style="font-size: 12px; margin-top: 4px;">${stop.notes}</p>` : ""}
              </div>`;

          const marker = new mapboxgl.Marker(el)
            .setLngLat(markerCoordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
            .addTo(map.current!);

          markers.current.push(marker);
        });

        // Fit map to show all stops (including both start and end of drives)
        const bounds = new mapboxgl.LngLatBounds();
        allStops.forEach(stop => {
          const driveRoute = geocodedDriveRoutes.get(stop.id);
          if (driveRoute) {
            bounds.extend(driveRoute.start);
            bounds.extend(driveRoute.end);
          } else if (stop.coordinates) {
            bounds.extend(stop.coordinates);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
      });
    }, 150);

    // Cleanup
    return () => {
      clearTimeout(timer);
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
      setIsMapLoading(false);
    };
  }, [isOpen, trip, mapboxToken, geocodedStops.size, geocodedDriveRoutes.size, routeGeometries.length]);

  const allStops = trip.days.flatMap(day => 
    day.stops
      .map(stop => {
        const driveRoute = geocodedDriveRoutes.get(stop.id);
        return {
          ...stop,
          coordinates: stop.coordinates || geocodedStops.get(stop.id) || driveRoute?.start
        };
      })
      .filter(stop => stop.coordinates)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-4 py-2 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">{trip.title} - Full Route</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {trip.startDate} - {trip.endDate} • {allStops.length} stops
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {mapboxToken && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setMapboxToken("");
                    setTokenError(false);
                    localStorage.removeItem("mapboxToken");
                  }}
                >
                  Change Token
                </Button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative">
          {!mapboxToken || tokenError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 p-8">
              <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Mapbox Token Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To display the route map, please enter your Mapbox public token. You can find it at{" "}
                  <a
                    href="https://account.mapbox.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="pk.ey..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleTokenSubmit()}
                  />
                  <Button onClick={handleTokenSubmit}>Save</Button>
                </div>
              </div>
            </div>
          ) : allStops.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="text-center p-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stops with coordinates to display on the map.</p>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapContainer} className="absolute inset-0" />
              {(isGeocoding || isMapLoading || isFetchingRoutes) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    {isGeocoding ? (
                      <p className="text-sm text-muted-foreground">Geocoding locations...</p>
                    ) : isFetchingRoutes ? (
                      <p className="text-sm text-muted-foreground">Calculating routes...</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TotalRouteModal;
