import { Home, ShoppingCart, User, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

const FloatingNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { favorites } = useFavorites();

  const path = location.pathname;
  if (["/processing", "/success", "/auth", "/location"].includes(path)) return null;

  const isHome = path === "/";
  const isCart = path === "/cart";
  const isFavorites = path === "/favorites";

  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-strong rounded-full gap-1 flex items-center justify-center opacity-80 py-[8px] px-[8px]">
        <button onClick={() => navigate("/")}
          className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${isHome ? "gradient-primary glow-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Home size={20} />
          {isHome && <span className="text-sm font-semibold">Home</span>}
        </button>
        <div className="w-px h-6 bg-border" />
        <button onClick={() => navigate("/favorites")}
          className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${isFavorites ? "gradient-primary glow-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart size={20} />
          {isFavorites && <span className="text-sm font-semibold">Favorites</span>}
        </button>
        <div className="w-px h-6 bg-border" />
        <button onClick={() => navigate("/cart")}
          className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 relative ${isCart ? "gradient-primary glow-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <ShoppingCart size={20} />
          {isCart && <span className="text-sm font-semibold">Cart</span>}
          {itemCount > 0 && !isCart && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default FloatingNav;
