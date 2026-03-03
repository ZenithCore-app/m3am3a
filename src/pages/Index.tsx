import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface Restaurant {
  name: string;
  category: string;
  image_url?: string;
  items: MenuItem[];
}

interface MenuItem {
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
}

const Index = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Use a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQfS3Hmq2mh00-bEn9zGyuzJOLkFr2_NsNV5oC4Bu0iDJRVw_4KzijDp9raZklXUTt8W12LMsHMVbZ3/pub?output=csv', {
          signal: controller.signal,
          headers: {
            'Accept': 'text/csv',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV data
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('No data found in CSV');
        }
        
        const restaurantMap = new Map<string, Restaurant>();
        let lastRestaurantName = '';
        
        for (let i = 1; i < lines.length; i++) {
          try {
            // Better CSV parsing to handle quoted strings with commas
            const values = [];
            let currentValue = '';
            let inQuotes = false;
            
            for (let char of lines[i]) {
              if (char === '"' && (inQuotes || currentValue.trim() === '')) {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim().replace(/"/g, ''));
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue.trim().replace(/"/g, ''));
            
            if (values.length >= 5) {
              const restaurantName = values[0];
              const restaurantImage = values[1] || '';
              const category = values[2];
              const itemName = values[3];
              const price = parseFloat(values[4]) || 0;
              const description = values[5] || '';
              const itemImage = values[6] || '';
              
              // Validate image URLs
              const isValidUrl = (url: string) => {
                try {
                  new URL(url);
                  return url.startsWith('http://') || url.startsWith('https://');
                } catch {
                  return false;
                }
              };
              
              const validRestaurantImage = isValidUrl(restaurantImage) ? restaurantImage : '';
              const validItemImage = isValidUrl(itemImage) ? itemImage : '';
              
              // Use the current restaurant name if not empty, otherwise use the last one
              const currentRestaurantName = restaurantName || lastRestaurantName;
              
              // Only create a new restaurant if we have a name and it doesn't exist yet
              if (restaurantName && !restaurantMap.has(restaurantName)) {
                restaurantMap.set(restaurantName, {
                  name: restaurantName,
                  category: category,
                  image_url: validRestaurantImage,
                  items: []
                });
                lastRestaurantName = restaurantName;
              }
              
              // Only add items if we have a valid restaurant name and item name
              if (currentRestaurantName && itemName) {
                const restaurant = restaurantMap.get(currentRestaurantName);
                if (restaurant) {
                  restaurant.items.push({
                    name: itemName,
                    price: price,
                    description: description,
                    category: category,
                    image_url: validItemImage
                  });
                }
              }
            }
          } catch (error) {
            console.warn(`Error parsing line ${i}:`, error, lines[i]);
          }
        }
        
        setRestaurants(Array.from(restaurantMap.values()));
        console.log(`Loaded ${restaurantMap.size} restaurants`);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        // Fallback to mock data if Google Sheets fails
        const mockRestaurants: Restaurant[] = [
          {
            name: "Manhattan Restaurant",
            category: "American",
            image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif",
            items: [
              { name: "Classic Burger", price: 45, description: "Juicy beef patty with fresh vegetables", category: "Burgers", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" },
              { name: "Caesar Salad", price: 35, description: "Crisp romaine lettuce with parmesan", category: "Salads", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" },
              { name: "Grilled Chicken", price: 55, description: "Tender grilled chicken breast", category: "Mains", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" }
            ]
          },
          {
            name: "Pizza Palace",
            category: "Italian",
            image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif",
            items: [
              { name: "Margherita Pizza", price: 40, description: "Fresh mozzarella and basil", category: "Pizza", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" },
              { name: "Pepperoni Pizza", price: 45, description: "Classic pepperoni with cheese", category: "Pizza", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" },
              { name: "Garlic Bread", price: 15, description: "Toasted bread with garlic butter", category: "Appetizers", image_url: "https://i.postimg.cc/Dzx8Wrs7/banh-mi-turkey-burger-secondary-6578982fea00a.avif" }
            ]
          }
        ];
        
        setRestaurants(mockRestaurants);
        console.log('Using mock restaurant data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container px-5 pt-6 pb-28 h-screen flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">Welcome! 🔥</h1>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Hey there 👋
          </h1>
          <p className="text-lg font-bold text-foreground mt-1">Where do you want to eat?</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
          />
        </div>
      </div>

      {/* Scrollable Restaurant List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        )}

        {/* Restaurant List */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No restaurants found</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4 pb-4">
            {filtered.map((restaurant) => (
              <motion.div
                key={restaurant.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/restaurant/${encodeURIComponent(restaurant.name)}`)}
                className="relative cursor-pointer transition-transform h-32 overflow-hidden"
                style={{ 
                  borderRadius: '1rem',
                  transformOrigin: 'center',
                  clipPath: 'inset(0 round 1rem)'
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  {restaurant.image_url ? (
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onLoad={() => console.log(`Restaurant image loaded: ${restaurant.image_url}`)}
                      onError={(e) => {
                        console.warn(`Restaurant image failed to load: ${restaurant.image_url}`, e);
                        const target = e.currentTarget;
                        target.src = '/placeholder.svg';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <img 
                      src="/placeholder.svg" 
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-2xl"
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
                      <p className="text-white text-sm italic mt-1">{restaurant.items.length} items available</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const wasFavorited = isFavorite(restaurant.name);
                        if (wasFavorited) {
                          removeFromFavorites(restaurant.name);
                        } else {
                          addToFavorites(restaurant);
                        }
                      }}
                      className={`w-8 h-8 rounded-full glass flex items-center justify-center transition-all duration-300 ${
                        isFavorite(restaurant.name) 
                          ? 'text-red-500 hover:text-red-400' 
                          : 'text-white hover:text-red-300'
                      }`}
                    >
                      <AnimatePresence>
                        {isFavorite(restaurant.name) ? (
                          <motion.div
                            key="filled"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{ transformOrigin: 'center' }}
                          >
                            <Heart size={16} fill="currentColor" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unfilled"
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 0] }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <Heart size={16} fill="none" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
