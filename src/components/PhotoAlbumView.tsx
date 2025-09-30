import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  src: string;
  caption: string;
}

interface PhotoAlbumViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  photos: Photo[];
}

const PhotoAlbumView = ({ isOpen, onClose, title, date, photos }: PhotoAlbumViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Photo Album */}
        <div className="overflow-y-auto px-6 py-8">
          <div className="space-y-16 max-w-4xl mx-auto">
            {photos.map((photo, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${
                    isLeft ? "items-start" : "items-end"
                  } gap-4 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-full md:w-[85%] ${
                      isLeft ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-auto rounded-lg shadow-lg object-cover"
                      style={{ maxHeight: "500px" }}
                    />
                    <p
                      className={`mt-3 text-foreground/80 italic text-lg ${
                        isLeft ? "text-left" : "text-right"
                      }`}
                    >
                      {photo.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoAlbumView;
