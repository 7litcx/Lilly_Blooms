import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { BotanicalBranch } from './BotanicalDecorations';

export default function HeroSection({ products = [], onShopBouquets, onExploreGifts, onQuickViewHero }) {
  // If products exist in database, map them dynamically
  const activeSlides = (products && products.length > 0)
    ? products.slice(0, 5).map((p, idx) => ({
        id: p.id || idx,
        image: p.image || '/images/pink-lily-hero.jpg',
        alt: p.name,
        badge: p.badge || 'المجموعة الخاصة',
        title: p.name,
        price: `${Number(p.price).toLocaleString()} ر.ي`,
        product: p
      }))
    : [
        {
          id: 'default-hero',
          image: '/images/pink-lily-hero.jpg',
          alt: "ليلي بلومز - باقات زهور طبيعية منسقة بعناية",
          badge: "ليلي بلومز",
          title: "باقات زهور استثنائية",
          price: ""
        }
      ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIndex = currentSlide >= activeSlides.length ? 0 : currentSlide;
  const currentItem = activeSlides[slideIndex];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <section id="home" className="relative overflow-hidden pt-6 pb-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="relative z-10 lg:col-span-6 flex flex-col items-start pl-0 lg:pl-4">
            

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-light tracking-tight text-[#381F26] leading-[1.25] mb-6">
              زهور مُختارة بعناية <br />
              <span className="italic font-normal text-[#C97A8B]">لأجمل لحظات الحياة وأثمنها</span>
            </h1>

            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-[#6E555C] max-w-xl font-light leading-relaxed mb-8">
              باقات منسّقة بعناية، هدايا راقية ولحظات فرح لا تُنسى — كلها بين يديك في مكان واحد.
            </p>

            {/* Call to action buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-12">
              <button
                type="button"
                onClick={onShopBouquets}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-sm md:text-base font-medium transition-all duration-300 shadow-md hover:shadow-rose-300/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>تسوق الباقات</span>
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreGifts}
                className="group inline-flex items-center gap-2 text-sm md:text-base font-normal text-[#5A4047] hover:text-[#C97A8B] transition-colors py-2 border-b border-transparent hover:border-[#C97A8B]"
              >
                <span>استكشف الهدايا</span>
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            </div>

            {/* Botanical Branch line art decoration at bottom start */}
            <div className="hidden sm:block absolute -bottom-10 start-0 -z-10 pointer-events-none opacity-40 scale-x-[-1]">
              <BotanicalBranch className="w-48 h-48 text-[#D89AA8]" />
            </div>
          </div>

          {/* Right Column: Hero Product Image Display */}
          <div className="lg:col-span-6 relative">
            
            {/* Soft Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#FCECEF]/80 via-[#FAF1ED]/60 to-transparent rounded-[2.5rem] blur-2xl -z-10" />

            {/* Image Frame with Warm Sunlight/Shadow Backdrop */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-rose-900/10 border border-[#F3E5E8] bg-[#F7F2EE] group">
              
              <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
                <img
                  src={currentItem.image}
                  alt={currentItem.alt}
                  className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() => onQuickViewHero && onQuickViewHero(currentItem.product || currentItem)}
                />

                {/* Subtle soft gradient overlay at the bottom for readability */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />

                {/* Interactive Carousel Badge & Counter */}
                <div className="absolute bottom-4 end-5 z-20 flex items-center gap-3 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-sm text-xs font-serif text-[#5E474D]">
                  <button 
                    onClick={prevSlide}
                    aria-label="الصورة السابقة"
                    className="hover:text-[#C97A8B] transition-colors p-0.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="tracking-wider select-none font-sans">
                    ( {slideIndex + 1} / {activeSlides.length} )
                  </span>
                  <button 
                    onClick={nextSlide}
                    aria-label="الصورة التالية"
                    className="hover:text-[#C97A8B] transition-colors p-0.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick preview tag button */}
                <button
                  onClick={() => onQuickViewHero && onQuickViewHero(currentItem.product || currentItem)}
                  className="absolute bottom-4 start-5 z-20 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-xs text-xs font-medium text-[#4D3339] hover:bg-white hover:text-[#C97A8B] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C97A8B]" />
                  <span>عرض التفاصيل</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
