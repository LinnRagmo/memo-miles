import { useEffect, useRef, useState } from "react";
import { Stop } from "@/types/trip";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  stops: Stop[];
  onStopClick?: (stopId: string) => void;
  highlightedStopId?: string;
}

const MapView = ({ stops, onStopClick, highlightedStopId }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Filter stops with coordinates
  const validStops = stops.filter(stop => stop.coordinates);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || validStops.length === 0) return;
    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = mapboxToken;

    try {
      // Calculate bounds
      const bounds = new mapboxgl.LngLatBounds();
      validStops.forEach(stop => {
        if (stop.coordinates) {
          bounds.extend(stop.coordinates as [number, number]);
        }
      });

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        bounds: bounds,
        fitBoundsOptions: { padding: 50 }
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      map.current.on("load", () => {
        if (!map.current) return;

        // Add route line
        const coordinates = validStops
          .filter(s => s.coordinates)
          .map(s => s.coordinates as [number, number]);

        if (coordinates.length > 1) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: coordinates
              }
            }
          });

          map.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "hsl(201, 85%, 52%)",
              "line-width": 4,
              "line-opacity": 0.8
            }
          });
        }

        // Add markers
        validStops.forEach((stop, index) => {
          if (!stop.coordinates || !map.current) return;

          const el = document.createElement("div");
          el.className = "custom-marker";
          el.style.width = "32px";
          el.style.height = "32px";
          el.style.borderRadius = "50%";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.fontSize = "14px";
          el.style.fontWeight = "600";
          el.style.cursor = "pointer";
          el.style.transition = "all 0.2s";
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          
          if (stop.type === "drive") {
            el.style.backgroundColor = "hsl(201, 85%, 52%)";
            el.style.color = "white";
          } else if (stop.type === "activity") {
            el.style.backgroundColor = "hsl(165, 70%, 55%)";
            el.style.color = "white";
          } else {
            el.style.backgroundColor = "white";
            el.style.color = "hsl(215, 25%, 15%)";
            el.style.border = "2px solid hsl(215, 15%, 88%)";
          }

          el.textContent = `${index + 1}`;

          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.2)";
            el.style.zIndex = "1000";
          });

          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
            el.style.zIndex = "auto";
          });

          el.addEventListener("click", () => {
            if (onStopClick) {
              onStopClick(stop.id);
            }
          });

          const marker = new mapboxgl.Marker(el)
            .setLngLat(stop.coordinates as [number, number])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 8px;">
                    <h3 style="font-weight: 600; margin-bottom: 4px;">${stop.location}</h3>
                    <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${stop.time}</p>
                    ${stop.notes ? `<p style="font-size: 12px; color: #888;">${stop.notes}</p>` : ""}
                  </div>
                `)
            )
            .addTo(map.current);

          markers.current[stop.id] = marker;
        });

        setIsMapInitialized(true);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markers.current = {};
    };
  }, [mapboxToken, validStops.length]);

  // Highlight marker when stop is selected
  useEffect(() => {
    if (!highlightedStopId || !markers.current[highlightedStopId]) return;

    Object.keys(markers.current).forEach(stopId => {
      const marker = markers.current[stopId];
      const el = marker.getElement();
      if (stopId === highlightedStopId) {
        el.style.transform = "scale(1.3)";
        el.style.zIndex = "1000";
      } else {
        el.style.transform = "scale(1)";
        el.style.zIndex = "auto";
      }
    });
  }, [highlightedStopId]);

  if (validStops.length === 0) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-primary/5 via-accent/5 to-muted/20 flex items-center justify-center">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-medium p-8 max-w-md text-center border border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Locations Yet</h3>
          <p className="text-sm text-muted-foreground">
            Add coordinates to your stops to see them on the map
          </p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-primary/5 via-accent/5 to-muted/20 flex items-center justify-center p-8">
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-medium p-8 max-w-md border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Mapbox Access Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to display the interactive map with pins and routes.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Get your free token at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => {
                if (mapboxToken) {
                  // Token will be used in the useEffect
                }
              }}
              className="w-full"
              disabled={!mapboxToken}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Load Map
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            💡 For production use, connect to <strong>Lovable Cloud</strong> to securely store your API keys
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
      {!isMapInitialized && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
