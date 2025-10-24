import { TripDay, Stop } from "@/types/trip";
import { Clock, MapPin, StickyNote, Car, Hotel, Camera, Sunrise, Sunset, GripVertical, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TripTableProps {
  days: TripDay[];
  onDayClick: (day: TripDay) => void;
  onUpdateDay: (dayId: string, field: keyof TripDay, value: string) => void;
  onMoveActivity: (fromDayId: string, toDayId: string, stopId: string, targetIndex?: number) => void;
  onAddDay: (insertIndex: number) => void;
  onRemoveDay: (dayId: string) => void;
  onReorderStops: (dayId: string, oldIndex: number, newIndex: number) => void;
  onReorderDays: (oldIndex: number, newIndex: number) => void;
  activeId?: string | null;
  activeStop?: Stop | null;
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
  isOver?: boolean;
}

const DraggableStop = ({ stop, dayId, day, isOver }: DraggableStopProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
    data: { stop, dayId },
  });
  const { isOver: isDropTarget, setNodeRef: setDroppableRef } = useDroppable({
    id: stop.id,
    data: { stop, dayId },
  });

  // Combine refs for drag and drop
  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    setDroppableRef(el);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-muted/50 rounded-md p-3 border transition-colors ${
        isDragging ? "cursor-grabbing border-primary" : "cursor-grab border-border hover:bg-muted"
      } ${isDropTarget || isOver ? "border-primary border-t-4 bg-primary/10" : ""}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-1" />
        <div className="flex-1">
          {/* Time - only show if it exists */}
          {stop.time && (
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{stop.time}</span>
            </div>
          )}

          {/* Event/Activity */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{getEventIcon(stop.type)}</span>
            <span className="text-sm font-medium text-foreground">{stop.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SortableDayProps {
  day: TripDay;
  dayIndex: number;
  onDayClick: (day: TripDay) => void;
  onRemoveDay: (dayId: string) => void;
  onReorderStops: (dayId: string, oldIndex: number, newIndex: number) => void;
}

const SortableDay = ({ day, dayIndex, onDayClick, onRemoveDay, onReorderStops }: SortableDayProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
    data: { type: "day", day, dayIndex },
  });
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: day.id,
    data: { type: "day", day, dayIndex },
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Combine refs for drag and drop
  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    setDroppableRef(el);
  };

  return (
    <>
      <div
        ref={combinedRef}
        style={style}
        className={`flex-shrink-0 w-[320px] bg-card rounded-lg border-2 overflow-hidden transition-all ${
          isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab"
        } ${isOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:shadow-lg"}`}
      >
        {/* Day Header - with drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="bg-foreground text-background px-4 py-4 border-b-2 border-border relative"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="absolute top-2 right-2 hover:bg-background/20 rounded-full p-1 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-2">
            <GripVertical className="w-5 h-5 mt-0.5 opacity-60" />
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-lg font-bold">{day.date}</span>
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
        </div>

        {/* Events List */}
        <div
          onClick={() => onDayClick(day)}
          className="p-4 space-y-3 min-h-[200px] cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <SortableContext items={day.stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {day.stops.map((stop, index) => {
              // Check if this stop is being hovered over during drag
              const stopIsOver = false; // Will be determined by drag state in parent
              return (
                <DraggableStop 
                  key={stop.id} 
                  stop={stop} 
                  dayId={day.id} 
                  day={day}
                  isOver={stopIsOver}
                />
              );
            })}
          </SortableContext>
          {day.stops.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Click here to add activities</div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Day {dayIndex + 1}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove Day {dayIndex + 1} ({day.date})?
              {day.stops.length > 0 && ` This will delete ${day.stops.length} event${day.stops.length > 1 ? "s" : ""}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemoveDay(day.id)}>Remove Day</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const TripTable = ({
  days,
  onDayClick,
  onUpdateDay,
  onMoveActivity,
  onAddDay,
  onRemoveDay,
  onReorderStops,
  onReorderDays,
  activeId,
  activeStop,
}: TripTableProps) => {
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
    <div className="px-6 py-6">
      <div className="inline-flex items-start gap-2 pb-4">
        {/* Add button before first day */}
        <Button variant="outline" size="icon" className="flex-shrink-0 w-8 h-8 mt-20" onClick={() => onAddDay(0)}>
          <Plus className="w-4 h-4" />
        </Button>

        <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {days.map((day, dayIndex) => (
            <SortableDay
              key={`${day.id}-${day.stops.length}`}
              day={day}
              dayIndex={dayIndex}
              onDayClick={onDayClick}
              onRemoveDay={onRemoveDay}
              onReorderStops={onReorderStops}
            />
          ))}
        </SortableContext>

        {/* Add button after last day */}
        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0 w-8 h-8 mt-20"
          onClick={() => onAddDay(days.length)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <DragOverlay>
        {activeId && activeStop ? (
          <div className="bg-card rounded-md p-3 border-2 border-primary shadow-lg opacity-80 w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{activeStop.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{getEventIcon(activeStop.type)}</span>
              <span className="text-sm font-medium text-foreground">{activeStop.location}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </div>
  );
};

export default TripTable;
