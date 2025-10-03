import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, LogOut, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import CreateTripDialog from "@/components/CreateTripDialog";
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
  // Use trip ID to consistently pick the same image for each trip
  const hash = tripId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultTripImages[hash % defaultTripImages.length];
};

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
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

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;

      setTrips(trips.filter(trip => trip.id !== tripId));
      toast({
        title: "Trip Deleted",
        description: "Your trip has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTripToDelete(null);
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
            onClick={() => setIsCreateDialogOpen(true)}
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
              className="hover:shadow-lg transition-all overflow-hidden group min-h-[280px] relative"
            >
              <div 
                onClick={() => navigate(`/plan/${trip.id}`)}
                className="cursor-pointer"
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  <img
                    src={trip.cover_image || getDefaultImage(trip.id)}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {trip.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setTripToDelete(trip.id);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No trips yet. Create your first one!</p>
          </div>
        )}
      </main>

      <CreateTripDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        userId={user?.id || ""}
      />

      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your trip and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tripToDelete && handleDeleteTrip(tripToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTripsPage;
