import { TripDay } from "@/types/trip";
import { Car, Clock, MapPin, StickyNote } from "lucide-react";

interface TripTableProps {
  days: TripDay[];
  onDayClick: (day: TripDay) => void;
  onUpdateDay: (dayId: string, field: keyof TripDay, value: string) => void;
}

const TripTable = ({ days, onDayClick, onUpdateDay }: TripTableProps) => {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="bg-card rounded-lg shadow-medium overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-[140px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-[140px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Driving Time
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Activities
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => (
                <tr
                  key={day.id}
                  onClick={() => onDayClick(day)}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{day.date}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Day {index + 1}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={day.drivingTime}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateDay(day.id, 'drivingTime', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground focus:bg-input rounded px-2 py-1 -mx-2 transition-colors"
                      placeholder="e.g. 3h 30m"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={day.activities}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateDay(day.id, 'activities', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground focus:bg-input rounded px-2 py-1 -mx-2 transition-colors"
                      placeholder="Add activities..."
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={day.notes}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateDay(day.id, 'notes', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground focus:bg-input rounded px-2 py-1 -mx-2 transition-colors"
                      placeholder="Add notes..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default TripTable;
