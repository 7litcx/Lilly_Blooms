import React, { useState } from 'react';
import { X, ShieldCheck, LogOut, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { registerUser, loginUser } from '../lib/supabase';
import { validateEmail, validatePassword, validatePhone } from '../lib/validation';
import confetti from 'canvas-confetti';

export default function AuthModal({
  isOpen,
  onClose,
  onAdminLogin,
  isAdmin,
  onLogoutAdmin,
  onOpenAdmin
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customerSubmitted, setCustomerSubmitted] = useState(false);

  if (!isOpen) return null;

  // The dedicated admin credentials requested by the user
  const ADMIN_EMAIL = 'sh2002@gmail.com';
  const ADMIN_PASSWORD = 'sh12345';

  const validateAll = () => {
    const errors = {};

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;

    if (!isLogin) {
      if (phone.trim()) {
        const phoneErr = validatePhone(phone);
        if (phoneErr) errors.phone = phoneErr;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Admin shortcut bypasses client-side rules if exact match
    if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
      onAdminLogin();
      setEmail('');
      setPassword('');
      setPhone('');
      onClose();
      onOpenAdmin && onOpenAdmin();
      return;
    }

    // 2. Run validations
    if (!validateAll()) {
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        // Customer Login
        await loginUser(cleanEmail, cleanPassword);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        onClose();
      } else {
        // Customer Sign Up (Registers directly into public.users and Supabase)
        await registerUser({
          email: cleanEmail,
          password: cleanPassword,
          phone: phone.trim()
        });
        setCustomerSubmitted(true);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
      }
    } catch (err) {
      let msg = err.message || 'حدث خطأ أثناء معالجة الطلب';
      if (msg.includes('Password should be at least')) {
        msg = 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام';
      } else if (msg.includes('مسجل مسبقاً') || msg.includes('already registered')) {
        msg = 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول به';
      } else if (msg.includes('Invalid login credentials') || msg.includes('غير صحيحة')) {
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage(null);
    setFieldErrors({});
    setCustomerSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/45 backdrop-blur-xs" />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EEDCE0] p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 end-4 p-1.5 rounded-full text-[#7A6369] hover:text-[#C97A8B] hover:bg-rose-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E7C2CB] mx-auto mb-3 p-0.5">
              <img src="/images/logo.jpg" alt="شعار ليلي بلومز" className="w-full h-full object-cover rounded-full" />
            </div>
            
            {isAdmin ? (
              <>
                <h3 className="font-serif text-2xl text-[#381F26] font-normal flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-6 h-6 text-[#C97A8B]" />
                  <span>حساب مدير المتجر</span>
                </h3>
                <p className="text-xs text-[#877278] mt-1">
                  أنت مسجل حالياً كمسؤول (sh2002@gmail.com) ولديك صلاحيات الوصول الكاملة.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-serif text-2xl text-[#381F26] font-normal">
                  {isLogin ? "مرحباً بك مجدداً في ليلي بلومز" : "انضم لنادي عملاء ليلي بلومز"}
                </h3>
                <p className="text-xs text-[#877278] mt-1">
                  {isLogin ? "سجّل الدخول لتتبع باقاتك المفضلة وتفاصيل طلباتك." : "احصل على حساب دائم في المتجر مع خصم 15% على طلبك الأول."}
                </p>
              </>
            )}
          </div>

          {/* If already logged in as Admin */}
          {isAdmin ? (
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin && onOpenAdmin();
                }}
                className="w-full py-3 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs sm:text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>فتح لوحة التحكم الآن</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogoutAdmin();
                  onClose();
                }}
                className="w-full py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل خروج الإدارة</span>
              </button>
            </div>
          ) : customerSubmitted ? (
            /* User Registered Successfully in Database */
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-serif font-bold text-[#381F26]">
                تم إنشاء حسابك في قاعدة البيانات بنجاح! 🌸
              </h4>
              <p className="text-xs text-[#7A646A] leading-relaxed max-w-xs mx-auto">
                تم حفظ بياناتك بنجاح في جدول المستخدمين (users) بحساب: <strong>{email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-2.5 rounded-full bg-[#C97A8B] text-white text-xs font-medium hover:bg-[#B8697A] transition-colors cursor-pointer shadow-xs"
              >
                متابعة التسوق
              </button>
            </div>
          ) : (
            /* Unified Login / Register Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Email field */}
              <div>
                <label className="block text-xs font-medium text-[#5E474D] mb-1">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="name@example.com"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50/30 focus:ring-1 focus:ring-red-400'
                      : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone field when creating account */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-[#5E474D] mb-1">
                    رقم الجوال للتواصل (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                    }}
                    placeholder="7XXXXXXXX"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-mono transition-colors focus:outline-none ${
                      fieldErrors.phone
                        ? 'border-red-400 bg-red-50/30 focus:ring-1 focus:ring-red-400'
                        : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Password field */}
              <div>
                <label className="block text-xs font-medium text-[#5E474D] mb-1">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="••••••••"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none ${
                    fieldErrors.password
                      ? 'border-red-400 bg-red-50/30 focus:ring-1 focus:ring-red-400'
                      : 'border-[#DFC3CB] focus:ring-1 focus:ring-[#C97A8B]'
                  }`}
                />
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs sm:text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLogin ? 'جاري التحقق...' : 'جاري إنشاء الحساب في قاعدة البيانات...'}</span>
                  </>
                ) : (
                  <span>{isLogin ? "تسجيل الدخول" : "إنشاء الحساب في المتجر"}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-[#877278] hover:text-[#C97A8B] cursor-pointer"
                >
                  {isLogin ? "جديد في ليلي بلومز؟ أنشئ حسابك الآن" : "لديك حساب بالفعل؟ تسجيل الدخول"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
