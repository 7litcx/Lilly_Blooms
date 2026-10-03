import { createClient } from '@supabase/supabase-js';

export const cleanSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  try {
    const parsed = new URL(clean);
    return parsed.origin; // e.g. "https://xxxxxx.supabase.co" without any subpaths or trailing slashes
  } catch {
    return clean
      .replace(/\/rest\/v1\/?.*$/i, '')
      .replace(/\/storage\/v1\/?.*$/i, '')
      .replace(/\/auth\/v1\/?.*$/i, '')
      .replace(/\/+$/, '');
  }
};

// Retrieve credentials from .env or localStorage
const getStoredCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const rawLocalUrl = typeof window !== 'undefined' ? localStorage.getItem('lilly_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('lilly_supabase_anon_key') : null;

  const rawUrl = (rawLocalUrl && rawLocalUrl.trim()) || (envUrl && envUrl.trim()) || '';
  const url = cleanSupabaseUrl(rawUrl);
  const key = (localKey && localKey.trim()) || (envKey && envKey.trim()) || '';

  // Auto-clean in localStorage if it contained subpaths or trailing slashes
  if (typeof window !== 'undefined' && rawLocalUrl && url && rawLocalUrl !== url) {
    localStorage.setItem('lilly_supabase_url', url);
  }

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
};

let currentCreds = getStoredCredentials();

export let supabase = currentCreds.isConfigured 
  ? createClient(currentCreds.url, currentCreds.key) 
  : null;

export const isSupabaseConfigured = () => {
  return Boolean(supabase && currentCreds.isConfigured);
};

export const getSupabaseConfig = () => {
  return currentCreds;
};

export const updateSupabaseCredentials = async (url, key) => {
  try {
    const cleanUrl = cleanSupabaseUrl(url);
    const cleanKey = (key || '').trim();

    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem('lilly_supabase_url');
      localStorage.removeItem('lilly_supabase_anon_key');
      currentCreds = getStoredCredentials();
      supabase = null;
      return { success: false, message: 'تم إفراغ بيانات الاتصال' };
    }

    const testClient = createClient(cleanUrl, cleanKey);
    const { error } = await testClient.from('products').select('id').limit(1);

    // If no error or just empty table, connection succeeded
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, we still know credentials are valid if error is not 401/403
      if (error.message?.includes('JWT') || error.message?.includes('apikey') || error.code === '401' || error.code === '403') {
        return { success: false, message: 'مفتاح API أو رابط المشروع غير صحيح: ' + error.message };
      }
    }

    localStorage.setItem('lilly_supabase_url', cleanUrl);
    localStorage.setItem('lilly_supabase_anon_key', cleanKey);
    currentCreds = { url: cleanUrl, key: cleanKey, isConfigured: true };
    supabase = testClient;

    return { success: true, message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح! 🚀' };
  } catch (err) {
    return { success: false, message: 'خطأ أثناء محاولة الاتصال: ' + err.message };
  }
};

// ==============================================================================
// Persistent Local Fallback Store (Used when Supabase is not yet connected)
// ==============================================================================
const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'lilly_db_products',
  ORDERS: 'lilly_db_orders',
  PROMO_CODES: 'lilly_db_promos',
  SLIDES: 'lilly_db_slider_slides'
};

const getLocalData = (key, defaultData) => {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
};

