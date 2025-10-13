import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search, Plus, Trash2, X, Image as ImageIcon, Filter } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TripDetailModal from "@/components/TripDetailModal";
import heroImagePCH from "@/assets/inspo-hero-pch.jpg";
import heroImageSmokies from "@/assets/inspo-hero-smokies.jpg";
import heroImageSouthwest from "@/assets/inspo-hero-southwest.jpg";

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

const sampleTrips: RoadTripPost[] = [
  {
    id: "1",
    title: "Pacific Coast Highway Adventure",
    description: "A breathtaking journey along California's iconic coastline, from San Francisco to San Diego.",
    duration: "7 Days",
    distance: "600 miles",
    author: "Sarah Mitchell",
    date: "March 15, 2024",
    readTime: "8 min read",
    heroImage: heroImagePCH,
    highlights: ["Golden Gate Bridge", "Big Sur", "Santa Barbara", "Malibu Beaches"],
    stops: [
      { location: "San Francisco", description: "Start at the Golden Gate Bridge, explore Fisherman's Wharf" },
      { location: "Monterey", description: "Visit the famous aquarium and Cannery Row" },
      { location: "Big Sur", description: "Drive through dramatic coastal cliffs and McWay Falls" },
      { location: "Santa Barbara", description: "Spanish architecture and wine country" },
      { location: "Los Angeles", description: "Hollywood, Venice Beach, and urban exploration" },
      { location: "San Diego", description: "End at beautiful beaches and Balboa Park" },
    ],
  },
  {
    id: "2",
    title: "Great Smoky Mountains Loop",
    description: "Experience the beauty of America's most visited national park with scenic mountain drives.",
    duration: "5 Days",
    distance: "400 miles",
    author: "Michael Chen",
    date: "February 28, 2024",
    readTime: "6 min read",
    heroImage: heroImageSmokies,
    highlights: ["Cades Cove", "Clingmans Dome", "Roaring Fork", "Blue Ridge Parkway"],
    stops: [
      { location: "Gatlinburg, TN", description: "Gateway town with mountain charm and local shops" },
      { location: "Cades Cove", description: "Historic valley with wildlife viewing opportunities" },
      { location: "Clingmans Dome", description: "Highest point in the Smokies with panoramic views" },
      { location: "Asheville, NC", description: "Vibrant arts scene and Biltmore Estate" },
      { location: "Blue Ridge Parkway", description: "Scenic mountain highway with countless overlooks" },
    ],
  },
  {
    id: "3",
    title: "Southwest Desert Explorer",
    description: "Journey through iconic desert landscapes, red rocks, and natural wonders of the American Southwest.",
    duration: "10 Days",
    distance: "1,200 miles",
    author: "Emma Rodriguez",
    date: "January 20, 2024",
    readTime: "10 min read",
    heroImage: heroImageSouthwest,
    highlights: ["Grand Canyon", "Monument Valley", "Sedona", "Zion National Park"],
    stops: [
      { location: "Las Vegas, NV", description: "Starting point with entertainment and dining" },
      { location: "Zion National Park", description: "Towering red cliffs and hiking trails" },
      { location: "Bryce Canyon", description: "Unique hoodoo rock formations" },
      { location: "Monument Valley", description: "Iconic desert buttes and mesas" },
      { location: "Grand Canyon", description: "One of the world's natural wonders" },
      { location: "Sedona, AZ", description: "Red rock country with spiritual vortexes" },
    ],
  },
];

