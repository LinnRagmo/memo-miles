import { useState } from "react";
import { TripDay, Stop } from "@/types/trip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Plus, Sunrise, Sunset, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimelineView from "./TimelineView";
import MapView from "./MapView";
import AddEventForm from "./AddEventForm";
import EditEventForm from "./EditEventForm";

interface DayDetailModalProps {
  day: TripDay | null;
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (dayId: string, event: Omit<Stop, "id">, insertAtIndex?: number) => void;
  onUpdateEvent: (dayId: string, stopId: string, updatedStop: any) => void;
  onDeleteEvent: (dayId: string, stopId: string) => void;
}

const DayDetailModal = ({ day, isOpen, onClose, onAddEvent, onUpdateEvent, onDeleteEvent }: DayDetailModalProps) => {
  const [highlightedStopId, setHighlightedStopId] = useState<string | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | undefined>();
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  if (!day) return null;

  const handleAddEvent = (event: Omit<Stop, "id">) => {
    onAddEvent(day.id, event, insertAtIndex);
    setShowAddForm(false);
    setInsertAtIndex(undefined);
  };
  
  const handleAddAfter = (index: number) => {
    setEditingStopId(null);
    setInsertAtIndex(index + 1);
    setShowAddForm(true);
  };

  const handleEditEvent = (stopId: string, updatedStop: Omit<Stop, "id">) => {
    onUpdateEvent(day.id, stopId, updatedStop);
    setEditingStopId(null);
  };

  const handleDeleteEvent = (stopId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDeleteEvent(day.id, stopId);
    }
  };

  const editingStop = editingStopId ? day.stops.find(s => s.id === editingStopId) : null;

  const handleStopClick = (stopId: string) => {
    setHighlightedStopId(stopId);
    // Auto-clear highlight after 2 seconds
    setTimeout(() => setHighlightedStopId(undefined), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0 animate-fade-in">
        <DialogHeader className="px-6 py-4 border-b border-border bg-card flex flex-row items-center justify-between">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold text-foreground">{day.date}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {day.drivingTime && `${day.drivingTime} driving`}
              {day.stops.length > 0 && ` • ${day.stops.length} stops`}
            </DialogDescription>
            {/* Sunrise/Sunset Times */}
            {(day.sunrise || day.sunset) && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                {day.sunrise && (
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="w-4 h-4" />
                    <span>Sunrise: {day.sunrise}</span>
                  </div>
                )}
                {day.sunset && (
                  <div className="flex items-center gap-1.5">
                    <Sunset className="w-4 h-4" />
                    <span>Sunset: {day.sunset}</span>
                  </div>
                )}
              </div>
            )}
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
            <div className="p-4">
              {editingStop ? (
                <EditEventForm
                  stop={editingStop}
                  onSave={handleEditEvent}
                  onCancel={() => setEditingStopId(null)}
                />
              ) : !showAddForm ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setInsertAtIndex(undefined);
                      setShowAddForm(true);
                    }}
                    variant="outline"
                    className="w-full mb-2 h-10 font-bold uppercase text-xs tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event {insertAtIndex !== undefined ? `(Position ${insertAtIndex + 1})` : ''}
                  </Button>
                  <Button
                    onClick={() => {
                      setInsertAtIndex(undefined);
                      setShowAddForm(true);
                      // Pre-fill accommodation
                    }}
                    variant="secondary"
                    className="w-full h-9 text-xs tracking-wider"
                  >
                    <Hotel className="w-4 h-4 mr-2" />
                    Quick Add Accommodation
                  </Button>
                </div>
              ) : (
                <AddEventForm
                  onAddEvent={handleAddEvent}
                  onCancel={() => {
                    setShowAddForm(false);
                    setInsertAtIndex(undefined);
                  }}
                />
              )}
            </div>
            <TimelineView 
              day={day} 
              onStopClick={handleStopClick}
              highlightedStopId={highlightedStopId}
              onEditStop={(stopId) => {
                setShowAddForm(false);
                setInsertAtIndex(undefined);
                setEditingStopId(stopId);
              }}
              onDeleteStop={handleDeleteEvent}
              onAddAfter={handleAddAfter}
              onReorderStops={(reorderedStops) => {
                onUpdateEvent(day.id, '', { stops: reorderedStops } as any);
              }}
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
