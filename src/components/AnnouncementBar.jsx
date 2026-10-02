import React from 'react';

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-[#FCECEF] border-b border-[#F7D6DC] py-2 px-4 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs md:text-sm font-medium tracking-wide text-[#A85A6E]">
        <span className="text-sm select-none opacity-90">🌸</span>
        <span>توصيل مجاني للطلبات الأكثر من 30,000 ر.ي</span>
        <span className="text-[10px] text-rose-400 select-none">✦</span>
        <span>أسعد من تحب اليوم بباقة زهور مميزة</span>
        <span className="text-sm select-none opacity-90">🌸</span>
      </div>
    </div>
  );
}
