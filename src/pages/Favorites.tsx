import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites } = useFavorites();

  const handleRestaurantClick = (restaurantName: string) => {
    navigate(`/restaurant/${encodeURIComponent(restaurantName)}`);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, restaurantName: string) => {
    e.stopPropagation();
    removeFromFavorites(restaurantName);
  };

  return (
    <div className="app-container px-5 pt-6 pb-28 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">My Favorites ❤️</h1>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No favorite restaurants yet</p>
          <p className="text-muted-foreground text-sm mt-2">Tap the heart icon on restaurants to add them here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-4 pb-4">
            {favorites.map((restaurant, index) => (
              <motion.div
                key={restaurant.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRestaurantClick(restaurant.name)}
                className="relative rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform h-32 overflow-hidden"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  {restaurant.image_url ? (
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn(`Favorite restaurant image failed to load: ${restaurant.image_url}`, e);
                        const target = e.currentTarget;
                        target.src = '/placeholder.svg';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <img 
                      src="/placeholder.svg" 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                
                {/* Text Overlay */}
                <div className="relative z-10 p-4 flex flex-col justify-start h-full">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-xl">{restaurant.name}</h3>
                      <p className="text-white text-sm italic mt-1">{restaurant.items?.length || 0} items available</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleRemoveFavorite(e, restaurant.name)}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Heart size={16} fill="currentColor" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
