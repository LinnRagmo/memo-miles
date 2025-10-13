import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PhotoAlbumView from "@/components/PhotoAlbumView";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Coastal Roadtrip",
    notes: "The Pacific Coast Highway delivered everything we dreamed of and more. Miles of dramatic cliffs plunging into the azure ocean, hidden beaches accessible only by winding trails, and sunsets that painted the sky in shades of orange and pink. We stopped at every scenic overlook, dined on fresh seafood at seaside cafes, and fell asleep to the sound of crashing waves. This stretch of coastline is pure magic.",
    photos: [beachPhoto1, beachPhoto2, beachPhoto3],
    photoCaptions: [
      "Private beach cove with crystal-clear turquoise water and swaying palms",
      "Historic lighthouse perched on dramatic cliffs at sunset",
      "Beachside lunch with fresh seafood and ocean views"
    ],
  },
  {
    id: "template-2",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Mountain Adventure",
    notes: "Winding mountain roads led us higher and higher into alpine wilderness. Each switchback revealed breathtaking vistas of snow-capped peaks and pristine lakes reflecting the sky like mirrors. We hiked through forests of towering pines, discovered hidden waterfalls cascading down mossy rocks, and breathed the crisp mountain air that seemed to clear away all worries. The mountains renewed our spirits.",
    photos: [mountainPhoto1, mountainPhoto2, mountainPhoto3],
    photoCaptions: [
      "Mirror-like reflection at dawn - the lake was perfectly still",
      "Hiked to this hidden waterfall deep in the forest",
      "Alpine meadows bursting with wildflowers in full bloom"
    ],
  },
  {
    id: "template-3",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    title: "City Escape",
    notes: "Sometimes the best roadtrips lead you to unexpected urban adventures. We explored vibrant neighborhoods filled with street art, discovered hole-in-the-wall restaurants serving incredible food, and wandered through historic districts where old meets new. From rooftop bars with skyline views to quiet parks offering refuge from the hustle, the city revealed its hidden gems one block at a time.",
    photos: [fallPhoto1, fallPhoto2, fallPhoto3, fallPhoto4],
    photoCaptions: [
      "Colorful street art alley - every wall tells a story",
      "Historic district with charming architecture and cobblestone streets",
      "Local market overflowing with fresh produce and artisan goods",
      "Sunset view from the rooftop - the city lights beginning to glow"
    ],
  },
];

const JournalPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [tripInfo, setTripInfo] = useState<{ title: string; start_date: string; end_date: string } | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: "",
    date: new Date(),
    notes: "",
    photos: [] as string[],
    photoCaptions: [] as string[],
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/journal/${tripId}`);
    }
  }, [user, authLoading, navigate, tripId]);

  // Fetch trip info and load entries
  useEffect(() => {
    if (!tripId) return;
    
    // Fetch trip info
    const fetchTripInfo = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("title, start_date, end_date")
        .eq("id", tripId)
        .single();

      if (!error && data) {
        setTripInfo(data);
      }
    };

    fetchTripInfo();
    
    // Load entries from localStorage
    const stored = localStorage.getItem(`journal-entries-${tripId}`);
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
  }, [tripId]);

  // Save entries to localStorage whenever they change (but not on initial mount)
  useEffect(() => {
    if (entries.length > 0 && tripId) {
      try {
        localStorage.setItem(`journal-entries-${tripId}`, JSON.stringify(entries));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast({
            title: "Storage limit reached",
            description: "Your journal has too much data. Please delete some older entries or photos to free up space.",
            variant: "destructive",
          });
          // Revert to previous state by removing the last added entry
          setEntries(prev => prev.slice(1));
        }
      }
    }
  }, [entries, tripId, toast]);

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
          const img = new Image();
          img.onload = () => {
            // Compress image to reduce storage size
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Limit max dimensions to reduce size
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to JPEG with 0.7 quality for smaller file size
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            setNewEntry((prev) => ({
              ...prev,
              photos: [...prev.photos, compressedDataUrl],
              photoCaptions: [...prev.photoCaptions, ""],
            }));
          };
          img.src = event.target!.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setNewEntry((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoCaptions: prev.photoCaptions.filter((_, i) => i !== index),
    }));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setNewEntry((prev) => {
      const newCaptions = [...prev.photoCaptions];
      newCaptions[index] = caption;
      return {
        ...prev,
        photoCaptions: newCaptions,
      };
    });
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
      date: newEntry.date.toISOString(),
      title: newEntry.title,
      notes: newEntry.notes,
      photos: newEntry.photos,
      photoCaptions: newEntry.photoCaptions,
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: "", date: new Date(), notes: "", photos: [], photoCaptions: [] });
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
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

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                {tripInfo?.title || "Travel Journal"}
              </h1>
              {tripInfo && (
                <p className="text-muted-foreground text-lg">
                  {format(new Date(tripInfo.start_date), "MMM d")} - {format(new Date(tripInfo.end_date), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <Button onClick={() => setIsCreating(!isCreating)} size="lg" className="gap-2 shadow-lg">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Create New Entry Form */}
        {isCreating && (
          <Card className="mb-12 border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Create Journal Entry</CardTitle>
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
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newEntry.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEntry.date ? format(newEntry.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEntry.date}
                    onSelect={(date) => date && setNewEntry({ ...newEntry, date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {newEntry.photos.map((photo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-48 object-cover rounded-md border-2 border-border"
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
                      <div className="space-y-1">
                        <Label htmlFor={`caption-${index}`} className="text-sm">
                          Caption for photo {index + 1}
                        </Label>
                        <Input
                          id={`caption-${index}`}
                          placeholder="Add a caption for this photo..."
                          value={newEntry.photoCaptions[index] || ""}
                          onChange={(e) => updatePhotoCaption(index, e.target.value)}
                          maxLength={200}
                        />
                      </div>
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

        {/* Journal Entries Grid */}
        <div>
          {entries.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-lg mb-4">No journal entries yet</p>
                <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="group cursor-pointer overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* Cover Photo */}
                  {entry.photos.length > 0 && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={entry.photos[0]}
                        alt={entry.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                          <span>{new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}</span>
                        </div>
                      </div>
                      {!entry.photos.length && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
