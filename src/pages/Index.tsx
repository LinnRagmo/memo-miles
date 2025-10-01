import { useState, useEffect } from "react";
import { Trip, TripDay, Stop } from "@/types/trip";
import TripHeader from "@/components/TripHeader";
import TripTable from "@/components/TripTable";
import DayDetailModal from "@/components/DayDetailModal";
import TotalRouteModal from "@/components/TotalRouteModal";
import { PlanSidebar } from "@/components/PlanSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { fetchSunriseSunset, parseDate } from "@/lib/sunriseSunset";

// Sample data with coordinates for map display - Great Ocean Road, Australia
const sampleTrip: Trip = {
  id: "1",
  title: "Great Ocean Road Adventure",
  startDate: "Jun 15, 2024",
  endDate: "Jun 17, 2024",
  days: [
    {
      id: "day-1",
      date: "Jun 15, 2024",
      drivingTime: "2h 30m",
      activities: "Melbourne to Torquay and Bells Beach",
      notes: "Start the famous Great Ocean Road journey",
      stops: [
        {
          id: "stop-1",
          time: "9:00 AM",
          location: "Melbourne - Federation Square",
          type: "activity",
          notes: "Breakfast and coffee before departure",
          coordinates: [144.9685, -37.8180]
        },
        {
          id: "stop-2",
          time: "11:00 AM",
          location: "Torquay",
          type: "drive",
          notes: "Gateway to the Great Ocean Road",
          coordinates: [144.3292, -38.3339]
        },
        {
          id: "stop-3",
          time: "12:00 PM",
          location: "Bells Beach",
          type: "activity",
          notes: "Famous surf spot, lunch at surf club",
          coordinates: [144.2825, -38.3686]
        },
        {
          id: "stop-4",
          time: "3:00 PM",
          location: "Lorne",
          type: "stop",
          notes: "Coastal town, beach walk and dinner",
          coordinates: [143.9784, -38.5429]
        }
      ]
    },
    {
      id: "day-2",
      date: "Jun 16, 2024",
      drivingTime: "2h 45m",
      activities: "Apollo Bay and Cape Otway",
      notes: "Rainforest and lighthouse exploration",
      stops: [
        {
          id: "stop-1",
          time: "8:00 AM",
          location: "Lorne Breakfast",
          type: "stop",
          coordinates: [143.9784, -38.5429]
        },
        {
          id: "stop-2",
          time: "9:30 AM",
          location: "Apollo Bay",
          type: "drive",
          notes: "Scenic coastal drive with ocean views",
          coordinates: [143.6711, -38.7571]
        },
        {
          id: "stop-3",
          time: "11:00 AM",
          location: "Great Otway National Park",
          type: "activity",
          notes: "Rainforest walk and waterfalls",
          coordinates: [143.5569, -38.7546]
        },
        {
          id: "stop-4",
          time: "2:00 PM",
          location: "Cape Otway Lighthouse",
          type: "activity",
          notes: "Historic lighthouse and koala spotting",
          coordinates: [143.5117, -38.8570]
        },
        {
          id: "stop-5",
          time: "5:00 PM",
          location: "Port Campbell",
          type: "stop",
          notes: "Overnight stay in coastal village",
          coordinates: [142.9921, -38.6167]
        }
      ]
    },
    {
      id: "day-3",
      date: "Jun 17, 2024",
      drivingTime: "3h 30m",
      activities: "Twelve Apostles and Shipwreck Coast",
      notes: "The iconic limestone formations",
      stops: [
        {
          id: "stop-1",
          time: "7:00 AM",
          location: "Port Campbell Sunrise",
          type: "stop",
          coordinates: [142.9921, -38.6167]
        },
        {
          id: "stop-2",
          time: "8:00 AM",
          location: "Twelve Apostles",
          type: "activity",
          notes: "Iconic rock formations at sunrise",
          coordinates: [143.1043, -38.6656]
        },
        {
          id: "stop-3",
          time: "10:00 AM",
          location: "Loch Ard Gorge",
          type: "activity",
          notes: "Dramatic coastal gorge and shipwreck history",
          coordinates: [143.0915, -38.6725]
        },
        {
          id: "stop-4",
          time: "12:00 PM",
          location: "London Bridge",
          type: "activity",
          notes: "Natural rock arch formation",
          coordinates: [142.9877, -38.6369]
        },
        {
          id: "stop-5",
          time: "2:00 PM",
          location: "Bay of Islands",
          type: "activity",
          notes: "Coastal viewpoint and photography",
          coordinates: [142.9597, -38.6244]
        },
        {
          id: "stop-6",
          time: "4:00 PM",
          location: "Warrnambool",
          type: "stop",
          notes: "End of Great Ocean Road, return to Melbourne",
          coordinates: [142.4826, -38.3809]
        }
      ]
    }
  ]
};

const Index = () => {
  const [trip, setTrip] = useState<Trip>(sampleTrip);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTotalRouteOpen, setIsTotalRouteOpen] = useState(false);

  // Fetch sunrise/sunset times for all days on mount
  useEffect(() => {
    const fetchAllSunriseSunset = async () => {
      const updatedDays = await Promise.all(
        trip.days.map(async (day) => {
          // Use the first stop's coordinates if available
          const firstStop = day.stops.find(stop => stop.coordinates);
          if (!firstStop?.coordinates) {
            return day;
          }

          const [lng, lat] = firstStop.coordinates;
          const date = parseDate(day.date);
          const sunData = await fetchSunriseSunset(lat, lng, date);

          if (sunData) {
            return { ...day, sunrise: sunData.sunrise, sunset: sunData.sunset };
          }
          return day;
        })
      );

      setTrip(prev => ({ ...prev, days: updatedDays }));
    };

    fetchAllSunriseSunset();
  }, []); // Only run once on mount

  const handleDayClick = (day: TripDay) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleUpdateDay = (dayId: string, field: keyof TripDay, value: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleAddDay = () => {
    const lastDay = trip.days[trip.days.length - 1];
    const newDate = new Date(lastDay.date);
    newDate.setDate(newDate.getDate() + 1);
    
    const newDay: TripDay = {
      id: `day-${trip.days.length + 1}`,
      date: newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      drivingTime: "",
      activities: "",
      notes: "",
      stops: []
    };

    setTrip(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));

    toast.success("New day added to your trip!");
  };

  const handleAddEvent = (dayId: string, event: Omit<Stop, "id">) => {
    const newStop: Stop = {
      ...event,
      id: `stop-${Date.now()}`,
    };

    setTrip(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? { ...day, stops: [...day.stops, newStop] }
          : day
      )
    }));

    // Update selectedDay to reflect the new stop
    setSelectedDay(prev => 
      prev && prev.id === dayId
        ? { ...prev, stops: [...prev.stops, newStop] }
        : prev
    );

    toast.success("Event added successfully!");
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
          />

          <DayDetailModal
            day={selectedDay}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddEvent={handleAddEvent}
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
