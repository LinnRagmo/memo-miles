import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft, Calendar as CalendarIcon, MapPin, Camera, Heart, Star, Plane, Coffee, Mountain, Palmtree, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PhotoAlbumView from "@/components/PhotoAlbumView";
import { ScrapbookEntry } from "@/components/ScrapbookEntry";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, parseISO } from "date-fns";
import type { Trip } from "@/types/trip";

interface ScrapbookSection {
  type: "text" | "photo" | "sticker";
  content: string;
  photoCaption?: string;
  sticker?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  sections: ScrapbookSection[];
}

const JournalPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [tripInfo, setTripInfo] = useState<{ title: string; start_date: string; end_date: string } | null>(null);
  const [fullTripData, setFullTripData] = useState<Trip | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<{
    title: string;
    date: string;
    sections: ScrapbookSection[];
  } | null>(null);

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
        .select("title, start_date, end_date, trip_data")
        .eq("id", tripId)
        .single();

      if (!error && data) {
        setTripInfo({ title: data.title, start_date: data.start_date, end_date: data.end_date });
        // Parse trip_data as Trip type - it contains the days array
        const tripData = data.trip_data as any;
        setFullTripData(tripData);
      }
    };

    fetchTripInfo();
    
    // Load entries from localStorage - start empty if none exist
    const stored = localStorage.getItem(`journal-entries-${tripId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(parsed);
      } catch (error) {
        console.error("Error parsing journal entries:", error);
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, [tripId]);

  // Auto-open first unfilled day template
  useEffect(() => {
    if (!tripInfo || !fullTripData || entries.length > 0 || isCreating) return;

    const firstUnfilledDay = findFirstUnfilledDay();
    if (firstUnfilledDay) {
      const template = generateScrapbookTemplate(new Date(firstUnfilledDay));
      setCurrentTemplate(template);
      setIsCreating(true);
    }
  }, [tripInfo, fullTripData, entries, isCreating]);

  const findFirstUnfilledDay = () => {
    if (!tripInfo) return null;
    
    const filledDates = new Set(entries.map(e => new Date(e.date).toDateString()));
    let currentDate = parseISO(tripInfo.start_date);
    const endDate = parseISO(tripInfo.end_date);

    while (currentDate <= endDate) {
      if (!filledDates.has(currentDate.toDateString())) {
        return currentDate.toISOString();
      }
      currentDate = addDays(currentDate, 1);
    }
    return null;
  };

  const generateScrapbookTemplate = (selectedDate: Date): {
    title: string;
    date: string;
    sections: ScrapbookSection[];
  } => {
    if (!fullTripData) {
      return {
        title: `Day ${format(selectedDate, "MMM d, yyyy")}`,
        date: format(selectedDate, "MMMM d, yyyy"),
        sections: [
          { type: "text", content: "Today's adventures begin..." },
          { type: "photo", content: "" },
          { type: "sticker", content: "" },
        ]
      };
    }

    const dayData = fullTripData.days?.find((day: any) => {
      const dayDate = new Date(day.date).toDateString();
      const selected = selectedDate.toDateString();
      return dayDate === selected;
    });

    if (!dayData || !dayData.stops || dayData.stops.length === 0) {
      return {
        title: `Day ${format(selectedDate, "MMM d, yyyy")}`,
        date: format(selectedDate, "MMMM d, yyyy"),
        sections: [
          { type: "text", content: "A day of spontaneous adventures awaits..." },
          { type: "photo", content: "" },
          { type: "sticker", content: "" },
          { type: "text", content: "What memories will I make today?" },
        ]
      };
    }

    const title = `${dayData.stops[0]?.location || "Adventure Day"}`;
    const sections: ScrapbookSection[] = [];

    // Opening text
    sections.push({
      type: "text",
      content: `Today I explored ${dayData.stops.map((s: any) => s.location).join(", ")}. `
    });

    // First photo placeholder
    sections.push({ type: "photo", content: "" });

    // Activity descriptions
    dayData.stops.forEach((stop: any, index: number) => {
      if (stop.notes) {
        sections.push({
          type: "text",
          content: `At ${stop.location}: ${stop.notes}`
        });
      }
      
      // Add photo placeholder after every 2 stops
      if ((index + 1) % 2 === 0 && index < dayData.stops.length - 1) {
        sections.push({ type: "photo", content: "" });
      }
    });

    // Add decorative sticker
    sections.push({ type: "sticker", content: "" });

    // Closing reflection
    sections.push({
      type: "text",
      content: "Looking back on this day, I feel..."
    });

    // Final photo placeholder
    sections.push({ type: "photo", content: "" });

    return {
      title,
      date: format(selectedDate, "MMMM d, yyyy"),
      sections
    };
  };

  const handleSaveEntry = (title: string, sections: ScrapbookSection[]) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title to your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: currentTemplate?.date || new Date().toISOString(),
      title,
      sections,
    };

    setEntries([entry, ...entries]);
    setIsCreating(false);
    setCurrentTemplate(null);

    // Save to localStorage
    try {
      localStorage.setItem(`journal-entries-${tripId}`, JSON.stringify([entry, ...entries]));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast({
          title: "Storage limit reached",
          description: "Your journal has too much data.",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Entry saved",
      description: "Your journal entry has been added.",
    });
  };

  const handleOpenCreateForm = () => {
    const firstUnfilledDay = findFirstUnfilledDay();
    if (firstUnfilledDay) {
      const template = generateScrapbookTemplate(new Date(firstUnfilledDay));
      setCurrentTemplate(template);
    } else {
      // If all days are filled, create template for tomorrow
      const tomorrow = addDays(new Date(), 1);
      const template = generateScrapbookTemplate(tomorrow);
      setCurrentTemplate(template);
    }
    setIsCreating(true);
  };

  const deleteEntry = (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    localStorage.setItem(`journal-entries-${tripId}`, JSON.stringify(newEntries));
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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
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
            {!isCreating && (
              <Button onClick={handleOpenCreateForm} size="lg" className="gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                New Entry
              </Button>
            )}
          </div>
        </div>

        {/* Create New Entry - Scrapbook Style */}
        {isCreating && currentTemplate && (
          <div className="mb-12">
            <ScrapbookEntry
              title={currentTemplate.title}
              date={currentTemplate.date}
              sections={currentTemplate.sections}
              onSave={handleSaveEntry}
              onCancel={() => {
                setIsCreating(false);
                setCurrentTemplate(null);
              }}
            />
          </div>
        )}

        {/* Journal Entries Grid */}
        <div>
          {entries.length === 0 && !isCreating ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-lg mb-4">No journal entries yet</p>
                <p className="text-sm text-muted-foreground mb-6">Start documenting your adventure!</p>
                <Button onClick={handleOpenCreateForm} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {entries.map((entry) => {
                // Find first photo for cover
                const coverPhoto = entry.sections.find(s => s.type === "photo" && s.content)?.content;
                
                return (
                  <Card
                    key={entry.id}
                    className="group relative overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-300"
                    style={{
                      background: "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--muted)/0.2))",
                    }}
                  >
                    {/* Decorative tape effect */}
                    <div className="absolute top-0 left-1/4 w-20 h-6 bg-yellow-100/50 -rotate-1 shadow-sm z-10" 
                      style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }} />
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                      className="absolute top-4 right-4 z-20 bg-destructive/10 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <CardContent className="p-8 md:p-12">
                      {/* Title and Date */}
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold text-foreground mb-2">{entry.title}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="italic">{new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}</span>
                        </div>
                      </div>

                      {/* Sections Display */}
                      <div className="space-y-6">
                        {entry.sections.map((section, idx) => (
                          <div key={idx}>
                            {section.type === "text" && section.content && (
                              <p className="text-base leading-relaxed whitespace-pre-wrap">
                                {section.content}
                              </p>
                            )}

                            {section.type === "photo" && section.content && (
                              <div className="relative my-6">
                                {/* Tape effect */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-yellow-100/60 rotate-1 shadow-sm z-10" 
                                  style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }} />
                                <img
                                  src={section.content}
                                  alt={section.photoCaption || "Journal photo"}
                                  className="w-full max-w-lg mx-auto rounded-lg shadow-lg border-4 border-white"
                                  style={{ 
                                    filter: "contrast(1.05) saturate(1.1)",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)"
                                  }}
                                />
                                {section.photoCaption && (
                                  <p className="text-center italic text-sm text-muted-foreground mt-2">
                                    {section.photoCaption}
                                  </p>
                                )}
                              </div>
                            )}

                            {section.type === "sticker" && section.sticker && (
                              <div className="flex justify-center my-4">
                                {(() => {
                                  const STICKERS_MAP = [
                                    { name: "map-pin", icon: MapPin, color: "text-red-500" },
                                    { name: "camera", icon: Camera, color: "text-blue-500" },
                                    { name: "heart", icon: Heart, color: "text-pink-500" },
                                    { name: "star", icon: Star, color: "text-yellow-500" },
                                    { name: "plane", icon: Plane, color: "text-sky-500" },
                                    { name: "coffee", icon: Coffee, color: "text-amber-700" },
                                    { name: "mountain", icon: Mountain, color: "text-slate-600" },
                                    { name: "palm", icon: Palmtree, color: "text-green-600" },
                                    { name: "sun", icon: Sun, color: "text-orange-500" },
                                  ];
                                  const stickerData = STICKERS_MAP.find(s => s.name === section.sticker);
                                  if (!stickerData) return null;
                                  const StickerIcon = stickerData.icon;
                                  return <StickerIcon className={`w-10 h-10 ${stickerData.color}`} />;
                                })()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
