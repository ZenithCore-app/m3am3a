import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

const LocationConfirm = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [location, setLocation] = useState("");
  const [placing, setPlacing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (isProcessing || !location.trim()) {
      if (!location.trim()) {
        alert("Please enter your delivery location");
      }
      return;
    }

    setIsProcessing(true);
    setPlacing(true);

    const orderItems = items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }));
    const orderTotal = total + 2;

    // Navigate to order processing with order data
    navigate("/processing", { 
      state: {
        items: orderItems,
        location: location.trim(),
        subtotal: total,
        deliveryFee: 2,
        total: orderTotal,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        estimatedTime: "25-30 minutes"
      }
    });
    
    setIsProcessing(false);
    setPlacing(false);
  };

  return (
    <div className="app-container min-h-screen flex flex-col">
      <div className="flex items-center gap-4 px-5 pt-6 mb-4">
        <button onClick={() => navigate(-1)} className="glass w-11 h-11 rounded-xl flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Confirm Location</h1>
      </div>

      <p className="px-5 text-muted-foreground text-sm mb-3">
        <MapPin size={14} className="inline mr-1 text-primary" />
        Enter your delivery location address
      </p>

      <div className="flex-1 px-5">
        <div className="glass rounded-2xl p-4 mb-6">
          <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
            Delivery Address
          </label>
          <textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your complete delivery address..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Please include street name, building number, and any landmarks to help us find you easily.
          </p>
        </div>

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="font-bold text-foreground mb-2">Delivery Information</h3>
          <p className="text-sm text-muted-foreground">
            📍 Location: {location || "Not specified"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            💡 Make sure to provide a detailed address for accurate delivery
          </p>
        </div>

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Order Summary</h3>
          <div className="space-y-2 mb-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">$2.00</span>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span>${(total + 2).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-2">Payment Method</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">💵</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePlaceOrder();
          }}
          disabled={placing || !location.trim()}
          className="w-full gradient-primary glow-primary text-primary-foreground py-4 rounded-2xl font-bold text-base disabled:opacity-50"
        >
          {placing ? "Placing Order..." : `Confirm & Place Order · $${(total + 2).toFixed(2)}`}
        </motion.button>
      </div>
    </div>
  );
};

export default LocationConfirm;
