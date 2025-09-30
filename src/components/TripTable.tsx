import { TripDay } from "@/types/trip";
import { Clock, MapPin, StickyNote, Car, Hotel, Coffee, Camera } from "lucide-react";

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
      <div className="bg-card rounded-lg overflow-hidden border-2 border-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-foreground text-background border-b-2 border-border">
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-[140px]">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                  Event / Activity
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-[140px]">
                  Driving Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-[200px]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <>
                  {/* Day Header Row */}
                  <tr 
                    key={`${day.id}-header`}
                    onClick={() => onDayClick(day)}
                    className="bg-muted hover:bg-accent cursor-pointer transition-colors border-b border-border"
                  >
                    <td 
                      colSpan={4} 
                      className="px-6 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-foreground">
                            {day.date}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            Day {dayIndex + 1}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.stops.length} events
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Event Rows */}
                  {day.stops.map((stop, stopIndex) => (
                    <tr
                      key={stop.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {stop.time}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {getEventIcon(stop.type)}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {stop.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {stop.type === "drive" && (
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            {day.drivingTime}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-muted-foreground">
                          {stop.notes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripTable;
