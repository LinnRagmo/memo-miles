import { useState } from "react";
import { Stop } from "@/types/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Mountain, Utensils, Camera, Coffee, Eye } from "lucide-react";

const activityIcons = [
  { value: 'hiking', label: 'Hiking', icon: Mountain },
  { value: 'food', label: 'Food/Dining', icon: Utensils },
  { value: 'sightseeing', label: 'Sightseeing', icon: Eye },
  { value: 'camera', label: 'Photography', icon: Camera },
  { value: 'coffee', label: 'Coffee/Cafe', icon: Coffee },
] as const;

interface EditEventFormProps {
  stop: Stop;
  onSave: (stopId: string, updatedStop: Omit<Stop, "id">) => void;
  onCancel: () => void;
}

const EditEventForm = ({ stop, onSave, onCancel }: EditEventFormProps) => {
  const [time, setTime] = useState(stop.time);
  const [location, setLocation] = useState(stop.location);
  const [type, setType] = useState<"drive" | "activity" | "accommodation">(stop.type);
  const [activityIcon, setActivityIcon] = useState<"hiking" | "food" | "sightseeing" | "camera" | "coffee">(stop.activityIcon || "hiking");
  const [notes, setNotes] = useState(stop.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) return;

    onSave(stop.id, {
      time,
      location,
      type,
      activityIcon: type === "activity" ? activityIcon : undefined,
      notes: notes || undefined,
      coordinates: stop.coordinates, // Keep existing coordinates
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Edit Event</h3>
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
          <Label htmlFor="edit-time" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Time (Optional)
          </Label>
          <Input
            id="edit-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="edit-type" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
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

      <div className="mb-3">
        <Label htmlFor="edit-location" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Location
        </Label>
        <Input
          id="edit-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location..."
          required
          className="h-9"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="edit-notes" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Notes
        </Label>
        <Textarea
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 h-9 font-bold uppercase text-xs tracking-wider">
          <Save className="w-4 h-4 mr-1" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4 font-bold uppercase text-xs tracking-wider">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditEventForm;
