import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { StoryBotanicalFlourish } from './BotanicalDecorations';

export default function OurStory({ onLearnMore }) {
  return (
    <section id="about-us" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-[#FCECEF] border border-[#F7D6DC] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-sm">
        
        {/* Story and Brand Emblem */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Brand Emblem Badge */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full p-2 border-2 border-[#E7C2CB] shadow-md bg-white/80 backdrop-blur-xs flex items-center justify-center group hover:scale-105 transition-transform duration-500">
              <img
                src="/images/logo.jpg"
                alt="شعار ليلي بلومز"
                className="w-full h-full object-cover object-center rounded-full"
              />
              <div className="absolute inset-0 rounded-full border border-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Narrative Story */}
          <div className="lg:col-span-8 relative">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 mb-4 text-sm sm:text-base tracking-[0.2em] font-bold text-[#B8697A]">
              <span className="text-base sm:text-lg">✦</span>
              <span>قصتنا</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#C97A8B] leading-tight mb-6">
              زهور صُنعت <br />
              <span className="italic font-medium">لتعبّر عما في القلب بكل حب.</span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#583E45] leading-relaxed max-w-3xl font-normal mb-8">
              في ليلي بلومز، نؤمن بأن الزهور تتحدث لغة القلب الصادقة. كل باقة ننسقها بحرفية وحب لتضفي لمسة من الجمال، الدفء والرقة على عالمكم وأحبائكم.
            </p>

            {/* Learn More link */}
            <button
              type="button"
              onClick={onLearnMore}
              className="group inline-flex items-center gap-2.5 text-base sm:text-lg font-medium text-[#5A4047] hover:text-[#C97A8B] transition-colors py-1.5 border-b-2 border-transparent hover:border-[#C97A8B] cursor-pointer"
            >
              <span>اعرف المزيد</span>
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
            </button>

            {/* Botanical flourish SVG behind */}
            <div className="hidden lg:block absolute bottom-0 start-10 pointer-events-none opacity-40">
              <StoryBotanicalFlourish className="w-40 h-40 text-[#DCAAB5]" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
