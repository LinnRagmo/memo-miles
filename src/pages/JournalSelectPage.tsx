import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import tripCoastalImg from "@/assets/trip-coastal.jpg";
import tripMountainImg from "@/assets/trip-mountain.jpg";
import tripDesertImg from "@/assets/trip-desert.jpg";
import tripForestImg from "@/assets/trip-forest.jpg";

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  created_at: string;
}

const defaultTripImages = [
  tripCoastalImg,
  tripMountainImg,
  tripDesertImg,
  tripForestImg,
];

const getDefaultImage = (tripId: string) => {
  const hash = tripId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultTripImages[hash % defaultTripImages.length];
};

const JournalSelectPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/journal-select");
      return;
    }

    fetchTrips();
  }, [user, navigate]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Select a Trip Journal</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              onClick={() => navigate(`/journal/${trip.id}`)}
              className="hover:shadow-lg transition-all overflow-hidden group min-h-[280px] cursor-pointer"
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                <img
                  src={trip.cover_image || getDefaultImage(trip.id)}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {trip.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Trips Yet</h2>
            <p className="text-muted-foreground mb-6">Create a trip first to start journaling!</p>
            <Card
              onClick={() => navigate("/plan")}
              className="cursor-pointer inline-block hover:bg-accent/50 transition-all p-6"
            >
              <p className="text-primary font-semibold">Go to My Trips</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalSelectPage;
