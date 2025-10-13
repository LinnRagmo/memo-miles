import { Calendar as CalendarIcon, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TripHeaderProps {
  title: string;
  startDate: string;
  endDate: string;
  onShowTotalRoute: () => void;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const TripHeader = ({ title, startDate, endDate, onShowTotalRoute, onDateChange }: TripHeaderProps) => {
  const parseDate = (dateStr: string) => {
    return new Date(dateStr);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      onDateChange(date, parseDate(endDate));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      onDateChange(parseDate(startDate), date);
    }
  };
  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start text-left font-normal px-2 py-1 h-auto hover:bg-muted",
                        "text-sm text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {startDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDate(startDate)}
                      onSelect={handleStartDateChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-muted-foreground">→</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start text-left font-normal px-2 py-1 h-auto hover:bg-muted",
                        "text-sm text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {endDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDate(endDate)}
                      onSelect={handleEndDateChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Button onClick={onShowTotalRoute} variant="outline" className="shadow-soft">
            <Map className="w-4 h-4 mr-2" />
            Show Total Route
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TripHeader;
