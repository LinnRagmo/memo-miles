import { TripDay, Stop } from "@/types/trip";
import { Car, MapPin, Utensils, Coffee, Camera } from "lucide-react";

interface TimelineViewProps {
  day: TripDay;
}

const getStopIcon = (type: Stop['type']) => {
  switch (type) {
    case 'drive':
      return Car;
    case 'activity':
      return Camera;
    case 'stop':
      return Coffee;
    default:
      return MapPin;
  }
};

const TimelineView = ({ day }: TimelineViewProps) => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {day.stops.map((stop, index) => {
          const Icon = getStopIcon(stop.type);
          const isLast = index === day.stops.length - 1;
          
          return (
            <div key={stop.id} className="relative flex gap-4 group">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-full -ml-px bg-border" />
              )}
              
              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-soft ${
                stop.type === 'drive' ? 'bg-primary text-primary-foreground' :
                stop.type === 'activity' ? 'bg-accent text-accent-foreground' :
                'bg-card border-2 border-border text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-card rounded-lg border border-border p-4 shadow-soft group-hover:shadow-medium transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">{stop.time}</span>
                        {stop.type === 'drive' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                            Driving
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{stop.location}</h4>
                      {stop.notes && (
                        <p className="text-sm text-muted-foreground">{stop.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
