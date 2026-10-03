import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Check,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Send,
  MapPin,
  Gift,
  AlertCircle
} from 'lucide-react';
import { getProductReviews, addProductReview } from '../lib/supabase';
import { validateName } from '../lib/validation';
import confetti from 'canvas-confetti';

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) {
  const [quantity, setQuantity] = useState(1);
  const [flowerCount, setFlowerCount] = useState(10);
  const [flowerSize, setFlowerSize] = useState('medium'); // 'medium' (3000 YER) or 'large' (5000 YER)
  const [includeGiftCard, setIncludeGiftCard] = useState(false);
  const [customGiftMessage, setCustomGiftMessage] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('صنعاء');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);
  const [reviewErrors, setReviewErrors] = useState({});

  // Load reviews whenever product opens
  useEffect(() => {
    if (isOpen && product) {
      setReviewsLoading(true);
      getProductReviews(product.id)
        .then((data) => {
          setReviews(data || []);
        })
        .finally(() => {
          setReviewsLoading(false);
        });
      setQuantity(1);
      setFlowerCount(10);
      setFlowerSize('medium');
      setIncludeGiftCard(false);
      setCustomGiftMessage('');
      setShowAddReview(false);
      setReviewErrors({});
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Calculation for Yemeni Rial based on flower count and flower size
  // وسط = 3000 ريال يمني للوردة | كبير = 5000 ريال يمني للوردة
  const flowerSizePrice = flowerSize === 'large' ? 5000 : 3000;
  const unitBasePrice = flowerSizePrice * flowerCount;
  const totalPrice = unitBasePrice * quantity;

  // Average rating calculation
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : (product.rating || 5.0).toFixed(1);

  // Rating percentages
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage: totalReviewsCount > 0 ? (reviews.filter((r) => r.rating === stars).length / totalReviewsCount) * 100 : 0
  }));

  const handleAdd = () => {
    const sizeLabel = flowerSize === 'large' ? 'حجم كبير' : 'حجم وسط';
    const extraTags = [];
    extraTags.push(sizeLabel);
    extraTags.push(`${flowerCount} حبة ورد`);
    if (includeGiftCard && customGiftMessage) {
      extraTags.push(`كرت: "${customGiftMessage}"`);
    }

    const finalName = `${product.name} (${extraTags.join(' • ')})`;

    onAddToCart({
      ...product,
      price: unitBasePrice,
      flowerCount: flowerCount,
      flowerSize: flowerSize === 'large' ? 'كبير' : 'وسط',
      flowerSizePrice: flowerSizePrice,
      name: finalName
    }, quantity);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const errors = {};
    const nameErr = validateName(reviewerName, 'الاسم');
    if (nameErr) errors.name = nameErr;

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      errors.comment = 'يرجى كتابة تفاصيل رأيك بالباقة (5 أحرف على الأقل)';
    }

    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      return;
    }
    setReviewErrors({});

    try {
      setSubmittingReview(true);
      const created = await addProductReview(product.id, {
        userName: reviewerName.trim(),
        city: reviewerCity.trim(),
        rating: newRating,
        comment: reviewComment.trim()
      });

      setReviews([created, ...reviews]);
      setShowAddReview(false);
      setReviewComment('');
      setReviewerName('');
      setReviewSubmittedToast(true);
      setTimeout(() => setReviewSubmittedToast(false), 4000);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (err) {
      setReviewErrors({ form: 'فشل حفظ التقييم: ' + err.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLikeReview = (reviewId) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
  };

  const scrollToReviews = () => {
    const reviewsEl = document.getElementById('product-reviews-section');
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" 
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6 text-center">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white text-start shadow-2xl transition-all border border-[#EEDDE1] flex flex-col max-h-[92vh]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 end-4 z-30 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-[#5C454B] hover:text-[#C97A8B] flex items-center justify-center border border-[#EEDDE1] shadow-xs hover:scale-105 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Toast Notification for Review Submitted */}
          {reviewSubmittedToast && (
            <div className="absolute top-4 start-1/2 -translate-x-1/2 z-40 bg-[#381F26] text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xl border border-rose-300/30 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <span>شكراً لك! تم إضافة تقييمك ورأيك بنجاح 🌸</span>
            </div>
          )}

          {/* Modal Header */}
          <div className="bg-[#FAF5F6] border-b border-[#EEDDE1] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-[#C97A8B]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-serif font-bold text-[#381F26]">
                  تفاصيل المنتج والتقييمات
                </h2>
                <p className="text-[11px] text-[#866D73]">
                  تنسيق فاخر من ليلي بلومز مع إمكانية تحديد عدد الورد
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToReviews}
              className="text-xs text-[#C97A8B] hover:text-[#B8697A] font-medium hidden sm:flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>التقييمات ({reviews.length}) • {averageRating} ★</span>
            </button>
          </div>

          {/* Modal Body - Single Unified Scrollable Page */}
          <div className="flex-1 overflow-y-auto">

            {/* ============================================================= */}
            {/* PART 1: PRODUCT DETAILS & CUSTOMIZATION (IMAGE + INFO)        */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#F0DFE2]">
              
              {/* Left/Start Column: Clean Product Visuals (5 cols) */}
              <div className="md:col-span-5 p-6 bg-[#FAF6F7] flex flex-col justify-start">
                <div className="relative aspect-4/5 rounded-2xl bg-white border border-[#EEDCE1] overflow-hidden shadow-xs group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = '/images/pink-lily-hero.jpg'; }}
                  />
                  {product.badge && (
                    <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-xs font-medium bg-[#C97A8B] text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Right/End Column: Title, Prices, Options, Cart Action (7 cols) */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category & Rating Row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#B8697A] font-semibold">
                      {product.category || 'زهور فاخرة منسقة'}
                    </span>
                    <button
                      type="button"
                      onClick={scrollToReviews}
                      className="flex items-center gap-1.5 text-xs text-[#7A646A] hover:text-[#C97A8B] transition-colors cursor-pointer"
                    >
                      <div className="flex text-[#DDA668]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                        ))}
                      </div>
                      <span className="font-bold text-[#381F26]">{averageRating}</span>
                      <span>({reviews.length} تقييم)</span>
                    </button>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#361F25] font-normal mb-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Price in Yemeni Rial */}
                  <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-bold text-[#C97A8B]">
                        {Number(totalPrice).toLocaleString()} <span className="text-base font-normal text-[#361F25]">ر.ي</span>
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                        متوفر للطلب الفوري 🟢
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7A646A]">
                      ({flowerCount} حبة ورد × {Number(flowerSizePrice).toLocaleString()} ر.ي - حجم {flowerSize === 'large' ? 'كبير' : 'وسط'})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#6E555C] leading-relaxed mb-5">
                    {product.description}
                  </p>

                  {/* Details list */}
                  {product.details && product.details.length > 0 && (
                    <div className="space-y-2 mb-5 p-3.5 rounded-2xl bg-[#FAF6F7] border border-[#F0E0E4] text-xs text-[#5A454A]">
                      {product.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C97A8B] mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flower Size Option (حجم الوردة: وسط / كبير) */}
                  <div className="mb-4 p-4 rounded-2xl bg-[#FAF5F7] border border-[#EFE0E4]">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-[#381F26] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C97A8B]" />
                        <span>اختر حجم الوردة:</span>
                      </label>
                      <span className="text-[11px] font-bold text-[#C97A8B] bg-white px-2.5 py-0.5 rounded-full border border-rose-200">
                        {flowerSize === 'large' ? 'حجم كبير (5,000 ر.ي)' : 'حجم وسط (3,000 ر.ي)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: وسط */}
                      <button
                        type="button"
                        onClick={() => setFlowerSize('medium')}
                        className={`relative p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          flowerSize === 'medium'
                            ? 'bg-white border-[#C97A8B] shadow-sm ring-2 ring-[#C97A8B]/30'
                            : 'bg-white/70 border-[#E5CED4] hover:border-[#C97A8B]/60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[#381F26] flex items-center gap-1.5">
                            <span>حجم وسط</span>
                            {flowerSize === 'medium' && (
                              <span className="w-2 h-2 rounded-full bg-[#C97A8B]" />
                            )}
                          </div>
                          <p className="text-xs text-[#C97A8B] font-bold mt-1">
                            3,000 <span className="text-[11px] text-[#7A646A] font-normal">ر.ي / وردة</span>
                          </p>
                        </div>
                        <span className="text-2xl select-none">🌸</span>
                      </button>

                      {/* Option 2: كبير */}
                      <button
                        type="button"
                        onClick={() => setFlowerSize('large')}
                        className={`relative p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          flowerSize === 'large'
                            ? 'bg-white border-[#C97A8B] shadow-sm ring-2 ring-[#C97A8B]/30'
                            : 'bg-white/70 border-[#E5CED4] hover:border-[#C97A8B]/60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[#381F26] flex items-center gap-1.5">
                            <span>حجم كبير</span>
                            {flowerSize === 'large' && (
                              <span className="w-2 h-2 rounded-full bg-[#C97A8B]" />
                            )}
                          </div>
                          <p className="text-xs text-[#C97A8B] font-bold mt-1">
                            5,000 <span className="text-[11px] text-[#7A646A] font-normal">ر.ي / وردة</span>
                          </p>
                        </div>
                        <span className="text-2xl select-none">🌺</span>
                      </button>
                    </div>
                  </div>

                  {/* Flower Count Option (عدد حبات الورد) */}
                  <div className="mb-5 p-4 rounded-2xl bg-[#FAF5F7] border border-[#EFE0E4]">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-[#381F26] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C97A8B]" />
                        <span>اختر عدد حبات الورد:</span>
                      </label>
                      <span className="text-xs font-bold text-[#C97A8B] bg-white px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
                        {flowerCount} {flowerCount === 1 ? 'وردة واحدة' : flowerCount === 2 ? 'وردتان' : flowerCount <= 10 ? 'وردات' : 'حبة ورد'}
                      </span>
                    </div>

                    {/* Quick selection chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[5, 10, 15, 20, 25, 30, 50].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setFlowerCount(count)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            flowerCount === count
                              ? 'bg-[#C97A8B] text-white shadow-xs font-bold scale-102'
                              : 'bg-white text-[#6E555C] border border-[#E5CED4] hover:border-[#C97A8B]'
                          }`}
                        >
                          {count} وردة
                        </button>
                      ))}
                    </div>

                    {/* Stepper & Custom Number Input */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#F0DFE3] text-xs">
                      <span className="text-[#84686F] text-[11px]">أو أدخل عدداً مخصصاً:</span>
                      <div className="inline-flex items-center border border-[#DFC3CB] rounded-full px-2 py-1 bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setFlowerCount(Math.max(1, flowerCount - 1))}
                          className="w-7 h-7 rounded-full text-base text-[#6D5359] hover:bg-rose-50 hover:text-[#C97A8B] flex items-center justify-center font-bold"
                          aria-label="تقليل عدد الورد"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={flowerCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) setFlowerCount(val);
                            else if (e.target.value === '') setFlowerCount(1);
                          }}
                          className="w-14 text-center text-xs font-bold text-[#381F26] border-none focus:outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setFlowerCount(flowerCount + 1)}
                          className="w-7 h-7 rounded-full text-base text-[#6D5359] hover:bg-rose-50 hover:text-[#C97A8B] flex items-center justify-center font-bold"
                          aria-label="زيادة عدد الورد"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Free Gift Card with Message */}
                  <div className="mb-6 p-3 rounded-2xl bg-white border border-[#EFE0E4]">
                    <label className="flex items-center justify-between cursor-pointer mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeGiftCard}
                          onChange={(e) => setIncludeGiftCard(e.target.checked)}
                          className="rounded text-[#C97A8B] focus:ring-[#C97A8B] w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-[#381F26] font-semibold flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#C97A8B]" />
                          <span>كتابة كرت إهداء فاخر ومجاني مع الباقة 💌</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        هدية مجانية
                      </span>
                    </label>

                    {includeGiftCard && (
                      <textarea
                        rows={2}
                        value={customGiftMessage}
                        onChange={(e) => setCustomGiftMessage(e.target.value)}
                        placeholder="اكتب رسالتك الرقيقة لتُكتب بخط اليد على كرت ليلي بلومز المخملي..."
                        className="w-full text-xs p-2.5 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B] text-[#381F26] bg-[#FAF8F8]"
                      />
                    )}
                  </div>

                </div>

                {/* Actions Bar */}
                <div className="space-y-3 pt-4 border-t border-[#F2E3E6]">
                  <div className="flex items-center gap-3">
                    {/* Quantity of Bouquets */}
                    <div className="inline-flex items-center border border-[#DFC3CB] rounded-full px-3 py-2 bg-[#FAF7F6]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-xs text-[#6D5359] hover:text-[#C97A8B] px-1 font-bold"
                        aria-label="تقليل الكمية"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#381F26] px-3 select-none min-w-[20px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-xs text-[#6D5359] hover:text-[#C97A8B] px-1 font-bold"
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="flex-1 py-3 px-6 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-rose-300/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>أضف إلى السلة • {Number(totalPrice).toLocaleString()} ر.ي</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                      className="w-11 h-11 rounded-full border border-[#DFC3CB] flex items-center justify-center text-[#5E434A] hover:text-[#C97A8B] hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C97A8B] text-[#C97A8B]' : ''}`} />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* ============================================================= */}
            {/* PART 2: REVIEWS & RATINGS (INTEGRATED ON THE SAME PAGE)       */}
            {/* ============================================================= */}
            <div id="product-reviews-section" className="p-6 sm:p-8 space-y-8 bg-[#FAF6F7] border-t border-[#F0DFE2]">
              
              <div className="flex items-center justify-between pb-2 border-b border-[#F0DFE2]">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-[#C97A8B]" />
                  <h4 className="font-serif text-xl text-[#381F26] font-normal">
                    التقييمات والآراء ({reviews.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddReview(!showAddReview)}
                  className="py-2 px-4 rounded-xl bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showAddReview ? 'إلغاء التقييم' : 'أضف تقييمك ورأيك'}</span>
                </button>
              </div>

              {/* Reviews Top Summary & Score Card */}
              <div className="bg-white p-6 rounded-3xl border border-[#EDDDE1] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Overall Score */}
                <div className="md:col-span-4 text-center md:border-e md:border-[#F0E0E4] md:pe-6">
                  <span className="text-5xl font-bold font-serif text-[#381F26] block">
                    {averageRating}
                  </span>
                  <div className="flex justify-center text-[#DDA668] my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current stroke-none" />
                    ))}
                  </div>
                  <p className="text-xs text-[#7A646A]">
                    بناءً على <strong>{reviews.length}</strong> تقييم من عملاء ليلي بلومز
                  </p>
                </div>

                {/* Stars Progress Bars */}
                <div className="md:col-span-8 space-y-1.5">
                  {ratingCounts.map((rc) => (
                    <div key={rc.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-[#7A646A] flex items-center gap-1 font-mono">
                        {rc.stars} <Star className="w-3 h-3 text-[#DDA668] fill-current stroke-none inline" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-[#F3E5E8] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#C97A8B] transition-all duration-500"
                          style={{ width: `${rc.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-[#988187] text-[11px] font-mono text-left">
                        {rc.count}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Add Review Form */}
              {showAddReview && (
                <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-3xl border border-[#EDDDE1] shadow-md space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0E0E4]">
                    <h4 className="font-serif text-lg text-[#381F26] font-normal">
                      شاركنا رأيك في باقة "{product.name}"
                    </h4>
                    <span className="text-xs text-[#7A646A]">تقييم مشتري موثق</span>
                  </div>

                  {/* Star selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4349] mb-1.5">
                      تقييمك بالنجوم:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`${star} نجوم`}
                        >
                          <Star
                            className={`w-6 h-6 stroke-none ${
                              (hoverRating || newRating) >= star
                                ? 'fill-[#DDA668]'
                                : 'fill-[#E2D2D6]'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#C97A8B] mr-2">
                        {newRating} من 5 نجوم
                      </span>
                    </div>
                  </div>

                  {reviewErrors.form && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewErrors.form}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#7A6369] mb-1">اسمك الكريم *</label>
                      <input
                        type="text"
                        placeholder="مثال: ياسمين المقطري"
                        value={reviewerName}
                        onChange={(e) => {
                          setReviewerName(e.target.value);
                          if (reviewErrors.name) setReviewErrors((prev) => ({ ...prev, name: null }));
                        }}
                        className={`w-full text-xs p-3 rounded-xl border ${
                          reviewErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#DFC3CB]'
                        } focus:outline-none focus:ring-1 focus:ring-[#C97A8B]`}
                      />
                      {reviewErrors.name && (
                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{reviewErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7A6369] mb-1">المدينة / المنطقة</label>
                      <select
                        value={reviewerCity}
                        onChange={(e) => setReviewerCity(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B] bg-white"
                      >
                        <option value="صنعاء">صنعاء</option>
                        <option value="عدن">عدن</option>
                        <option value="تعز">تعز</option>
                        <option value="المكلا">المكلا</option>
                        <option value="الحديدة">الحديدة</option>
                        <option value="إب">إب</option>
                        <option value="ذمار">ذمار</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7A6369] mb-1">تفاصيل تجربتك ورأيك بالباقة والتنسيق *</label>
                    <textarea
                      rows={3}
                      placeholder="صف جودة الورود، نضارتها، التغليف، وتجربة الاستلام..."
                      value={reviewComment}
                      onChange={(e) => {
                        setReviewComment(e.target.value);
                        if (reviewErrors.comment) setReviewErrors((prev) => ({ ...prev, comment: null }));
                      }}
                      className={`w-full text-xs p-3 rounded-xl border ${
                        reviewErrors.comment ? 'border-red-400 bg-red-50/20' : 'border-[#DFC3CB]'
                      } focus:outline-none focus:ring-1 focus:ring-[#C97A8B]`}
                    />
                    {reviewErrors.comment && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{reviewErrors.comment}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReview(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#7A6369] hover:bg-rose-50 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 rounded-xl bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>{submittingReview ? 'جاري الإرسال...' : 'نشر التقييم الآن 🌸'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsLoading ? (
                  <div className="text-center py-12 text-xs text-[#8A7177]">
                    جاري تحميل التقييمات...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-[#EDDDE1]">
                    <MessageSquare className="w-10 h-10 text-rose-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#381F26]">كن أول من يقيّم هذه الباقة الرائعة!</p>
                    <button
                      type="button"
                      onClick={() => setShowAddReview(true)}
                      className="mt-2 text-xs text-[#C97A8B] underline font-medium cursor-pointer"
                    >
                      أضف تقييمك الآن
                    </button>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-[#EDDDE1] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar circle */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C97A8B] to-[#F2B3C0] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {rev.userName ? rev.userName.charAt(0) : 'ع'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-sm text-[#381F26]">
                                {rev.userName}
                              </h5>
                              {rev.isVerified && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                  ✓ مشتري موثق
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#866D73] mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-[#C97A8B]" />
                                {rev.city || 'اليمن'}
                              </span>
                              <span>•</span>
                              <span>{rev.date || 'مؤخراً'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Review Stars */}
                        <div className="flex text-[#DDA668]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 stroke-none ${
                                i < (rev.rating || 5) ? 'fill-[#DDA668]' : 'fill-[#EADBE0]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-xs sm:text-sm text-[#5C454B] leading-relaxed pt-1">
                        "{rev.comment}"
                      </p>

                      {/* Helpful button */}
                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleLikeReview(rev.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] text-[#8A7177] hover:text-[#C97A8B] transition-colors bg-[#FAF5F6] px-2.5 py-1 rounded-full border border-[#EEDDE1] cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>مفيد ({rev.likes || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
