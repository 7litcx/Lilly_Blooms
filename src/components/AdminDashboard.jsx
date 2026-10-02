import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Plus,
  Trash2,
  Edit3,
  X,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  Truck,
  Upload,
  Search,
  ArrowRight,
  ShieldCheck,
  Lock,
  LogOut
} from 'lucide-react';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getPromoCodes,
  addPromoCode,
  togglePromoCodeStatus,
  deletePromoCode
} from '../lib/supabase';
import { PRODUCTS as DEFAULT_CATALOG } from '../data/products';

export default function AdminDashboard({
  isOpen,
  onClose,
  onProductsUpdated,
  isAdmin = false,
  onAdminLogin,
  onLogoutAdmin
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, promos, database
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);

  // Product Modal (Add/Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'باقات',
    price: '',
    originalPrice: '',
    badge: '',
    image: '',
    description: '',
    details: '',
    inStock: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');

  // Promo Form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');

  // Load initial dashboard data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords, promos] = await Promise.all([
        getProducts(),
        getOrders(),
        getPromoCodes()
      ]);
      setProducts(prods || []);
      setOrders(ords || []);
      setPromoCodes(promos || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadData();
    }
  }, [isOpen, isAdmin]);

  const notify = (msg, isError = false) => {
    setActionMessage({ text: msg, isError });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // PRODUCTS LOGIC
  // --------------------------------------------------------------------------
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'باقات',
      price: '',
      originalPrice: '',
      badge: '',
      image: '/images/pink-lily-hero.jpg',
      description: '',
      details: 'زهور منتقاة بعناية فائقة بملمس طبيعي نضر\nتغليف ياباني فاخر متعدد الطبقات ومقاوم للماء\nكرت إهداء مجاني مع الطلب',
      inStock: true
    });
    setImageFile(null);
    setImagePreview('/images/pink-lily-hero.jpg');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category || 'باقات',
      price: prod.price.toString(),
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : '',
      badge: prod.badge || '',
      image: prod.image,
      description: prod.description || '',
      details: Array.isArray(prod.details) ? prod.details.join('\n') : (prod.details || ''),
      inStock: prod.inStock !== false
    });
    setImageFile(null);
    setImagePreview(prod.image);
    setIsProductModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      notify('يرجى كتابة اسم المنتج وسعره', true);
      return;
    }

    try {
      setLoading(true);
      let finalImageUrl = productForm.image;
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      }

      const detailsArray = productForm.details
        ? productForm.details.split('\n').map(d => d.trim()).filter(Boolean)
        : [];

      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        badge: productForm.badge.trim() || null,
        image: finalImageUrl || '/images/pink-lily-hero.jpg',
        description: productForm.description,
        details: detailsArray,
        inStock: productForm.inStock
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        notify(`تم تحديث منتج "${productForm.name}" بنجاح! 🌸`);
      } else {
        await addProduct(payload);
        notify(`تمت إضافة منتج "${productForm.name}" بنجاح! 🌸`);
      }

      setIsProductModalOpen(false);
      await loadData();
      onProductsUpdated && onProductsUpdated();
    } catch (err) {
      notify(`فشلت العملية: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      notify(`تم حذف المنتج "${name}"`);
      await loadData();
      onProductsUpdated && onProductsUpdated();
    } catch (err) {
      notify(`فشل الحذف: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Seed default products to database
  const handleSeedProducts = async () => {
    if (!window.confirm('هل ترغب في رفع باقات المتجر الافتراضية إلى قاعدة البيانات؟')) return;
    try {
      setLoading(true);
      let count = 0;
      for (const item of DEFAULT_CATALOG) {
        await addProduct(item);
        count++;
      }
      notify(`تم رفع ${count} باقات إلى قاعدة البيانات بنجاح! 🌸`);
      await loadData();
      onProductsUpdated && onProductsUpdated();
    } catch (err) {
      notify(`فشل الرفع: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // ORDERS LOGIC
  // --------------------------------------------------------------------------
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      notify('تم تحديث حالة الطلب بنجاح');
      const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
      setOrders(updated);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      notify(`فشل التحديث: ${err.message}`, true);
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`هل أنت متأكد من حذف الطلب #${orderNum}؟`)) return;
    try {
      await deleteOrder(orderId);
      notify('تم حذف الطلب');
      setOrders(orders.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (err) {
      notify(`فشل الحذف: ${err.message}`, true);
    }
  };

  // --------------------------------------------------------------------------
  // PROMO CODES LOGIC
  // --------------------------------------------------------------------------
  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoDiscount) {
      notify('يرجى كتابة رمز الكود ونسبة الخصم', true);
      return;
    }
    try {
      setLoading(true);
      await addPromoCode(newPromoCode, newPromoDiscount);
      notify(`تم تفعيل كود الخصم "${newPromoCode.toUpperCase()}" بنجاح!`);
      setNewPromoCode('');
      setNewPromoDiscount('');
      const updated = await getPromoCodes();
      setPromoCodes(updated);
    } catch (err) {
      notify(`خطأ: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromo = async (promo) => {
    try {
      await togglePromoCodeStatus(promo.id, promo.isActive);
      notify(`تم تغيير حالة الكود ${promo.code}`);
      const updated = await getPromoCodes();
      setPromoCodes(updated);
    } catch (err) {
      notify(`خطأ: ${err.message}`, true);
    }
  };

  const handleDeletePromo = async (promoId, code) => {
    if (!window.confirm(`هل أنت متأكد من حذف الكود ${code}؟`)) return;
    try {
      await deletePromoCode(promoId);
      notify(`تم حذف الكود ${code}`);
      const updated = await getPromoCodes();
      setPromoCodes(updated);
    } catch (err) {
      notify(`خطأ: ${err.message}`, true);
    }
  };

  // --------------------------------------------------------------------------
  // CALCULATIONS FOR OVERVIEW / REPORTS
  // --------------------------------------------------------------------------
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    return (
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> قيد الانتظار</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><RefreshCw className="w-3 h-3" /> جاري التجهيز</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"><Truck className="w-3 h-3" /> تم الشحن</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> تم التوصيل</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><X className="w-3 h-3" /> ملغي</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (!isOpen) return null;

  // Gatekeeper: If user is not logged in as Admin, show password prompt
  if (!isAdmin) {
    const handleGateSubmit = (e) => {
      e.preventDefault();
      const validAdminPasswords = ['sh12345', 'admin', 'admin123', 'lilly2026'];
      if (validAdminPasswords.includes(gatePassword.trim())) {
        onAdminLogin && onAdminLogin();
        setGatePassword('');
        setGateError(null);
      } else {
        setGateError('كلمة مرور الإدارة غير صحيحة');
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EEDCE0] p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={onClose}
              className="absolute top-4 end-4 p-1.5 rounded-full text-[#7A6369] hover:text-[#C97A8B] hover:bg-rose-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#C97A8B] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-2xl text-[#381F26]">
              لوحة تحكم إدارة المتجر
            </h3>

            <p className="text-xs text-[#7A6369] leading-relaxed">
              هذه الصفحة مخصصة لمدير متجر ليلي بلومز فقط. يرجى إدخال كلمة المرور لتسجيل الدخول:
            </p>

            <form onSubmit={handleGateSubmit} className="space-y-3 pt-2">
              <input
                type="password"
                required
                autoFocus
                placeholder="أدخل كلمة مرور الإدارة..."
                value={gatePassword}
                onChange={(e) => {
                  setGatePassword(e.target.value);
                  setGateError(null);
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
              />

              {gateError && (
                <p className="text-[11px] text-red-600 font-medium">{gateError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول كمسؤول</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Toast Alert Inside Admin */}
      {actionMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-medium shadow-2xl transition-all ${
          actionMessage.isError ? 'bg-red-600 text-white' : 'bg-[#381F26] text-white border border-rose-300/40'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* Main Admin Modal Container */}
      <div className="w-full max-w-6xl h-[92vh] bg-[#FAF7F7] rounded-3xl shadow-2xl border border-[#ECD9DE] flex flex-col overflow-hidden text-[#381F26]">
        
        {/* Top Header */}
        <div className="bg-white border-b border-[#EEDCE1] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C97A8B] to-[#F1B3C0] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#381F26] font-normal">
                لوحة تحكم ليلي بلومز
              </h1>
              <p className="text-xs text-[#7E656B]">
                إدارة المتجر، المنتجات، الطلبات المباشرة، وقاعدة البيانات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="تحديث البيانات"
              disabled={loading}
              className="p-2 text-[#7E656B] hover:text-[#C97A8B] hover:bg-rose-50 rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {onLogoutAdmin && (
              <button
                type="button"
                onClick={() => {
                  onLogoutAdmin();
                  onClose();
                }}
                title="تسجيل خروج الإدارة"
                className="p-2 text-[#7E656B] hover:text-red-600 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#7E656B] hover:text-[#C97A8B] hover:bg-rose-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white border-b border-[#EEDCE1] px-6 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'التقارير والإحصائيات', icon: LayoutDashboard },
            { id: 'products', label: `المنتجات (${products.length})`, icon: Package },
            { id: 'orders', label: `الطلبات (${orders.length})`, icon: ShoppingBag },
            { id: 'promos', label: `أكواد الخصم (${promoCodes.length})`, icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#C97A8B] text-[#C97A8B]'
                    : 'border-transparent text-[#6D545A] hover:text-[#C97A8B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF6F7]">

          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW / REPORTS                                         */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#EDDAE0] shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6369] mb-1 font-medium">إجمالي المبيعات</p>
                    <h3 className="text-2xl font-bold text-[#381F26]">{Number(totalRevenue).toLocaleString()} <span className="text-xs font-normal text-[#C97A8B]">ر.ي</span></h3>
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" /> من {totalOrdersCount} طلب مسجل
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#C97A8B] flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#EDDAE0] shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6369] mb-1 font-medium">إجمالي الطلبات</p>
                    <h3 className="text-2xl font-bold text-[#381F26]">{totalOrdersCount}</h3>
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      {pendingOrdersCount} قيد المعالجة • {completedOrdersCount} مسلّمة
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#EDDAE0] shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6369] mb-1 font-medium">متوسط قيمة الطلب</p>
                    <h3 className="text-2xl font-bold text-[#381F26]">{Number(avgOrderValue.toFixed(0)).toLocaleString()} <span className="text-xs font-normal text-[#C97A8B]">ر.ي</span></h3>
                    <p className="text-[11px] text-[#7A6369] mt-1">لكل سلة شراء</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#EDDAE0] shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6369] mb-1 font-medium">المنتجات المعروضة</p>
                    <h3 className="text-2xl font-bold text-[#381F26]">{products.length}</h3>
                    <p className="text-[11px] text-[#7A6369] mt-1 font-medium">
                      {products.filter(p => p.inStock).length} باقة متوفرة
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Orders Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-[#EDDAE0] shadow-xs">
                  <h3 className="font-serif text-lg font-normal text-[#381F26] mb-4">
                    حالات الطلبات الحالية
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'pending', label: 'قيد الانتظار', color: 'bg-amber-400', count: orders.filter(o => o.status === 'pending').length },
                      { key: 'processing', label: 'جاري التجهيز والتنسيق', color: 'bg-blue-400', count: orders.filter(o => o.status === 'processing').length },
                      { key: 'shipped', label: 'مع مندوب التوصيل', color: 'bg-purple-400', count: orders.filter(o => o.status === 'shipped').length },
                      { key: 'delivered', label: 'تم تسليمها للعميل', color: 'bg-emerald-400', count: orders.filter(o => o.status === 'delivered').length },
                      { key: 'cancelled', label: 'طلبات ملغية', color: 'bg-rose-400', count: orders.filter(o => o.status === 'cancelled').length },
                    ].map((st) => (
                      <div key={st.key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${st.color}`} />
                          <span className="text-[#5C454B]">{st.label}</span>
                        </div>
                        <span className="font-bold text-[#381F26]">{st.count}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full mt-6 py-2.5 rounded-xl border border-[#E9CAD1] text-xs font-medium text-[#C97A8B] hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>عرض وإدارة جميع الطلبات</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>

                {/* Latest Orders Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EDDAE0] shadow-xs flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-normal text-[#381F26]">
                      أحدث الطلبات المستلمة
                    </h3>
                    <span className="text-xs text-[#7A6369]">تحديث فوري</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <ShoppingBag className="w-10 h-10 text-[#C97A8B]/40 mb-2" />
                      <p className="text-sm font-medium text-[#5E474D]">لا توجد طلبات مسجلة بعد</p>
                      <p className="text-xs text-[#8A7177] mt-1">عندما يطلب العميل عبر السلة ستظهر تفاصيله هنا مباشرة.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right">
                        <thead>
                          <tr className="border-b border-[#F0E0E4] text-[#7A6369]">
                            <th className="pb-3 font-medium">رقم الطلب</th>
                            <th className="pb-3 font-medium">العميل</th>
                            <th className="pb-3 font-medium">المبلغ</th>
                            <th className="pb-3 font-medium">الحالة</th>
                            <th className="pb-3 font-medium">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F6EBF0]">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="hover:bg-rose-50/40 transition-colors">
                              <td className="py-3 font-bold text-[#C97A8B] font-mono">
                                #{o.orderNumber}
                              </td>
                              <td className="py-3 text-[#381F26] font-medium">{o.customerName}</td>
                              <td className="py-3 font-bold">{Number(o.totalAmount || 0).toLocaleString()} ر.ي</td>
                              <td className="py-3">{getStatusBadge(o.status)}</td>
                              <td className="py-3">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="text-[#C97A8B] hover:underline font-medium"
                                >
                                  عرض التفاصيل
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: PRODUCTS MANAGEMENT                                        */}
          {/* ================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Product Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EDDAE0]">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#9A8187]" />
                  <input
                    type="text"
                    placeholder="ابحث عن باقة أو تصنيف..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-[#E7CDD4] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {products.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSeedProducts}
                      className="px-4 py-2 rounded-xl text-xs font-medium border border-[#C97A8B] text-[#C97A8B] hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                    >
                      <span>تحميل الباقات الافتراضية</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[#C97A8B] hover:bg-[#B8697A] text-white transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة منتج جديد</span>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-[#EDDAE0] overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-4/3 bg-[#FAF5F6] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/images/pink-lily-hero.jpg'; }}
                      />
                      {p.badge && (
                        <span className="absolute top-2 start-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-[#C97A8B] shadow-xs backdrop-blur-xs">
                          {p.badge}
                        </span>
                      )}
                      <span className={`absolute top-2 end-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {p.inStock ? 'متوفر' : 'نفذ'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#866D73] mb-1">
                          <span>{p.category}</span>
                          <span className="font-mono">{p.rating || 5.0} ★</span>
                        </div>
                        <h4 className="font-serif text-base text-[#381F26] font-normal mb-1.5 line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-bold text-sm text-[#C97A8B]">{Number(p.price).toLocaleString()} ر.ي</span>
                          {p.originalPrice && (
                            <span className="text-xs text-[#A18B91] line-through">
                              {Number(p.originalPrice).toLocaleString()} ر.ي
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#F2E5E8]">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          className="flex-1 py-1.5 rounded-lg border border-[#E7CDD4] text-xs font-medium text-[#5E474D] hover:text-[#C97A8B] hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EDDAE0]">
                  <Package className="w-12 h-12 text-[#C97A8B]/30 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#5E474D]">لم يتم العثور على أي باقات</p>
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="mt-3 text-xs text-[#C97A8B] underline hover:text-[#B8697A]"
                  >
                    أضف أول باقة الآن
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ORDERS MANAGEMENT                                          */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Order Status Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'جميع الطلبات', count: orders.length },
                  { id: 'pending', label: 'قيد الانتظار', count: orders.filter(o => o.status === 'pending').length },
                  { id: 'processing', label: 'جاري التجهيز', count: orders.filter(o => o.status === 'processing').length },
                  { id: 'shipped', label: 'تم الشحن', count: orders.filter(o => o.status === 'shipped').length },
                  { id: 'delivered', label: 'تم التوصيل', count: orders.filter(o => o.status === 'delivered').length },
                  { id: 'cancelled', label: 'ملغي', count: orders.filter(o => o.status === 'cancelled').length }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      orderFilter === f.id
                        ? 'bg-[#C97A8B] text-white shadow-xs'
                        : 'bg-white border border-[#E7CDD4] text-[#5E474D] hover:border-[#C97A8B]'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-[#EDDAE0] overflow-hidden shadow-xs">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-[#C97A8B]/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#5E474D]">لا توجد طلبات مطابقة لهذا الفلتر</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-[#FAF4F6] border-b border-[#EDDAE0] text-[#7A6369]">
                        <tr>
                          <th className="p-4 font-semibold">رقم الطلب</th>
                          <th className="p-4 font-semibold">تاريخ الطلب</th>
                          <th className="p-4 font-semibold">بيانات العميل</th>
                          <th className="p-4 font-semibold">العناصر</th>
                          <th className="p-4 font-semibold">الإجمالي</th>
                          <th className="p-4 font-semibold">الحالة</th>
                          <th className="p-4 font-semibold text-center">تحديث الحالة</th>
                          <th className="p-4 font-semibold text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2E5E8]">
                        {filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="p-4 font-mono font-bold text-[#C97A8B]">
                              #{o.orderNumber}
                            </td>
                            <td className="p-4 text-[#7A6369]">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-SA') : 'الآن'}
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-[#381F26]">{o.customerName}</div>
                              <div className="text-[11px] text-[#7A6369] font-mono">{o.customerPhone}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-[#381F26]">
                                {Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0} زهور
                              </span>
                            </td>
                            <td className="p-4 font-bold text-sm text-[#381F26]">
                              {Number(o.totalAmount || 0).toLocaleString()} ر.ي
                            </td>
                            <td className="p-4">
                              {getStatusBadge(o.status)}
                            </td>
                            <td className="p-4 text-center">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className="text-xs p-1.5 rounded-lg border border-[#DFC3CB] bg-[#FAF6F7] text-[#381F26] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="processing">جاري التجهيز</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="delivered">تم التوصيل</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-1.5 text-[#C97A8B] hover:bg-rose-50 rounded-lg transition-colors"
                                  title="عرض تفاصيل الطلب"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف الطلب"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: PROMO CODES MANAGEMENT                                     */}
          {/* ================================================================= */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              
              {/* Add New Promo Code Form */}
              <div className="bg-white p-6 rounded-2xl border border-[#EDDAE0] shadow-xs">
                <h3 className="font-serif text-lg font-normal text-[#381F26] mb-3">
                  إضافة كود خصم جديد
                </h3>
                <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#7A6369] mb-1">رمز الكود</label>
                    <input
                      type="text"
                      placeholder="مثال: SPRING20"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DFC3CB] uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A6369] mb-1">نسبة الخصم (%)</label>
                    <input
                      type="number"
                      placeholder="مثال: 15"
                      min="1"
                      max="100"
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      حفظ وتفعيل الكود
                    </button>
                  </div>
                </form>
              </div>

              {/* Promo Codes List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-white p-5 rounded-2xl border border-[#EDDAE0] shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono font-bold text-base text-[#381F26] tracking-wider bg-rose-50 px-2 py-0.5 rounded-md border border-[#F0D5DC]">
                          {promo.code}
                        </span>
                        <span className="text-xs font-bold text-[#C97A8B]">
                          خصم {promo.discountPercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#7A6369]">
                        <span>تم الاستخدام: {promo.usageCount || 0} مرة</span>
                        <span>•</span>
                        <span className={promo.isActive ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                          {promo.isActive ? 'نشط ويعمل' : 'معطّل مؤقتاً'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePromo(promo)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          promo.isActive
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {promo.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromo(promo.id, promo.code)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف الكود"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                                           */}
      {/* =================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EDDAE0] max-h-[90vh] flex flex-col overflow-hidden text-[#381F26]">
            
            <div className="p-5 border-b border-[#F0E0E4] flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-[#381F26]">
                {editingProduct ? 'تعديل بيانات الباقة' : 'إضافة باقة زهور جديدة'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#7A6369] hover:text-[#C97A8B] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-[#7A6369] mb-1">اسم الباقة / المنتج *</label>
                <input
                  type="text"
                  placeholder="مثال: حلم الزنبق الوردي"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                  required
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">التصنيف</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B] bg-white"
                  >
                    <option value="باقات">باقات الورد</option>
                    <option value="أعياد الميلاد">أعياد الميلاد</option>
                    <option value="رومانسية">رومانسية</option>
                    <option value="هدايا فاخرة">هدايا فاخرة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">شارة مميزة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر مبيعاً، جديد، حصري"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">السعر (ر.ي) *</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="25000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A6369] mb-1">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="78.00"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                  />
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="block text-xs font-medium text-[#7A6369] mb-1">صورة الباقة</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#FAF5F6] border border-[#DFC3CB] overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#B0999F]">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-[#7A6369] file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#FAF3F5] file:text-[#C97A8B] hover:file:bg-rose-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="أو رابط الصورة المباشر (URL)"
                      value={productForm.image}
                      onChange={(e) => {
                        setProductForm({ ...productForm, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-[#E7CDD4]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#7A6369] mb-1">وصف الباقة</label>
                <textarea
                  rows={2}
                  placeholder="وصف شاعري رقيق يوضح مكونات الورد والتغليف..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                />
              </div>

              {/* Details Bullets */}
              <div>
                <label className="block text-xs font-medium text-[#7A6369] mb-1">
                  المميزات والتفاصيل (اكتب كل ميزة في سطر منفصل)
                </label>
                <textarea
                  rows={3}
                  placeholder="زهور منتقاة بعناية فائقة بملمس طبيعي نضر&#10;تغليف ياباني فاخر متعدد الطبقات ومقاوم للماء&#10;كرت إهداء مجاني مع الطلب"
                  value={productForm.details}
                  onChange={(e) => setProductForm({ ...productForm, details: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#DFC3CB] focus:outline-none focus:ring-1 focus:ring-[#C97A8B]"
                />
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C97A8B] focus:ring-[#C97A8B]"
                />
                <label htmlFor="inStockCheck" className="text-xs font-medium text-[#381F26]">
                  متوفر للطلب في المخزون
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#F0E0E4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E7CDD4] text-xs font-medium text-[#7A6369] hover:bg-rose-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#C97A8B] hover:bg-[#B8697A] text-white text-xs font-medium transition-colors shadow-xs"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ الباقة'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ORDER DETAILS                                                */}
      {/* =================================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EDDAE0] max-h-[90vh] flex flex-col overflow-hidden text-[#381F26]">
            
            <div className="p-5 border-b border-[#F0E0E4] flex items-center justify-between bg-[#FAF6F7]">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#381F26]">
                  تفاصيل الطلب <span className="font-mono text-[#C97A8B]">#{selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-[#7A6369]">
                  بتاريخ: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('ar-SA') : 'الآن'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#7A6369] hover:text-[#C97A8B] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Customer info */}
              <div className="bg-[#FAF5F6] p-4 rounded-2xl border border-[#F0E0E4] space-y-2">
                <h4 className="text-xs font-bold text-[#C97A8B]">معلومات العميل والتسليم</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#886F76]">اسم المستلم: </span>
                    <strong className="text-[#381F26]">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#886F76]">رقم الهاتف: </span>
                    <strong className="text-[#381F26] font-mono">{selectedOrder.customerPhone || 'غير مسجل'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#886F76]">عنوان التوصيل: </span>
                    <strong className="text-[#381F26]">{selectedOrder.customerAddress}</strong>
                  </div>
                </div>
              </div>

              {/* Gift Message */}
              {selectedOrder.giftMessage && (
                <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#F5E2CE]">
                  <h4 className="text-xs font-bold text-[#A86419] mb-1">💌 رسالة كرت الإهداء:</h4>
                  <p className="text-xs text-[#634522] italic">"{selectedOrder.giftMessage}"</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-bold text-[#7A6369] mb-2.5">الباقات المطلوبة</h4>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0E0E4]">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/images/pink-lily-hero.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#381F26]">{item.name}</p>
                          <p className="text-[11px] text-[#7A6369]">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#C97A8B]">
                        {Number(parseFloat(item.price) * item.quantity).toLocaleString()} ر.ي
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-[#FAF6F7] p-4 rounded-2xl border border-[#F0E0E4] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A6369]">المجموع الفرعي:</span>
                  <span className="font-semibold">{Number(parseFloat(selectedOrder.subtotal || selectedOrder.totalAmount)).toLocaleString()} ر.ي</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>الخصم المطبق:</span>
                    <span>-{Number(parseFloat(selectedOrder.discount)).toLocaleString()} ر.ي</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#381F26] pt-2 border-t border-[#EDDAE0]">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-[#C97A8B]">{Number(parseFloat(selectedOrder.totalAmount)).toLocaleString()} ر.ي</span>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#F0E0E4] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A6369]">الحالة الحالية:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#C97A8B] text-white text-xs font-medium hover:bg-[#B8697A] transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