const setLocalData = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to set localStorage for key "${key}":`, err);
  }
};

// ==============================================================================
// 1. PRODUCTS API
// ==============================================================================
export const getProducts = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: parseFloat(item.price),
          originalPrice: item.original_price ? parseFloat(item.original_price) : null,
          rating: item.rating ? parseFloat(item.rating) : 5.0,
          reviewsCount: item.reviews_count || 0,
          badge: item.badge || null,
          image: item.image,
          description: item.description || '',
          details: Array.isArray(item.details) ? item.details : [],
          inStock: item.in_stock !== false,
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch products error, fallback to local store:', err);
    }
  }

  // Fallback to local storage (starts empty or with added products)
  return getLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, []);
};

export const addProduct = async (productData) => {
  const newProduct = {
    name: productData.name,
    category: productData.category || 'باقات',
    price: parseFloat(productData.price) || 0,
    original_price: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
    badge: productData.badge || null,
    image: productData.image || '/images/pink-lily-hero.jpg',
    description: productData.description || '',
    details: Array.isArray(productData.details) ? productData.details : [],
    in_stock: productData.inStock !== false,
    rating: 5.0,
    reviews_count: 0
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      ...data,
      originalPrice: data.original_price,
      inStock: data.in_stock,
      reviewsCount: data.reviews_count
    };
  }

  // Local fallback
  const localProducts = getLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, []);
  const createdLocal = {
    id: `prod-${Date.now()}`,
    ...newProduct,
    originalPrice: newProduct.original_price,
    inStock: newProduct.in_stock,
    createdAt: new Date().toISOString()
  };
  localProducts.unshift(createdLocal);
  setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, localProducts);
  return createdLocal;
};

export const updateProduct = async (id, productData) => {
  const updates = {
    name: productData.name,
    category: productData.category,
    price: parseFloat(productData.price),
    original_price: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
    badge: productData.badge || null,
    image: productData.image,
    description: productData.description,
    details: productData.details || [],
    in_stock: productData.inStock !== false,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Local fallback
  const localProducts = getLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, []);
  const index = localProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    localProducts[index] = {
      ...localProducts[index],
      ...updates,
      originalPrice: updates.original_price,
      inStock: updates.in_stock
    };
    setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, localProducts);
    return localProducts[index];
  }
  throw new Error('المنتج غير موجود');
};

export const deleteProduct = async (id) => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  const localProducts = getLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, []);
  const filtered = localProducts.filter(p => p.id !== id);
  setLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, filtered);
  return true;
};

export const compressImageFile = async (file, maxWidth = 1600, maxHeight = 900, quality = 0.82) => {
  if (!file) return null;
  if (typeof file === 'string' && !file.startsWith('data:image')) {
    return file; // Already a URL
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const processImage = () => {
        let width = img.width;
        let height = img.height;
        if (!width || !height) {
          resolve(typeof file === 'string' ? file : '/images/pink-lily-hero.jpg');
          return;
        }

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      if (typeof file === 'string') {
        img.onload = processImage;
        img.onerror = () => resolve(file);
        img.src = file;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.onload = processImage;
          img.onerror = () => resolve(e.target.result);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve('/images/pink-lily-hero.jpg');
        reader.readAsDataURL(file);
      }
    } catch {
      resolve('/images/pink-lily-hero.jpg');
    }
  });
};

export const uploadProductImage = async (file) => {
  if (!file) return null;
  if (typeof file === 'string') return file;

  // Compress image first to keep payload lightweight
  const compressedDataUrl = await compressImageFile(file, 1600, 900, 0.82);

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const fileName = `item-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else if (uploadError) {
        console.warn('Storage upload notice (falling back to DataURL):', uploadError.message);
      }
    } catch (err) {
      console.warn('Storage upload error, falling back to DataURL:', err);
    }
  }

  // Fallback: Return lightweight compressed Base64 Data URL (fits safely in localStorage)
  return compressedDataUrl;
};

// ==============================================================================
// 2. ORDERS API
// ==============================================================================
export const getOrders = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(o => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerEmail: o.customer_email,
          customerAddress: o.customer_address,
          items: o.items || [],
          subtotal: parseFloat(o.subtotal || 0),
          discount: parseFloat(o.discount || 0),
          deliveryFee: parseFloat(o.delivery_fee || 0),
          totalAmount: parseFloat(o.total_amount || 0),
          promoCode: o.promo_code,
          giftMessage: o.gift_message,
          status: o.status,
          paymentMethod: o.payment_method,
          createdAt: o.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch orders error, fallback to local store:', err);
    }
  }

  return getLocalData(LOCAL_STORAGE_KEYS.ORDERS, []);
};

