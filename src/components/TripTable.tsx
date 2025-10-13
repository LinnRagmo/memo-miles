import { TripDay, Stop } from "@/types/trip";
import { Clock, MapPin, StickyNote, Car, Hotel, Camera, Sunrise, Sunset, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useState } from "react";

interface TripTableProps {
  days: TripDay[];
  onDayClick: (day: TripDay) => void;
  onUpdateDay: (dayId: string, field: keyof TripDay, value: string) => void;
  onMoveActivity: (fromDayId: string, toDayId: string, stopId: string, targetIndex?: number) => void;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case "drive":
      return <Car className="w-4 h-4" />;
    case "accommodation":
      return <Hotel className="w-4 h-4" />;
    case "activity":
      return <Camera className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

interface DraggableStopProps {
  stop: Stop;
  dayId: string;
  day: TripDay;
}

const DraggableStop = ({ stop, dayId, day }: DraggableStopProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${dayId}-${stop.id}`,
    data: { stop, dayId },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-muted/50 rounded-md p-3 border border-border hover:bg-muted transition-colors ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 touch-none">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          {/* Time */}
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{stop.time || 'Time not set'}</span>
          </div>

          {/* Event/Activity */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground">
              {getEventIcon(stop.type)}
            </span>
            <span className="text-sm font-medium text-foreground">
              {stop.location}
            </span>
          </div>

          {/* Driving Time */}
          {stop.type === "drive" && day.drivingTime && (
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{day.drivingTime}</span>
            </div>
          )}

          {/* Notes */}
          {stop.notes && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
              <StickyNote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground">{stop.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DroppableDayProps {
  day: TripDay;
  dayIndex: number;
  onDayClick: (day: TripDay) => void;
}

const DroppableDay = ({ day, dayIndex, onDayClick }: DroppableDayProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: { day },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[320px] bg-card rounded-lg border-2 overflow-hidden transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      {/* Day Header */}
      <div
        onClick={() => onDayClick(day)}
        className="bg-foreground text-background cursor-pointer hover:bg-foreground/90 transition-colors px-4 py-4 border-b-2 border-border"
      >
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">
            {day.date}
          </span>
          <span className="text-sm opacity-80">
            Day {dayIndex + 1} • {day.stops.length} events
          </span>
          {/* Sunrise/Sunset Times */}
          {(day.sunrise || day.sunset) && (
            <div className="flex items-center gap-3 text-xs opacity-90 pt-1">
              {day.sunrise && (
                <div className="flex items-center gap-1.5">
                  <Sunrise className="w-3.5 h-3.5" />
                  <span>{day.sunrise}</span>
                </div>
              )}
              {day.sunset && (
                <div className="flex items-center gap-1.5">
                  <Sunset className="w-3.5 h-3.5" />
                  <span>{day.sunset}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-3 min-h-[200px]">
        {day.stops.map((stop) => (
          <DraggableStop key={stop.id} stop={stop} dayId={day.id} day={day} />
        ))}
        {day.stops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Drop activities here
          </div>
        )}
      </div>
    </div>
  );
};

const TripTable = ({ days, onDayClick, onUpdateDay, onMoveActivity }: TripTableProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStop, setActiveStop] = useState<Stop | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    if (active.data.current) {
      setActiveStop(active.data.current.stop);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveStop(null);

    if (!over || !active.data.current) return;

    const fromDayId = active.data.current.dayId;
    const toDayId = over.id as string;
    const stopId = active.data.current.stop.id;
    const movingStop = active.data.current.stop as Stop;

    if (fromDayId !== toDayId) {
      const targetDay = days.find(d => d.id === toDayId);
      
      if (!targetDay) return;

      // If the activity has no time, allow the move
      if (!movingStop.time) {
        onMoveActivity(fromDayId, toDayId, stopId);
        toast.success("Activity moved to another day");
        return;
      }

      // Parse the moving stop's time
      const movingTime = parseTimeToMinutes(movingStop.time);

      // Find the correct position in target day based on time
      let insertIndex = 0;
      let canInsert = true;

      for (let i = 0; i < targetDay.stops.length; i++) {
        const stop = targetDay.stops[i];
        
        if (!stop.time) {
          insertIndex = i + 1;
          continue;
        }

        const stopTime = parseTimeToMinutes(stop.time);

        // Check if times match exactly (conflict)
        if (stopTime === movingTime) {
          canInsert = false;
          toast.error("Time conflict: An activity already exists at this time");
          return;
        }

        // Find insertion point
        if (stopTime < movingTime) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }

      if (canInsert) {
        onMoveActivity(fromDayId, toDayId, stopId, insertIndex);
        toast.success("Activity moved and placed in chronological order");
      }
    }
  };

  // Helper function to parse time string to minutes since midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (days.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-2">Your trip is empty</p>
          <p className="text-sm text-muted-foreground">Click "Add Day" to start planning your adventure</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto px-6 py-6">
        <div className="overflow-x-auto">
          <div className="inline-flex gap-4 min-w-full pb-4">
            {days.map((day, dayIndex) => (
              <DroppableDay
                key={day.id}
                day={day}
                dayIndex={dayIndex}
                onDayClick={onDayClick}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeStop ? (
          <div className="bg-card rounded-md p-3 border-2 border-primary shadow-lg opacity-80 w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{activeStop.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {getEventIcon(activeStop.type)}
              </span>
              <span className="text-sm font-medium text-foreground">
                {activeStop.location}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TripTable;
