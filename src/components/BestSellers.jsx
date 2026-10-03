import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { SectionSprig } from './BotanicalDecorations';
import { PRODUCTS } from '../data/products';

export default function BestSellers({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onOpenProductModal,
  selectedCategory = 'الكل',
  onSelectCategory
}) {
  const [filter, setFilter] = useState('الكل');

  const productList = Array.isArray(products) ? products : [];

  const filteredProducts = productList.filter((p) => {
    if (filter === 'الكل') return true;
    if (filter === 'الأكثر مبيعاً') return p.badge === 'الأكثر مبيعاً';
    return p.category === filter;
  });

  return (
    <section id="bouquets" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-[#F3E3E6] gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <SectionSprig className="w-6 h-6 text-[#C97A8B]" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#361F25] font-normal tracking-tight">
              الأكثر مبيعاً
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setFilter('الكل')}
            className="sm:hidden group inline-flex items-center gap-1 text-xs font-normal text-[#6B5258] hover:text-[#C97A8B] transition-colors"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto overflow-hidden">
          {/* Quick filter pills - Visible & horizontally scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {['الكل', 'باقات', 'رومانسية', 'أعياد الميلاد', 'هدايا تخرج'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === cat
                    ? 'bg-[#C97A8B] text-white font-medium shadow-xs'
                    : 'bg-[#FAF5F7] sm:bg-transparent text-[#6B5258] hover:text-[#C97A8B] hover:bg-rose-50 border border-[#F0E0E4] sm:border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFilter('الكل')}
            className="hidden sm:inline-flex group items-center gap-1.5 text-xs sm:text-sm font-normal text-[#6B5258] hover:text-[#C97A8B] transition-colors whitespace-nowrap shrink-0"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);

          return (
            <div
              key={product.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#F0E2E5] hover:border-[#E5BFC7] hover:shadow-lg hover:shadow-rose-900/5 transition-all duration-300"
            >
              {/* Product Image Area */}
              <div 
                className="relative aspect-[4/5] bg-[#F9F5F3] overflow-hidden cursor-pointer"
                onClick={() => onOpenProductModal(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />

                {/* Best Seller Badge */}
                {product.badge && (
                  <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-[11px] font-medium bg-[#C97A8B] text-white shadow-xs">
                    {product.badge}
                  </span>
                )}

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xs flex items-center justify-center text-[#5E434A] hover:text-[#C97A8B] transition-transform active:scale-90 hover:scale-110"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isWishlisted 
                        ? 'fill-[#C97A8B] text-[#C97A8B]' 
                        : 'stroke-[1.6]'
                    }`}
                  />
                </button>
              </div>

              {/* Product Info Area */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 
                    onClick={() => onOpenProductModal(product)}
                    className="font-serif text-lg sm:text-xl text-[#361F25] font-normal tracking-tight hover:text-[#C97A8B] transition-colors cursor-pointer mb-1 line-clamp-1"
                  >
                    {product.name}
                  </h3>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="flex text-[#DDA668]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                      ))}
                    </div>
                    <span className="text-xs text-[#826E73] font-light">
                      ({product.reviewsCount} تقييم)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-base sm:text-lg font-medium text-[#361F25]">
                      {Number(product.price).toLocaleString()} ر.ي
                    </span>
                    {product.originalPrice && (
                      <span className="mr-2 text-xs text-[#9B888D] line-through">
                        {Number(product.originalPrice).toLocaleString()} ر.ي
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Pill Button */}
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-xs hover:shadow-rose-300/30 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                  <span>أضف إلى السلة</span>
                </button>
              </div>

            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#F2E3E6] p-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-[#C97A8B] flex items-center justify-center mx-auto mb-3 border border-[#F2D6DC]">
              <SectionSprig className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#381F26] mb-1.5 font-normal">لا توجد باقات معروضة حالياً</h3>
            <p className="text-xs text-[#826E73] max-w-sm mx-auto">
              تعتمد هذه الصفحة مباشرة على قاعدة البيانات. يمكنك إضافة باقات جديدة مع صورها وتفاصيلها من لوحة التحكم.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
