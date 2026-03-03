import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Flame, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";

interface MenuItemDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  delivery_time: number;
  calories: number;
  restaurant_id: string;
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<MenuItemDB | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("menu_items").select("*").eq("id", id).single().then(({ data }) => {
      setItem(data as MenuItemDB | null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="app-container min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!item) return <div className="app-container min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Item not found</p></div>;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: item.id, name: item.name, price: Number(item.price), image_url: item.image_url, restaurant_id: item.restaurant_id });
    }
    navigate(-1);
  };

  return (
    <div className="app-container min-h-screen pb-28">
      <div className="flex items-center justify-between px-5 pt-6">
        <button onClick={() => navigate(-1)} className="glass w-11 h-11 rounded-xl flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-5 mt-4">
        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain drop-shadow-2xl" />
          ) : (
            <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-6xl opacity-60">🍽️</div>
          )}
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-extrabold text-foreground">{item.name}</h1>
          <div className="flex items-center gap-1 glass px-3 py-1.5 rounded-full">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-sm font-bold text-foreground">{Number(item.rating)}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{item.description}</p>

        <div className="flex items-center gap-6 mt-5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={16} />
            <div>
              <p className="text-[10px] text-muted-foreground">Delivery</p>
              <p className="text-sm font-semibold text-foreground">{item.delivery_time} Mins</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Flame size={16} className="text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Calories</p>
              <p className="text-sm font-semibold text-foreground">{item.calories} Cal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground">
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold text-foreground w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground">
              <Plus size={16} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Total Price</p>
            <p className="gradient-text text-xl font-extrabold">${(Number(item.price) * quantity).toFixed(2)}</p>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.96 }} onClick={handleAddToCart}
          className="w-full mt-6 gradient-primary glow-primary text-primary-foreground py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
          <Plus size={18} /> Add to Cart
        </motion.button>
      </div>
    </div>
  );
};

export default ItemDetail;
