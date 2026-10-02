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
  PROMO_CODES: 'lilly_db_promos'
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
  localStorage.setItem(key, JSON.stringify(data));
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

export const uploadProductImage = async (file) => {
  if (!file) return null;
  if (typeof file === 'string') return file;

  if (isSupabaseConfigured() && file instanceof File) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

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

  // Fallback: Convert to Base64 Data URL for local persistence
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('/images/pink-lily-hero.jpg');
      reader.readAsDataURL(file);
    } catch {
      resolve('/images/pink-lily-hero.jpg');
    }
  });
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
// 4. REVIEWS & RATINGS API
// ==============================================================================
const DEFAULT_REVIEWS = {
  'pink-lily-dream': [
    {
      id: 'rev-1',
      userName: 'ريم الصنعاني',
      city: 'صنعاء',
      rating: 5,
      date: 'منذ يومين',
      comment: 'الباقة فاقت توقعاتي بكثير! رائحة الورد والزنبق طبيعية وتغليف البليسيه الياباني فخم جداً وكرت الإهداء خطه متقن.',
      isVerified: true,
      likes: 14
    },
    {
      id: 'rev-2',
      userName: 'أصيل اليافعي',
      city: 'عدن',
      rating: 5,
      date: 'منذ أسبوع',
      comment: 'وصلت في وقتها تماماً بتغليف مبرد ممتاز، أهديتها للوالدة وأسعدتها جداً. شكراً ليلي بلومز على الذوق الرفيع.',
      isVerified: true,
      likes: 8
    },
    {
      id: 'rev-3',
      userName: 'سارة الأهدل',
      city: 'الحديدة',
      rating: 5,
      date: 'منذ أسبوعين',
      comment: 'أجمل وأرقى تنسيق زهور طلبته، الورود نضرة وبقيت نضرة أكثر من أسبوع مع اتباع نصائح العناية المرفقة.',
      isVerified: true,
      likes: 5
    }
  ],
  'pure-elegance': [
    {
      id: 'rev-4',
      userName: 'مها الشرجبي',
      city: 'تعز',
      rating: 5,
      date: 'منذ 3 أيام',
      comment: 'زهور الليلي البيضاء ساحرة وملكية، التنسيق فائق النعومة ومناسب جداً للمناسبات الخاصة.',
      isVerified: true,
      likes: 9
    },
    {
      id: 'rev-5',
      userName: 'طارق باوزير',
      city: 'المكلا',
      rating: 5,
      date: 'منذ أسبوع',
      comment: 'خدمة احترافية والتزام بالموعد، الباقة حقيقة أجمل من الصور بمراحل.',
      isVerified: true,
      likes: 4
    }
  ],
  'blushing-romance': [
    {
      id: 'rev-6',
      userName: 'نور الهمداني',
      city: 'صنعاء',
      rating: 5,
      date: 'منذ 4 أيام',
      comment: 'درجات الوردي مع الجبسوفيليا والأوكالبتوس تعطي هدوء وفخامة غير عادية، حبيت الاهتمام بأدق التفاصيل.',
      isVerified: true,
      likes: 11
    }
  ],
  'sweet-serenity': [
    {
      id: 'rev-7',
      userName: 'أروى العولقي',
      city: 'عدن',
      rating: 5,
      date: 'منذ 5 أيام',
      comment: 'ألوان الهيدرانجيا الليلكية مبهجة جداً والورود منتقاة بحب، تنسيق متكامل وفاخر.',
      isVerified: true,
      likes: 6
    }
  ]
};

export const getProductReviews = async (productId) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(r => ({
          id: r.id,
          userName: r.user_name,
          city: r.city || 'اليمن',
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

  // Local fallback
  const stored = typeof window !== 'undefined' ? localStorage.getItem(`lilly_reviews_${productId}`) : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  const defaults = DEFAULT_REVIEWS[productId] || [
    {
      id: `rev-gen-1`,
      userName: 'عميل ليلي بلومز',
      city: 'صنعاء',
      rating: 5,
      date: 'مؤخراً',
      comment: 'تنسيق أنيق وزهور طبيعية فائقة النضارة، التوصيل كان سريعاً والتعامل راقي جداً.',
      isVerified: true,
      likes: 3
    }
  ];
  return defaults;
};

export const addProductReview = async (productId, reviewData) => {
  const newReview = {
    product_id: productId,
    user_name: reviewData.userName || 'مشتري موثق',
    city: reviewData.city || 'اليمن',
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
          city: data.city,
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
    city: newReview.city,
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


