import { useState } from "react";
import { Stop } from "@/types/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

interface EditEventFormProps {
  stop: Stop;
  onSave: (stopId: string, updatedStop: Omit<Stop, "id">) => void;
  onCancel: () => void;
}

const EditEventForm = ({ stop, onSave, onCancel }: EditEventFormProps) => {
  const [time, setTime] = useState(stop.time);
  const [location, setLocation] = useState(stop.location);
  const [type, setType] = useState<"drive" | "activity" | "stop">(stop.type);
  const [notes, setNotes] = useState(stop.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) return;

    onSave(stop.id, {
      time,
      location,
      type,
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
          <Select value={type} onValueChange={(value: "drive" | "activity" | "stop") => setType(value)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="drive">Drive</SelectItem>
              <SelectItem value="stop">Stop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
