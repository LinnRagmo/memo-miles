import { TripDay, Stop } from "@/types/trip";
import { Car, MapPin, Coffee, Camera, Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  onDeleteStop?: (stopId: string) => void;
  onAddAfter?: (index: number) => void;
  onReorderStops?: (stops: Stop[]) => void;
}

interface SortableStopProps {
  stop: Stop;
  index: number;
  isLast: boolean;
  isHighlighted: boolean;
  onStopClick?: (stopId: string) => void;
  onEditStop?: (stopId: string) => void;
  onDeleteStop?: (stopId: string) => void;
  onAddAfter?: (index: number) => void;
}

const SortableStop = ({ stop, index, isLast, isHighlighted, onStopClick, onEditStop, onDeleteStop, onAddAfter }: SortableStopProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getStopIcon(stop.type);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`relative flex gap-4 group cursor-pointer transition-all ${
          isHighlighted ? 'scale-[1.02]' : ''
        } ${isDragging ? 'z-50' : ''}`}
        onClick={() => onStopClick?.(stop.id)}
      >
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-5 top-12 w-0.5 h-[calc(100%+3rem)] -ml-px bg-border" />
        )}
        
        {/* Drag Handle & Icon */}
        <div className="flex flex-col items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-soft transition-all ${
            stop.type === 'drive' ? 'bg-primary text-primary-foreground' :
            stop.type === 'activity' ? 'bg-accent text-accent-foreground' :
            'bg-card border-2 border-border text-muted-foreground'
          } ${isHighlighted ? 'ring-4 ring-primary/30 scale-110' : 'group-hover:scale-105'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 pb-6">
          <div className={`bg-card rounded-lg border p-4 shadow-soft transition-all ${
            isHighlighted 
              ? 'border-primary shadow-medium ring-2 ring-primary/20' 
              : 'border-border group-hover:shadow-medium group-hover:border-primary/50'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary">{stop.time || 'Time not set'}</span>
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
                </div>
                <h4 className="font-semibold text-foreground mb-1">{stop.location}</h4>
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
                {onEditStop && (
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
      {!isLast && onAddAfter && (
        <div className="relative flex justify-start h-12 ml-5">
          <div className="absolute left-0 top-0 w-0.5 h-full -ml-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="relative z-10 -ml-4 h-8 w-8 rounded-full bg-background border-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:scale-110 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onAddAfter(index);
            }}
            title="Add event after this"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const getStopIcon = (type: Stop['type']) => {
  switch (type) {
    case 'drive':
      return Car;
    case 'activity':
      return Camera;
    case 'stop':
      return Coffee;
    default:
      return MapPin;
  }
};

const TimelineView = ({ day, onStopClick, highlightedStopId, onEditStop, onDeleteStop, onAddAfter, onReorderStops }: TimelineViewProps) => {
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
              
              return (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isLast={isLast}
                  isHighlighted={isHighlighted}
                  onStopClick={onStopClick}
                  onEditStop={onEditStop}
                  onDeleteStop={onDeleteStop}
                  onAddAfter={onAddAfter}
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
