import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Processing = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigate("/success");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="app-container min-h-screen flex flex-col items-center justify-center px-5">
      {/* Pulsing ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full gradient-primary opacity-40 animate-pulse-glow" />
        <div className="absolute inset-2 rounded-full gradient-primary opacity-50 animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-4 rounded-full gradient-primary opacity-60 animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="relative z-10 glass-strong w-20 h-20 rounded-full flex items-center justify-center">
          <span className="text-3xl font-extrabold text-foreground">{seconds}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-8"
      >
        <h2 className="text-xl font-extrabold text-foreground">Processing Order</h2>
        <p className="text-muted-foreground text-sm mt-2">Confirming your delicious meal...</p>
      </motion.div>
    </div>
  );
};

export default Processing;
