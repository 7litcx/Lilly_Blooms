import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Footer({ onOpenChat, onOpenAdmin, isAdmin = false }) {
  return (
    <footer className="relative bg-[#FCF9F9] border-t border-[#F2E3E6] pt-12 pb-8 overflow-hidden text-[#5C454B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-[#F2E3E6]">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E9C3CC] bg-white shadow-xs p-0.5 mb-4 group hover:scale-105 transition-transform">
              <img
                src="/images/logo.jpg"
                alt="شعار ليلي بلومز"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <p className="text-sm sm:text-base text-[#70585E] leading-relaxed">
              © 2025 ليلي بلومز.<br />جميع الحقوق محفوظة.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#381F26] mb-4">
              روابط سريعة
            </h4>
            <ul className="space-y-3 text-sm sm:text-base text-[#5C454B]">
              <li><a href="#home" className="hover:text-[#C97A8B] transition-colors">الرئيسية</a></li>
              <li><a href="#bouquets" className="hover:text-[#C97A8B] transition-colors">باقات الورد</a></li>
              <li><a href="#flowers" className="hover:text-[#C97A8B] transition-colors">الزهور</a></li>
              <li><a href="#gifts" className="hover:text-[#C97A8B] transition-colors">الهدايا</a></li>
              <li><a href="#about-us" className="hover:text-[#C97A8B] transition-colors">من نحن</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#381F26] mb-4">
              خدمة العملاء
            </h4>
            <ul className="space-y-3 text-sm sm:text-base text-[#5C454B]">
              <li><a href="#shipping" className="hover:text-[#C97A8B] transition-colors">الشحن والتوصيل</a></li>
              <li><a href="#returns" className="hover:text-[#C97A8B] transition-colors">الاسترجاع والاستبدال</a></li>
              <li><a href="#faq" className="hover:text-[#C97A8B] transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#contact" className="hover:text-[#C97A8B] transition-colors">تواصل معنا</a></li>
              {isAdmin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="text-[#C97A8B] hover:underline font-bold text-sm sm:text-base flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>لوحة تحكم المتجر (الإدارة)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Follow Us */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#381F26] mb-4">
              تابعنا
            </h4>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.instagram.com/lilllyblooms?stkn=bmUzb3BlYTZvcHFq" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="إنستغرام ليلي بلومز"
                title="إنستغرام @lilllyblooms"
                className="w-10 h-10 rounded-full border border-[#DFC3CB] bg-white flex items-center justify-center text-[#5C454B] hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:scale-110 hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer group"
              >
                <svg className="w-5 h-5 fill-currentColor transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 5: Decorative Script Sign-off */}
          <div className="lg:col-span-1 flex flex-col justify-end items-start lg:items-end">
            <p className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#C97A8B] tracking-wide transform -rotate-2 select-none">
              “Lilly Blooms”
            </p>
          </div>

        </div>

        {/* Bottom Bar without payment methods */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div className="flex items-center gap-2 text-sm sm:text-base text-[#7D646A]">
            <span>صُنعت بكل حب لجميع عشاق الزهور والأناقة 🌸</span>
          </div>
        </div>

      </div>

      {/* Floating Chat Support Bubble */}
      <div className="fixed bottom-6 end-6 z-40">
        <button
          type="button"
          onClick={onOpenChat}
          aria-label="محادثة مستشار الزهور"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white shadow-lg hover:shadow-rose-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 stroke-[1.8]" />
          <span className="absolute -top-1 -start-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
        </button>
      </div>
    </footer>
  );
}
