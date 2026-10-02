import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function CategoryCards({ onSelectCategory }) {
  return (
    <section className="py-6 md:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.title)}
            className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#FAF5F3] hover:bg-[#F8F0EE] border border-[#F2E4E7] hover:border-[#E8CAD2] transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 overflow-hidden"
          >
            {/* Start Content Area */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[55%]">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#3A2228] font-normal tracking-tight group-hover:text-[#C97A8B] transition-colors mb-1.5">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#7A646A] leading-relaxed line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>

              {/* Circular Action Arrow */}
              <div className="mt-4">
                <span 
                  aria-label={`تصفح ${cat.title}`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#DFC3CB] text-[#6E4F57] group-hover:bg-[#C97A8B] group-hover:border-[#C97A8B] group-hover:text-white transition-all duration-300 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            {/* End Bouquet Visual */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 -mr-2 rtl:-mr-0 rtl:-ml-2 -my-2 flex-shrink-0 overflow-hidden rounded-xl">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
              />
              {/* Soft subtle radial mask to seamlessly blend into background */}
              <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#FAF5F3]/50 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
