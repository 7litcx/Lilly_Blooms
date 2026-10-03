import React, { useState, useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoryCards from './components/CategoryCards';
import BestSellers from './components/BestSellers';
import OurStory from './components/OurStory';
import Footer from './components/Footer';

import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import SearchModal from './components/SearchModal';
import ChatWidget from './components/ChatWidget';
import StoryModal from './components/StoryModal';
import AuthModal from './components/AuthModal';
import WishlistModal from './components/WishlistModal';
import AdminDashboard from './components/AdminDashboard';

import { getProducts, getSliderSlides } from './lib/supabase';

export default function App() {
  // Cart state - initialized completely empty (no dummy items)
  const [cartItems, setCartItems] = useState([]);

  // Live products loaded directly from the database
  const [products, setProducts] = useState([]);

  // Live slider banners loaded from database / local store
  const [sliderSlides, setSliderSlides] = useState([]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState([]);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  // Admin authentication state (persistent in localStorage)
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lilly_is_admin') === 'true';
    }
    return false;
  });

  const handleAdminLogin = () => {
    setIsAdmin(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lilly_is_admin', 'true');
    }
    showToast('تم تسجيل الدخول كمسؤول للمتجر بنجاح! 🌸');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lilly_is_admin');
    }
    setIsAdminOpen(false);
    showToast('تم تسجيل خروج الإدارة');
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('الرئيسية');

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState(null);

  const fetchLiveProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch live products:', err);
      setProducts([]);
    }
  };

  const fetchLiveSlides = async () => {
    try {
      const data = await getSliderSlides();
      setSliderSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch slider slides:', err);
      setSliderSlides([]);
    }
  };

  useEffect(() => {
    fetchLiveProducts();
    fetchLiveSlides();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
          }
        ];
      }
    });

    showToast(`تمت إضافة "${product.name}" إلى سلة الزهور 🌸`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleToggleWishlist = (productId) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        showToast('تم الحفظ في قائمة المفضلة ♡');
        return [...prev, productId];
      }
    });
  };

  const handleShopBouquets = () => {
    const el = document.getElementById('bouquets');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveTab('باقات الورد');
  };

  const handleExploreGifts = () => {
    const el = document.getElementById('about-us');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveTab('الهدايا');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F9] selection:bg-rose-200 selection:text-rose-900">
      
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isAdmin}
        onLogoutAdmin={handleAdminLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 3. Hero Banner Slider */}
        <HeroSection
          slides={sliderSlides}
          onShopBouquets={handleShopBouquets}
          onExploreGifts={handleExploreGifts}
        />

        {/* 4. Highlight Category Cards */}
        <CategoryCards
          onSelectCategory={(categoryName) => {
            handleShopBouquets();
          }}
        />

        {/* 5. Best Sellers Section */}
        <BestSellers
          products={products}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
          onOpenProductModal={(product) => setModalProduct(product)}
        />

        {/* 6. Brand Story & Integrated Newsletter */}
        <OurStory onLearnMore={() => setIsStoryOpen(true)} />
      </main>

      {/* 7. Footer with floating concierge chat button */}
      <Footer 
        onOpenChat={() => setIsChatOpen(true)} 
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Modals & Slide-out Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={() => {
          setCartItems([]);
          showToast('تم تسجيل طلبك وحفظه بنجاح! 🌸');
        }}
      />

      <ProductModal
        product={modalProduct}
        isOpen={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={modalProduct ? wishlistIds.includes(modalProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(product) => setModalProduct(product)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
        onLogoutAdmin={handleAdminLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Full Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductsUpdated={fetchLiveProducts}
        onSlidesUpdated={fetchLiveSlides}
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 bg-[#381F26] text-white px-5 py-3 rounded-full shadow-2xl border border-rose-300/20 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-ping" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="mr-2 underline text-rose-200 hover:text-white font-medium"
            >
              عرض السلة
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
