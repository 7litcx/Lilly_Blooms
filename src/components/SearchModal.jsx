import React, { useState } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function SearchModal({ isOpen, onClose, onSelectProduct, products = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const productList = (products && products.length > 0) ? products : PRODUCTS;

  const results = searchTerm.trim() === '' 
    ? [] 
    : productList.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const popularSearches = ['حلم الزنبق الوردي', 'رومانسية', 'باقات الورد', 'أعياد الميلاد', 'الأكثر مبيعاً'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="min-h-full flex items-start justify-center pt-20 px-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EFE0E4] p-6 overflow-hidden">
          
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#F2E3E6]">
            <Search className="w-5 h-5 text-[#C97A8B]" />
            <input
              type="text"
              autoFocus
              placeholder="ابحث عن باقات منسقة، ورد رومانسي، هدايا فاخرة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-base sm:text-lg text-[#381F26] placeholder-[#A48F94] focus:outline-none bg-transparent"
            />
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-1.5 text-[#887076] hover:text-[#C97A8B] rounded-full hover:bg-rose-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Popular Tag suggestions */}
          {searchTerm.trim() === '' && (
            <div className="py-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8B747A] block mb-3">
                عمليات البحث الشائعة
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-[#FAF5F3] hover:bg-rose-100 text-[#5C454B] hover:text-[#C97A8B] border border-[#EFE0E4] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {searchTerm.trim() !== '' && (
            <div className="py-4 max-h-96 overflow-y-auto space-y-3">
              {results.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#877278]">
                  لم يتم العثور على باقات تطابق "{searchTerm}". جرّب البحث عن "زنبق" أو "ورد".
                </div>
              ) : (
                results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#FAF5F3] cursor-pointer transition-colors border border-transparent hover:border-[#EFE0E4]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg bg-[#FAF5F3]"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif text-base text-[#381F26] font-normal">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#877278]">{product.category}</p>
                    </div>
                    <span className="text-sm font-medium text-[#C97A8B]">
                      {Number(product.price).toLocaleString()} ر.ي
                    </span>
                    <ArrowLeft className="w-4 h-4 text-[#C97A8B]" />
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
