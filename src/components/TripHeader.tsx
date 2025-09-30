import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripHeaderProps {
  title: string;
  startDate: string;
  endDate: string;
  onAddDay: () => void;
}

const TripHeader = ({ title, startDate, endDate, onAddDay }: TripHeaderProps) => {
  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{startDate} - {endDate}</span>
              </div>
            </div>
          </div>
          
          <Button onClick={onAddDay} className="shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            Add Day
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TripHeader;
