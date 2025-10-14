import { TripDay, Stop } from "@/types/trip";
import { Car, MapPin, Coffee, Camera, Pencil, Trash2, Plus, Hotel, Mountain, Utensils, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import EditEventForm from "./EditEventForm";
import AddEventForm from "./AddEventForm";
import { useRef, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineViewProps {
  day: TripDay;
  onStopClick?: (stopId: string) => void;
  highlightedStopId?: string;
  onEditStop?: (stopId: string) => void;
  editingStopId?: string | null;
  onSaveEdit?: (stopId: string, updatedStop: Omit<Stop, "id">) => void;
  onCancelEdit?: () => void;
  onDeleteStop?: (stopId: string) => void;
  onAddEvent?: (event: Omit<Stop, "id">, insertAtIndex?: number) => void;
  onReorderStops?: (stops: Stop[]) => void;
}

interface SortableStopProps {
  stop: Stop;
  index: number;
  isLast: boolean;
  isHighlighted: boolean;
  isEditing: boolean;
  onStopClick?: (stopId: string) => void;
  onEditStop?: (stopId: string) => void;
  onSaveEdit?: (stopId: string, updatedStop: Omit<Stop, "id">) => void;
  onCancelEdit?: () => void;
  onDeleteStop?: (stopId: string) => void;
  onAddEvent?: (event: Omit<Stop, "id">, insertAtIndex?: number) => void;
}

const SortableStop = ({ stop, index, isLast, isHighlighted, isEditing, onStopClick, onEditStop, onSaveEdit, onCancelEdit, onDeleteStop, onAddEvent }: SortableStopProps) => {
  const [showAddAfterPopover, setShowAddAfterPopover] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const stopRef = useRef<HTMLDivElement>(null);

  // Scroll into view when highlighted
  useEffect(() => {
    if (isHighlighted && stopRef.current) {
      stopRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
  }, [isHighlighted]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getStopIcon(stop.type, stop.activityIcon);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        ref={stopRef}
        className={`relative flex gap-4 group transition-all ${
          isHighlighted ? 'scale-[1.02]' : ''
        } ${isDragging ? 'z-50' : ''}`}
      >
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-5 top-12 w-0.5 h-[calc(100%+3rem)] -ml-px bg-border" />
        )}
        
        {/* Icon - drag handle */}
        <div 
          className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
          {...attributes} 
          {...listeners}
        >
          <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-soft transition-all ${
            stop.type === 'drive' ? 'bg-primary text-primary-foreground' :
            stop.type === 'activity' ? 'bg-accent text-accent-foreground' :
            'bg-card border-2 border-border text-muted-foreground'
          } ${isHighlighted ? 'ring-4 ring-primary/30 scale-110' : 'group-hover:scale-105'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Content */}
        <div 
          className="flex-1 pb-6"
          onClick={() => onStopClick?.(stop.id)}
        >
          <div className={`relative bg-card rounded-lg border p-4 shadow-soft transition-all ${
            isHighlighted 
              ? 'border-primary shadow-medium ring-2 ring-primary/20' 
              : 'border-border group-hover:shadow-medium group-hover:border-primary/50'
          }`}>
            {/* Number in bottom right corner */}
            <div className="absolute bottom-2 right-2 text-muted-foreground/50 font-medium text-sm">
              {index + 1}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Time - only show if it exists */}
                {stop.time && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">{stop.time}</span>
                    {stop.type === 'drive' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        Driving
                      </span>
                    )}
                    {stop.type === 'activity' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
                        Activity
                      </span>
                    )}
                    {stop.type === 'accommodation' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary">
                        Accommodation
                      </span>
                    )}
                  </div>
                )}
                {!stop.time && (
                  <div className="flex items-center gap-2 mb-1">
                    {stop.type === 'drive' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        Driving
                      </span>
                    )}
                    {stop.type === 'activity' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
                        Activity
                      </span>
                    )}
                    {stop.type === 'accommodation' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary">
                        Accommodation
                      </span>
                    )}
                  </div>
                )}
                <h4 className="font-semibold text-foreground mb-1">{stop.location}</h4>
                {stop.type === 'drive' && (stop.drivingTime || stop.distance) && (
                  <div className="flex gap-3 mb-1">
                    {stop.drivingTime && (
                      <span className="text-sm text-muted-foreground">⏱ {stop.drivingTime}</span>
                    )}
                    {stop.distance && (
                      <span className="text-sm text-muted-foreground">📍 {stop.distance}</span>
                    )}
                  </div>
                )}
                {stop.notes && (
                  <p className="text-sm text-muted-foreground">{stop.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {stop.coordinates && (
                  <MapPin className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isHighlighted ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
                {onEditStop && onSaveEdit && onCancelEdit && (
                  <Popover open={isEditing} onOpenChange={(open) => !open && onCancelEdit()}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStop(stop.id);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0" align="end" side="left">
                      <EditEventForm
                        stop={stop}
                        onSave={(stopId, updatedStop) => onSaveEdit(stopId, updatedStop)}
                        onCancel={onCancelEdit}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                {onDeleteStop && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteStop(stop.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add button on timeline between stops */}
      {!isLast && onAddEvent && (
        <div className="relative flex justify-start h-12 ml-5">
          <div className="absolute left-0 top-0 w-0.5 h-full -ml-px bg-border" />
          <Popover open={showAddAfterPopover} onOpenChange={setShowAddAfterPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 -ml-4 h-8 w-8 rounded-full bg-background border-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:scale-110 transition-all"
                title="Add event after this"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start" side="right">
              <AddEventForm
                onAddEvent={(event) => {
                  onAddEvent(event, index + 1);
                  setShowAddAfterPopover(false);
                }}
                onCancel={() => setShowAddAfterPopover(false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

const getStopIcon = (type: Stop['type'], activityIcon?: Stop['activityIcon']) => {
  if (type === 'activity' && activityIcon) {
    switch (activityIcon) {
      case 'hiking':
        return Mountain;
      case 'food':
        return Utensils;
      case 'sightseeing':
        return Eye;
      case 'camera':
        return Camera;
      case 'coffee':
        return Coffee;
    }
  }
  
  switch (type) {
    case 'drive':
      return Car;
    case 'activity':
      return Camera;
    case 'accommodation':
      return Hotel;
    default:
      return MapPin;
  }
};

const TimelineView = ({ day, onStopClick, highlightedStopId, onEditStop, editingStopId, onSaveEdit, onCancelEdit, onDeleteStop, onAddEvent, onReorderStops }: TimelineViewProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = day.stops.findIndex((stop) => stop.id === active.id);
      const newIndex = day.stops.findIndex((stop) => stop.id === over.id);
      
      const reorderedStops = arrayMove(day.stops, oldIndex, newIndex);
      
      // Check for time conflicts
      const hasConflict = checkTimeConflicts(reorderedStops);
      
      if (hasConflict) {
        toast.error("Cannot reorder: times would be out of sequence");
        return;
      }
      
      onReorderStops?.(reorderedStops);
    }
  };

  const checkTimeConflicts = (stops: Stop[]): boolean => {
    for (let i = 0; i < stops.length - 1; i++) {
      const currentTime = stops[i].time;
      const nextTime = stops[i + 1].time;
      
      if (currentTime && nextTime && currentTime >= nextTime) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={day.stops.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {day.stops.map((stop, index) => {
              const isLast = index === day.stops.length - 1;
              const isHighlighted = highlightedStopId === stop.id;
              const isEditing = editingStopId === stop.id;
              
              return (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isLast={isLast}
                  isHighlighted={isHighlighted}
                  isEditing={isEditing}
                  onStopClick={onStopClick}
                  onEditStop={onEditStop}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onDeleteStop={onDeleteStop}
                  onAddEvent={onAddEvent}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TimelineView;
