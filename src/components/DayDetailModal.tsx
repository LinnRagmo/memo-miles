import { useState } from "react";
import { TripDay } from "@/types/trip";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X } from "lucide-react";
import TimelineView from "./TimelineView";
import MapView from "./MapView";

interface DayDetailModalProps {
  day: TripDay | null;
  isOpen: boolean;
  onClose: () => void;
}

const DayDetailModal = ({ day, isOpen, onClose }: DayDetailModalProps) => {
  const [highlightedStopId, setHighlightedStopId] = useState<string | undefined>();

  if (!day) return null;

  const handleStopClick = (stopId: string) => {
    setHighlightedStopId(stopId);
    // Auto-clear highlight after 2 seconds
    setTimeout(() => setHighlightedStopId(undefined), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0 animate-fade-in">
        <DialogHeader className="px-6 py-4 border-b border-border bg-card flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{day.date}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {day.drivingTime && `${day.drivingTime} driving`}
              {day.stops.length > 0 && ` • ${day.stops.length} stops`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Timeline */}
          <div className="w-1/2 border-r border-border overflow-y-auto bg-background">
            <TimelineView 
              day={day} 
              onStopClick={handleStopClick}
              highlightedStopId={highlightedStopId}
            />
          </div>
          
          {/* Right Panel - Map */}
          <div className="w-1/2 overflow-hidden bg-muted/20">
            <MapView 
              stops={day.stops}
              onStopClick={handleStopClick}
              highlightedStopId={highlightedStopId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;
