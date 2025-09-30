import { useState } from "react";
import { Stop } from "@/types/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface AddEventFormProps {
  onAddEvent: (event: Omit<Stop, "id">) => void;
  onCancel: () => void;
}

const AddEventForm = ({ onAddEvent, onCancel }: AddEventFormProps) => {
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"drive" | "activity" | "stop">("activity");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!time || !location) return;

    onAddEvent({
      time,
      location,
      type,
      notes: notes || undefined,
      coordinates: undefined, // Users can add coordinates later
    });

    // Reset form
    setTime("");
    setLocation("");
    setType("activity");
    setNotes("");
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
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
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
        <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location..."
          required
          className="h-9"
        />
      </div>

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
        <Button type="submit" className="flex-1 h-9 font-bold uppercase text-xs tracking-wider">
          <Plus className="w-4 h-4 mr-1" />
          Add Event
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4 font-bold uppercase text-xs tracking-wider">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddEventForm;
