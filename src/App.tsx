import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import FloatingNav from "@/components/FloatingNav";
import Index from "./pages/Index";
import RestaurantMenu from "./pages/RestaurantMenu";
import ItemDetail from "./pages/ItemDetail";
import Cart from "./pages/Cart";
import LocationConfirm from "./pages/LocationConfirm";
import OrderProcessing from "./pages/OrderProcessing";
import Success from "./pages/Success";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <div className="min-h-screen bg-background flex justify-center">
    <div className="w-full max-w-[450px] relative">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/restaurant/:id" element={<RestaurantMenu />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/location" element={<LocationConfirm />} />
        <Route path="/processing" element={<OrderProcessing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingNav />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <FavoritesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
