import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface MenuItem {
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
}

interface Restaurant {
  name: string;
  category: string;
  image_url?: string;
  items: MenuItem[];
}

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQfS3Hmq2mh00-bEn9zGyuzJOLkFr2_NsNV5oC4Bu0iDJRVw_4KzijDp9raZklXUTt8W12LMsHMVbZ3/pub?output=csv');
        const csvText = await response.text();
        
        // Parse CSV data
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
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
        
        // Find the specific restaurant by name (decode URI component)
        const restaurantName = decodeURIComponent(id || '');
        const foundRestaurant = restaurantMap.get(restaurantName);
        setRestaurant(foundRestaurant || null);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: `${restaurant?.name}-${item.name}`,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      restaurant_id: null
    });
  };

  const filteredItems = restaurant?.items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app-container min-h-screen pb-28 px-5 pt-6">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="app-container min-h-screen pb-28 px-5 pt-6">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container px-5 pt-6 pb-28 h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="glass w-11 h-11 rounded-xl flex items-center justify-center text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">{restaurant.name}</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
        />
      </div>

      {/* Scrollable Menu Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-4 pb-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-2xl overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-16 object-cover rounded-lg"
                      onLoad={() => console.log(`Menu item image loaded: ${item.image_url}`)}
                      onError={(e) => {
                        console.warn(`Menu item image failed to load: ${item.image_url}`, e);
                        const target = e.currentTarget;
                        target.src = '/placeholder.svg';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <img 
                      src="/placeholder.svg" 
                      alt={item.name}
                      className="w-full h-16 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="gradient-text font-extrabold text-lg">{item.price} MAD</p>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddToCart(item)}
                      className="glass w-8 h-8 rounded-full flex items-center justify-center text-foreground"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No items found matching "{search}"</p>
          </div>
        )}

        {restaurant.items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No items available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
