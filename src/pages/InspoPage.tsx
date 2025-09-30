import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, Calendar } from "lucide-react";
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Road Trip Inspiration
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Discover epic journeys and plan your next adventure with our curated collection of road trip stories
          </p>
        </div>

        <div className="space-y-12">
          {sampleTrips.map((trip) => (
            <article key={trip.id} className="group">
              <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-64 sm:h-96 overflow-hidden">
                  <img
                    src={trip.heroImage}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur">
                        <Clock className="w-3 h-3" />
                        {trip.duration}
                      </Badge>
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                        {trip.distance}
                      </Badge>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {trip.title}
                    </h2>
                  </div>
                </div>

                <CardHeader className="space-y-4">
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

                  <CardDescription className="text-base sm:text-lg leading-relaxed">
                    {trip.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
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
                        <div key={index} className="flex gap-4 items-start group/stop">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg group-hover/stop:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className="font-bold text-foreground text-lg mb-1 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {stop.location}
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">{stop.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspoPage;
