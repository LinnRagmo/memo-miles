import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Camera, 
  Heart, 
  Star, 
  Plane, 
  Coffee, 
  Mountain,
  Palmtree,
  Sun,
  X,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrapbookSection {
  type: "text" | "photo" | "sticker";
  content: string;
  photoCaption?: string;
  sticker?: string;
}

interface ScrapbookEntryProps {
  title: string;
  date: string;
  sections: ScrapbookSection[];
  onSave: (title: string, sections: ScrapbookSection[]) => void;
  onCancel: () => void;
}

const STICKERS = [
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

export const ScrapbookEntry = ({ 
  title: initialTitle, 
  date, 
  sections: initialSections,
  onSave,
  onCancel 
}: ScrapbookEntryProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState<ScrapbookSection[]>(initialSections);
  const [showStickerPicker, setShowStickerPicker] = useState<number | null>(null);

  const handlePhotoUpload = (sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          setSections(prev => prev.map((section, idx) => 
            idx === sectionIndex 
              ? { ...section, content: compressedDataUrl }
              : section
          ));
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSection = (index: number, updates: Partial<ScrapbookSection>) => {
    setSections(prev => prev.map((section, idx) => 
      idx === index ? { ...section, ...updates } : section
    ));
  };

  const addSticker = (sectionIndex: number, stickerName: string) => {
    updateSection(sectionIndex, { sticker: stickerName });
    setShowStickerPicker(null);
  };

  const removeSticker = (sectionIndex: number) => {
    updateSection(sectionIndex, { sticker: undefined });
  };

  return (
    <Card className="relative overflow-hidden border-2 shadow-2xl" 
      style={{
        background: "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--muted)/0.3))",
      }}>
      {/* Decorative tape effect at top */}
      <div className="absolute top-0 left-1/4 w-24 h-8 bg-yellow-100/60 -rotate-2 shadow-sm" 
        style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }} />
      <div className="absolute top-0 right-1/4 w-24 h-8 bg-yellow-100/60 rotate-2 shadow-sm" 
        style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }} />

      <div className="p-8 md:p-12 space-y-6">
        {/* Title Section */}
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-none bg-transparent focus-visible:ring-0 px-0 font-handwriting"
            placeholder="Entry title..."
            style={{ fontFamily: "'Shadows Into Light', cursive" }}
          />
          <p className="text-sm text-muted-foreground italic">{date}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="relative">
              {section.type === "text" && (
                <div className="relative">
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(idx, { content: e.target.value })}
                    className="min-h-[100px] bg-white/50 border-dashed border-2 rounded-lg p-4 resize-none"
                    placeholder="Write about your experience..."
                  />
                </div>
              )}

              {section.type === "photo" && (
                <div className="relative group">
                  {section.content ? (
                    <div className="relative">
                      {/* Photo with tape effect */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-yellow-100/70 rotate-1 shadow-sm z-10" 
                        style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }} />
                      <img
                        src={section.content}
                        alt="Entry photo"
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg border-4 border-white transform hover:rotate-1 transition-transform"
                        style={{ 
                          filter: "contrast(1.05) saturate(1.1)",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Input
                        value={section.photoCaption || ""}
                        onChange={(e) => updateSection(idx, { photoCaption: e.target.value })}
                        className="mt-3 text-center italic text-sm bg-transparent border-none"
                        placeholder="Add a caption..."
                      />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-64 border-2 border-dashed rounded-lg cursor-pointer bg-white/50 hover:bg-white/80 transition-colors">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to add photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(idx, e)}
                      />
                    </label>
                  )}
                </div>
              )}

              {section.type === "sticker" && (
                <div className="flex items-center justify-center gap-4 py-4">
                  {section.sticker ? (
                    <div className="relative group">
                      {(() => {
                        const stickerData = STICKERS.find(s => s.name === section.sticker);
                        if (!stickerData) return null;
                        const StickerIcon = stickerData.icon;
                        return (
                          <>
                            <StickerIcon className={cn("w-12 h-12", stickerData.color)} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSticker(idx)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStickerPicker(showStickerPicker === idx ? null : idx)}
                        className="border-dashed"
                      >
                        + Add Sticker
                      </Button>
                      {showStickerPicker === idx && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-3 z-20 flex gap-2 flex-wrap max-w-xs">
                          {STICKERS.map((sticker) => {
                            const Icon = sticker.icon;
                            return (
                              <button
                                key={sticker.name}
                                onClick={() => addSticker(idx, sticker.name)}
                                className="p-2 hover:bg-accent rounded-md transition-colors"
                              >
                                <Icon className={cn("w-8 h-8", sticker.color)} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={() => onSave(title, sections)} size="lg" className="flex-1">
            Save Entry
          </Button>
          <Button onClick={onCancel} variant="outline" size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
