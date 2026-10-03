import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_SLIDER_SLIDES } from '../lib/supabase';

export default function HeroSection({ slides = [], onShopBouquets, onExploreGifts }) {
  // Use passed slides or fallback to defaults
  const displaySlides = (slides && slides.length > 0)
    ? slides.filter((s) => s.isActive !== false)
    : DEFAULT_SLIDER_SLIDES;

  const validSlides = displaySlides.length > 0 ? displaySlides : DEFAULT_SLIDER_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentIndex >= validSlides.length) {
      setCurrentIndex(0);
    }
  }, [validSlides.length, currentIndex]);

  // Auto-play timer
  useEffect(() => {
    if (validSlides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [validSlides.length, isHovered]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % validSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left
      nextSlide();
    } else if (diff < -45) {
      // Swiped right
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Slide click action
  const handleSlideClick = (slide) => {
    if (slide.link) {
      if (slide.link.startsWith('#')) {
        const target = document.querySelector(slide.link);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } else if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    if (onShopBouquets) {
      onShopBouquets();
    }
  };

  return (
    <section id="home" className="w-full pt-3 pb-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Slider Card Container */}
        <div
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-[#F0E0E4]/70 bg-[#FBF6F7] group select-none transition-shadow hover:shadow-md h-[180px] xs:h-[220px] sm:h-[320px] md:h-[400px] lg:h-[450px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides List with Smooth Fade Transition */}
          {validSlides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => handleSlideClick(slide)}
                className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Banner Image */}
                <img
                  src={slide.image}
                  alt={slide.title || 'بانر ليلي بلومز'}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle Gradient Shadow for readability if title exists */}
                {slide.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex flex-col justify-end p-4 sm:p-8 md:p-10 text-white">
                    <div className="max-w-2xl transform transition-transform duration-500">
                      <h2 className="font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide drop-shadow-md mb-1 sm:mb-2 text-white">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-xs sm:text-sm md:text-base text-rose-100/90 font-light drop-shadow-sm line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Navigation Arrows */}
          {validSlides.length > 1 && (
            <>
              {/* Right Arrow (Previous in RTL) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="البنر السابق"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-75 sm:opacity-0 group-hover:opacity-100 hover:scale-105 shadow-md"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>

              {/* Left Arrow (Next in RTL) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="البنر التالي"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-75 sm:opacity-0 group-hover:opacity-100 hover:scale-105 shadow-md"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Pagination Indicators / Dots (Exact Match to Reference Screenshot) */}
          {validSlides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/20 backdrop-blur-xs">
              {validSlides.map((_, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    aria-label={`الانتقال للشريحة ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow-sm'
                        : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 hover:bg-white/90'
                    }`}
                  />
                );
              })}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