const InspoPage = () => {
  const { addFavorite, isFavorite } = useFavorites();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<RoadTripPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<RoadTripPost[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    duration: "",
    distance: "",
    author: "",
    heroImage: "",
    highlights: [""],
    stops: [{ location: "", description: "" }],
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/inspo`);
    }
  }, [user, authLoading, navigate]);

  // Load user posts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("inspo-posts");
    if (stored) {
      try {
        setUserPosts(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    }
  }, []);

  // Save user posts to localStorage
  useEffect(() => {
    if (userPosts.length > 0) {
      localStorage.setItem("inspo-posts", JSON.stringify(userPosts));
    }
  }, [userPosts]);

  const handleSaveFavorite = (stop: { location: string; description: string }, tripTitle: string) => {
    const favoriteId = `${tripTitle}-${stop.location}`.replace(/\s+/g, '-').toLowerCase();
    
    if (isFavorite(favoriteId)) {
      toast.info("Already in favorites");
      return;
    }

    addFavorite({
      id: favoriteId,
      name: stop.location,
      description: stop.description,
      tripTitle: tripTitle,
    });

    toast.success(`Added ${stop.location} to favorites!`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewPost({ ...newPost, heroImage: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const addHighlight = () => {
    setNewPost({ ...newPost, highlights: [...newPost.highlights, ""] });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...newPost.highlights];
    newHighlights[index] = value;
    setNewPost({ ...newPost, highlights: newHighlights });
  };

  const removeHighlight = (index: number) => {
    setNewPost({ ...newPost, highlights: newPost.highlights.filter((_, i) => i !== index) });
  };

  const addStop = () => {
    setNewPost({ ...newPost, stops: [...newPost.stops, { location: "", description: "" }] });
  };

  const updateStop = (index: number, field: "location" | "description", value: string) => {
    const newStops = [...newPost.stops];
    newStops[index][field] = value;
    setNewPost({ ...newPost, stops: newStops });
  };

  const removeStop = (index: number) => {
    setNewPost({ ...newPost, stops: newPost.stops.filter((_, i) => i !== index) });
  };

  const handleSavePost = () => {
    if (!newPost.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!newPost.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const post: RoadTripPost = {
      id: Date.now().toString(),
      title: newPost.title,
      description: newPost.description,
      duration: newPost.duration || "N/A",
      distance: newPost.distance || "N/A",
      author: newPost.author || "Anonymous",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      readTime: "5 min read",
      heroImage: newPost.heroImage || heroImagePCH,
      highlights: newPost.highlights.filter(h => h.trim()),
      stops: newPost.stops.filter(s => s.location.trim()),
    };

    setUserPosts([post, ...userPosts]);
    setNewPost({
      title: "",
      description: "",
      duration: "",
      distance: "",
      author: "",
      heroImage: "",
      highlights: [""],
      stops: [{ location: "", description: "" }],
    });
    setIsCreating(false);
    toast.success("Blog post created!");
  };

  const deletePost = (id: string) => {
    setUserPosts(userPosts.filter(p => p.id !== id));
    toast.success("Post deleted");
  };

  const handleTripClick = (trip: RoadTripPost) => {
    setSelectedTrip(trip);
    setIsDetailOpen(true);
  };

  // Combine user posts and sample trips
  const allTrips = [...userPosts, ...sampleTrips];

  // Filter trips based on search query and filters
  const filteredTrips = allTrips.filter((trip) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        trip.title.toLowerCase().includes(query) ||
        trip.description.toLowerCase().includes(query) ||
        trip.author.toLowerCase().includes(query) ||
        trip.highlights.some(h => h.toLowerCase().includes(query)) ||
        trip.stops.some(s => 
          s.location.toLowerCase().includes(query) || 
          s.description.toLowerCase().includes(query)
        );
      if (!matchesSearch) return false;
    }

    // Duration filter
    if (durationFilter !== "all") {
      const durationNum = parseInt(trip.duration);
      if (durationFilter === "short" && durationNum > 3) return false;
      if (durationFilter === "medium" && (durationNum <= 3 || durationNum > 7)) return false;
      if (durationFilter === "long" && durationNum <= 7) return false;
    }

    // Distance filter
    if (distanceFilter !== "all") {
      const distanceNum = parseInt(trip.distance);
      if (distanceFilter === "short" && distanceNum > 400) return false;
      if (distanceFilter === "medium" && (distanceNum <= 400 || distanceNum > 800)) return false;
      if (distanceFilter === "long" && distanceNum <= 800) return false;
    }

    return true;
  });

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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        {/* Create Post Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Pacific Coast Highway Adventure"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="A breathtaking journey along California's iconic coastline..."
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="7 Days"
                    value={newPost.duration}
                    onChange={(e) => setNewPost({ ...newPost, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance</Label>
                  <Input
                    id="distance"
                    placeholder="600 miles"
                    value={newPost.distance}
                    onChange={(e) => setNewPost({ ...newPost, distance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                />
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="gap-2" asChild>
                    <label htmlFor="hero-upload" className="cursor-pointer">
                      <ImageIcon className="w-4 h-4" />
                      Upload Image
                      <input
                        id="hero-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </Button>
                  {newPost.heroImage && (
                    <span className="text-sm text-muted-foreground">Image uploaded</span>
                  )}
                </div>
                {newPost.heroImage && (
                  <img src={newPost.heroImage} alt="Preview" className="w-full h-48 object-cover rounded-md mt-2" />
                )}
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Highlights</Label>
                  <Button size="sm" variant="outline" onClick={addHighlight}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                {newPost.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Golden Gate Bridge"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeHighlight(index)}
                      disabled={newPost.highlights.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Stops */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Stops</Label>
                  <Button size="sm" variant="outline" onClick={addStop}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stop
                  </Button>
                </div>
                {newPost.stops.map((stop, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stop {index + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStop(index)}
                        disabled={newPost.stops.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Location"
                      value={stop.location}
                      onChange={(e) => updateStop(index, "location", e.target.value)}
                    />
                    <Textarea
                      placeholder="Description"
                      value={stop.description}
                      onChange={(e) => updateStop(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSavePost}>Create Post</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Road Trip Inspiration
              </h1>
              <Button onClick={() => setIsCreating(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Post
              </Button>
            </div>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
              Discover epic journeys and plan your next adventure with our curated collection of road trip stories
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search trips, destinations, or highlights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-base border-2 focus:border-primary"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filters:
              </div>
              
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Short (1-3 days)</SelectItem>
                  <SelectItem value="medium">Medium (4-7 days)</SelectItem>
                  <SelectItem value="long">Long (8+ days)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Distances</SelectItem>
                  <SelectItem value="short">Short (0-400 mi)</SelectItem>
                  <SelectItem value="medium">Medium (400-800 mi)</SelectItem>
                  <SelectItem value="long">Long (800+ mi)</SelectItem>
                </SelectContent>
              </Select>

              {(durationFilter !== "all" || distanceFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDurationFilter("all");
                    setDistanceFilter("all");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Trip Detail Modal */}
        <TripDetailModal
          trip={selectedTrip}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onSaveFavorite={handleSaveFavorite}
          onDeletePost={deletePost}
          isFavorite={isFavorite}
          isUserPost={userPosts.some(p => p.id === selectedTrip?.id)}
        />

        {filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">No trips found matching "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className="group cursor-pointer border-2 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg"
                onClick={() => handleTripClick(trip)}
              >
                {/* Compact Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.heroImage}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Delete button for user posts */}
                  {userPosts.some(p => p.id === trip.id) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePost(trip.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {trip.title}
                  </h3>

                  {/* Duration and Distance */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {trip.duration}
                    </Badge>
                    <Badge variant="outline">
                      {trip.distance}
                    </Badge>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Highlights
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {trip.highlights.slice(0, 3).map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                      {trip.highlights.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{trip.highlights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Read More Hint */}
                  <p className="text-xs text-muted-foreground pt-2 group-hover:text-primary transition-colors">
                    Click to view details →
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspoPage;
