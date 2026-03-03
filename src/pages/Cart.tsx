import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    navigate("/location");
  };

  return (
    <div className="app-container min-h-screen pb-28 px-5 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="glass w-11 h-11 rounded-xl flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">My Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm mt-1">Add some delicious items!</p>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass rounded-2xl p-4 flex items-center gap-4 mb-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-2xl">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{item.name}</h3>
                  <p className="gradient-text font-extrabold text-sm mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-foreground">
                    {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                  </button>
                  <span className="text-sm font-bold text-foreground w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-foreground">
                    <Plus size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="glass rounded-2xl p-5 mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-foreground font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground text-sm">Delivery</span>
              <span className="text-foreground font-semibold">$2.00</span>
            </div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between">
              <span className="text-foreground font-bold">Total</span>
              <span className="gradient-text font-extrabold text-lg">${(total + 2).toFixed(2)}</span>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={handleCheckout}
            className="w-full mt-6 gradient-primary glow-primary text-primary-foreground py-4 rounded-2xl font-bold text-base">
            Continue · ${(total + 2).toFixed(2)}
          </motion.button>
        </>
      )}
    </div>
  );
};

export default Cart;
