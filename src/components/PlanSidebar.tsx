import { useFavorites } from "@/contexts/FavoritesContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Heart, MapPin, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlanSidebarProps {
  onAddToDay: (place: { location: string; description: string; coordinates?: [number, number] }) => void;
}

export function PlanSidebar({ onAddToDay }: PlanSidebarProps) {
  const { favorites, removeFavorite } = useFavorites();
  const { open: isOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold px-4 py-3">
            <Heart className="w-4 h-4 text-primary" />
            {isOpen && <span>Favorite Places</span>}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              {favorites.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  {isOpen ? (
                    <div className="space-y-2">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No favorites yet</p>
                      <p className="text-xs text-muted-foreground">
                        Save places from the Inspiration page
                      </p>
                    </div>
                  ) : (
                    <Heart className="w-6 h-6 mx-auto text-muted-foreground opacity-30" />
                  )}
                </div>
              ) : (
                <SidebarMenu>
                  {favorites.map((place) => (
                    <SidebarMenuItem key={place.id}>
                      <div className="group relative px-3 py-2 hover:bg-muted/50 rounded-md transition-colors">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          
                          {isOpen && (
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {place.name}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {place.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {place.tripTitle}
                              </Badge>
                              
                              <div className="flex gap-1 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1 flex-1"
                                  onClick={() => onAddToDay({
                                    location: place.name,
                                    description: place.description,
                                    coordinates: place.coordinates
                                  })}
                                >
                                  <Plus className="w-3 h-3" />
                                  Add to Plan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => removeFavorite(place.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
