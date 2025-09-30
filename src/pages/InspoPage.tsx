import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Camera } from "lucide-react";

interface RoadTripPost {
  id: string;
  title: string;
  description: string;
  duration: string;
  distance: string;
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
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Road Trip Inspiration</h1>
        <p className="text-muted-foreground text-lg">
          Browse sample itineraries to spark ideas for your next adventure
        </p>
      </div>

      <div className="space-y-6">
        {sampleTrips.map((trip) => (
          <Card key={trip.id} className="border-2 border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{trip.title}</CardTitle>
                  <CardDescription className="text-base">{trip.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.duration}
                  </Badge>
                  <Badge variant="secondary">{trip.distance}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Highlights */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Highlights</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stops */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Stops</h3>
                </div>
                <div className="space-y-3">
                  {trip.stops.map((stop, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground">{stop.location}</h4>
                        <p className="text-sm text-muted-foreground">{stop.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InspoPage;
