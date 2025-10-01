import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, MapPin } from "lucide-react";
import { Trip } from "@/types/trip";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TotalRouteModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

const TotalRouteModal = ({ trip, isOpen, onClose }: TotalRouteModalProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem("mapboxToken") || "";
  });
  const [tokenInput, setTokenInput] = useState("");
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [containerReady, setContainerReady] = useState(false);
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

  // Check when container becomes available
  useEffect(() => {
    if (isOpen && mapContainer.current) {
      console.log('Container mounted');
      setContainerReady(true);
    } else {
      setContainerReady(false);
    }
  }, [isOpen, mapContainer.current]);

  useEffect(() => {
    console.log('TotalRouteModal useEffect triggered:', { isOpen, containerReady, hasToken: !!mapboxToken });
    
    if (!isOpen || !containerReady || !mapboxToken) {
      setIsMapLoading(false);
      console.log('Early return - conditions not met');
      return;
    }

    // Get all stops with coordinates from all days
    const allStops = trip.days.flatMap(day => 
      day.stops.filter(stop => stop.coordinates).map(stop => ({
        ...stop,
        date: day.date
      }))
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
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: allStops[0].coordinates!,
      zoom: 6,
    });

    map.current.on('error', (e) => {
      console.error('Mapbox error:', e);
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

      // Create route coordinates array
      const coordinates = allStops.map(stop => stop.coordinates!);
      console.log('Route coordinates:', coordinates);

      // Add route line
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      // Get computed primary color from CSS
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
      
      console.log('Primary color:', primaryColor);
      const lineColor = primaryColor ? `hsl(${primaryColor})` : '#3b82f6';
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
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
      console.log('Route layer added successfully');

      // Add markers for each stop
      allStops.forEach((stop, index) => {
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

        const marker = new mapboxgl.Marker(el)
          .setLngLat(stop.coordinates!)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${stop.location}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${stop.date}</p>
                <p style="font-size: 12px; color: #666;">${stop.time}</p>
                ${stop.notes ? `<p style="font-size: 12px; margin-top: 4px;">${stop.notes}</p>` : ""}
              </div>`
            )
          )
          .addTo(map.current!);

        markers.current.push(marker);
      });

      // Fit map to show all stops
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
      setIsMapLoading(false);
    };
  }, [isOpen, containerReady, trip, mapboxToken]);

  const allStops = trip.days.flatMap(day => 
    day.stops.filter(stop => stop.coordinates)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-card flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {trip.title} - Full Route
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {trip.startDate} - {trip.endDate} • {allStops.length} stops
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>

        <div className="flex-1 relative">
          {!mapboxToken ? (
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
              {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
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
