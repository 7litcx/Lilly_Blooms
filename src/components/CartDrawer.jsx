import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Check,
  ArrowLeft,
  Truck,
  Store,
  Printer,
  FileText,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { validatePromoCode, createOrder } from '../lib/supabase';
import { validateName, validatePhone, validateAddress } from '../lib/validation';

const PAYMENT_OPTIONS = [
  {
    id: 'transfer',
    name: 'حوالة',
    details: 'شهد خالد عامر بن جذنان , رقم الجوال : 735252426',
    recipientName: 'شهد خالد عامر بن جذنان',
    phoneNumber: '735252426'
  },
  {
    id: 'deposit',
    name: 'إيداع',
    details: 'بن دول : 369970',
    bankName: 'بن دول',
    accountNumber: '369970'
  }
];

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCompleted
}) {
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [appliedPromoName, setAppliedPromoName] = useState('');
  const [promoError, setPromoError] = useState(null);
  const [giftNote, setGiftNote] = useState('');

  // Steps: 'cart' | 'checkout' | 'invoice'
  const [step, setStep] = useState('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Delivery & Customer fields
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' | 'pickup'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer'); // 'transfer' | 'deposit'
  const [checkoutErrors, setCheckoutErrors] = useState({});

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = (subtotal * promoDiscountPercent) / 100;
  
  // Delivery Fee calculation: Free if pickup, or if order >= 30,000 YER, else 2,500 YER
  const freeShippingThreshold = 30000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryFee = deliveryType === 'pickup' ? 0 : (isFreeShipping ? 0 : 2500);
  const finalTotal = subtotal - discount + deliveryFee;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoCode.trim()) return;

    try {
      const res = await validatePromoCode(promoCode);
      if (res.valid) {
        setPromoDiscountPercent(res.discountPercent);
        setAppliedPromoName(res.code);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
      } else {
        setPromoError('كود الخصم غير صالح أو منتهي الصلاحية');
        setPromoDiscountPercent(0);
        setAppliedPromoName('');
      }
    } catch {
      setPromoError('حدث خطأ أثناء فحص الكود');
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    const errors = {};

    const nameErr = validateName(customerName, 'اسم المستلم');
    if (nameErr) errors.name = nameErr;

    const phoneErr = validatePhone(customerPhone);
    if (phoneErr) errors.phone = phoneErr;

    if (deliveryType === 'delivery') {
      const addrErr = validateAddress(customerAddress);
      if (addrErr) errors.address = addrErr;
    }

    if (Object.keys(errors).length > 0) {
      setCheckoutErrors(errors);
      return;
    }
    setCheckoutErrors({});

    const selectedPayment = PAYMENT_OPTIONS.find(p => p.id === paymentMethod) || PAYMENT_OPTIONS[0];

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: '',
        customerAddress: deliveryType === 'delivery' ? customerAddress.trim() : 'استلام من الفرع الرئيسي',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          flowerCount: item.flowerCount || null,
          flowerSize: item.flowerSize || null
        })),
        subtotal: subtotal,
        discount: discount,
        deliveryFee: deliveryFee,
        totalAmount: finalTotal,
        promoCode: appliedPromoName || null,
        giftMessage: giftNote.trim() || null,
        paymentMethod: `${selectedPayment.name} (${selectedPayment.details})`
      };

      const result = await createOrder(orderPayload);
      const generatedOrderNumber = result.orderNumber || 'LB-' + Math.floor(100000 + Math.random() * 900000);

      const orderInvoiceData = {
        orderNumber: generatedOrderNumber,
        createdAt: new Date().toLocaleString('ar-YE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType: deliveryType,
        customerAddress: deliveryType === 'delivery' ? customerAddress.trim() : 'استلام من الفرع الرئيسي',
        paymentMethod: selectedPayment.id,
        paymentMethodName: selectedPayment.name,
        paymentDetails: selectedPayment.details,
        items: [...cartItems],
        subtotal,
        discount,
        deliveryFee,
        finalTotal,
        giftNote: giftNote.trim()
      };

      setLastOrder(orderInvoiceData);
      setStep('invoice');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#C97A8B', '#F7D6DC', '#FFD1DC', '#E09FAD']
      });

      onOrderCompleted && onOrderCompleted();
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل الطلب: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleOpenWhatsApp = () => {
    if (!lastOrder) return;
    const whatsappNumber = '967733249213';
    
    const itemsList = lastOrder.items
      .map((item, idx) => `${idx + 1}. ${item.name} × ${item.quantity} (${Number(item.price * item.quantity).toLocaleString()} ر.ي)`)
      .join('\n');

    const msg = `مرحباً ليلي بلومز 🌸
أود تأكيد طلبي برقم: #${lastOrder.orderNumber}

👤 اسم العميل: ${lastOrder.customerName}
📱 رقم الجوال: ${lastOrder.customerPhone}
📍 طريقة الاستلام: ${lastOrder.deliveryType === 'delivery' ? 'توصيل إلى موقعي' : 'استلام من الفرع'}
${lastOrder.deliveryType === 'delivery' ? `🏡 العنوان والحي: ${lastOrder.customerAddress}` : ''}
💳 طريقة الدفع: ${lastOrder.paymentMethodName} (${lastOrder.paymentDetails})

📦 تفاصيل الباقات:
${itemsList}

💰 المبلغ الإجمالي: ${Number(lastOrder.finalTotal).toLocaleString()} ر.ي

(مرفق صورة سند الإيداع/الحوالة مع الفاتورة لاعتماد الطلب وتجهيزه)`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCloseModal = () => {
    if (step === 'invoice') {
      setStep('cart');
      setLastOrder(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleCloseModal}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 no-print" 
      />

      <div className="fixed inset-y-0 start-0 max-w-full flex pr-10 rtl:pr-0 rtl:pl-10">
        <div className={`w-screen ${step === 'invoice' ? 'max-w-xl' : 'max-w-md'} bg-[#FCF9F9] shadow-2xl flex flex-col border-e border-[#F0DFE2] transition-all duration-300`}>
          
          {/* Header */}
          <div className="p-6 border-b border-[#F0DFE2] bg-white flex items-center justify-between no-print">
            <div className="flex items-center gap-2.5">
              {step === 'checkout' && (
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="p-1 hover:bg-rose-50 rounded-full text-[#7A646A] hover:text-[#C97A8B] transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rtl:rotate-0" />
                </button>
              )}
              {step === 'invoice' ? (
                <FileText className="w-5 h-5 text-[#C97A8B]" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-[#C97A8B]" />
              )}
              <h2 className="font-serif text-2xl text-[#381F26] font-normal">
                {step === 'cart' && `سلة مشترياتك (${cartItems.reduce((sum, i) => sum + i.quantity, 0)})`}
                {step === 'checkout' && 'إتمام الطلب والدفع'}
                {step === 'invoice' && 'فاتورة الطلب الإلكترونية'}
              </h2>
            </div>
            <button
              onClick={handleCloseModal}
              aria-label="إغلاق النافذة"
              className="p-1.5 text-[#7A646A] hover:text-[#C97A8B] rounded-full hover:bg-rose-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* =============================================================== */}
          {/* STEP 1: CART VIEW                                               */}
          {/* =============================================================== */}
          {step === 'cart' && (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-rose-50 text-[#C97A8B] flex items-center justify-center mb-4">
                      <ShoppingBag className="w-10 h-10 stroke-1" />
                    </div>
                    <h3 className="font-serif text-xl text-[#381F26] mb-1">
                      سلتك فارغة حالياً
                    </h3>
                    <p className="text-xs text-[#7A646A] max-w-xs mb-6">
                      اختر من باقاتنا الفاخرة المنسقة بكل حب لتملأ لحظاتك بهجة وسعادة.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium transition-all shadow-xs"
                    >
                      تصفح الباقات الآن
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 bg-white rounded-2xl border border-[#F0DFE2] shadow-2xs hover:border-[#E8CAD1] transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl bg-rose-50"
                        onError={(e) => { e.target.src = '/images/pink-lily-hero.jpg'; }}
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-xs sm:text-sm text-[#381F26] line-clamp-2 leading-snack">
                              {item.name}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-[#C97A8B] mt-1 block">
                            {Number(item.price).toLocaleString()} ر.ي
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#DFC3CB] rounded-full px-2 py-0.5 bg-[#FAF7F6]">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="text-xs text-[#6D5359] hover:text-[#C97A8B] px-1 font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#381F26] px-2 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="text-xs text-[#6D5359] hover:text-[#C97A8B] px-1 font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#998187] hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Gift Note card */}
                {cartItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#F0DFE2]">
                    <label className="block text-xs font-medium text-[#5E474D] mb-1.5">
                      كرت إهداء مجاني مع الطلب 💌
                    </label>
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="اكتب رسالة رقيقة لتُكتب بخط اليد على كرتنا الورقي الفاخر..."
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] bg-white focus:outline-none focus:ring-1 focus:ring-[#C97A8B] text-[#381F26] placeholder-[#A48F94]"
                    />
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-[#F0DFE2] bg-white space-y-3">
                  {/* Promo input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="كود الخصم (مثل BLOOM15)"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError(null);
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-full border border-[#DFC3CB] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                    />
                    <button
                      type="submit"
                      className="text-xs px-4 py-2 rounded-full bg-[#FAF3F1] hover:bg-rose-100 text-[#C97A8B] font-medium border border-[#E9C3CC] transition-colors"
                    >
                      تطبيق
                    </button>
                  </form>

                  {promoError && (
                    <p className="text-[11px] text-red-600 px-1">{promoError}</p>
                  )}

                  {appliedPromoName && (
                    <div className="flex items-center justify-between text-xs text-[#2D6A4F] bg-[#EBF7EE] px-3 py-1.5 rounded-lg">
                      <span>كود {appliedPromoName} (خصم {promoDiscountPercent}%)</span>
                      <span>-{Number(discount).toLocaleString()} ر.ي</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-[#6B555B] pt-2">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي</span>
                      <span>{Number(subtotal).toLocaleString()} ر.ي</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#2D6A4F]">
                        <span>الخصم المطبق</span>
                        <span>-{Number(discount).toLocaleString()} ر.ي</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>الشحن والتوصيل</span>
                      <span>{isFreeShipping ? 'مجاني' : `${Number(deliveryFee).toLocaleString()} ر.ي`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#381F26] pt-2 border-t border-[#F0DFE2]">
                      <span>المجموع الكلي</span>
                      <span>{Number(finalTotal).toLocaleString()} ر.ي</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="w-full mt-3 py-3 px-4 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-sm font-medium transition-all shadow-md hover:shadow-rose-300/40 flex items-center justify-center gap-2"
                  >
                    <span>المتابعة لإتمام الطلب</span>
                    <ArrowLeft className="w-4 h-4 rtl:rotate-0" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* =============================================================== */}
          {/* STEP 2: CHECKOUT FORM                                           */}
          {/* =============================================================== */}
          {step === 'checkout' && (
            <form onSubmit={handleConfirmOrder} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4">
                
                {/* Summary box */}
                <div className="bg-[#FAF3F5] p-4 rounded-2xl border border-[#EDD3DA] text-xs space-y-1.5">
                  <div className="flex justify-between text-[#5C454B]">
                    <span>عدد الباقات:</span>
                    <span className="font-semibold text-[#381F26]">
                      {cartItems.reduce((sum, i) => sum + i.quantity, 0)} باقة
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5C454B]">
                    <span>المبلغ المستحق:</span>
                    <span className="font-bold text-[#C97A8B] text-sm">
                      {Number(finalTotal).toLocaleString()} ر.ي
                    </span>
                  </div>
                </div>

                {/* 1. Delivery Type (استلام أو توصيل) */}
                <div>
                  <label className="block text-xs font-semibold text-[#381F26] mb-2">
                    طريقة الاستلام:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                        deliveryType === 'delivery'
                          ? 'border-[#C97A8B] bg-rose-50/80 text-[#C97A8B] font-bold shadow-2xs'
                          : 'border-[#DFC3CB] bg-white text-[#5E474D] hover:border-[#C97A8B]'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>توصيل إلى موقعك</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                        deliveryType === 'pickup'
                          ? 'border-[#C97A8B] bg-rose-50/80 text-[#C97A8B] font-bold shadow-2xs'
                          : 'border-[#DFC3CB] bg-white text-[#5E474D] hover:border-[#C97A8B]'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>استلام من الفرع</span>
                    </button>
                  </div>
                </div>

                {/* Receiver Name */}
                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">
                    اسم المستلم *
                  </label>
                  <input
                    type="text"
                    placeholder="الاسم الكريم"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (checkoutErrors.name) setCheckoutErrors({ ...checkoutErrors, name: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border transition-colors focus:outline-none ${
                      checkoutErrors.name
                        ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                        : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                    }`}
                  />
                  {checkoutErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{checkoutErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Receiver Phone */}
                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">
                    رقم الجوال للتواصل *
                  </label>
                  <input
                    type="tel"
                    placeholder="7XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (checkoutErrors.phone) setCheckoutErrors({ ...checkoutErrors, phone: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border font-mono transition-colors focus:outline-none ${
                      checkoutErrors.phone
                        ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                        : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                    }`}
                  />
                  {checkoutErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{checkoutErrors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Conditional Address Field if Delivery */}
                {deliveryType === 'delivery' ? (
                  <div>
                    <label className="block text-xs font-medium text-[#7A6369] mb-1">
                      عنوان التوصيل والحي *
                    </label>
                    <input
                      type="text"
                      placeholder="المدينة، الحي، الشارع، تفاصيل الموقع"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        if (checkoutErrors.address) setCheckoutErrors({ ...checkoutErrors, address: null });
                      }}
                      className={`w-full text-xs p-3 rounded-xl border transition-colors focus:outline-none ${
                        checkoutErrors.address
                          ? 'border-red-400 bg-red-50/20 focus:ring-1 focus:ring-red-400'
                          : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                      }`}
                    />
                    {checkoutErrors.address && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{checkoutErrors.address}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF5F7] rounded-xl border border-[#EEDDE1] text-xs text-[#6B4B52] flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#C97A8B] flex-shrink-0" />
                    <span>الاستلام من متجر ليلي بلومز (سيتم تجهيز باقتك وإشعارك فور اكتمال التنسيق) 🌸</span>
                  </div>
                )}

                {/* 2. Payment Methods (2 options: حوالة أو إيداع) */}
                <div>
                  <label className="block text-xs font-semibold text-[#381F26] mb-2">
                    طريقة الدفع (حوالة أو إيداع):
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          paymentMethod === opt.id
                            ? 'border-[#C97A8B] bg-rose-50/80 text-[#C97A8B] font-bold shadow-2xs'
                            : 'border-[#DFC3CB] bg-white text-[#5E474D] hover:border-[#C97A8B]'
                        }`}
                      >
                        <span className="block text-xs font-bold">{opt.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Details Card with Copy feature */}
                  {paymentMethod === 'transfer' && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#EDD3DA] text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-[#7A646A] border-b border-rose-100 pb-1.5 font-medium">
                        <span>بيانات التحويل المالي (حوالة):</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          حوالة صرافة
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[#381F26]">
                          <span className="text-[#7A646A]">اسم المستلم:</span>
                          <span className="font-bold">شهد خالد عامر بن جذنان</span>
                        </div>
                        <div className="flex justify-between items-center text-[#381F26]">
                          <span className="text-[#7A646A]">رقم الجوال:</span>
                          <span className="font-mono font-bold text-sm text-[#C97A8B]">735252426</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyText('شهد خالد عامر بن جذنان - 735252426', 'transfer')}
                        className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C97A8B] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedKey === 'transfer' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">تم نسخ البيانات بنجاح!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ بيانات الحوالة</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'deposit' && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#EDD3DA] text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-[#7A646A] border-b border-rose-100 pb-1.5 font-medium">
                        <span>بيانات الإيداع البنكي:</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          إيداع مباشر
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[#381F26]">
                          <span className="text-[#7A646A]">البنك:</span>
                          <span className="font-bold">بن دول</span>
                        </div>
                        <div className="flex justify-between items-center text-[#381F26]">
                          <span className="text-[#7A646A]">رقم الحساب:</span>
                          <span className="font-mono font-bold text-sm text-[#C97A8B]">369970</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyText('بن دول : 369970', 'deposit')}
                        className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C97A8B] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedKey === 'deposit' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">تم نسخ رقم الحساب بنجاح!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ رقم الحساب البنكي</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

              <div className="p-6 border-t border-[#F0DFE2] bg-white">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'جاري تسجيل الطلب وإصدار الفاتورة...' : 'تأكيد الطلب وإصدار الفاتورة 🌸'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* STEP 3: INVOICE VIEW (فاتورة الطلب الإلكترونية)                     */}
          {/* =============================================================== */}
          {step === 'invoice' && lastOrder && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* Printable Invoice Card */}
              <div className="printable-invoice bg-white rounded-3xl p-5 sm:p-6 border border-[#EEDDE1] shadow-lg space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F0DFE2] pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/logo.jpg"
                      alt="Lilly Blooms Logo"
                      className="w-12 h-12 rounded-full border border-rose-200 object-cover p-0.5 bg-[#FFF9FA]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#381F26]">
                        ليلي بلومز | Lilly Blooms
                      </h3>
                      <p className="text-[11px] text-[#866D73]">
                        زهور صنعت لتعبر عما في القلب بكل حب
                      </p>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-[11px] text-[#866D73] block">رقم الفاتورة:</span>
                    <span className="text-sm font-bold text-[#C97A8B]">#{lastOrder.orderNumber}</span>
                  </div>
                </div>

                {/* Customer & Order Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF5F7] p-3.5 rounded-2xl border border-[#EFE0E4]">
                  <div>
                    <span className="text-[#866D73] block text-[11px]">اسم العميل:</span>
                    <strong className="text-[#381F26]">{lastOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#866D73] block text-[11px]">رقم الجوال:</span>
                    <strong className="text-[#381F26] font-mono">{lastOrder.customerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-[#866D73] block text-[11px]">طريقة الاستلام:</span>
                    <strong className="text-[#381F26]">
                      {lastOrder.deliveryType === 'delivery' ? 'توصيل إلى موقعك 🚗' : 'استلام من الفرع 🏬'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#866D73] block text-[11px]">تاريخ الطلب:</span>
                    <strong className="text-[#381F26] text-[11px]">{lastOrder.createdAt}</strong>
                  </div>
                  {lastOrder.deliveryType === 'delivery' && (
                    <div className="col-span-2 pt-1 border-t border-rose-100">
                      <span className="text-[#866D73] block text-[11px]">عنوان التوصيل والحي:</span>
                      <strong className="text-[#381F26]">{lastOrder.customerAddress}</strong>
                    </div>
                  )}
                  <div className="col-span-2 pt-1 border-t border-rose-100">
                    <span className="text-[#866D73] block text-[11px]">طريقة الدفع المختارة:</span>
                    <strong className="text-[#C97A8B]">{lastOrder.paymentMethodName} ({lastOrder.paymentDetails})</strong>
                  </div>
                </div>

                {/* Items Summary Table */}
                <div>
                  <h4 className="text-xs font-bold text-[#381F26] mb-2">تفاصيل الباقات المطلوبة:</h4>
                  <div className="border border-[#F0DFE2] rounded-2xl overflow-hidden text-xs">
                    <div className="bg-[#FAF5F6] px-3 py-2 font-bold text-[#6D5359] flex justify-between border-b border-[#F0DFE2]">
                      <span className="flex-1">الباقة والتفاصيل</span>
                      <span className="w-16 text-center">الكمية</span>
                      <span className="w-24 text-left">السعر</span>
                    </div>
                    {lastOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2.5 flex justify-between items-center border-b border-[#F0DFE2] last:border-b-0 hover:bg-[#FFFDFD]"
                      >
                        <span className="flex-1 text-[#381F26] font-medium leading-relaxed">
                          {item.name}
                        </span>
                        <span className="w-16 text-center font-bold text-[#7A646A]">
                          {item.quantity}
                        </span>
                        <span className="w-24 text-left font-bold text-[#C97A8B]">
                          {Number(item.price * item.quantity).toLocaleString()} ر.ي
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs text-[#6B555B] bg-[#FAF8F8] p-3.5 rounded-2xl border border-[#F0DFE2]">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{Number(lastOrder.subtotal).toLocaleString()} ر.ي</span>
                  </div>
                  {lastOrder.discount > 0 && (
                    <div className="flex justify-between text-[#2D6A4F]">
                      <span>الخصم</span>
                      <span>-{Number(lastOrder.discount).toLocaleString()} ر.ي</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>رسوم التوصيل</span>
                    <span>{lastOrder.deliveryFee === 0 ? 'مجاني' : `${Number(lastOrder.deliveryFee).toLocaleString()} ر.ي`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#381F26] pt-2 border-t border-[#E8D1D7]">
                    <span>الإجمالي النهائي المستحق:</span>
                    <span className="text-[#C97A8B] text-base">
                      {Number(lastOrder.finalTotal).toLocaleString()} ر.ي
                    </span>
                  </div>
                </div>

                {/* Important Notes Box */}
                <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span>📌 ملاحظة هامة:</span>
                  </div>
                  <p className="leading-relaxed">
                    يرجى <strong>حفظ الفاتورة PDF</strong> وإرسالها عبر <strong>الواتساب</strong> مع صورة <strong>سند الإيداع أو الحوالة</strong> لاعتماد الطلب وتجهيز باقتك فوراً.
                  </p>
                </div>

              </div>

              {/* Action Buttons (Excluded from Print) */}
              <div className="space-y-2.5 pt-2 no-print">
                {/* Save PDF Button */}
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="w-full py-3 px-4 rounded-full bg-white hover:bg-rose-50 text-[#C97A8B] border-2 border-[#C97A8B] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <Printer className="w-4 h-4" />
                  <span>حفظ الفاتورة PDF 📄</span>
                </button>

                {/* Send via WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>إرسال الفاتورة عبر واتساب (733249213) 💬</span>
                </button>

                {/* Back to store */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 text-xs text-[#8A7177] hover:text-[#381F26] font-medium transition-colors"
                >
                  إغلاق ومتابعة التسوق
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
