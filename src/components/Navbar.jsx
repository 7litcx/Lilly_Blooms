import React, { useState } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
  onOpenAuth,
  onOpenAdmin,
  isAdmin = false,
  onLogoutAdmin,
  activeTab = 'الرئيسية',
  setActiveTab
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'باقات الورد', href: '#bouquets' },
    { name: 'الزهور', href: '#flowers' },
    { name: 'الهدايا', href: '#gifts' },
    { name: 'من نحن', href: '#about-us' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FCF9F9]/95 backdrop-blur-md border-b border-[#F3E5E8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* Brand Logo */}
          <a 
            href="#home" 
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-full"
            aria-label="الصفحة الرئيسية لـ ليلي بلومز"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 border border-[#EAC5CE] shadow-sm bg-white transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/images/logo.jpg" 
                alt="شعار ليلي بلومز" 
                className="w-full h-full object-cover object-center rounded-full"
              />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = activeTab === link.name;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveTab(link.name);
                  }}
                  className={`relative text-sm lg:text-base font-normal tracking-wide transition-colors py-1 ${
                    isActive 
                      ? 'text-[#C97A8B] font-medium' 
                      : 'text-[#5C454B] hover:text-[#C97A8B]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C97A8B] rounded-full transform transition-all duration-300" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="البحث عن باقات"
              className="p-2 text-[#5C454B] hover:text-[#C97A8B] transition-colors rounded-full hover:bg-rose-50/60 focus:outline-none"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Account / User */}
            <button
              type="button"
              onClick={onOpenAuth}
              aria-label="حساب المستخدم"
              className="p-2 text-[#5C454B] hover:text-[#C97A8B] transition-colors rounded-full hover:bg-rose-50/60 focus:outline-none"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`المفضلة (${wishlistCount} عناصر)`}
              className="relative p-2 text-[#5C454B] hover:text-[#C97A8B] transition-colors rounded-full hover:bg-rose-50/60 focus:outline-none"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-1 start-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-[#C97A8B] rounded-full border border-white">
                {wishlistCount}
              </span>
            </button>

            {/* Shopping Cart Bag */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`سلة المشتريات (${cartCount} عناصر)`}
              className="relative p-2 text-[#5C454B] hover:text-[#C97A8B] transition-colors rounded-full hover:bg-rose-50/60 focus:outline-none group"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className="absolute top-1 start-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-[#C97A8B] rounded-full border border-white shadow-xs animate-pulse">
                {cartCount}
              </span>
            </button>

            {/* Admin Dashboard Quick Access Button (Visible ONLY to Admin) */}
            {isAdmin && (
              <div className="inline-flex items-center gap-1 bg-rose-50/90 p-0.5 rounded-full border border-[#EAC5CE]">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  aria-label="لوحة التحكم"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C97A8B] hover:text-[#B8697A] text-xs font-medium transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </button>
                {onLogoutAdmin && (
                  <button
                    type="button"
                    onClick={onLogoutAdmin}
                    title="تسجيل خروج الإدارة"
                    className="p-1.5 text-[#9E8B90] hover:text-red-600 rounded-full hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#5C454B] hover:text-[#C97A8B] rounded-lg"
              aria-label="فتح القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#F3E5E8] bg-[#FCF9F9] px-6 py-5 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveTab(link.name);
                  setMobileMenuOpen(false);
                }}
                className={`text-base font-normal tracking-wide transition-colors ${
                  activeTab === link.name ? 'text-[#C97A8B] font-medium' : 'text-[#5C454B]'
                }`}
              >
                {link.name}
              </a>
            ))}
            {isAdmin && (
              <div className="pt-2 border-t border-[#F3E5E8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdmin && onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-[#C97A8B]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة تحكم المتجر (الإدارة)</span>
                </button>
                {onLogoutAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogoutAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-500 hover:underline px-2"
                  >
                    خروج
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
