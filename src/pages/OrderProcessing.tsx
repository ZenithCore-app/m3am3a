import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, X, Clock, CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  items: OrderItem[];
  location: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderNumber: string;
  estimatedTime: string;
}

const OrderProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [countdown, setCountdown] = useState(10);
  const [isCancelled, setIsCancelled] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [discordSent, setDiscordSent] = useState(false);
  
  // Get order data from navigation state or use defaults
  const orderData: OrderData = location.state || {
    items: [
      { name: "Tacos Poulet", price: 40.00, quantity: 1 },
    ] as OrderItem[],
    location: "riad essalam bloc 6 numero 13",
    subtotal: 40.00,
    deliveryFee: 2.00,
    total: 42.00,
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    estimatedTime: "25-30 minutes"
  };

  const sendToDiscord = async () => {
    if (discordSent) return; // Prevent duplicate calls
    
    const webhookUrl = "https://discord.com/api/webhooks/1477653083076165693/5EAEoGmlbqAHmZLh43b8mB-oJG1L42M-oZ_5P--0rwh7pWolPQ584I0qyL7IeGF21vh3";
    
    const embed = {
      title: "🍔 New Order Received!",
      description: `Order #${orderData.orderNumber}`,
      color: 0x00ff00,
      fields: [
        {
          name: "📍 Delivery Location",
          value: orderData.location,
          inline: false
        },
        {
          name: "⏰ Estimated Time",
          value: orderData.estimatedTime,
          inline: true
        },
        {
          name: "💰 Total Amount",
          value: `$${orderData.total.toFixed(2)}`,
          inline: true
        },
        {
          name: "📋 Order Items",
          value: orderData.items.map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n'),
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "M3A M3A Delivery System"
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });

      if (!response.ok) {
        console.error('Failed to send to Discord:', response.statusText);
      } else {
        console.log('Order sent to Discord successfully');
        setDiscordSent(true); // Mark as sent
      }
    } catch (error) {
      console.error('Error sending to Discord:', error);
    }
  };

  useEffect(() => {
    if (isCancelled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Send to Discord when timer ends
          sendToDiscord();
          setOrderComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCancelled]);

  const handleCancel = () => {
    setIsCancelled(true);
    setTimeout(() => {
      navigate(-1); // Go back to location confirm
    }, 500);
  };

  const handleContinue = () => {
    clearCart();
    navigate("/");
  };

  if (isCancelled) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Order Cancelled</h2>
            <p className="text-muted-foreground">Returning to previous page...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={40} className="text-green-500" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Delivery Confirmed!</h2>
            <p className="text-muted-foreground mb-6">Your order is on the way</p>
            
            <div className="glass rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Package size={16} className="text-primary" />
                <span className="font-medium text-foreground">Order #{orderData.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                <span className="text-sm text-foreground">Est. {orderData.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-sm text-muted-foreground">{orderData.location}</span>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleContinue}
              className="w-full gradient-primary glow-primary text-primary-foreground py-3 rounded-xl font-medium"
            >
              Back to Home
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen flex flex-col">
      <div className="flex items-center gap-4 px-5 pt-6 mb-4">
        <button onClick={handleCancel} className="glass w-11 h-11 rounded-xl flex items-center justify-center text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Confirming Order</h1>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="relative inline-flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
              className="absolute"
            >
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </motion.div>
            <div className="text-3xl font-bold text-primary">{countdown}</div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Confirming your order...</p>
        </motion.div>

        {/* Receipt-style Order Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-200 relative overflow-hidden">
            {/* Receipt Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg">M3A M3A DELIVERY</h3>
              <p className="text-sm text-gray-600">Order #{orderData.orderNumber}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">ORDER DETAILS</h4>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-6 pb-4 border-b-2 border-gray-300">
              <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">DELIVERY INFO</h4>
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700 font-medium flex-1">{orderData.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <p className="text-xs text-gray-700 font-medium">Est. {orderData.estimatedTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-green-500" />
                  <p className="text-xs text-gray-700 font-medium">Cash on Delivery</p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 mb-6 bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">SUBTOTAL</span>
                <span className="text-gray-800 font-semibold">${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">DELIVERY</span>
                <span className="text-gray-800 font-semibold">${orderData.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                <span>TOTAL</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">Thank you for your order!</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-primary rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancel Button */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCancel}
              className="w-full mb-6 py-3 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors"
            >
              Cancel Order ({countdown}s)
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderProcessing;
