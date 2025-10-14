import { useState } from "react";
import { Stop } from "@/types/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Mountain, Utensils, Camera, Coffee, Eye, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFavorites } from "@/contexts/FavoritesContext";

interface AddEventFormProps {
  onAddEvent: (event: Omit<Stop, "id">) => void;
  onCancel: () => void;
}

const activityIcons = [
  { value: 'hiking', label: 'Hiking', icon: Mountain },
  { value: 'food', label: 'Food/Dining', icon: Utensils },
  { value: 'sightseeing', label: 'Sightseeing', icon: Eye },
  { value: 'camera', label: 'Photography', icon: Camera },
  { value: 'coffee', label: 'Coffee/Cafe', icon: Coffee },
] as const;

const AddEventForm = ({ onAddEvent, onCancel }: AddEventFormProps) => {
  const { favorites } = useFavorites();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [type, setType] = useState<"drive" | "activity" | "accommodation">("activity");
  const [activityIcon, setActivityIcon] = useState<"hiking" | "food" | "sightseeing" | "camera" | "coffee">("hiking");
  const [notes, setNotes] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [favoritePopoverOpen, setFavoritePopoverOpen] = useState(false);
  const [drivingTime, setDrivingTime] = useState("");
  const [distance, setDistance] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on type
    if (type === "drive") {
      if (!startLocation || !endLocation) {
        toast.error("Please enter both start and end locations for the drive");
        return;
      }
    } else {
      if (!location) return;
    }

    let eventData: Omit<Stop, "id"> = {
      time,
      location: type === "drive" ? `${startLocation} to ${endLocation}` : location,
      type,
      activityIcon: type === "activity" ? activityIcon : undefined,
      notes: notes || undefined,
      coordinates: undefined,
    };

    // For drive type, use hard-coded values
    if (type === "drive") {
      const hardCodedDrivingTime = "3h 15 min";
      const hardCodedDistance = "2190 km";
      
      eventData = {
        ...eventData,
        startLocation,
        endLocation,
        drivingTime: hardCodedDrivingTime,
        distance: hardCodedDistance,
      };
      setDrivingTime(hardCodedDrivingTime);
      setDistance(hardCodedDistance);
    }

    // For accommodation, if time is evening (after 6 PM), suggest next day morning
    if (type === "accommodation" && time) {
      const [hours] = time.split(':').map(Number);
      if (hours >= 18) {
        eventData.time = "08:00";
      }
    }

    onAddEvent(eventData);

    // Reset form
    setTime("");
    setLocation("");
    setStartLocation("");
    setEndLocation("");
    setType("activity");
    setActivityIcon("hiking");
    setNotes("");
    setDrivingTime("");
    setDistance("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Add New Event</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label htmlFor="time" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Time (Optional)
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-9"
            placeholder="Optional"
          />
          {type === "accommodation" && time && (
            <p className="text-xs text-muted-foreground mt-1">
              {parseInt(time.split(':')[0]) >= 18 ? "Will show as next morning" : "Check-in time"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="type" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Type
          </Label>
          <Select value={type} onValueChange={(value: "drive" | "activity" | "accommodation") => setType(value)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="drive">Drive</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {type === "activity" && (
        <div className="mb-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Activity Icon
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {activityIcons.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActivityIcon(value)}
                className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                  activityIcon === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight text-center">{label.split('/')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {type === "drive" ? (
        <>
          <div className="mb-3">
            <Label htmlFor="startLocation" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Start Location
            </Label>
            <Input
              id="startLocation"
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter start location..."
              required
              className="h-9"
            />
          </div>
          <div className="mb-3">
            <Label htmlFor="endLocation" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              End Location
            </Label>
            <Input
              id="endLocation"
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="Enter end location..."
              required
              className="h-9"
            />
          </div>
          
          {drivingTime && (
            <div className="p-3 bg-muted/50 rounded-md border border-border">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Driving Time:</span> {drivingTime}
              </p>
              {distance && (
                <p className="text-sm text-muted-foreground mt-1">
                  Distance: {distance}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mb-3">
          <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Location
          </Label>
          <div className="relative">
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (e.g., Malmö, Sweden)..."
              required
              className="h-9 pr-10"
            />
            <Popover open={favoritePopoverOpen} onOpenChange={setFavoritePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0 hover:bg-transparent"
                >
                  <Heart className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border">
                  <h4 className="text-sm font-semibold">Favorite Places</h4>
                </div>
                <ScrollArea className="h-64">
                  {favorites.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No favorite places yet
                    </div>
                  ) : (
                    <div className="p-2">
                      {favorites.map((favorite) => (
                        <button
                          key={favorite.id}
                          type="button"
                          onClick={() => {
                            setLocation(favorite.name);
                            setFavoritePopoverOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors mb-1"
                        >
                          <div className="font-medium text-sm">{favorite.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {favorite.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            From: {favorite.tripTitle}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={calculating} className="flex-1 h-9 font-bold uppercase text-xs tracking-wider">
          {calculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Calculating Route...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={calculating} className="h-9 px-4 font-bold uppercase text-xs tracking-wider">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddEventForm;
