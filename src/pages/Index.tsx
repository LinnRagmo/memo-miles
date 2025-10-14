import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trip, TripDay, Stop } from "@/types/trip";
import TripTable from "@/components/TripTable";
import DayDetailModal from "@/components/DayDetailModal";
import TotalRouteModal from "@/components/TotalRouteModal";
import { PlanSidebar } from "@/components/PlanSidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Map, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { fetchSunriseSunset, parseDate } from "@/lib/sunriseSunset";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, eachDayOfInterval, parseISO, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Sample data removed - trips are now loaded from database

const Index = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTotalRouteOpen, setIsTotalRouteOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<{ location: string; description: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load trip from database
  useEffect(() => {
    if (!tripId || !user) return;

    const loadTrip = async () => {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", tripId)
          .single();

        if (error) throw error;

        // Convert database format to Trip format
        const tripData = data.trip_data as unknown as { days: TripDay[] };
        
        // Generate days automatically based on start and end dates
        let daysArray = tripData?.days || [];
        
        // If no days exist, generate them from the date range
        if (daysArray.length === 0) {
          const startDate = parseISO(data.start_date);
          const endDate = parseISO(data.end_date);
          const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
          
          daysArray = dateRange.map((date, index) => ({
            id: `day-${index + 1}`,
            date: format(date, "MMM d, yyyy"),
            drivingTime: "",
            activities: "",
            notes: "",
            stops: []
          }));
        }
        
        const loadedTrip: Trip = {
          id: data.id,
          title: data.title,
          startDate: format(new Date(data.start_date), "MMM d, yyyy"),
          endDate: format(new Date(data.end_date), "MMM d, yyyy"),
          days: daysArray,
        };

        setTrip(loadedTrip);
        
        // Save generated days back to database if they were created
        if (tripData?.days.length === 0 && daysArray.length > 0) {
          await supabase
            .from("trips")
            .update({ trip_data: { days: daysArray } as any })
            .eq("id", data.id);
        }
      } catch (error: any) {
        toast.error("Failed to load trip");
        navigate("/plan");
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, user, navigate]);

  // Save trip to database
  const saveTrip = async (updatedTrip: Trip) => {
    if (!tripId) return;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          title: updatedTrip.title,
          trip_data: { days: updatedTrip.days } as any,
        })
        .eq("id", tripId);

      if (error) throw error;
    } catch (error: any) {
      toast.error("Failed to save changes");
    }
  };

  // Fetch sunrise/sunset times for all days
  useEffect(() => {
    if (!trip) return;

    const fetchAllSunriseSunset = async () => {
      const updatedDays = await Promise.all(
        trip.days.map(async (day) => {
          const firstStop = day.stops.find(stop => stop.coordinates);
          if (!firstStop?.coordinates) return day;

          const [lng, lat] = firstStop.coordinates;
          const date = parseDate(day.date);
          const sunData = await fetchSunriseSunset(lat, lng, date);

          if (sunData) {
            return { ...day, sunrise: sunData.sunrise, sunset: sunData.sunset };
          }
          return day;
        })
      );

      const updatedTrip = { ...trip, days: updatedDays };
      setTrip(updatedTrip);
      saveTrip(updatedTrip);
    };

    fetchAllSunriseSunset();
  }, [trip?.id]); // Only when trip ID changes

  const handleDayClick = (day: TripDay) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleDateChange = async (newStartDate: Date, newEndDate: Date) => {
    if (!trip || !tripId) return;

    if (newEndDate < newStartDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    const oldStartDate = parseISO(format(new Date(trip.startDate), "yyyy-MM-dd"));
    const oldEndDate = parseISO(format(new Date(trip.endDate), "yyyy-MM-dd"));
    const oldDuration = differenceInDays(oldEndDate, oldStartDate) + 1;
    const newDuration = differenceInDays(newEndDate, newStartDate) + 1;

    let updatedDays = [...trip.days];

    if (oldDuration === newDuration) {
      // Duration stays same - shift dates
      const newDateRange = eachDayOfInterval({ start: newStartDate, end: newEndDate });
      updatedDays = trip.days.map((day, index) => ({
        ...day,
        date: format(newDateRange[index], "MMM d, yyyy")
      }));
    } else if (newDuration > oldDuration) {
      // Extended - add empty days at end
      const additionalDays = newDuration - oldDuration;
      const newDateRange = eachDayOfInterval({ start: newStartDate, end: newEndDate });
      
      updatedDays = trip.days.map((day, index) => ({
        ...day,
        date: format(newDateRange[index], "MMM d, yyyy")
      }));
      
      for (let i = 0; i < additionalDays; i++) {
        const dayIndex = oldDuration + i;
        updatedDays.push({
          id: `day-${Date.now()}-${i}`,
          date: format(newDateRange[dayIndex], "MMM d, yyyy"),
          drivingTime: "",
          activities: "",
          notes: "",
          stops: []
        });
      }
    } else {
      // Shortened - remove days from end
      const daysToRemove = oldDuration - newDuration;
      updatedDays = trip.days.slice(0, newDuration);
      
      const newDateRange = eachDayOfInterval({ start: newStartDate, end: newEndDate });
      updatedDays = updatedDays.map((day, index) => ({
        ...day,
        date: format(newDateRange[index], "MMM d, yyyy")
      }));
    }

    const updatedTrip = {
      ...trip,
      startDate: format(newStartDate, "MMM d, yyyy"),
      endDate: format(newEndDate, "MMM d, yyyy"),
      days: updatedDays
    };

    setTrip(updatedTrip);

    // Save to database
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          start_date: format(newStartDate, "yyyy-MM-dd"),
          end_date: format(newEndDate, "yyyy-MM-dd"),
          trip_data: { days: updatedDays } as any,
        })
        .eq("id", tripId);

      if (error) throw error;
      toast.success("Trip dates updated");
    } catch (error: any) {
      toast.error("Failed to update dates");
    }
  };

  const handleUpdateDay = (dayId: string, field: keyof TripDay, value: string) => {
    if (!trip) return;
    
    const updatedTrip = {
      ...trip,
      days: trip.days.map(day =>
        day.id === dayId ? { ...day, [field]: value } : day
      )
    };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
  };

  const handleAddDay = async (insertIndex: number) => {
    if (!trip || !tripId) return;

    const newDays = [...trip.days];
    
    // Calculate the date for the new day
    let newDate: Date;
    if (insertIndex === 0) {
      // Adding before first day
      newDate = addDays(new Date(trip.days[0].date), -1);
    } else if (insertIndex >= newDays.length) {
      // Adding after last day
      newDate = addDays(new Date(trip.days[trip.days.length - 1].date), 1);
    } else {
      // Adding between days - use the date at insertIndex
      newDate = new Date(trip.days[insertIndex].date);
      // Shift all subsequent days forward by 1
      for (let i = insertIndex; i < newDays.length; i++) {
        newDays[i] = {
          ...newDays[i],
          date: format(addDays(new Date(newDays[i].date), 1), "MMM d, yyyy")
        };
      }
    }

    const newDay: TripDay = {
      id: `day-${Date.now()}`,
      date: format(newDate, "MMM d, yyyy"),
      drivingTime: "",
      activities: "",
      notes: "",
      stops: []
    };

    newDays.splice(insertIndex, 0, newDay);

    // Calculate new start and end dates from the updated days array
    const newStartDate = new Date(newDays[0].date);
    const newEndDate = new Date(newDays[newDays.length - 1].date);

    const updatedTrip = {
      ...trip,
      startDate: format(newStartDate, "MMM d, yyyy"),
      endDate: format(newEndDate, "MMM d, yyyy"),
      days: newDays
    };
    
    setTrip(updatedTrip);

    // Save to database with updated dates
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          start_date: format(newStartDate, "yyyy-MM-dd"),
          end_date: format(newEndDate, "yyyy-MM-dd"),
          trip_data: { days: newDays } as any,
        })
        .eq("id", tripId);

      if (error) throw error;
      toast.success("Day added");
    } catch (error: any) {
      toast.error("Failed to add day");
    }
  };

  const handleRemoveDay = async (dayId: string) => {
    if (!trip || !tripId) return;

    const dayIndex = trip.days.findIndex(day => day.id === dayId);
    if (dayIndex === -1) return;

    // Create a copy and remove the day
    const updatedDays = trip.days.filter(day => day.id !== dayId);
    
    if (updatedDays.length === 0) {
      toast.error("Cannot remove the last day");
      return;
    }

    // Shift all subsequent days back by one day
    for (let i = dayIndex; i < updatedDays.length; i++) {
      const currentDate = new Date(updatedDays[i].date);
      updatedDays[i] = {
        ...updatedDays[i],
        date: format(addDays(currentDate, -1), "MMM d, yyyy")
      };
    }

    // Calculate new start and end dates from the updated days array
    const newStartDate = new Date(updatedDays[0].date);
    const newEndDate = new Date(updatedDays[updatedDays.length - 1].date);

    const updatedTrip = {
      ...trip,
      startDate: format(newStartDate, "MMM d, yyyy"),
      endDate: format(newEndDate, "MMM d, yyyy"),
      days: updatedDays
    };
    
    setTrip(updatedTrip);

    // Save to database with updated dates
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          start_date: format(newStartDate, "yyyy-MM-dd"),
          end_date: format(newEndDate, "yyyy-MM-dd"),
          trip_data: { days: updatedDays } as any,
        })
        .eq("id", tripId);

      if (error) throw error;
      toast.success("Day removed");
    } catch (error: any) {
      toast.error("Failed to remove day");
    }
  };


  const handleAddEvent = (dayId: string, event: Omit<Stop, "id">, insertAtIndex?: number) => {
    if (!trip) return;

    const newStop: Stop = {
      ...event,
      id: `stop-${Date.now()}`,
    };

    const updatedTrip = {
      ...trip,
      days: trip.days.map(day => {
        if (day.id === dayId) {
          const newStops = [...day.stops];
          if (insertAtIndex !== undefined) {
            newStops.splice(insertAtIndex, 0, newStop);
          } else {
            newStops.push(newStop);
          }
          return { ...day, stops: newStops };
        }
        return day;
      })
    };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);

    // Update selectedDay to reflect the new stop
    setSelectedDay(prev => {
      if (prev && prev.id === dayId) {
        const newStops = [...prev.stops];
        if (insertAtIndex !== undefined) {
          newStops.splice(insertAtIndex, 0, newStop);
        } else {
          newStops.push(newStop);
        }
        return { ...prev, stops: newStops };
      }
      return prev;
    });

    toast.success("Event added successfully!");
  };

  const handleUpdateEvent = (dayId: string, stopId: string, updatedStop: any) => {
    if (!trip) return;

    // Handle reordering case
    if (updatedStop && 'stops' in updatedStop && Array.isArray(updatedStop.stops)) {
      const updatedTrip = {
        ...trip,
        days: trip.days.map(day =>
          day.id === dayId ? { ...day, stops: updatedStop.stops } : day
        )
      };
      setTrip(updatedTrip);
      saveTrip(updatedTrip);

      // Update selectedDay
      setSelectedDay(prev => 
        prev && prev.id === dayId ? { ...prev, stops: updatedStop.stops } : prev
      );

      toast.success("Activities reordered!");
      return;
    }

    // Handle normal update case
    const updatedTrip = {
      ...trip,
      days: trip.days.map(day =>
        day.id === dayId
          ? { 
              ...day, 
              stops: day.stops.map(stop => 
                stop.id === stopId ? { ...updatedStop, id: stopId } : stop
              )
            }
          : day
      )
    };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);

    // Update selectedDay to reflect the changes
    setSelectedDay(prev => 
      prev && prev.id === dayId
        ? { 
            ...prev, 
            stops: prev.stops.map(stop => 
              stop.id === stopId ? { ...updatedStop, id: stopId } : stop
            )
          }
        : prev
    );

    toast.success("Event updated successfully!");
  };

  const handleDeleteEvent = (dayId: string, stopId: string) => {
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      days: trip.days.map(day =>
        day.id === dayId
          ? { ...day, stops: day.stops.filter(stop => stop.id !== stopId) }
          : day
      )
    };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);

    // Update selectedDay to reflect the deletion
    setSelectedDay(prev => 
      prev && prev.id === dayId
        ? { ...prev, stops: prev.stops.filter(stop => stop.id !== stopId) }
        : prev
    );

    toast.success("Event deleted successfully!");
  };

  const handleAddFavoriteToDay = (place: { location: string; description: string; coordinates?: [number, number] }) => {
    if (!selectedDay) {
      toast.error("Please select a day first");
      return;
    }

    const newStop: Omit<Stop, "id"> = {
      time: "",
      location: place.location,
      type: "activity",
      notes: place.description,
      coordinates: place.coordinates,
    };

    handleAddEvent(selectedDay.id, newStop);
  };

  const handleMoveActivity = (fromDayId: string, toDayId: string, stopId: string, targetIndex?: number) => {
    if (!trip) return;

    // Find the stop to move
    const fromDay = trip.days.find(d => d.id === fromDayId);
    const stopToMove = fromDay?.stops.find(s => s.id === stopId);
    
    if (!stopToMove) return;

    // Remove from old day and add to new day at specific index
    const updatedTrip = {
      ...trip,
      days: trip.days.map(day => {
        if (day.id === fromDayId) {
          return { ...day, stops: day.stops.filter(s => s.id !== stopId) };
        }
        if (day.id === toDayId) {
          const newStops = [...day.stops];
          if (targetIndex !== undefined) {
            newStops.splice(targetIndex, 0, stopToMove);
          } else {
            newStops.push(stopToMove);
          }
          return { ...day, stops: newStops };
        }
        return day;
      })
    };

    setTrip(updatedTrip);
    saveTrip(updatedTrip);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Trip not found</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const { active } = event;
        
        if (active.data.current?.type === 'favorite') {
          setActiveDragItem({
            location: active.data.current.location,
            description: active.data.current.notes,
          });
        }
      }}
      onDragEnd={(event) => {
        const { active, over } = event;
        
        setActiveDragItem(null);

        if (!over || !active.data.current) return;

        // Handle dragging from favorites
        if (active.data.current.type === 'favorite') {
          const toDayId = over.id as string;
          const targetDay = trip?.days.find(d => d.id === toDayId);
          
          if (!targetDay) return;

          const newStop: Omit<Stop, "id"> = {
            time: "",
            location: active.data.current.location,
            type: "activity",
            notes: active.data.current.notes,
            coordinates: active.data.current.coordinates,
          };

          handleAddEvent(toDayId, newStop);
        }
      }}
    >
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        {isFavoritesOpen && <PlanSidebar onAddToDay={handleAddFavoriteToDay} onClose={() => setIsFavoritesOpen(false)} />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-card shadow-soft">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
              className="flex-shrink-0"
            >
              <Heart className={cn("w-4 h-4", isFavoritesOpen && "fill-primary text-primary")} />
            </Button>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{trip.title}</h1>
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
                        {trip.startDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(trip.startDate)}
                        onSelect={(date) => date && handleDateChange(date, new Date(trip.endDate))}
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
                        {trip.endDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(trip.endDate)}
                        onSelect={(date) => date && handleDateChange(new Date(trip.startDate), date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button onClick={() => setIsTotalRouteOpen(true)} variant="outline" className="shadow-soft">
                <Map className="w-4 h-4 mr-2" />
                Show Total Route
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <TripTable
              days={trip.days}
              onDayClick={handleDayClick}
              onUpdateDay={handleUpdateDay}
              onMoveActivity={handleMoveActivity}
              onAddDay={handleAddDay}
              onRemoveDay={handleRemoveDay}
            />
          </div>

          <DayDetailModal
            day={selectedDay}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />

          <TotalRouteModal
            trip={trip}
            isOpen={isTotalRouteOpen}
            onClose={() => setIsTotalRouteOpen(false)}
          />
        </div>
      </div>

      <DragOverlay>
        {activeDragItem ? (
          <div className="bg-card rounded-md p-3 border-2 border-primary shadow-lg w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{activeDragItem.location}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{activeDragItem.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Index;
