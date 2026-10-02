import React from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistIds,
  onAddToCart,
  onToggleWishlist
}) {
  if (!isOpen) return null;

  const wishlistedProducts = PRODUCTS.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/45 backdrop-blur-xs" />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EEDCE0] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2E3E6]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-[#C97A8B] text-[#C97A8B]" />
              <h3 className="font-serif text-2xl text-[#381F26] font-normal">
                الباقات المفضلة ({wishlistedProducts.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-1.5 text-[#7A6369] hover:text-[#C97A8B] rounded-full hover:bg-rose-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-3">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-12 text-[#8A747A]">
                <Heart className="w-12 h-12 stroke-[1] mx-auto mb-3 text-rose-200" />
                <p className="font-serif text-lg text-[#381F26]">لا توجد باقات في المفضلة بعد</p>
                <p className="text-xs text-[#9E8B90] mt-1">اضغط على رمز القلب في أي باقة لإضافتها إلى قائمة مفضلتك.</p>
              </div>
            ) : (
              wishlistedProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#FAF5F3] border border-[#EFE0E4]">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-serif text-base text-[#381F26]">{p.name}</h4>
                    <p className="text-xs font-semibold text-[#C97A8B]">{Number(p.price).toLocaleString()} ر.ي</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddToCart(p);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#C97A8B] text-white text-xs font-medium hover:bg-[#B8697A] transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>أضف للسلة</span>
                    </button>
                    <button
                      onClick={() => onToggleWishlist(p.id)}
                      className="p-1.5 text-[#8E797E] hover:text-red-500 rounded-full"
                      title="إزالة"
                      aria-label="إزالة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-[#F2E3E6] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#FAF3F1] hover:bg-rose-100 text-[#C97A8B] text-xs font-medium transition-colors"
            >
              متابعة التصفح
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
