import { useState, useEffect } from "react";
import { Trip, TripDay, Stop } from "@/types/trip";
import TripHeader from "@/components/TripHeader";
import TripTable from "@/components/TripTable";
import DayDetailModal from "@/components/DayDetailModal";
import { toast } from "sonner";
import { fetchSunriseSunset, parseDate } from "@/lib/sunriseSunset";

// Sample data with coordinates for map display
const sampleTrip: Trip = {
  id: "1",
  title: "Pacific Coast Highway Road Trip",
  startDate: "Jun 15, 2024",
  endDate: "Jun 22, 2024",
  days: [
    {
      id: "day-1",
      date: "Jun 15, 2024",
      drivingTime: "2h 30m",
      activities: "Start in San Francisco, Drive to Monterey",
      notes: "Check out Fisherman's Wharf before leaving",
      stops: [
        {
          id: "stop-1",
          time: "9:00 AM",
          location: "San Francisco - Fisherman's Wharf",
          type: "activity",
          notes: "Breakfast and coffee, explore the area",
          coordinates: [-122.4177, 37.8080]
        },
        {
          id: "stop-2",
          time: "11:00 AM",
          location: "Drive to Monterey via Highway 1",
          type: "drive",
          notes: "Scenic coastal drive, 2.5 hours",
          coordinates: [-121.8947, 36.6002]
        },
        {
          id: "stop-3",
          time: "1:30 PM",
          location: "Monterey Bay Aquarium",
          type: "activity",
          notes: "Lunch and visit the famous aquarium",
          coordinates: [-121.9018, 36.6177]
        },
        {
          id: "stop-4",
          time: "5:00 PM",
          location: "Hotel check-in - Monterey Plaza",
          type: "stop",
          notes: "Monterey Plaza Hotel & Spa",
          coordinates: [-121.8949, 36.6050]
        }
      ]
    },
    {
      id: "day-2",
      date: "Jun 16, 2024",
      drivingTime: "1h 15m",
      activities: "17-Mile Drive, Carmel-by-the-Sea",
      notes: "Take the scenic route",
      stops: [
        {
          id: "stop-1",
          time: "8:00 AM",
          location: "Breakfast at hotel",
          type: "stop",
          coordinates: [-121.8949, 36.6050]
        },
        {
          id: "stop-2",
          time: "9:30 AM",
          location: "17-Mile Drive Entrance",
          type: "drive",
          notes: "Stop at scenic viewpoints along the way",
          coordinates: [-121.9308, 36.5833]
        },
        {
          id: "stop-3",
          time: "11:00 AM",
          location: "Lone Cypress",
          type: "activity",
          notes: "Iconic photo spot",
          coordinates: [-121.9647, 36.5686]
        },
        {
          id: "stop-4",
          time: "12:00 PM",
          location: "Carmel-by-the-Sea",
          type: "activity",
          notes: "Lunch and explore the charming town",
          coordinates: [-121.9233, 36.5552]
        },
        {
          id: "stop-5",
          time: "4:00 PM",
          location: "Point Lobos State Reserve",
          type: "activity",
          notes: "Hiking and wildlife viewing",
          coordinates: [-121.9499, 36.5184]
        }
      ]
    },
    {
      id: "day-3",
      date: "Jun 17, 2024",
      drivingTime: "3h 45m",
      activities: "Big Sur scenic drive",
      notes: "Plan for photo stops",
      stops: [
        {
          id: "stop-1",
          time: "8:30 AM",
          location: "Depart Monterey",
          type: "drive",
          coordinates: [-121.8949, 36.6050]
        },
        {
          id: "stop-2",
          time: "10:00 AM",
          location: "Bixby Bridge",
          type: "activity",
          notes: "Iconic photo opportunity",
          coordinates: [-121.9021, 36.3716]
        },
        {
          id: "stop-3",
          time: "12:30 PM",
          location: "Nepenthe Restaurant",
          type: "stop",
          notes: "Lunch with amazing ocean views",
          coordinates: [-121.8692, 36.2694]
        },
        {
          id: "stop-4",
          time: "2:30 PM",
          location: "McWay Falls",
          type: "activity",
          notes: "Short hike to waterfall viewpoint",
          coordinates: [-121.6711, 36.1597]
        },
        {
          id: "stop-5",
          time: "5:00 PM",
          location: "Ragged Point",
          type: "stop",
          notes: "End of day destination",
          coordinates: [-121.3142, 35.7795]
        }
      ]
    }
  ]
};

const Index = () => {
  const [trip, setTrip] = useState<Trip>(sampleTrip);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <TripHeader
        title={trip.title}
        startDate={trip.startDate}
        endDate={trip.endDate}
        onAddDay={handleAddDay}
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
    </div>
  );
};

export default Index;
