import { TripDay } from "@/types/trip";
import { Clock, MapPin, StickyNote, Car, Hotel, Camera, Sunrise, Sunset } from "lucide-react";

interface TripTableProps {
  days: TripDay[];
  onDayClick: (day: TripDay) => void;
  onUpdateDay: (dayId: string, field: keyof TripDay, value: string) => void;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case "drive":
      return <Car className="w-4 h-4" />;
    case "stop":
      return <Hotel className="w-4 h-4" />;
    case "activity":
      return <Camera className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

const TripTable = ({ days, onDayClick, onUpdateDay }: TripTableProps) => {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="overflow-x-auto">
        <div className="inline-flex gap-4 min-w-full pb-4">
          {days.map((day, dayIndex) => (
            <div
              key={day.id}
              className="flex-shrink-0 w-[320px] bg-card rounded-lg border-2 border-border overflow-hidden"
            >
              {/* Day Header */}
              <div
                onClick={() => onDayClick(day)}
                className="bg-foreground text-background cursor-pointer hover:bg-foreground/90 transition-colors px-4 py-4 border-b-2 border-border"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-lg font-bold">
                    {day.date}
                  </span>
                  <span className="text-sm opacity-80">
                    Day {dayIndex + 1} • {day.stops.length} events
                  </span>
                  {/* Sunrise/Sunset Times */}
                  {(day.sunrise || day.sunset) && (
                    <div className="flex items-center gap-3 text-xs opacity-90 pt-1">
                      {day.sunrise && (
                        <div className="flex items-center gap-1.5">
                          <Sunrise className="w-3.5 h-3.5" />
                          <span>{day.sunrise}</span>
                        </div>
                      )}
                      {day.sunset && (
                        <div className="flex items-center gap-1.5">
                          <Sunset className="w-3.5 h-3.5" />
                          <span>{day.sunset}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Events List */}
              <div className="p-4 space-y-3">
                {day.stops.map((stop) => (
                  <div
                    key={stop.id}
                    className="bg-muted/50 rounded-md p-3 border border-border hover:bg-muted transition-colors"
                  >
                    {/* Time */}
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">{stop.time}</span>
                    </div>

                    {/* Event/Activity */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">
                        {getEventIcon(stop.type)}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {stop.location}
                      </span>
                    </div>

                    {/* Driving Time */}
                    {stop.type === "drive" && day.drivingTime && (
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{day.drivingTime}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {stop.notes && (
                      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
                        <StickyNote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{stop.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripTable;
