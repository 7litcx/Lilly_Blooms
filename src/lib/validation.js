// Centralized form validation utilities for Lilly Blooms

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'يرجى إدخال البريد الإلكتروني';
  }
  const clean = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return 'صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com)';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'يرجى إدخال كلمة المرور';
  }
  if (password.length < 6) {
    return 'كلمة المرور يجب أن لا تقل عن 6 خانات';
  }
  return null;
};

export const validateName = (name, fieldTitle = 'الاسم') => {
  if (!name || !name.trim()) {
    return `يرجى إدخال ${fieldTitle}`;
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return `${fieldTitle} يجب أن يكون حرفين على الأقل`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'يرجى إدخال رقم الجوال للتواصل';
  }
  const clean = phone.trim().replace(/[\s-]/g, '');
  
  // Yemeni format: 9 digits starting with 7 (e.g. 735252426) or with 967 or 00967
  const yemeniRegex = /^((\+?967)|(00967))?[7][0-9]{8}$/;
  // General fallback for international numbers (8 to 15 digits)
  const generalRegex = /^\+?[0-9]{8,15}$/;

  if (!yemeniRegex.test(clean) && !generalRegex.test(clean)) {
    return 'يرجى إدخال رقم جوال صحيح (مثال: 735252426 أو 7XXXXXXXX)';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return 'يرجى إدخال عنوان التوصيل والحي';
  }
  const clean = address.trim();
  if (clean.length < 4) {
    return 'يرجى إدخال عنوان مفصل (المدينة، الحي، والشارع)';
  }
  return null;
};

export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) {
    return 'يرجى تحديد السعر';
  }
  const num = Number(price);
  if (isNaN(num) || num <= 0) {
    return 'السعر يجب أن يكون رقماً أكبر من الصفر';
  }
  return null;
};

export const validateFlowerCount = (count) => {
  const num = Number(count);
  if (isNaN(num) || num < 1) {
    return 'عدد الورد يجب أن يكون حبة واحدة على الأقل';
  }
  if (num > 500) {
    return 'أقصى عدد للورد هو 500 حبة في التنسيق الواحد';
  }
  return null;
};
