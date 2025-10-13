import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, User, Calendar, Heart, Trash2, Navigation } from "lucide-react";
import MapView from "./MapView";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoadTripPost {
  id: string;
  title: string;
  description: string;
  duration: string;
  distance: string;
  author: string;
  date: string;
  readTime: string;
  heroImage: string;
  highlights: string[];
  stops: { location: string; description: string }[];
}

interface TripDetailModalProps {
  trip: RoadTripPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFavorite: (stop: { location: string; description: string }, tripTitle: string) => void;
  onDeletePost?: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isUserPost: boolean;
}

const TripDetailModal = ({ 
  trip, 
  isOpen, 
  onClose, 
  onSaveFavorite, 
  onDeletePost,
  isFavorite,
  isUserPost 
}: TripDetailModalProps) => {
  const [stopDistances, setStopDistances] = useState<{ [key: number]: { distance: string; duration: string } }>({});
  const [stopCoordinates, setStopCoordinates] = useState<{ [key: number]: [number, number] }>({});
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!trip || !isOpen) return;

    const calculateDistances = async () => {
      setIsCalculating(true);
      const distances: { [key: number]: { distance: string; duration: string } } = {};
      const coordinates: { [key: number]: [number, number] } = {};

      for (let i = 0; i < trip.stops.length; i++) {
        const stop = trip.stops[i];
        
        // Geocode current stop
        try {
          const geocodeResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(stop.location)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`
          );
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.features && geocodeData.features.length > 0) {
            coordinates[i] = geocodeData.features[0].center;
          }
        } catch (error) {
          console.error(`Error geocoding ${stop.location}:`, error);
        }

        // Calculate distance to next stop
        if (i < trip.stops.length - 1) {
          try {
            const { data, error } = await supabase.functions.invoke('calculate-route', {
              body: { 
                start: trip.stops[i].location, 
                end: trip.stops[i + 1].location 
              }
            });

            if (!error && data) {
              distances[i] = {
                distance: data.distance,
                duration: data.duration
              };
            }
          } catch (error) {
            console.error(`Error calculating route between stops ${i} and ${i + 1}:`, error);
          }
        }
      }

      setStopDistances(distances);
      setStopCoordinates(coordinates);
      setIsCalculating(false);
    };

    calculateDistances();
  }, [trip, isOpen]);

  if (!trip) return null;

  const mapStops = Object.entries(stopCoordinates).map(([index, coords]) => ({
    id: `stop-${index}`,
    location: trip.stops[parseInt(index)].location,
    coordinates: coords,
    time: "00:00",
    type: 'activity' as const
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative">
            <DialogTitle className="text-3xl font-bold pr-10">{trip.title}</DialogTitle>
            {isUserPost && onDeletePost && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-0 right-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePost(trip.id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 overflow-hidden rounded-lg -mx-6">
          <img
            src={trip.heroImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur">
                <Clock className="w-3 h-3" />
                {trip.duration}
              </Badge>
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                {trip.distance}
              </Badge>
            </div>
          </div>
        </div>

        <CardHeader className="space-y-4 px-0">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{trip.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{trip.date}</span>
            </div>
            <div className="text-muted-foreground/80">{trip.readTime}</div>
          </div>

          <CardDescription className="text-base leading-relaxed">
            {trip.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-0">
          {/* Highlights */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Trip Highlights
            </h3>
            <div className="flex flex-wrap gap-2">
              {trip.highlights.map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          {/* Map */}
          {mapStops.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                Route Map
              </h3>
              <div className="h-80 rounded-lg overflow-hidden border">
                <MapView stops={mapStops} />
              </div>
            </div>
          )}

          {/* Stops */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Route & Stops
            </h3>
            <div className="space-y-4">
              {trip.stops.map((stop, index) => (
                <div key={index}>
                  <div className="flex gap-4 items-start group/stop">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-lg mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {stop.location}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">{stop.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2 hover:bg-primary/10 hover:text-primary"
                          onClick={() => onSaveFavorite(stop, trip.title)}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(`${trip.title}-${stop.location}`.replace(/\s+/g, '-').toLowerCase()) ? 'fill-primary text-primary' : ''}`} />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distance to next stop */}
                  {index < trip.stops.length - 1 && (
                    <div className="ml-14 mt-3 mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Navigation className="w-4 h-4" />
                      {isCalculating ? (
                        <span>Calculating route...</span>
                      ) : stopDistances[index] ? (
                        <span>
                          {stopDistances[index].distance} • {stopDistances[index].duration}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailModal;
