import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, LogOut, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  created_at: string;
}

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
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

  const handleCreateTrip = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          user_id: user?.id,
          title: "New Road Trip",
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: format(new Date(), "yyyy-MM-dd"),
          trip_data: { days: [] },
        })
        .select()
        .single();

      if (error) throw error;
      
      navigate(`/plan/${data.id}`);
      toast({
        title: "Trip Created",
        description: "Your new trip has been created!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Trips</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Trip Card */}
          <Card
            onClick={handleCreateTrip}
            className="cursor-pointer border-2 border-dashed hover:border-primary hover:bg-accent/50 transition-all flex items-center justify-center min-h-[280px]"
          >
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Create New Trip</h3>
              <p className="text-sm text-muted-foreground">Start planning your next adventure</p>
            </div>
          </Card>

          {/* Trip Cards */}
          {trips.map((trip) => (
            <Card
              key={trip.id}
              onClick={() => navigate(`/plan/${trip.id}`)}
              className="cursor-pointer hover:shadow-lg transition-all overflow-hidden group min-h-[280px]"
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {trip.cover_image ? (
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MapPin className="w-16 h-16 text-primary/40" />
                )}
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
            <p className="text-muted-foreground mb-4">No trips yet. Create your first one!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTripsPage;
