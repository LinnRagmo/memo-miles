import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PhotoAlbumView from "@/components/PhotoAlbumView";
import samplePhoto1 from "@/assets/journal-sample-1.jpg";
import samplePhoto2 from "@/assets/journal-sample-2.jpg";
import samplePhoto3 from "@/assets/journal-sample-3.jpg";
import samplePhoto4 from "@/assets/journal-sample-4.jpg";
import desertPhoto1 from "@/assets/journal-desert-1.jpg";
import desertPhoto2 from "@/assets/journal-desert-2.jpg";
import desertPhoto3 from "@/assets/journal-desert-3.jpg";
import mountainPhoto1 from "@/assets/journal-mountains-1.jpg";
import mountainPhoto2 from "@/assets/journal-mountains-2.jpg";
import mountainPhoto3 from "@/assets/journal-mountains-3.jpg";
import beachPhoto1 from "@/assets/journal-beach-1.jpg";
import beachPhoto2 from "@/assets/journal-beach-2.jpg";
import beachPhoto3 from "@/assets/journal-beach-3.jpg";
import fallPhoto1 from "@/assets/journal-fall-1.jpg";
import fallPhoto2 from "@/assets/journal-fall-2.jpg";
import fallPhoto3 from "@/assets/journal-fall-3.jpg";
import fallPhoto4 from "@/assets/journal-fall-4.jpg";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  notes: string;
  photos: string[];
  photoCaptions?: string[];
}

const templateEntries: JournalEntry[] = [
  {
    id: "template-1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Pacific Coast Highway - Day 3",
    notes: "The drive from Big Sur to Santa Barbara was absolutely breathtaking. We stopped at multiple scenic overlooks and watched the sunset from a clifftop viewpoint.",
    photos: [samplePhoto1, samplePhoto2, samplePhoto3, samplePhoto4],
    photoCaptions: [
      "The winding coastal highway offered endless views of the Pacific Ocean",
      "Sunset over the cliffs - one of the most beautiful moments of the trip",
      "Found the perfect spot to park and take in the scenery",
      "Campfire under the stars to end an amazing day"
    ],
  },
  {
    id: "template-2",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Southwest Desert Adventure",
    notes: "Exploring the red rock country was like visiting another planet. The vastness of the desert and the vibrant colors at sunset made this an unforgettable experience.",
    photos: [desertPhoto1, desertPhoto2, desertPhoto3],
    photoCaptions: [
      "Monument Valley at golden hour - the red rocks glowed like fire",
      "Stopped at a classic Route 66 diner for lunch and nostalgia",
      "Desert sunset with saguaro cacti silhouettes against the purple sky"
    ],
  },
  {
    id: "template-3",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Rocky Mountain High",
    notes: "The mountain roads took us through pristine alpine forests and past crystal-clear lakes. Every turn revealed a new postcard-perfect view.",
    photos: [mountainPhoto1, mountainPhoto2, mountainPhoto3],
    photoCaptions: [
      "Mirror-like reflection at dawn - the lake was perfectly still",
      "Hiked to this hidden waterfall deep in the forest",
      "Alpine meadows bursting with wildflowers in full bloom"
    ],
  },
  {
    id: "template-4",
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Tropical Beach Escape",
    notes: "Following the coastline led us to pristine beaches and charming seaside towns. The turquoise water and golden sand made every stop a paradise.",
    photos: [beachPhoto1, beachPhoto2, beachPhoto3],
    photoCaptions: [
      "Private beach cove with crystal-clear turquoise water and swaying palms",
      "Historic lighthouse perched on dramatic cliffs at sunset",
      "Beachside lunch with fresh seafood and ocean views"
    ],
  },
  {
    id: "template-5",
    date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    title: "New England Fall Foliage Tour",
    notes: "Driving through Vermont and New Hampshire during peak fall colors was magical. Every winding country road offered a new explosion of reds, oranges, and golds.",
    photos: [fallPhoto1, fallPhoto2, fallPhoto3, fallPhoto4],
    photoCaptions: [
      "Tunnel of autumn colors on a peaceful country road",
      "Historic covered bridge surrounded by vibrant fall foliage",
      "Stopped at a local farm stand for fresh apple cider and pumpkins",
      "Cozy cabin retreat nestled in the colorful autumn woods"
    ],
  },
];

const JournalPage = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: "",
    notes: "",
    photos: [] as string[],
  });

  // Load entries from localStorage on mount, or use template if empty
  useEffect(() => {
    const stored = localStorage.getItem("journal-entries");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setEntries(parsed);
        } else {
          setEntries(templateEntries);
        }
      } catch (error) {
        console.error("Error parsing journal entries:", error);
        setEntries(templateEntries);
      }
    } else {
      setEntries(templateEntries);
    }
  }, []);

  // Save entries to localStorage whenever they change (but not on initial mount)
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("journal-entries", JSON.stringify(entries));
    }
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
      <PhotoAlbumView
        isOpen={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.title || ""}
        date={selectedEntry?.date || ""}
        photos={
          selectedEntry?.photos.map((photo, index) => ({
            src: photo,
            caption: selectedEntry.photoCaptions?.[index] || `Photo ${index + 1}`,
          })) || []
        }
      />

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
            <Card
              key={entry.id}
              className="border-2 border-border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
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
