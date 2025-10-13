import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trip, TripDay, Stop } from "@/types/trip";
import TripHeader from "@/components/TripHeader";
import TripTable from "@/components/TripTable";
import DayDetailModal from "@/components/DayDetailModal";
import TotalRouteModal from "@/components/TotalRouteModal";
import { PlanSidebar } from "@/components/PlanSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { fetchSunriseSunset, parseDate } from "@/lib/sunriseSunset";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
        const loadedTrip: Trip = {
          id: data.id,
          title: data.title,
          startDate: format(new Date(data.start_date), "MMM d, yyyy"),
          endDate: format(new Date(data.end_date), "MMM d, yyyy"),
          days: tripData?.days || [],
        };

        setTrip(loadedTrip);
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

  const handleAddDay = () => {
    if (!trip) return;

    const lastDay = trip.days[trip.days.length - 1];
    const newDate = lastDay ? new Date(lastDay.date) : new Date();
    if (lastDay) newDate.setDate(newDate.getDate() + 1);
    
    const newDay: TripDay = {
      id: `day-${trip.days.length + 1}`,
      date: newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      drivingTime: "",
      activities: "",
      notes: "",
      stops: []
    };

    const updatedTrip = {
      ...trip,
      days: [...trip.days, newDay]
    };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    toast.success("New day added to your trip!");
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

  const handleMoveActivity = (fromDayId: string, toDayId: string, stopId: string) => {
    if (!trip) return;

    // Find the stop to move
    const fromDay = trip.days.find(d => d.id === fromDayId);
    const stopToMove = fromDay?.stops.find(s => s.id === stopId);
    
    if (!stopToMove) return;

    // Remove from old day and add to new day
    const updatedTrip = {
      ...trip,
      days: trip.days.map(day => {
        if (day.id === fromDayId) {
          return { ...day, stops: day.stops.filter(s => s.id !== stopId) };
        }
        if (day.id === toDayId) {
          return { ...day, stops: [...day.stops, stopToMove] };
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <PlanSidebar onAddToDay={handleAddFavoriteToDay} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50 backdrop-blur">
            <SidebarTrigger />
          </div>

          <TripHeader
            title={trip.title}
            startDate={trip.startDate}
            endDate={trip.endDate}
            onAddDay={handleAddDay}
            onShowTotalRoute={() => setIsTotalRouteOpen(true)}
          />
          
          <TripTable
            days={trip.days}
            onDayClick={handleDayClick}
            onUpdateDay={handleUpdateDay}
            onMoveActivity={handleMoveActivity}
          />

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
    </SidebarProvider>
  );
};

export default Index;