export const createOrder = async (orderData) => {
  const orderNumber = `LB-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    order_number: orderNumber,
    customer_name: orderData.customerName || 'عميل ليلي بلومز',
    customer_phone: orderData.customerPhone || '',
    customer_email: orderData.customerEmail || '',
    customer_address: orderData.customerAddress || 'الرياض، المملكة العربية السعودية',
    items: orderData.items || [],
    subtotal: parseFloat(orderData.subtotal || 0),
    discount: parseFloat(orderData.discount || 0),
    delivery_fee: parseFloat(orderData.deliveryFee || 0),
    total_amount: parseFloat(orderData.totalAmount || 0),
    promo_code: orderData.promoCode || null,
    gift_message: orderData.giftMessage || null,
    status: 'pending',
    payment_method: orderData.paymentMethod || 'mada'
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If promo code was used, increment its count
    if (orderData.promoCode) {
      try {
        await supabase.rpc('increment_promo_usage', { p_code: orderData.promoCode });
      } catch {}
    }

    return {
      id: data.id,
      orderNumber: data.order_number,
      ...orderData,
      status: 'pending',
      createdAt: data.created_at
    };
  }

  // Local fallback
  const localOrders = getLocalData(LOCAL_STORAGE_KEYS.ORDERS, []);
  const createdLocal = {
    id: `ord-${Date.now()}`,
    orderNumber,
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  localOrders.unshift(createdLocal);
  setLocalData(LOCAL_STORAGE_KEYS.ORDERS, localOrders);
  return createdLocal;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const localOrders = getLocalData(LOCAL_STORAGE_KEYS.ORDERS, []);
  const index = localOrders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    localOrders[index].status = newStatus;
    setLocalData(LOCAL_STORAGE_KEYS.ORDERS, localOrders);
    return localOrders[index];
  }
  throw new Error('الطلب غير موجود');
};

export const deleteOrder = async (orderId) => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw new Error(error.message);
    return true;
  }

  const localOrders = getLocalData(LOCAL_STORAGE_KEYS.ORDERS, []);
  const filtered = localOrders.filter(o => o.id !== orderId);
  setLocalData(LOCAL_STORAGE_KEYS.ORDERS, filtered);
  return true;
};

// ==============================================================================
// 3. PROMO CODES API
// ==============================================================================
const DEFAULT_PROMOS = [
  { id: 'promo-bloom15', code: 'BLOOM15', discountPercent: 15, isActive: true, usageCount: 24 }
];

export const getPromoCodes = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(p => ({
          id: p.id,
          code: p.code,
          discountPercent: parseFloat(p.discount_percent),
          isActive: p.is_active,
          usageCount: p.usage_count || 0,
          createdAt: p.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch promo codes error:', err);
    }
  }

  return getLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, DEFAULT_PROMOS);
};

export const addPromoCode = async (code, discountPercent) => {
  const cleanCode = (code || '').trim().toUpperCase();
  const percent = parseFloat(discountPercent);

  if (!cleanCode || isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('يرجى إدخال كود صالح ونسبة خصم بين 1% و 100%');
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{ code: cleanCode, discount_percent: percent, is_active: true }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      code: data.code,
      discountPercent: parseFloat(data.discount_percent),
      isActive: data.is_active,
      usageCount: 0
    };
  }

  const localPromos = getLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, DEFAULT_PROMOS);
  if (localPromos.some(p => p.code.toUpperCase() === cleanCode)) {
    throw new Error('كود الخصم موجود بالفعل');
  }

  const newPromo = {
    id: `promo-${Date.now()}`,
    code: cleanCode,
    discountPercent: percent,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  };
  localPromos.unshift(newPromo);
  setLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, localPromos);
  return newPromo;
};

export const togglePromoCodeStatus = async (promoId, currentStatus) => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('id', promoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const localPromos = getLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, DEFAULT_PROMOS);
  const index = localPromos.findIndex(p => p.id === promoId);
  if (index !== -1) {
    localPromos[index].isActive = !currentStatus;
    setLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, localPromos);
    return localPromos[index];
  }
  throw new Error('الكود غير موجود');
};

export const deletePromoCode = async (promoId) => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', promoId);

    if (error) throw new Error(error.message);
    return true;
  }

  const localPromos = getLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, DEFAULT_PROMOS);
  const filtered = localPromos.filter(p => p.id !== promoId);
  setLocalData(LOCAL_STORAGE_KEYS.PROMO_CODES, filtered);
  return true;
};

export const validatePromoCode = async (code) => {
  const cleanCode = (code || '').trim().toUpperCase();
  const promos = await getPromoCodes();
  const match = promos.find(p => p.code.toUpperCase() === cleanCode && p.isActive);
  if (match) {
    return { valid: true, discountPercent: match.discountPercent, code: match.code };
  }
  return { valid: false, discountPercent: 0 };
};

// ==============================================================================
// 3.5. SLIDER BANNERS API
// ==============================================================================
export const DEFAULT_SLIDER_SLIDES = [
  {
    id: 'slide-1',
    image: '/images/pink-lily-hero.jpg',
    title: 'ليلي بلومز | تشكيلة الزهور الفاخرة',
    subtitle: 'أجمل باقات الزهور الطبيعية المنسقة بعناية لجميع المناسبات',
    link: '#bouquets',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1920&q=80',
    title: 'باقات ورد وهدايا استثنائية',
    subtitle: 'تنسيق راقٍ وتغليف ياباني فاخر مع كرت إهداء خاص',
    link: '#bouquets',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1920&q=80',
    title: 'توصيل مجاني للطلبات الأكثر من 30,000 ر.ي',
    subtitle: 'أبهج من تحب اليوم بتوصيل سريع إلى باب المنزل',
    link: '#bouquets',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString()
  }
];

export const getSliderSlides = async () => {
  // 1. Check local storage first for instant response
  const localSlides = getLocalData(LOCAL_STORAGE_KEYS.SLIDES, null);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('slider_slides')
        .select('*')
        .order('order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          image: item.image,
          title: item.title || '',
          subtitle: item.subtitle || '',
          link: item.link || '',
          isActive: item.is_active !== false,
          order: item.order || 1,
          createdAt: item.created_at
        }));
        // Synchronize local cache with database
        setLocalData(LOCAL_STORAGE_KEYS.SLIDES, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch slides error, fallback to local store:', err);
    }
  }

  // 2. Return local storage if present
  if (localSlides && Array.isArray(localSlides) && localSlides.length > 0) {
    return localSlides;
  }

  // 3. Fallback to initial defaults and persist them
  setLocalData(LOCAL_STORAGE_KEYS.SLIDES, DEFAULT_SLIDER_SLIDES);
  return DEFAULT_SLIDER_SLIDES;
};

export const addSliderSlide = async (slideData) => {
  if (!slideData.image) {
    throw new Error('يرجى اختيار أو رفع صورة للبنر');
  }

  const newSlide = {
    id: `slide-${Date.now()}`,
    image: slideData.image,
    title: (slideData.title || '').trim(),
    subtitle: (slideData.subtitle || '').trim(),
    link: (slideData.link || '').trim(),
    isActive: slideData.isActive !== false,
    order: Number(slideData.order) || 1,
    createdAt: new Date().toISOString()
  };

  // Always update local storage first so user changes are NEVER lost
  const localSlides = getLocalData(LOCAL_STORAGE_KEYS.SLIDES, DEFAULT_SLIDER_SLIDES);
  localSlides.push(newSlide);
  setLocalData(LOCAL_STORAGE_KEYS.SLIDES, localSlides);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('slider_slides')
        .insert([{
          id: newSlide.id,
          image: newSlide.image,
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          link: newSlide.link,
          is_active: newSlide.isActive,
          order: newSlide.order
        }])
        .select()
        .single();

      if (!error && data) {
        const created = {
          id: data.id,
          image: data.image,
          title: data.title || '',
          subtitle: data.subtitle || '',
          link: data.link || '',
          isActive: data.is_active !== false,
          order: data.order || 1,
          createdAt: data.created_at
        };
        return created;
      }
    } catch (err) {
      console.warn('Supabase insert slide error, fallback to local store:', err);
    }
  }

  return newSlide;
};

export const updateSliderSlide = async (id, slideData) => {
  const updates = {
    ...(slideData.image !== undefined && { image: slideData.image }),
    ...(slideData.title !== undefined && { title: slideData.title }),
    ...(slideData.subtitle !== undefined && { subtitle: slideData.subtitle }),
    ...(slideData.link !== undefined && { link: slideData.link }),
    ...(slideData.isActive !== undefined && { is_active: slideData.isActive }),
    ...(slideData.order !== undefined && { order: Number(slideData.order) })
  };

  // Always update local storage first so user changes are NEVER lost
  const localSlides = getLocalData(LOCAL_STORAGE_KEYS.SLIDES, DEFAULT_SLIDER_SLIDES);
  const index = localSlides.findIndex(s => s.id === id);
  let updatedItem = null;
  if (index !== -1) {
    localSlides[index] = {
      ...localSlides[index],
      ...slideData,
      isActive: slideData.isActive !== undefined ? slideData.isActive : localSlides[index].isActive
    };
    setLocalData(LOCAL_STORAGE_KEYS.SLIDES, localSlides);
    updatedItem = localSlides[index];
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('slider_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          image: data.image,
          title: data.title || '',
          subtitle: data.subtitle || '',
          link: data.link || '',
          isActive: data.is_active !== false,
          order: data.order || 1,
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn('Supabase update slide error:', err);
    }
  }

  if (updatedItem) return updatedItem;
  throw new Error('شريحة البنر غير موجودة');
};

export const deleteSliderSlide = async (id) => {
  // Always update local storage first
  const localSlides = getLocalData(LOCAL_STORAGE_KEYS.SLIDES, DEFAULT_SLIDER_SLIDES);
  const filtered = localSlides.filter(s => s.id !== id);
  setLocalData(LOCAL_STORAGE_KEYS.SLIDES, filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('slider_slides').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete slide error:', err);
    }
  }

  return true;
};

export const toggleSliderSlide = async (id, currentStatus) => {
  return updateSliderSlide(id, { isActive: !currentStatus });
};

export const uploadSliderImage = async (file) => {
  if (!file) return null;
  if (typeof file === 'string') return file;

  // Compress image to fit 1600x900 and stay under 150KB
  const compressedDataUrl = await compressImageFile(file, 1600, 900, 0.82);

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const fileName = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Storage upload error for slider:', err);
    }
  }

  // Fallback: Return compressed Base64 Data URL
  return compressedDataUrl;
};

// ==============================================================================
// 4. REVIEWS & RATINGS API
// ==============================================================================
export const getProductReviews = async (productId) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(r => ({
          id: r.id,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          isVerified: r.is_verified,
          likes: r.likes || 0,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-YE') : 'مؤخراً'
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch reviews error, fallback to local store:', err);
    }
  }

  // Local fallback: only real reviews added by users
  const stored = typeof window !== 'undefined' ? localStorage.getItem(`lilly_reviews_${productId}`) : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  return [];
};

export const addProductReview = async (productId, reviewData) => {
  const newReview = {
    product_id: productId,
    user_name: reviewData.userName || 'مشتري موثق',
    rating: parseInt(reviewData.rating, 10) || 5,
    comment: reviewData.comment || '',
    is_verified: true,
    likes: 0
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userName: data.user_name,
          rating: data.rating,
          comment: data.comment,
          isVerified: true,
          likes: 0,
          date: 'الآن'
        };
      }
    } catch (err) {
      console.warn('Supabase insert review error, falling back locally:', err);
    }
  }

  // Local storage save
  const currentReviews = await getProductReviews(productId);
  const localItem = {
    id: `rev-${Date.now()}`,
    userName: newReview.user_name,
    rating: newReview.rating,
    comment: newReview.comment,
    isVerified: true,
    likes: 0,
    date: 'الآن'
  };
  const updated = [localItem, ...currentReviews];
  if (typeof window !== 'undefined') {
    localStorage.setItem(`lilly_reviews_${productId}`, JSON.stringify(updated));
  }
  return localItem;
};

// ==============================================================================
// 5. USER AUTHENTICATION & USERS TABLE API
// ==============================================================================
export const registerUser = async ({ name, email, password, phone = '' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
  const cleanPhone = (phone || '').trim();
  const role = cleanEmail === 'sh2002@gmail.com' ? 'admin' : 'customer';

  if (isSupabaseConfigured()) {
    // 1. Check if user already exists in public.users
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        throw new Error('هذا البريد الإلكتروني مسجل مسبقاً في قاعدة البيانات');
      }
    } catch (err) {
      if (err.message && err.message.includes('مسجل مسبقاً')) {
        throw err;
      }
    }

    // 2. Insert directly into public.users table
    let { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          phone: cleanPhone || null,
          role
        }
      ])
      .select()
      .maybeSingle();

    if (insertError && insertError.message?.includes('column "password" does not exist')) {
      // Retry with password_hash if table was created with that column
      const { data: retryUser, error: retryError } = await supabase
        .from('users')
        .insert([
          {
            name: cleanName,
            email: cleanEmail,
            password_hash: cleanPassword,
            phone: cleanPhone || null,
            role
          }
        ])
        .select()
        .maybeSingle();

      if (!retryError) {
        insertedUser = retryUser;
        insertError = null;
      }
    }

    if (insertError) {
      console.warn('public.users table insert notice:', insertError.message);
      // Also try profiles table as fallback
      try {
        await supabase.from('profiles').upsert([
          { email: cleanEmail, full_name: cleanName, role, created_at: new Date().toISOString() }
        ], { onConflict: 'email' });
      } catch {}

      // Also try supabase.auth.signUp as fallback
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { data: { full_name: cleanName } }
        });
      } catch {}
    }

    return insertedUser || { name: cleanName, email: cleanEmail, role };
  }

  // Local fallback
  const localUsers = getLocalData('lilly_registered_users', []);
  if (localUsers.some(u => u.email === cleanEmail)) {
    throw new Error('هذا البريد الإلكتروني مسجل مسبقاً');
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    phone: cleanPhone || null,
    role,
    createdAt: new Date().toISOString()
  };
  localUsers.push(newUser);
  setLocalData('lilly_registered_users', localUsers);
  return newUser;
};

export const loginUser = async (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Admin shortcut
  if (cleanEmail === 'sh2002@gmail.com' && cleanPassword === 'sh12345') {
    return { success: true, isAdmin: true, user: { email: cleanEmail, name: 'مدير المتجر', role: 'admin' } };
  }

  if (isSupabaseConfigured()) {
    // 1. Check in public.users table directly
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbUser) {
        const storedPass = dbUser.password || dbUser.password_hash;
        if (storedPass === cleanPassword) {
          return {
            success: true,
            user: dbUser,
            isAdmin: dbUser.role === 'admin' || cleanEmail === 'sh2002@gmail.com'
          };
        }
      }
    } catch (e) {
      console.warn('Direct users query notice:', e);
    }

    // 2. Fallback to Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (!error && data?.user) {
        return {
          success: true,
          user: data.user,
          isAdmin: cleanEmail === 'sh2002@gmail.com'
        };
      }
    } catch {}

    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Local fallback
  const localUsers = getLocalData('lilly_registered_users', []);
  const match = localUsers.find(u => u.email === cleanEmail && u.password === cleanPassword);
  if (match) {
    return {
      success: true,
      user: match,
      isAdmin: match.role === 'admin' || cleanEmail === 'sh2002@gmail.com'
    };
  }

  throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
};


