import { Stop } from "@/types/trip";
import { MapPin, Navigation } from "lucide-react";

interface MapViewProps {
  stops: Stop[];
}

const MapView = ({ stops }: MapViewProps) => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-primary/5 via-accent/5 to-muted/20 relative overflow-hidden">
      {/* Decorative map styling */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Map placeholder content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-medium p-8 max-w-md text-center border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Interactive Map</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Route visualization with pins for all stops and activities
          </p>
          
          {/* Stops list */}
          <div className="space-y-2 text-left">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  stop.type === 'drive' ? 'bg-primary text-primary-foreground' :
                  stop.type === 'activity' ? 'bg-accent text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {stop.location}
                  </div>
                  <div className="text-xs text-muted-foreground">{stop.time}</div>
                </div>
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Route line decoration */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M 10% 20% Q 30% 40%, 50% 50% T 90% 80%"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10,5"
        />
      </svg>
    </div>
  );
};

export default MapView;
