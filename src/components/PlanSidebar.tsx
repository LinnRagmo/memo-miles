import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, MapPin, Trash2, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDraggable } from '@dnd-kit/core';

interface PlanSidebarProps {
  onAddToDay: (place: { location: string; description: string; coordinates?: [number, number] }) => void;
  onClose: () => void;
}

interface DraggableFavoriteProps {
  place: {
    id: string;
    name: string;
    description: string;
    tripTitle: string;
    coordinates?: [number, number];
  };
  onRemove: (id: string) => void;
}


const DraggableFavorite = ({ place, onRemove }: DraggableFavoriteProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `favorite-${place.id}`,
    data: { 
      type: 'favorite',
      location: place.name,
      notes: place.description,
      coordinates: place.coordinates,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-3 hover:bg-muted/50 rounded-md transition-colors border border-border ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 touch-none">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        
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
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
          onClick={() => onRemove(place.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export function PlanSidebar({ onAddToDay, onClose }: PlanSidebarProps) {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-base font-semibold">Favorite Places</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {favorites.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-2">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No favorites yet</p>
            <p className="text-xs text-muted-foreground">
              Save places from the Inspiration page
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {favorites.map((place) => (
              <DraggableFavorite
                key={place.id}
                place={place}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
