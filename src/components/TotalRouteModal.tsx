import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, MapPin } from "lucide-react";
import { Trip } from "@/types/trip";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface TotalRouteModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

const TotalRouteModal = ({ trip, isOpen, onClose }: TotalRouteModalProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!isOpen || !mapContainer.current) return;

    // Get all stops with coordinates from all days
    const allStops = trip.days.flatMap(day => 
      day.stops.filter(stop => stop.coordinates).map(stop => ({
        ...stop,
        date: day.date
      }))
    );

    if (allStops.length === 0) return;

    // Initialize map
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNWN5dnEzaDAyeHcya3M1cnQ0dHU5djAifQ.37LNMhTd2dKmwalzcSHOlQ";
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: allStops[0].coordinates!,
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Wait for map to load before adding route
    map.current.on("load", () => {
      if (!map.current) return;

      // Create route coordinates array
      const coordinates = allStops.map(stop => stop.coordinates!);

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

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "hsl(var(--primary))",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

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
    };
  }, [isOpen, trip]);

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
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TotalRouteModal;
