import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, User, Calendar, Heart, Trash2 } from "lucide-react";

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
  if (!trip) return null;

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
              <Badge className="gap-1 bg-primary text-primary-foreground backdrop-blur pointer-events-none">
                <Clock className="w-3 h-3" />
                {trip.duration}
              </Badge>
              <Badge className="bg-primary text-primary-foreground backdrop-blur pointer-events-none">
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
