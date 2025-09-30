import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import samplePhoto1 from "@/assets/journal-sample-1.jpg";
import samplePhoto2 from "@/assets/journal-sample-2.jpg";
import samplePhoto3 from "@/assets/journal-sample-3.jpg";
import samplePhoto4 from "@/assets/journal-sample-4.jpg";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  notes: string;
  photos: string[];
}

const templateEntry: JournalEntry = {
  id: "template-1",
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  title: "Pacific Coast Highway - Day 3",
  notes: "The drive from Big Sur to Santa Barbara was absolutely breathtaking. We stopped at multiple scenic overlooks and watched the sunset from a clifftop viewpoint. The winding roads hugged the coastline, offering stunning ocean views at every turn.\n\nHighlight of the day was finding a secluded beach where we had a campfire dinner under the stars. The sound of waves crashing against the rocks was therapeutic. Can't wait to come back here someday.",
  photos: [samplePhoto1, samplePhoto2, samplePhoto3, samplePhoto4],
};

const JournalPage = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    notes: "",
    photos: [] as string[],
  });

  // Load entries from localStorage on mount, or use template if empty
  useEffect(() => {
    const stored = localStorage.getItem("journal-entries");
    if (stored) {
      const parsed = JSON.parse(stored);
      setEntries(parsed.length > 0 ? parsed : [templateEntry]);
    } else {
      setEntries([templateEntry]);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("journal-entries", JSON.stringify(entries));
  }, [entries]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFiles = 5;
    const currentPhotoCount = newEntry.photos.length;

    if (currentPhotoCount + files.length > maxFiles) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${maxFiles} photos per entry.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Each photo must be under 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewEntry((prev) => ({
            ...prev,
            photos: [...prev.photos, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setNewEntry((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEntry = () => {
    if (!newEntry.title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title to your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: newEntry.title,
      notes: newEntry.notes,
      photos: newEntry.photos,
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: "", notes: "", photos: [] });
    setIsCreating(false);

    toast({
      title: "Entry saved",
      description: "Your journal entry has been added.",
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    toast({
      title: "Entry deleted",
      description: "Your journal entry has been removed.",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Travel Journal</h1>
          <p className="text-muted-foreground text-lg">Document your adventures and memories</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Create New Entry Form */}
      {isCreating && (
        <Card className="mb-8 border-2 border-border">
          <CardHeader>
            <CardTitle>Create Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your entry a title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Write about your experience..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                rows={6}
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos (up to 5)</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="gap-2" asChild>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    Upload Photos
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {newEntry.photos.length} / 5 photos
                </span>
              </div>

              {newEntry.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {newEntry.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border-2 border-border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEntry}>Save Entry</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries List */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No journal entries yet</p>
              <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="border-2 border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{entry.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {entry.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {entry.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${entry.title} - Photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md border border-border"
                      />
                    ))}
                  </div>
                )}

                {entry.notes && (
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalPage;
