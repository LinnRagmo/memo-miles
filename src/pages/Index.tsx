import { useState } from "react";
import { Trip, TripDay } from "@/types/trip";
import TripHeader from "@/components/TripHeader";
import TripTable from "@/components/TripTable";
import DayDetailModal from "@/components/DayDetailModal";
import { toast } from "sonner";

// Sample data
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
          notes: "Breakfast and coffee, explore the area"
        },
        {
          id: "stop-2",
          time: "11:00 AM",
          location: "Drive to Monterey via Highway 1",
          type: "drive",
          notes: "Scenic coastal drive, 2.5 hours"
        },
        {
          id: "stop-3",
          time: "1:30 PM",
          location: "Monterey Bay Aquarium",
          type: "activity",
          notes: "Lunch and visit the famous aquarium"
        },
        {
          id: "stop-4",
          time: "5:00 PM",
          location: "Hotel check-in",
          type: "stop",
          notes: "Monterey Plaza Hotel & Spa"
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
          type: "stop"
        },
        {
          id: "stop-2",
          time: "9:30 AM",
          location: "17-Mile Drive",
          type: "drive",
          notes: "Stop at scenic viewpoints along the way"
        },
        {
          id: "stop-3",
          time: "12:00 PM",
          location: "Carmel-by-the-Sea",
          type: "activity",
          notes: "Lunch and explore the charming town"
        },
        {
          id: "stop-4",
          time: "4:00 PM",
          location: "Point Lobos State Reserve",
          type: "activity",
          notes: "Hiking and wildlife viewing"
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
          type: "drive"
        },
        {
          id: "stop-2",
          time: "10:00 AM",
          location: "Bixby Bridge",
          type: "activity",
          notes: "Iconic photo opportunity"
        },
        {
          id: "stop-3",
          time: "12:30 PM",
          location: "Nepenthe Restaurant",
          type: "stop",
          notes: "Lunch with amazing ocean views"
        },
        {
          id: "stop-4",
          time: "2:30 PM",
          location: "McWay Falls",
          type: "activity",
          notes: "Short hike to waterfall viewpoint"
        }
      ]
    }
  ]
};

const Index = () => {
  const [trip, setTrip] = useState<Trip>(sampleTrip);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      />
    </div>
  );
};

export default Index;
