import { useState } from "react";
import { TripDay, Stop } from "@/types/trip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Plus, Sunrise, Sunset, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [showQuickAccommodation, setShowQuickAccommodation] = useState(false);
  const [accommodationName, setAccommodationName] = useState("");

  if (!day) return null;

  const handleAddEvent = (event: Omit<Stop, "id">, insertAtIndex?: number) => {
    onAddEvent(day.id, event, insertAtIndex);
    setShowAddForm(false);
  };

  const handleEditEvent = (stopId: string, updatedStop: Omit<Stop, "id">) => {
    onUpdateEvent(day.id, stopId, updatedStop);
    setEditingStopId(null);
  };

  const handleDeleteEvent = (stopId: string) => {
    onDeleteEvent(day.id, stopId);
  };

  const editingStop = editingStopId ? day.stops.find(s => s.id === editingStopId) : null;

  const handleStopClick = (stopId: string) => {
    setHighlightedStopId(stopId);
    // Auto-clear highlight after 2 seconds
    setTimeout(() => setHighlightedStopId(undefined), 2000);
  };

  const handleQuickAccommodationSubmit = () => {
    if (!accommodationName.trim()) return;
    
    onAddEvent(day.id, {
      time: "",
      location: accommodationName,
      type: "accommodation",
      notes: undefined,
      coordinates: undefined,
    });
    
    setAccommodationName("");
    setShowQuickAccommodation(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0 animate-fade-in" hideClose>
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
            className="rounded-lg p-2 hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Timeline */}
          <div className="w-1/2 border-r border-border overflow-y-auto bg-background">
            <div className="p-4">
              {showAddForm ? (
                <AddEventForm
                  onAddEvent={handleAddEvent}
                  onCancel={() => setShowAddForm(false)}
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full mb-4 h-10 font-bold uppercase text-xs tracking-wider"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>
            
            {/* Empty state with quick accommodation add */}
            {day.stops.length === 0 && !showAddForm && !showQuickAccommodation && (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Hotel className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No activities planned yet</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  Start by adding where you'll stay tonight
                </p>
                <Button
                  variant="outline"
                  className="gap-2 font-semibold"
                  onClick={() => setShowQuickAccommodation(true)}
                >
                  <Hotel className="w-4 h-4" />
                  Add Accommodation
                </Button>
              </div>
            )}
            
            {/* Quick accommodation form */}
            {showQuickAccommodation && (
              <div className="bg-card border border-border rounded-lg p-6 mb-4 mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Hotel className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Where will you stay?</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="accommodation" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Accommodation Name
                    </Label>
                    <Input
                      id="accommodation"
                      type="text"
                      value={accommodationName}
                      onChange={(e) => setAccommodationName(e.target.value)}
                      placeholder="e.g., Hotel California, Airbnb in downtown..."
                      className="h-10"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleQuickAccommodationSubmit();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickAccommodationSubmit}
                      disabled={!accommodationName.trim()}
                      className="flex-1 h-9 font-bold uppercase text-xs tracking-wider"
                    >
                      <Hotel className="w-4 h-4 mr-1" />
                      Add Accommodation
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowQuickAccommodation(false);
                        setAccommodationName("");
                      }}
                      className="h-9 px-4 font-bold uppercase text-xs tracking-wider"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <TimelineView
              day={day} 
              onStopClick={handleStopClick}
              highlightedStopId={highlightedStopId}
              onEditStop={setEditingStopId}
              editingStopId={editingStopId}
              onSaveEdit={handleEditEvent}
              onCancelEdit={() => setEditingStopId(null)}
              onDeleteStop={handleDeleteEvent}
              onAddEvent={handleAddEvent}
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