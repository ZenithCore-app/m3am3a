import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FavoriteRestaurant {
  name: string;
  category: string;
  image_url?: string;
  items: any[];
}

interface FavoritesContextType {
  favorites: FavoriteRestaurant[];
  addToFavorites: (restaurant: FavoriteRestaurant) => void;
  removeFromFavorites: (restaurantName: string) => void;
  isFavorite: (restaurantName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favoriteRestaurants");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("favoriteRestaurants", JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  const addToFavorites = (restaurant: FavoriteRestaurant) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.name === restaurant.name);
      if (!exists) {
        return [...prev, restaurant];
      }
      return prev;
    });
  };

  const removeFromFavorites = (restaurantName: string) => {
    setFavorites(prev => prev.filter(fav => fav.name !== restaurantName));
  };

  const isFavorite = (restaurantName: string) => {
    return favorites.some(fav => fav.name === restaurantName);
  };

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
