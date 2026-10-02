import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function ChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'florist',
      text: "أهلاً بك عزيزي! 🌸 مرحباً بك في ليلي بلومز. أنا إليانور، مستشارتك الخاصة للزهور. هل تبحث عن مفاجأة رومانسية أم باقة احتفالية اليوم؟"
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Florist intelligent simulated response
    setTimeout(() => {
      let reply = "باقتنا الأيقونية 'حلم الزنبق الوردي' هي الأكثر طلباً لدينا حالياً! تتميز بزهور الزنبق الفاخرة بورق ياباني بليسيه وشريط أورجانزا حريري.";
      const lower = query.toLowerCase();
      if (lower.includes('ذكرى') || lower.includes('رومانس') || lower.includes('حب') || lower.includes('anniversary') || lower.includes('romantic')) {
        reply = "للمناسبات الرومانسية وذكرى الزواج، نوصي بشدة بباقة 'رومانسية الورد' أو 'حلم الزنبق الوردي'. يمكنك إضافة فازة كريستالية وكرت إهداء مكتوب باليد!";
      } else if (lower.includes('ميلاد') || lower.includes('birthday')) {
        reply = "لأعياد الميلاد، باقة 'سكينة ناعمة' بألوان الباستيل والهيدرانجيا والورود الندية تضفي بهجة وسروراً لا يضاهى!";
      } else if (lower.includes('توصيل') || lower.includes('شحن') || lower.includes('delivery')) {
        reply = "نوفر توصيلاً سريعاً بنفس اليوم في صناديق مبرّدة فاخرة. كما أن الشحن والتوصيل مجاني لجميع الطلبات فوق 30,000 ر.ي!";
      } else if (lower.includes('عناية') || lower.includes('ماء') || lower.includes('care')) {
        reply = "احرص على إبقاء باقتك في إضاءة معتدلة بعيداً عن التيارات الحارة المباشرة، لتحافظ على نضارتها وألقها لأطول فترة ممكنة!";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'florist', text: reply }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-20 end-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EEDCE0] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#FAF3F1] border-b border-[#EEDCE0] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E7C2CB] bg-white p-0.5">
            <img src="/images/logo.jpg" alt="شعار ليلي بلومز" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-medium text-[#381F26]">
              مستشار ليلي بلومز
            </h4>
            <span className="flex items-center gap-1 text-[11px] text-[#2D6A4F]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              متصل • جاهز لمساعدتك
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="إغلاق المحادثة"
          className="p-1 text-[#8C747B] hover:text-[#C97A8B] rounded-full hover:bg-rose-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="p-4 h-72 overflow-y-auto space-y-3 bg-[#FCFAF9] text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#C97A8B] text-white rounded-te-none'
                  : 'bg-white border border-[#EFE0E4] text-[#4A3339] rounded-ts-none shadow-2xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick suggestions */}
      <div className="px-3 py-2 bg-white border-t border-[#F2E5E8] flex gap-1.5 overflow-x-auto text-[11px]">
        {['أفضل باقة لذكرى سنوية؟', 'مدة الشحن والتوصيل؟', 'نصائح للعناية بالزهور'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleSend(btn)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#FAF5F3] text-[#785F66] hover:bg-rose-100 hover:text-[#C97A8B] border border-[#EFE0E4] transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-[#F2E5E8] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل إليانور أي سؤال..."
          className="flex-1 text-xs px-3.5 py-2 rounded-full border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
        />
        <button
          type="submit"
          aria-label="إرسال"
          className="p-2 rounded-full bg-[#C97A8B] text-white hover:bg-[#B8697A] transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}
