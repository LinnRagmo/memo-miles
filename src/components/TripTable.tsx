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
      {days.map((day, dayIndex) => (
        <div key={day.id} className="mb-8 bg-card rounded-lg overflow-hidden border-2 border-border">
          {/* Day Header */}
          <div
            onClick={() => onDayClick(day)}
            className="bg-muted hover:bg-accent cursor-pointer transition-colors border-b-2 border-border px-6 py-3"
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
          </div>

          {/* Column-based Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-foreground text-background border-b-2 border-border">
                  <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider w-[140px] sticky left-0 bg-foreground z-10">
                    Field
                  </th>
                  {day.stops.map((stop, index) => (
                    <th
                      key={stop.id}
                      className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider min-w-[180px]"
                    >
                      Event {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Time Row */}
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-foreground sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Time
                    </div>
                  </td>
                  {day.stops.map((stop) => (
                    <td key={stop.id} className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      {stop.time}
                    </td>
                  ))}
                </tr>

                {/* Event/Activity Row */}
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-foreground sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Event / Activity
                    </div>
                  </td>
                  {day.stops.map((stop) => (
                    <td key={stop.id} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-muted-foreground">
                          {getEventIcon(stop.type)}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {stop.location}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Driving Time Row */}
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-foreground sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      Driving Time
                    </div>
                  </td>
                  {day.stops.map((stop) => (
                    <td key={stop.id} className="px-4 py-3 text-center text-sm text-foreground">
                      {stop.type === "drive" ? day.drivingTime : "-"}
                    </td>
                  ))}
                </tr>

                {/* Notes Row */}
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-foreground sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-muted-foreground" />
                      Notes
                    </div>
                  </td>
                  {day.stops.map((stop) => (
                    <td key={stop.id} className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {stop.notes || "-"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripTable;
