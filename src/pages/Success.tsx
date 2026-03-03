import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="app-container min-h-screen flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="gradient-primary w-24 h-24 rounded-full flex items-center justify-center glow-primary"
      >
        <CheckCircle size={48} className="text-primary-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <h2 className="text-2xl font-extrabold text-foreground">Order Dispatched! 🎉</h2>
        <p className="text-muted-foreground text-sm mt-2">Your food is on its way. Enjoy!</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate("/")}
        className="mt-10 gradient-primary glow-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold"
      >
        Back to Menu
      </motion.button>
    </div>
  );
};

export default Success;
