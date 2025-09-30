import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface FavoritePlace {
  id: string;
  name: string;
  description: string;
  tripTitle: string;
  coordinates?: [number, number];
}

interface FavoritesContextType {
  favorites: FavoritePlace[];
  addFavorite: (place: FavoritePlace) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("favorite-places");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorite-places", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (place: FavoritePlace) => {
    setFavorites((prev) => {
      // Avoid duplicates
      if (prev.some((f) => f.id === place.id)) {
        return prev;
      }
      return [...prev, place];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
