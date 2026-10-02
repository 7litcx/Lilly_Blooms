import React from 'react';
import { X } from 'lucide-react';

export default function StoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/45 backdrop-blur-xs" />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-[#FCFAF9] rounded-3xl shadow-2xl border border-[#EEDCE0] p-6 sm:p-10 overflow-hidden">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 end-4 p-2 rounded-full text-[#7A6369] hover:text-[#C97A8B] hover:bg-rose-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E7C2CB] shadow-sm mb-4">
              <img src="/images/logo.jpg" alt="شعار ليلي بلومز" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs tracking-widest text-[#B8697A] font-medium mb-1">
              ✦ قصة ليلي بلومز
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#381F26] font-light">
              نصنع الفرح، بتلة تلو الأخرى.
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#664F55] leading-relaxed font-light text-start">
            <p>
              انطلقت <strong>ليلي بلومز</strong> من شغف أصيل بفنون النباتات وتنسيق الزهور، لتكون استوديو حرفياً يحوّل سحر الطبيعة إلى مشاعر محبة وتقدير خالدة.
            </p>
            <p>
              كل زهرة يتم اختيارها بعناية وتنسيقها بأيدي نخبة من فناني الزهور. من زهور الزنبق الوردي الفاخرة إلى ورود الحدائق النادرة، نبتكر تنسيقات تنبض بالمشاعر التي تعجز الكلمات عن وصفها.
            </p>
            <p>
              تصل كل باقة بتغليفنا الياباني المموّج والمقاوم للماء مع أشرطة الأورجانزا الحريرية وبطاقات الإهداء المكتوبة بخط اليد، لتجعل كل مناسبة ذكرى لا تُنسى.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F0DFE2] flex items-center justify-between">
            <div className="font-serif italic text-xl sm:text-2xl text-[#C97A8B]">
              بكل حب، إليانور وفريق ليلي بلومز ♡
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#C97A8B] text-white text-xs font-medium hover:bg-[#B8697A] transition-colors"
            >
              العودة للمتجر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
