import React, { useState, useMemo, useEffect } from 'react';
import {
  assets,
  products as initialProducts,
  o2Collections,
  customerReviews,
  PlantProduct,
  formatRupiah,
} from './data/products';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Droplets,
  Sun,
  Wind,
  ShoppingBag,
  Search,
  Play,
  Truck,
  ShieldCheck,
  TicketPercent,
  QrCode,
  Building2,
  Wallet,
  Banknote,
  Copy,
  Check,
  MapPin,
  Phone,
  FileText,
  Gift,
  ArrowLeft,
  User,
  LogOut,
  Package,
  Pencil,
  RotateCcw,
  Lock,
  Mail,
  Upload,
  LayoutDashboard,
} from 'lucide-react';

export interface CartItem {
  product: PlantProduct;
  quantity: number;
}

export interface UserAccount {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: 'admin' | 'customer';
}

export interface OrderInvoice {
  orderId: string;
  date: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  courier: string;
  etd: string;
  paymentLabel: string;
  status: 'Menunggu Kurir' | 'Sedang Dikirim' | 'Selesai';
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  addonsCost: number;
  discount: number;
  grandTotal: number;
}

const PLANT_GALLERY_CHOICES = [
  { label: 'Calathea', url: assets.plantCalathea },
  { label: 'Meja Hijau', url: assets.plantDesk1 },
  { label: 'Sukulen Mint', url: assets.plantDesk2 },
  { label: 'Sansivera Putih', url: assets.plantCalatheaAi },
  { label: 'Kaktus Terakota', url: assets.plantCal874 },
  { label: 'Monstera O2', url: assets.plantShow },
  { label: 'Palem Tropis', url: assets.plantCalatO2 },
];

const CATEGORIES = [
  'Semua',
  'Tanaman Indoor',
  'Tanaman Meja',
  'Tanaman O2',
  'Sukulen',
] as const;

const SHIPPING_OPTIONS = [
  {
    id: 'instant',
    name: 'GoSend / GrabExpress Instant',
    etd: 'Tiba hari ini (2–3 jam)',
    badge: 'Direkomendasikan untuk Tanaman',
    price: 25000,
  },
  {
    id: 'sameday',
    name: 'AnterAja / SiCepat Same Day',
    etd: 'Tiba hari ini (6–8 jam)',
    badge: 'Aman & Cepat',
    price: 15000,
  },
  {
    id: 'reguler',
    name: 'JNE Reguler + Hydrogel Lembap',
    etd: 'Estimasi 2–3 hari',
    badge: 'Ekonomis',
    price: 10000,
  },
] as const;

const BANK_OPTIONS = [
  { id: 'bca', name: 'BCA Virtual Account', va: '8801 0812 9940 2219' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', va: '8902 2026 7711 8842' },
  { id: 'bni', name: 'BNI Virtual Account', va: '8241 0091 3341 9012' },
  { id: 'bri', name: 'BRI Virtual Account', va: '8112 4409 1928 0011' },
] as const;

const EWALLET_OPTIONS = [
  { id: 'gopay', name: 'GoPay' },
  { id: 'shopeepay', name: 'ShopeePay' },
  { id: 'ovo', name: 'OVO' },
  { id: 'dana', name: 'DANA' },
] as const;

export default function App() {
  // Dynamic Product Catalog state persisted in localStorage
  const [catalog, setCatalog] = useState<PlantProduct[]>(() => {
    try {
      const saved = localStorage.getItem('planto_catalog_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return initialProducts;
  });

  useEffect(() => {
    try {
      localStorage.setItem('planto_catalog_v1', JSON.stringify(catalog));
    } catch {
      // ignore storage errors
    }
  }, [catalog]);

  // Order history persisted in localStorage
  const [orders, setOrders] = useState<OrderInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('planto_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('planto_orders_v1', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Authenticated user state (auto role detection: admin vs customer)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('planto_current_user_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(
          'planto_current_user_v1',
          JSON.stringify(currentUser)
        );
      } else {
        localStorage.removeItem('planto_current_user_v1');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Auth Modal & Page Views state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdminPageOpen, setIsAdminPageOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);

  // Admin Product Form Modal state
  const [editingProduct, setEditingProduct] = useState<PlantProduct | null>(
    null
  );
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState<{
    name: string;
    subtitle: string;
    category: PlantProduct['category'];
    price: number;
    description: string;
    longDescription: string;
    image: string;
    careLevel: PlantProduct['careLevel'];
    light: string;
    water: string;
    oxygenBoost: string;
    featuredIn: NonNullable<PlantProduct['featuredIn']>;
  }>({
    name: '',
    subtitle: 'Tanaman Rumah Kekinian',
    category: 'Tanaman Indoor',
    price: 350000,
    description: '',
    longDescription: '',
    image: assets.plantCalathea,
    careLevel: 'Mudah',
    light: 'Cahaya Teduh',
    water: '2x Seminggu',
    oxygenBoost: '+95% Udara Bersih',
    featuredIn: 'top-selling',
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { product: catalog[0] || initialProducts[0], quantity: 1 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Interactive hero carousel (3 slides matching the 3 dots in Figma)
  const heroSlides = useMemo(() => {
    const top = catalog.filter((p) => p.featuredIn === 'top-selling');
    return top.length >= 3
      ? [top[0], top[1], top[4] || top[2]]
      : catalog.slice(0, 3);
  }, [catalog]);
  const [heroIndex, setHeroIndex] = useState(0);
  const currentHeroPlant =
    heroSlides[heroIndex % Math.max(1, heroSlides.length)] ||
    initialProducts[0];

  // Interactive O2 carousel (4 slides matching 01/04 in Figma)
  const [o2Index, setO2Index] = useState(0);
  const currentO2 = o2Collections[o2Index];

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlantTypeDropdownOpen, setIsPlantTypeDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Toast state
  const [selectedProduct, setSelectedProduct] = useState<PlantProduct | null>(
    null
  );
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Newsletter state
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    province: 'DKI Jakarta',
    city: '',
    postalCode: '',
    courierNote: '',
    shippingId: 'instant',
    woodPacking: true,
    plantInsurance: true,
    giftCard: false,
    giftMessage: '',
    paymentMethod: 'qris',
    selectedBank: 'bca',
    selectedEwallet: 'gopay',
  });

  // Promo voucher & Invoice state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    label: string;
    type: 'percent' | 'shipping';
    value: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [lastOrderInvoice, setLastOrderInvoice] = useState<OrderInvoice | null>(
    null
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const addToCart = (product: PlantProduct, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      showToast(`"${product.name}" berhasil ditambahkan ke keranjang!`);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const selectedShipping = useMemo(
    () =>
      SHIPPING_OPTIONS.find((s) => s.id === checkoutForm.shippingId) ||
      SHIPPING_OPTIONS[0],
    [checkoutForm.shippingId]
  );

  const addonsTotal = useMemo(() => {
    let total = 0;
    if (checkoutForm.woodPacking) total += 15000;
    if (checkoutForm.plantInsurance) total += 5000;
    return total;
  }, [checkoutForm.woodPacking, checkoutForm.plantInsurance]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') {
      return Math.round((totalPrice * appliedPromo.value) / 100);
    }
    if (appliedPromo.type === 'shipping') {
      return selectedShipping.price;
    }
    return 0;
  }, [appliedPromo, totalPrice, selectedShipping]);

  const serviceFee = 2000;

  const grandTotal = useMemo(
    () =>
      Math.max(
        0,
        totalPrice +
        selectedShipping.price +
        addonsTotal +
        serviceFee -
        promoDiscount
      ),
    [totalPrice, selectedShipping, addonsTotal, promoDiscount]
  );

  const handleApplyPromo = (codeToApply?: string) => {
    const raw = (codeToApply ?? promoInput).trim().toUpperCase();
    setPromoError(null);
    if (!raw) return;
    if (raw === 'HIJAU10') {
      setAppliedPromo({
        code: 'HIJAU10',
        label: 'Diskon Tanaman 10%',
        type: 'percent',
        value: 10,
      });
      setPromoInput('HIJAU10');
      showToast('Voucher HIJAU10 (Diskon 10%) berhasil dipasang!');
    } else if (raw === 'ONGKIRGRATIS') {
      setAppliedPromo({
        code: 'ONGKIRGRATIS',
        label: 'Gratis Ongkos Kirim',
        type: 'shipping',
        value: 100,
      });
      setPromoInput('ONGKIRGRATIS');
      showToast('Voucher ONGKIRGRATIS berhasil dipasang!');
    } else if (raw === 'PLANTO25') {
      setAppliedPromo({
        code: 'PLANTO25',
        label: 'Diskon Spesial 25%',
        type: 'percent',
        value: 25,
      });
      setPromoInput('PLANTO25');
      showToast('Voucher PLANTO25 (Diskon 25%) berhasil dipasang!');
    } else {
      setPromoError('Kode voucher tidak ditemukan. Coba HIJAU10 atau ONGKIRGRATIS.');
    }
  };

  const handleCopyVa = (text: string) => {
    navigator.clipboard?.writeText(text.replace(/\s+/g, ''));
    setCopiedVa(true);
    showToast('Nomor Virtual Account berhasil disalin!');
    setTimeout(() => setCopiedVa(false), 2000);
  };

  // Top selling cards from catalog
  const topSellingProducts = useMemo(() => {
    const base = catalog.filter((p) => p.featuredIn === 'top-selling');
    return base.filter((p) => {
      const matchesCat =
        selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [catalog, selectedCategory, searchQuery]);

  const trendyPlant1 =
    catalog.find((p) => p.featuredIn === 'trendy-1') ||
    catalog[0] ||
    initialProducts[0];
  const trendyPlant2 =
    catalog.find((p) => p.featuredIn === 'trendy-2') ||
    catalog[1] ||
    initialProducts[1];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsPlantTypeDropdownOpen(false);
    scrollToSection('top-selling');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    showToast('Terima kasih telah berlangganan info terbaru Planto!');
    setEmailInput('');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = `PLT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bankObj = BANK_OPTIONS.find((b) => b.id === checkoutForm.selectedBank);
    const ewalletObj = EWALLET_OPTIONS.find(
      (w) => w.id === checkoutForm.selectedEwallet
    );
    const paymentLabel =
      checkoutForm.paymentMethod === 'qris'
        ? 'QRIS Instan'
        : checkoutForm.paymentMethod === 'va'
          ? bankObj?.name || 'Transfer Virtual Account'
          : checkoutForm.paymentMethod === 'ewallet'
            ? `E-Wallet (${ewalletObj?.name || 'GoPay'})`
            : 'Bayar di Tempat (COD)';

    const newInvoice: OrderInvoice = {
      orderId: randomId,
      date: new Date().toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
      customerEmail:
        currentUser?.email || checkoutForm.email || 'tamu@planto.id',
      customerName: checkoutForm.fullName || 'Pecinta Tanaman',
      phone: checkoutForm.phone || '0812-3456-7890',
      address: `${checkoutForm.address}, ${checkoutForm.city}, ${checkoutForm.province} ${checkoutForm.postalCode}`,
      courier: selectedShipping.name,
      etd: selectedShipping.etd,
      paymentLabel,
      status: 'Menunggu Kurir',
      items: [...cart],
      subtotal: totalPrice,
      shippingCost: selectedShipping.price,
      addonsCost: addonsTotal + serviceFee,
      discount: promoDiscount,
      grandTotal,
    };

    setLastOrderInvoice(newInvoice);
    setOrders((prev) => [newInvoice, ...prev]);

    setCheckoutSuccess(true);
    setCart([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Pesanan #${randomId} berhasil dikonfirmasi!`);
  };

  const openCheckoutPage = () => {
    setIsCartOpen(false);
    setCheckoutSuccess(false);
    if (currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone,
        address: prev.address || currentUser.address,
        city: prev.city || currentUser.city,
        postalCode: prev.postalCode || currentUser.postalCode,
      }));
    }
    setIsCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeCheckoutPage = () => {
    setIsCheckoutOpen(false);
    setCheckoutSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatic privilege recognition login handler (No visible Admin button)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const emailClean = authForm.email.trim().toLowerCase();
    const passClean = authForm.password.trim();

    if (!emailClean || !passClean) {
      setAuthError('Mohon isi alamat email dan kata sandi.');
      return;
    }

    // Privilege Recognition: Admin credentials check
    if (
      (emailClean === 'admin@planto.id' || emailClean === 'owner@planto.id') &&
      passClean === 'admin123'
    ) {
      const adminAcc: UserAccount = {
        email: emailClean,
        name: 'Pengelola Planto',
        phone: '0812-8888-9999',
        address: 'Kantor Pusat Planto Indonesia',
        city: 'Jakarta Selatan',
        postalCode: '12190',
        role: 'admin',
      };
      setCurrentUser(adminAcc);
      setIsAuthModalOpen(false);
      setIsAdminPageOpen(true);
      setAuthForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
      });
      showToast('Selamat datang kembali, Pengelola Toko Planto.');
      return;
    }

    if (
      emailClean === 'admin@planto.id' ||
      emailClean === 'owner@planto.id'
    ) {
      setAuthError('Kata sandi akun tersebut tidak sesuai.');
      return;
    }

    // Standard Customer Login / Registration
    let storedUsers: Record<
      string,
      UserAccount & { password: string }
    > = {};
    try {
      const raw = localStorage.getItem('planto_registered_customers_v1');
      if (raw) storedUsers = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (authMode === 'register') {
      const newCustomer: UserAccount & { password: string } = {
        email: emailClean,
        name: authForm.name.trim() || emailClean.split('@')[0],
        phone: authForm.phone.trim() || '0812-3456-7890',
        address: authForm.address.trim() || 'Jl. Lembah Hijau No. 24',
        city: authForm.city.trim() || 'Jakarta Selatan',
        postalCode: '12190',
        role: 'customer',
        password: passClean,
      };
      storedUsers[emailClean] = newCustomer;
      try {
        localStorage.setItem(
          'planto_registered_customers_v1',
          JSON.stringify(storedUsers)
        );
      } catch {
        // ignore
      }
      setCurrentUser(newCustomer);
      setIsAuthModalOpen(false);
      showToast(`Akun berhasil dibuat! Selamat datang, ${newCustomer.name}.`);
    } else {
      const existing = storedUsers[emailClean];
      if (existing && existing.password !== passClean) {
        setAuthError('Kata sandi yang Anda masukkan salah.');
        return;
      }
      const customerAcc: UserAccount = existing || {
        email: emailClean,
        name:
          emailClean.split('@')[0].charAt(0).toUpperCase() +
          emailClean.split('@')[0].slice(1),
        phone: '0812-3456-7890',
        address: 'Jl. Lembah Hijau No. 24',
        city: 'Jakarta Selatan',
        postalCode: '12190',
        role: 'customer',
      };
      setCurrentUser(customerAcc);
      setIsAuthModalOpen(false);
      showToast(`Selamat datang kembali, ${customerAcc.name}!`);
    }

    setAuthForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminPageOpen(false);
    setIsCustomerOrdersOpen(false);
    showToast('Anda telah keluar dari akun.');
  };

  // Admin CRUD Product Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      subtitle: 'Tanaman Rumah Kekinian',
      category: 'Tanaman Indoor',
      price: 350000,
      description:
        'Tanaman hias daun segar yang mempercantik sudut ruangan Anda.',
      longDescription:
        'Tanaman pilihan berkualitas tinggi dengan perawatan mudah dan kemampuan menyaring udara alami di dalam ruangan.',
      image: assets.plantCalathea,
      careLevel: 'Mudah',
      light: 'Cahaya Teduh',
      water: '2x Seminggu',
      oxygenBoost: '+95% Udara Bersih',
      featuredIn: 'top-selling',
    });
    setIsProductFormOpen(true);
  };

  const openEditProductModal = (product: PlantProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      price: product.price,
      description: product.description,
      longDescription: product.longDescription,
      image: product.image,
      careLevel: product.careLevel,
      light: product.light,
      water: product.water,
      oxygenBoost: product.oxygenBoost,
      featuredIn: product.featuredIn || 'top-selling',
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(productForm.price) || 0;
    const formatted = formatRupiah(numericPrice);

    if (editingProduct) {
      const updated: PlantProduct = {
        ...editingProduct,
        ...productForm,
        price: numericPrice,
        priceFormatted: formatted,
      };
      setCatalog((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updated : p))
      );
      showToast(`Produk "${updated.name}" berhasil diperbarui!`);
    } else {
      const newProduct: PlantProduct = {
        id: `plant-${Date.now()}`,
        ...productForm,
        price: numericPrice,
        priceFormatted: formatted,
      };
      setCatalog((prev) => [newProduct, ...prev]);
      showToast(`Produk baru "${newProduct.name}" berhasil ditambahkan!`);
    }
    setIsProductFormOpen(false);
  };

  const handleDeleteProduct = (product: PlantProduct) => {
    setCatalog((prev) => prev.filter((p) => p.id !== product.id));
    setCart((prev) => prev.filter((item) => item.product.id !== product.id));
    showToast(`Produk "${product.name}" telah dihapus dari katalog.`);
  };

  const handleResetCatalog = () => {
    setCatalog(initialProducts);
    localStorage.removeItem('planto_catalog_v1');
    showToast('Katalog produk berhasil dikembalikan ke data awal Figma.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderInvoice['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
    showToast(`Status pesanan #${orderId} diubah menjadi "${status}".`);
  };

  return (
    <div className="min-h-screen bg-[#171f12] text-white relative overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#222c1d] border border-white/30 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Centered 1728px Figma Canvas Container, Dedicated Checkout Page, OR Admin Page */}
      {isAdminPageOpen && currentUser?.role === 'admin' ? (
        <div className="min-h-screen bg-[#171f12] text-white flex flex-col justify-between">
          {/* Admin Header */}
          <header className="sticky top-0 z-30 bg-[#171f12]/90 backdrop-blur-xl border-b border-white/15">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdminPageOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-sm font-medium text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Lihat Tampilan Toko</span>
                </button>

                <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <img
                    src={assets.logoPlant}
                    alt="Planto"
                    className="w-9 h-9 object-contain"
                  />
                  <div>
                    <span className="font-black text-xl text-white tracking-tight block leading-none">
                      Planto.
                    </span>
                    <span className="text-[11px] text-[#4ade80] font-semibold">
                      Panel Pengelola Toko
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Navigation Tabs */}
              <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-2xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setAdminTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${adminTab === 'products'
                    ? 'bg-[#4ade80] text-[#171f12] font-bold shadow'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Katalog Produk ({catalog.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${adminTab === 'orders'
                    ? 'bg-[#4ade80] text-[#171f12] font-bold shadow'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Pesanan Masuk ({orders.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/70 hidden md:inline">
                  Masuk sebagai:{' '}
                  <strong className="text-white">{currentUser.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 text-xs font-semibold text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </header>

          {/* Admin Body */}
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-10 py-8 sm:py-10 flex-1 space-y-8">
            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl bg-[#1e2918] border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">
                    Total Koleksi Tanaman
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {catalog.length} Produk
                  </p>
                  <p className="text-xs text-[#4ade80] mt-1">
                    Aktif ditampilkan di etalase
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#4ade80]" />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#1e2918] border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">
                    Total Pesanan Pelanggan
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {orders.length} Transaksi
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Tersimpan otomatis di sistem
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#4ade80]" />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#1e2918] border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">
                    Total Pendapatan Toko
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] mt-1">
                    {formatRupiah(
                      orders.reduce((sum, o) => sum + o.grandTotal, 0)
                    )}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Akumulasi pembayaran masuk
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#4ade80]" />
                </div>
              </div>
            </div>

            {adminTab === 'products' ? (
              <div className="rounded-[32px] bg-[#1e2918] border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Manajemen Katalog Tanaman
                    </h2>
                    <p className="text-sm text-white/65">
                      Tambah tanaman baru, ubah harga/deskripsi, atau hapus
                      produk dari halaman utama.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetCatalog}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white/80 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Data Awal</span>
                    </button>

                    <button
                      type="button"
                      onClick={openAddProductModal}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4ade80] hover:bg-white text-[#171f12] text-sm font-bold transition-colors shadow-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Produk Tanaman</span>
                    </button>
                  </div>
                </div>

                {/* Products Table / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalog.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/25 border border-white/15 hover:border-white/35 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded-2xl bg-white/5 p-2 shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4ade80]/20 text-[#4ade80]">
                              {item.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70">
                              {item.featuredIn === 'top-selling'
                                ? 'Etalase Utama'
                                : item.featuredIn === 'trendy-1'
                                  ? 'Banner Populer 1'
                                  : 'Banner Populer 2'}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-white truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-white/65 line-clamp-1">
                            {item.description}
                          </p>
                          <p className="text-base font-bold text-[#4ade80]">
                            {item.priceFormatted}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(item)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-[#4ade80] hover:text-[#171f12] text-white transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item)}
                          className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Admin Orders List */
              <div className="rounded-[32px] bg-[#1e2918] border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="border-b border-white/15 pb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Daftar Pesanan Pelanggan
                  </h2>
                  <p className="text-sm text-white/65">
                    Pantau dan perbarui status pengiriman pesanan tanaman yang
                    masuk.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <Package className="w-12 h-12 text-white/30 mx-auto" />
                    <p className="text-lg text-white/70">
                      Belum ada transaksi pesanan yang masuk.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="p-5 rounded-2xl bg-black/25 border border-white/15 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-[#4ade80]">
                                #{ord.orderId}
                              </span>
                              <span className="text-xs text-white/50">
                                • {ord.date}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white mt-0.5">
                              {ord.customerName} ({ord.phone}) —{' '}
                              <span className="text-white/70 font-normal">
                                {ord.customerEmail}
                              </span>
                            </p>
                            <p className="text-xs text-white/60">
                              Alamat: {ord.address}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  ord.orderId,
                                  e.target.value as OrderInvoice['status']
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-[#222c1d] border border-[#4ade80]/40 text-xs font-bold text-[#4ade80] focus:outline-none"
                            >
                              <option value="Menunggu Kurir">
                                Menunggu Kurir
                              </option>
                              <option value="Sedang Dikirim">
                                Sedang Dikirim
                              </option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/75">
                          <div className="flex flex-wrap gap-2">
                            {ord.items.map((it) => (
                              <span
                                key={it.product.id}
                                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10"
                              >
                                {it.quantity}x {it.product.name}
                              </span>
                            ))}
                          </div>
                          <div className="text-right">
                            <span className="text-white/60 mr-2">
                              {ord.courier} • {ord.paymentLabel}
                            </span>
                            <span className="text-base font-bold text-[#4ade80]">
                              {formatRupiah(ord.grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          <footer className="border-t border-white/10 bg-[#222c1d] py-5 px-6 sm:px-10 text-center text-xs text-white/60">
            Planto. Sistem Manajemen E-Commerce Internal
          </footer>
        </div>
      ) : isCheckoutOpen ? (
        <div className="min-h-screen bg-[#171f12] text-white flex flex-col justify-between">
          {/* Checkout Page Navbar */}
          <header className="sticky top-0 z-30 bg-[#171f12]/90 backdrop-blur-xl border-b border-white/15">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={closeCheckoutPage}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-sm font-medium text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Toko</span>
                </button>

                <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />

                <button
                  type="button"
                  onClick={closeCheckoutPage}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img
                    src={assets.logoPlant}
                    alt="Planto"
                    className="w-9 h-9 object-contain"
                  />
                  <span className="font-black text-2xl text-white/85 tracking-tight">
                    Planto.
                  </span>
                </button>
              </div>

              {/* Checkout Step Indicator */}
              <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/70">
                  1. Keranjang
                </span>
                <span className="text-white/30">→</span>
                <span
                  className={`px-3 py-1 rounded-full ${!checkoutSuccess
                    ? 'bg-[#4ade80] text-[#171f12] font-bold'
                    : 'bg-white/10 text-white/70'
                    }`}
                >
                  2. Pengiriman & Pembayaran
                </span>
                <span className="text-white/30">→</span>
                <span
                  className={`px-3 py-1 rounded-full ${checkoutSuccess
                    ? 'bg-[#4ade80] text-[#171f12] font-bold'
                    : 'bg-white/10 text-white/40'
                    }`}
                >
                  3. Invoice Selesai
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#4ade80] font-semibold">
                <ShieldCheck className="w-5 h-5" />
                <span className="hidden sm:inline">
                  Transaksi Terenkripsi & Garansi Tanaman Hidup
                </span>
              </div>
            </div>
          </header>

          {/* Checkout Page Main Content */}
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-10 py-8 sm:py-12 flex-1">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {checkoutSuccess
                  ? 'Bukti Pemesanan Resmi Planto.'
                  : 'Halaman Checkout & Pengiriman'}
              </h1>
              <p className="text-sm text-white/65 mt-1">
                {checkoutSuccess
                  ? 'Terima kasih telah berbelanja di Planto. Simpan invoice ini sebagai bukti garansi tanaman hidup.'
                  : 'Lengkapi alamat pengiriman dan pilih metode pembayaran yang paling nyaman untuk Anda.'}
              </p>
            </div>

            {checkoutSuccess && lastOrderInvoice ? (
              /* =================================================== */
              /* INVOICE / ORDER CONFIRMATION PAGE                   */
              /* =================================================== */
              <div className="rounded-[32px] bg-[#1e2918] border border-white/20 p-6 sm:p-10 space-y-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#4ade80]/10 border border-[#4ade80]/30">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-14 h-14 text-[#4ade80] shrink-0" />
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-[#4ade80] text-[#171f12] mb-1">
                        PEMBAYARAN TERVERIFIKASI
                      </span>
                      <h4 className="text-2xl font-bold text-white">
                        Terima kasih, {lastOrderInvoice.customerName}!
                      </h4>
                      <p className="text-sm text-white/75">
                        Pesanan tanaman Anda sedang dikemas dengan hydrogel
                        pelembap & pelindung khusus.
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-black/25 px-5 py-3.5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/60">Nomor Invoice</p>
                    <p className="text-lg font-mono font-bold text-[#4ade80]">
                      #{lastOrderInvoice.orderId}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {lastOrderInvoice.date}
                    </p>
                  </div>
                </div>

                {/* Shipping & Payment Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#4ade80] text-xs font-bold uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>Tujuan Pengiriman</span>
                    </div>
                    <p className="font-semibold text-white">
                      {lastOrderInvoice.customerName}
                    </p>
                    <p className="text-xs text-white/70">
                      {lastOrderInvoice.phone}
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {lastOrderInvoice.address}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#4ade80] text-xs font-bold uppercase tracking-wider">
                      <Truck className="w-4 h-4" />
                      <span>Ekspedisi & Estimasi</span>
                    </div>
                    <p className="font-semibold text-white">
                      {lastOrderInvoice.courier}
                    </p>
                    <p className="text-xs text-[#4ade80]">
                      {lastOrderInvoice.etd}
                    </p>
                    <p className="text-xs text-white/60">
                      Status: Menunggu Penjemputan Kurir
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#4ade80] text-xs font-bold uppercase tracking-wider">
                      <Wallet className="w-4 h-4" />
                      <span>Metode Pembayaran</span>
                    </div>
                    <p className="font-semibold text-white">
                      {lastOrderInvoice.paymentLabel}
                    </p>
                    <p className="text-xs text-white/70">
                      Total Dibayar:{' '}
                      <span className="text-[#4ade80] font-bold">
                        {formatRupiah(lastOrderInvoice.grandTotal)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="rounded-2xl bg-white/5 border border-white/15 p-6 space-y-4">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4ade80]" />
                    <span>Rincian Tanaman yang Dipesan</span>
                  </h5>
                  <div className="divide-y divide-white/10">
                    {lastOrderInvoice.items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 object-contain rounded-xl bg-black/25 p-1"
                          />
                          <div>
                            <p className="font-semibold text-white text-base">
                              {product.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {quantity} x {product.priceFormatted}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-base">
                          {formatRupiah(product.price * quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="border-t border-white/15 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal Produk</span>
                      <span>{formatRupiah(lastOrderInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Ongkos Kirim</span>
                      <span>{formatRupiah(lastOrderInvoice.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Packing Kayu, Garansi & Layanan</span>
                      <span>{formatRupiah(lastOrderInvoice.addonsCost)}</span>
                    </div>
                    {lastOrderInvoice.discount > 0 && (
                      <div className="flex justify-between text-[#4ade80]">
                        <span>Diskon Voucher Promo</span>
                        <span>- {formatRupiah(lastOrderInvoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-white/15">
                      <span>Total Pembayaran</span>
                      <span className="text-[#4ade80]">
                        {formatRupiah(lastOrderInvoice.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-6 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cetak / Simpan Invoice (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={closeCheckoutPage}
                    className="px-8 py-3.5 rounded-xl bg-[#4ade80] text-[#171f12] font-bold text-sm hover:bg-white transition-colors cursor-pointer"
                  >
                    Selesai & Kembali Belanja
                  </button>
                </div>
              </div>
            ) : (
              /* =================================================== */
              /* 2-COLUMN FULL PAGE CHECKOUT FORM & ORDER SUMMARY    */
              /* =================================================== */
              <form
                onSubmit={handleCheckoutSubmit}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* LEFT COLUMN (7 Cols): Recipient, Shipping, Add-ons, Payment */}
                <div className="lg:col-span-7 space-y-7">
                  {/* 1. Alamat & Kontak Penerima */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#1e2918] border border-white/20 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3.5">
                      <MapPin className="w-5 h-5 text-[#4ade80]" />
                      <h2 className="font-bold text-lg sm:text-xl text-white">
                        1. Informasi & Alamat Pengiriman
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/75 mb-1.5">
                          Nama Lengkap Penerima *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.fullName}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/75 mb-1.5">
                          Nomor WhatsApp Aktif (Untuk Kurir) *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={checkoutForm.phone}
                            onChange={(e) =>
                              setCheckoutForm({
                                ...checkoutForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/75 mb-1.5">
                        Alamat Email (Untuk Pengiriman Invoice) *
                      </label>
                      <input
                        type="email"
                        required
                        value={checkoutForm.email}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/75 mb-1.5">
                        Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kelurahan)
                        *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs text-white/75 mb-1.5">
                          Provinsi *
                        </label>
                        <select
                          value={checkoutForm.province}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              province: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-3 rounded-xl bg-[#222c1d] border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        >
                          <option value="DKI Jakarta">DKI Jakarta</option>
                          <option value="Jawa Barat">Jawa Barat</option>
                          <option value="Banten">Banten</option>
                          <option value="Jawa Tengah">Jawa Tengah</option>
                          <option value="DI Yogyakarta">DI Yogyakarta</option>
                          <option value="Jawa Timur">Jawa Timur</option>
                          <option value="Bali">Bali</option>
                          <option value="Luar Pulau Jawa">
                            Luar Pulau Jawa
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/75 mb-1.5">
                          Kota / Kabupaten *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.city}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/75 mb-1.5">
                          Kode Pos *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.postalCode}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/75 mb-1.5">
                        Catatan untuk Kurir (Opsional)
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.courierNote}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            courierNote: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-xs text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  </div>

                  {/* 2. Pilihan Kurir & Perlindungan Tanaman */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#1e2918] border border-white/20 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3.5">
                      <Truck className="w-5 h-5 text-[#4ade80]" />
                      <h2 className="font-bold text-lg sm:text-xl text-white">
                        2. Metode Pengiriman & Proteksi Tanaman
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {SHIPPING_OPTIONS.map((option) => {
                        const isSelected =
                          checkoutForm.shippingId === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() =>
                              setCheckoutForm({
                                ...checkoutForm,
                                shippingId: option.id,
                              })
                            }
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                              ? 'bg-[#4ade80]/15 border-[#4ade80] shadow-md'
                              : 'bg-black/20 border-white/15 hover:border-white/35'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${isSelected
                                  ? 'border-[#4ade80]'
                                  : 'border-white/40'
                                  }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                                )}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-sm text-white">
                                    {option.name}
                                  </p>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-[#4ade80]">
                                    {option.badge}
                                  </span>
                                </div>
                                <p className="text-xs text-white/65 mt-0.5">
                                  {option.etd}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-white shrink-0">
                              {formatRupiah(option.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add-ons Checkboxes */}
                    <div className="pt-3 space-y-3 border-t border-white/10">
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Layanan Tambahan Khusus Tanaman Hias
                      </p>

                      <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-black/20 border border-white/10 cursor-pointer hover:border-white/30">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checkoutForm.woodPacking}
                            onChange={(e) =>
                              setCheckoutForm({
                                ...checkoutForm,
                                woodPacking: e.target.checked,
                              })
                            }
                            className="mt-1 accent-[#4ade80] w-4 h-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              Packing Kayu & Tabung Pelindung Daun
                            </p>
                            <p className="text-xs text-white/60">
                              Mencegah pot pecah dan batang patah selama
                              perjalanan ekspedisi.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#4ade80] shrink-0">
                          +Rp 15.000
                        </span>
                      </label>

                      <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-black/20 border border-white/10 cursor-pointer hover:border-white/30">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checkoutForm.plantInsurance}
                            onChange={(e) =>
                              setCheckoutForm({
                                ...checkoutForm,
                                plantInsurance: e.target.checked,
                              })
                            }
                            className="mt-1 accent-[#4ade80] w-4 h-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              Garansi Tanaman Hidup 100% (Ganti Baru Gratis)
                            </p>
                            <p className="text-xs text-white/60">
                              Klaim penggantian tanaman baru gratis jika tanaman
                              layu saat tiba.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#4ade80] shrink-0">
                          +Rp 5.000
                        </span>
                      </label>

                      <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-black/20 border border-white/10 cursor-pointer hover:border-white/30">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checkoutForm.giftCard}
                            onChange={(e) =>
                              setCheckoutForm({
                                ...checkoutForm,
                                giftCard: e.target.checked,
                              })
                            }
                            className="mt-1 accent-[#4ade80] w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white flex items-center gap-1.5">
                              <Gift className="w-4 h-4 text-[#4ade80]" />
                              <span>Kartu Ucapan Hadiah / Kado</span>
                            </p>
                            <p className="text-xs text-white/60">
                              Tulis pesan spesial yang dicetak di kartu kertas
                              daur ulang.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#4ade80] shrink-0">
                          GRATIS
                        </span>
                      </label>

                      {checkoutForm.giftCard && (
                        <input
                          type="text"
                          value={checkoutForm.giftMessage}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              giftMessage: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-[#4ade80]/40 text-xs text-white focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* 3. Metode Pembayaran Interaktif */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#1e2918] border border-white/20 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3.5">
                      <Wallet className="w-5 h-5 text-[#4ade80]" />
                      <h2 className="font-bold text-lg sm:text-xl text-white">
                        3. Metode Pembayaran
                      </h2>
                    </div>

                    {/* Payment Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          id: 'qris',
                          label: 'QRIS Instan',
                          icon: QrCode,
                        },
                        {
                          id: 'va',
                          label: 'Transfer VA',
                          icon: Building2,
                        },
                        {
                          id: 'ewallet',
                          label: 'E-Wallet',
                          icon: Wallet,
                        },
                        {
                          id: 'cod',
                          label: 'COD',
                          icon: Banknote,
                        },
                      ].map((method) => {
                        const Icon = method.icon;
                        const active =
                          checkoutForm.paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() =>
                              setCheckoutForm({
                                ...checkoutForm,
                                paymentMethod: method.id,
                              })
                            }
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${active
                              ? 'bg-[#4ade80]/15 border-[#4ade80] text-white'
                              : 'bg-black/20 border-white/15 text-white/70 hover:border-white/35'
                              }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${active ? 'text-[#4ade80]' : 'text-white/60'
                                }`}
                            />
                            <span className="font-semibold text-xs">
                              {method.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Interactive Payment Details Preview */}
                    {checkoutForm.paymentMethod === 'qris' && (
                      <div className="p-4 rounded-2xl bg-black/30 border border-white/15 flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-32 h-32 bg-white p-2.5 rounded-2xl shrink-0 flex flex-col items-center justify-center shadow-lg">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full text-[#171f12]"
                            fill="currentColor"
                          >
                            <rect x="5" y="5" width="28" height="28" rx="4" />
                            <rect
                              x="10"
                              y="10"
                              width="18"
                              height="18"
                              fill="white"
                            />
                            <rect x="14" y="14" width="10" height="10" />
                            <rect x="67" y="5" width="28" height="28" rx="4" />
                            <rect
                              x="72"
                              y="10"
                              width="18"
                              height="18"
                              fill="white"
                            />
                            <rect x="76" y="14" width="10" height="10" />
                            <rect x="5" y="67" width="28" height="28" rx="4" />
                            <rect
                              x="10"
                              y="72"
                              width="18"
                              height="18"
                              fill="white"
                            />
                            <rect x="14" y="76" width="10" height="10" />
                            <rect x="40" y="8" width="8" height="8" />
                            <rect x="52" y="12" width="8" height="14" />
                            <rect x="40" y="24" width="10" height="8" />
                            <rect x="8" y="42" width="14" height="8" />
                            <rect x="28" y="40" width="12" height="12" />
                            <rect x="46" y="42" width="16" height="16" rx="2" />
                            <rect x="68" y="40" width="10" height="12" />
                            <rect x="82" y="46" width="12" height="8" />
                            <rect x="40" y="64" width="12" height="10" />
                            <rect x="58" y="62" width="14" height="14" />
                            <rect x="78" y="66" width="16" height="10" />
                            <rect x="42" y="80" width="18" height="14" />
                            <rect x="66" y="82" width="10" height="12" />
                            <rect x="82" y="82" width="12" height="12" />
                          </svg>
                        </div>
                        <div className="space-y-1.5 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold">
                            <span>QRIS Nasional • Bebas Biaya Admin</span>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            Pindai QR dengan aplikasi BCA Mobile, Livin, GoPay,
                            OVO, DANA, atau ShopeePay
                          </p>
                          <p className="text-xs text-white/60">
                            Nominal tagihan{' '}
                            <strong className="text-white">
                              {formatRupiah(grandTotal)}
                            </strong>{' '}
                            akan otomatis terverifikasi setelah Anda menekan
                            tombol konfirmasi.
                          </p>
                        </div>
                      </div>
                    )}

                    {checkoutForm.paymentMethod === 'va' && (
                      <div className="p-4 rounded-2xl bg-black/30 border border-white/15 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {BANK_OPTIONS.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() =>
                                setCheckoutForm({
                                  ...checkoutForm,
                                  selectedBank: bank.id,
                                })
                              }
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${checkoutForm.selectedBank === bank.id
                                ? 'bg-white text-[#171f12] border-white'
                                : 'bg-white/5 text-white/70 border-white/15 hover:border-white/40'
                                }`}
                            >
                              {bank.id.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        {(() => {
                          const currentBank =
                            BANK_OPTIONS.find(
                              (b) => b.id === checkoutForm.selectedBank
                            ) || BANK_OPTIONS[0];
                          return (
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                              <div>
                                <p className="text-xs text-white/60">
                                  {currentBank.name} (a.n. Planto Indonesia)
                                </p>
                                <p className="text-base sm:text-lg font-mono font-bold text-[#4ade80] tracking-wider mt-0.5">
                                  {currentBank.va}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyVa(currentBank.va)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
                              >
                                {copiedVa ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                                    <span>Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Salin VA</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {checkoutForm.paymentMethod === 'ewallet' && (
                      <div className="p-4 rounded-2xl bg-black/30 border border-white/15 space-y-3">
                        <p className="text-xs text-white/70">
                          Pilih dompet digital yang terhubung dengan nomor
                          WhatsApp Anda:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {EWALLET_OPTIONS.map((w) => (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() =>
                                setCheckoutForm({
                                  ...checkoutForm,
                                  selectedEwallet: w.id,
                                })
                              }
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${checkoutForm.selectedEwallet === w.id
                                ? 'bg-[#4ade80] text-[#171f12] border-[#4ade80]'
                                : 'bg-white/5 text-white/75 border-white/15'
                                }`}
                            >
                              {w.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkoutForm.paymentMethod === 'cod' && (
                      <div className="p-4 rounded-2xl bg-black/30 border border-white/15 text-xs text-white/75 space-y-1">
                        <p className="font-semibold text-white text-sm">
                          Bayar Tunai Saat Tanaman Tiba (COD)
                        </p>
                        <p>
                          Anda dapat memeriksa kesegaran tanaman terlebih dahulu
                          saat kurir tiba sebelum menyerahkan uang pembayaran.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN (5 Cols): Sticky Order Summary, Promo Voucher, Cost Breakdown */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#222c1d] border border-white/20 space-y-5 shadow-2xl">
                    <h2 className="font-bold text-lg sm:text-xl text-white flex items-center justify-between border-b border-white/15 pb-3.5">
                      <span>Ringkasan Pesanan</span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-[#4ade80]">
                        {totalItems} Tanaman
                      </span>
                    </h2>

                    {/* Product List (No cramped inner scrollbar, expands naturally on the page) */}
                    <div className="space-y-3">
                      {cart.map(({ product, quantity }) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/20 border border-white/10"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-contain rounded-xl bg-white/5 p-1 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {quantity} x {product.priceFormatted}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-sm text-[#4ade80] shrink-0">
                            {formatRupiah(product.price * quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Promo Code Input */}
                    <div className="pt-3 border-t border-white/15 space-y-2.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                        <TicketPercent className="w-4 h-4 text-[#4ade80]" />
                        <span>Kode Promo / Voucher Diskon</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) =>
                            setPromoInput(e.target.value.toUpperCase())
                          }
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#4ade80]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyPromo()}
                          className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-[#4ade80] hover:text-[#171f12] text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Pakai
                        </button>
                      </div>

                      {/* Quick Clickable Promo Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-white/50">
                          Klik voucher:
                        </span>
                        {[
                          { code: 'HIJAU10', text: 'HIJAU10 (Diskon 10%)' },
                          {
                            code: 'ONGKIRGRATIS',
                            text: 'ONGKIRGRATIS (Free Ongkir)',
                          },
                        ].map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => handleApplyPromo(v.code)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${appliedPromo?.code === v.code
                              ? 'bg-[#4ade80] text-[#171f12] border-[#4ade80] font-bold'
                              : 'bg-white/5 text-white/75 border-white/20 hover:border-white/50'
                              }`}
                          >
                            {v.text}
                          </button>
                        ))}
                      </div>

                      {promoError && (
                        <p className="text-xs text-red-400">{promoError}</p>
                      )}
                      {appliedPromo && (
                        <div className="flex items-center justify-between text-xs bg-[#4ade80]/15 border border-[#4ade80]/40 text-[#4ade80] px-3 py-2 rounded-xl">
                          <span>
                            ✓ Voucher <strong>{appliedPromo.code}</strong> (
                            {appliedPromo.label})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoInput('');
                            }}
                            className="underline hover:text-white cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transparent Price Breakdown */}
                    <div className="pt-3 border-t border-white/15 space-y-2.5 text-sm">
                      <div className="flex justify-between text-white/75">
                        <span>Subtotal Harga Tanaman ({totalItems} item)</span>
                        <span>{formatRupiah(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-white/75">
                        <span>
                          Ongkos Kirim ({selectedShipping.id.toUpperCase()})
                        </span>
                        <span>{formatRupiah(selectedShipping.price)}</span>
                      </div>
                      {checkoutForm.woodPacking && (
                        <div className="flex justify-between text-white/75">
                          <span>Packing Kayu & Pelindung Daun</span>
                          <span>Rp 15.000</span>
                        </div>
                      )}
                      {checkoutForm.plantInsurance && (
                        <div className="flex justify-between text-white/75">
                          <span>Garansi Tanaman Hidup 100%</span>
                          <span>Rp 5.000</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white/75">
                        <span>Biaya Layanan Aplikasi</span>
                        <span>{formatRupiah(serviceFee)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-[#4ade80] font-semibold">
                          <span>Potongan Voucher ({appliedPromo?.code})</span>
                          <span>- {formatRupiah(promoDiscount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-baseline text-xl font-bold text-white pt-3 border-t border-white/20">
                        <span>Total Tagihan</span>
                        <span className="text-[#4ade80]">
                          {formatRupiah(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Payment Button */}
                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-[#4ade80] text-[#171f12] font-extrabold text-base sm:text-lg hover:bg-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        Buat Pesanan & Bayar {formatRupiah(grandTotal)}
                      </span>
                    </button>

                    <p className="text-[11px] text-center text-white/50 leading-relaxed">
                      Dengan menekan tombol di atas, pesanan Anda dilindungi
                      oleh Garansi Tanaman Hidup Planto Indonesia.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </main>

          {/* Checkout Page Compact Footer */}
          <footer className="border-t border-white/10 bg-[#222c1d] py-6 px-6 sm:px-10 text-center sm:flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center justify-center gap-2">
              <img
                src={assets.logoPlant}
                alt="Planto"
                className="w-5 h-5 object-contain"
              />
              <span className="font-bold text-white/80">Planto.</span>
              <span>© Hak cipta dilindungi</span>
            </div>
            <p className="mt-2 sm:mt-0">
              Pusat Bantuan Kurir Tanaman: WhatsApp 0812-8888-PLANTO
            </p>
          </footer>
        </div>
      ) : (
        <div
          className="max-w-[1728px] mx-auto relative overflow-hidden"
          data-node-id="22:2"
        >
          {/* ========================================================= */}
          {/* HERO + OUR TRENDY PLANTS SHARED BACKGROUND SECTION        */}
          {/* In Figma, nagy-arnold-X_IvVDuHvDQ-unsplash 2 spans 2592px */}
          {/* ========================================================= */}
          <div className="relative w-full">
            {/* Background Image Layer (h-[2592px] on desktop matching Figma) */}
            <div
              className="absolute inset-x-0 top-0 h-[2592px] pointer-events-none select-none overflow-hidden"
              data-node-id="22:3"
            >
              <img
                src={assets.heroBg}
                alt="Latar belakang tanaman hijau segar"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#171f12] to-transparent" />
            </div>

            {/* ========================================================= */}
            {/* NAVBAR (data-node-id="22:23")                             */}
            {/* ========================================================= */}
            <header
              className="relative z-30 flex items-center justify-between px-6 sm:px-10 lg:px-[67px] pt-8 lg:pt-[58px]"
              data-node-id="22:23"
            >
              {/* Brand Logo */}
              <a
                href="#home"
                className="flex items-center gap-[7px] group focus:outline-none"
                data-node-id="22:5"
              >
                <div
                  className="relative w-[48px] h-[48px] shrink-0 transition-transform duration-300 group-hover:scale-105"
                  data-node-id="17:174"
                >
                  <img
                    src={assets.logoPlant}
                    alt="Logo Planto"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  className="font-black text-[28px] text-white/75 group-hover:text-white transition-colors tracking-tight leading-none mt-2"
                  data-node-id="22:4"
                >
                  Planto.
                </span>
              </a>

              {/* Center Navigation Links */}
              <nav
                className="hidden lg:flex items-center gap-12 xl:gap-[74px]"
                data-node-id="22:12"
              >
                <a
                  href="#home"
                  className="font-medium text-[24px] text-white/75 hover:text-white transition-colors"
                  data-node-id="22:6"
                >
                  Beranda
                </a>

                {/* Plant Type's Dropdown */}
                <div className="relative" data-node-id="22:9">
                  <button
                    type="button"
                    onClick={() =>
                      setIsPlantTypeDropdownOpen(!isPlantTypeDropdownOpen)
                    }
                    className="flex items-center gap-2.5 font-medium text-[24px] text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    <span data-node-id="22:7">Tipe Tanaman</span>
                    <img
                      src={assets.navPolygon}
                      alt=""
                      className={`w-[13px] h-[7px] transition-transform duration-200 ${isPlantTypeDropdownOpen ? 'rotate-0' : 'rotate-180'
                        }`}
                    />
                  </button>

                  {isPlantTypeDropdownOpen && (
                    <div className="absolute left-0 mt-3 w-56 rounded-2xl bg-[#1e2918]/95 backdrop-blur-xl border border-white/25 shadow-2xl py-2 z-50">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={`w-full text-left px-4 py-2.5 text-base transition-colors flex items-center justify-between cursor-pointer ${selectedCategory === cat
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          <span>
                            {cat === 'Semua' ? 'Semua Tipe Tanaman' : cat}
                          </span>
                          {selectedCategory === cat && (
                            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => scrollToSection('best-o2')}
                  className="font-medium text-[24px] text-white/75 hover:text-white transition-colors cursor-pointer"
                  data-node-id="22:10"
                >
                  Lainnya
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('footer')}
                  className="font-medium text-[24px] text-white/75 hover:text-white transition-colors cursor-pointer"
                  data-node-id="22:11"
                >
                  Kontak
                </button>
              </nav>

              {/* Right Action Icons */}
              <div
                className="flex items-center gap-5 sm:gap-8"
                data-node-id="22:22"
              >
                {/* Search Button */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Cari tanaman"
                  className="relative w-[24px] h-[24px] opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                  data-node-id="22:13"
                >
                  <img
                    src={assets.searchIcon}
                    alt="Cari"
                    className="w-full h-full object-contain"
                  />
                </button>

                {/* Cart Bag Button */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Buka keranjang belanja"
                  className="relative w-[24px] h-[24px] opacity-85 hover:opacity-100 transition-opacity cursor-pointer"
                  data-node-id="22:14"
                >
                  <img
                    src={assets.bagIcon}
                    alt="Keranjang Belanja"
                    className="w-full h-full object-contain"
                  />
                  {totalItems > 0 && (
                    <span className="absolute -top-2.5 -right-3 bg-[#4ade80] text-[#171f12] font-bold text-xs min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* User Account / Login Button (Auto Role Recognition) */}
                {currentUser ? (
                  <div className="flex items-center gap-2.5">
                    {currentUser.role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => setIsAdminPageOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4ade80] text-[#171f12] font-bold text-xs sm:text-sm shadow-lg hover:bg-white transition-all cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Kelola Toko</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCustomerOrdersOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#4ade80]" />
                        <span className="max-w-[100px] truncate">
                          {currentUser.name}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Keluar Akun"
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/15 text-white/70 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white hover:text-[#171f12] border border-white/30 text-white text-sm font-semibold transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Masuk</span>
                  </button>
                )}

                {/* Hamburger Menu Icon */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Buka Menu"
                  className="w-[24px] h-[15px] flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  data-node-id="22:21"
                >
                  <img
                    src={assets.menuHamburger}
                    alt="Menu"
                    className="w-[28px] h-[15px] max-w-none"
                  />
                </button>
              </div>
            </header>

            {/* Expandable Search Bar & Quick Filter Drawer */}
            {(isSearchOpen || isMobileMenuOpen) && (
              <div className="relative z-30 mx-6 sm:mx-10 lg:mx-[67px] mt-6 p-5 rounded-3xl bg-[#1e2918]/90 backdrop-blur-xl border border-white/25 shadow-2xl">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-white/60 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/60"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedCategory === cat
                          ? 'bg-white text-[#171f12] shadow'
                          : 'bg-white/10 text-white/75 hover:bg-white/20'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* HERO SECTION (Left Text + Testimonial, Right Featured Card)*/}
            {/* ========================================================= */}
            <section
              id="home"
              className="relative z-20 px-6 sm:px-10 lg:px-[67px] pt-12 lg:pt-[155px]"
            >
              <div className="flex flex-col xl:flex-row items-start justify-between gap-12 xl:gap-8">
                {/* Left Column: Bernapas Alami + Actions + Alina Patel Review Card */}
                <div className="w-full xl:max-w-[890px]">
                  <h1
                    className="font-semibold text-[54px] sm:text-[84px] lg:text-[108px] text-white/75 leading-[1.08] tracking-tight"
                    data-node-id="22:37"
                  >
                    Bernapas Alami
                  </h1>

                  <p
                    className="font-medium text-[18px] sm:text-[23px] text-white/75 max-w-[820px] mt-3 lg:mt-[12px] leading-normal lg:ml-[7px]"
                    data-node-id="22:38"
                  >
                    Tanaman hias dengan tampilan estetik dan menyegarkan di dalam
                    rumah
                  </p>

                  {/* Explore & Live Demo Buttons */}
                  <div className="flex flex-wrap items-center gap-6 sm:gap-[26px] mt-8 lg:mt-[25px] lg:ml-[7px]">
                    <button
                      type="button"
                      onClick={() => scrollToSection('top-selling')}
                      className="h-[58px] w-[180px] rounded-[13px] border-2 border-white/75 text-[24px] text-white/75 hover:bg-white hover:text-[#171f12] transition-all duration-300 flex items-center justify-center cursor-pointer"
                      data-node-id="22:39"
                    >
                      Jelajahi
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLiveDemoOpen(true)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div
                        className="w-[58px] h-[58px] relative transition-transform duration-300 group-hover:scale-105"
                        data-node-id="22:45"
                      >
                        <img
                          src={assets.playButtonSvg}
                          alt="Putar Demo Langsung"
                          className="w-full h-full block"
                        />
                      </div>
                      <span
                        className="font-semibold text-[18px] text-white/75 group-hover:text-white transition-colors"
                        data-node-id="22:44"
                      >
                        Lihat Demo...
                      </span>
                    </button>
                  </div>

                  {/* Hero Glass Testimonial Card (Alina Patel) */}
                  <div
                    className="mt-14 lg:mt-[217px] lg:ml-[7px] w-full max-w-[409px] min-h-[237px] rounded-[42px] backdrop-blur-[8.05px] bg-white/5 border-2 border-white/45 px-[34px] py-[42px] relative"
                    data-node-id="22:58"
                  >
                    <div className="flex items-center gap-[18px]">
                      <div
                        className="w-[60px] h-[60px] rounded-[46px] overflow-hidden shrink-0 shadow-[0px_30px_36px_rgba(0,0,0,0.25)]"
                        data-node-id="22:47"
                      >
                        <img
                          src={assets.avatarAlinaPatel}
                          alt="Alina Patel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p
                          className="font-medium text-[24px] text-white leading-tight"
                          data-node-id="22:48"
                        >
                          Arip Soleh
                        </p>
                        <div
                          className="w-[98px] h-[15px] mt-1.5"
                          data-node-id="22:55"
                        >
                          <img
                            src={assets.starsSvg}
                            alt="4.5 bintang"
                            className="w-full h-full block"
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      className="font-normal text-[17px] text-white/75 mt-[25px] leading-snug max-w-[328px]"
                      data-node-id="22:56"
                    >
                      Terima kasih banyak cikkk..
                    </p>
                  </div>
                </div>

                {/* Right Column: Featured Hero Plant Card (data-node-id="22:105") */}
                <div
                  className="relative w-full max-w-[512px] h-[754px] mx-auto xl:mx-0 shrink-0 xl:-mt-[62px]"
                  data-node-id="22:105"
                >
                  {/* SVG Notched Glass Card Background */}
                  <div
                    className="absolute left-0 top-[110px] w-full h-[644px] pointer-events-none"
                    data-node-id="22:24"
                  >
                    <img
                      src={assets.cardFrameSvg}
                      alt=""
                      className="w-full h-full block object-fill"
                    />
                  </div>

                  {/* Floating Plant Image */}
                  <div
                    onClick={() => setSelectedProduct(currentHeroPlant)}
                    className="absolute left-1/2 -translate-x-1/2 top-0 w-[360px] sm:w-[459px] h-[459px] cursor-pointer transition-transform duration-500 hover:scale-105"
                    data-node-id="17:167"
                  >
                    <img
                      src={currentHeroPlant.image}
                      alt={currentHeroPlant.name}
                      className="w-full h-full object-contain plant-drop-shadow"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="absolute left-[45px] sm:left-[75px] right-[32px] top-[486px]">
                    <p
                      className="font-normal text-[23px] text-white leading-normal"
                      data-node-id="22:27"
                    >
                      {currentHeroPlant.subtitle}
                    </p>

                    <div className="flex items-center justify-between mt-[18px]">
                      <h2
                        onClick={() => setSelectedProduct(currentHeroPlant)}
                        className="font-normal text-[32px] sm:text-[38px] text-white/75 hover:text-white transition-colors cursor-pointer leading-normal"
                        data-node-id="22:28"
                      >
                        {currentHeroPlant.name}
                      </h2>

                      {/* Next Slide Arrow */}
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex((prev) => (prev + 1) % heroSlides.length)
                        }
                        aria-label="Tanaman berikutnya"
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer mr-1"
                        data-node-id="22:36"
                      >
                        <img
                          src={assets.rightArrow}
                          alt="Berikutnya"
                          className="w-[18px] h-[18px] opacity-75"
                        />
                      </button>
                    </div>

                    {/* Beli Sekarang Button */}
                    <button
                      type="button"
                      onClick={() => addToCart(currentHeroPlant, true)}
                      className="mt-[35px] px-6 min-w-[180px] h-[58px] rounded-[13px] border-2 border-white/75 text-[22px] text-white/75 hover:bg-white hover:text-[#171f12] transition-all duration-300 flex items-center justify-center cursor-pointer"
                      data-node-id="22:31"
                    >
                      Beli Sekarang
                    </button>
                  </div>

                  {/* Pagination Indicator Dots */}
                  <div
                    className="absolute bottom-[50px] left-1/2 -translate-x-1/2 flex items-center gap-2.5"
                    data-node-id="22:35"
                  >
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setHeroIndex(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-[6px] rounded-full transition-all cursor-pointer ${heroIndex === idx
                          ? 'w-[21px] bg-white'
                          : 'w-[6px] bg-white/50 hover:bg-white/80'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* OUR TRENDY PLANTS SECTION                                 */}
            {/* ========================================================= */}
            <section className="relative z-20 px-6 sm:px-10 lg:px-[74px] pt-24 lg:pt-[100px] pb-16">
              {/* Section Heading with Corner Brackets */}
              <div className="flex justify-center mb-16 lg:mb-[150px]">
                <div
                  className="relative inline-flex items-center justify-center px-8 py-2"
                  data-node-id="22:64"
                >
                  {/* Bottom-Left Green Corner Bracket */}
                  <img
                    src={assets.sectionBracketLeft}
                    alt=""
                    className="absolute -left-2 -bottom-2 w-[55px] h-[55px] pointer-events-none select-none"
                  />
                  <h2
                    className="font-semibold text-[36px] sm:text-[48px] lg:text-[55px] text-white heading-shadow text-center leading-normal"
                    data-node-id="22:61"
                  >
                    Tanaman Populer Kami
                  </h2>
                  {/* Top-Right Green Corner Bracket */}
                  <img
                    src={assets.sectionBracketRight}
                    alt=""
                    className="absolute -right-2 -top-2 w-[55px] h-[55px] rotate-180 pointer-events-none select-none"
                  />
                </div>
              </div>

              {/* Trendy Banner 1 (Plant on Left, Content on Right) */}
              <div className="relative w-full min-h-[526px] rounded-[48px] lg:rounded-[151px] backdrop-blur-[11.15px] bg-white/5 border-[3px] border-white/45 px-8 sm:px-14 lg:px-20 py-12 lg:py-0 flex flex-col lg:flex-row items-center justify-between gap-8 mb-24 lg:mb-[138px]">
                {/* Left Overlapping Plant Image */}
                <div
                  onClick={() => setSelectedProduct(trendyPlant1)}
                  className="relative lg:-mt-[206px] lg:-mb-[20px] w-[320px] sm:w-[460px] xl:w-[601px] xl:h-[732px] shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105"
                  data-node-id="22:66"
                >
                  <img
                    src={trendyPlant1.image}
                    alt={trendyPlant1.name}
                    className="w-full h-full object-contain plant-drop-shadow"
                  />
                </div>

                {/* Right Text Details */}
                <div
                  className="w-full lg:max-w-[680px] xl:mr-12"
                  data-node-id="22:75"
                >
                  <h3
                    onClick={() => setSelectedProduct(trendyPlant1)}
                    className="font-semibold text-[28px] sm:text-[38px] text-white leading-normal cursor-pointer hover:text-[#4ade80] transition-colors"
                    data-node-id="22:67"
                  >
                    {trendyPlant1.name}
                  </h3>
                  <p
                    className="font-semibold text-[18px] sm:text-[20px] text-white mt-4 lg:mt-[24px] max-w-[616px] leading-normal"
                    data-node-id="22:68"
                  >
                    {trendyPlant1.description}
                  </p>
                  <p
                    className="font-semibold text-[32px] sm:text-[38px] text-white price-shadow mt-5 lg:mt-[24px] leading-normal"
                    data-node-id="22:69"
                  >
                    {trendyPlant1.priceFormatted}
                  </p>

                  <div
                    className="flex items-center gap-[23px] mt-6 lg:mt-[24px]"
                    data-node-id="22:70"
                  >
                    <button
                      type="button"
                      onClick={() => addToCart(trendyPlant1, true)}
                      className="px-6 min-w-[180px] h-[58px] rounded-[13px] border-2 border-white text-[22px] text-white hover:bg-white hover:text-[#171f12] transition-all duration-300 flex items-center justify-center cursor-pointer"
                      data-node-id="22:71"
                    >
                      Beli Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => addToCart(trendyPlant1, false)}
                      aria-label="Tambah ke keranjang"
                      className="w-[58px] h-[58px] rounded-[13px] border-2 border-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                      data-node-id="22:73"
                    >
                      <img
                        src={assets.bagIcon}
                        alt="Tambah ke keranjang"
                        className="w-[28px] h-[28px] object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trendy Banner 2 (Content on Left, Plant on Right) */}
              <div className="relative w-full min-h-[526px] rounded-[48px] lg:rounded-[151px] backdrop-blur-[11.15px] bg-white/5 border-[3px] border-white/45 px-8 sm:px-14 lg:px-[147px] py-12 lg:py-0 flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
                {/* Left Text Details */}
                <div className="w-full lg:max-w-[621px]" data-node-id="22:78">
                  <h3
                    onClick={() => setSelectedProduct(trendyPlant2)}
                    className="font-semibold text-[28px] sm:text-[38px] text-white leading-normal cursor-pointer hover:text-[#4ade80] transition-colors"
                    data-node-id="22:80"
                  >
                    {trendyPlant2.name}
                  </h3>
                  <p
                    className="font-semibold text-[18px] sm:text-[20px] text-white mt-4 lg:mt-[24px] max-w-[616px] leading-normal"
                    data-node-id="22:81"
                  >
                    {trendyPlant2.description}
                  </p>
                  <p
                    className="font-semibold text-[32px] sm:text-[38px] text-white price-shadow mt-5 lg:mt-[24px] leading-normal"
                    data-node-id="22:79"
                  >
                    {trendyPlant2.priceFormatted}
                  </p>

                  <div
                    className="flex items-center gap-[23px] mt-6 lg:mt-[24px]"
                    data-node-id="22:82"
                  >
                    <button
                      type="button"
                      onClick={() => addToCart(trendyPlant2, true)}
                      className="px-6 min-w-[180px] h-[58px] rounded-[13px] border-2 border-white text-[22px] text-white hover:bg-white hover:text-[#171f12] transition-all duration-300 flex items-center justify-center cursor-pointer"
                      data-node-id="22:83"
                    >
                      Beli Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => addToCart(trendyPlant2, false)}
                      aria-label="Tambah ke keranjang"
                      className="w-[58px] h-[58px] rounded-[13px] border-2 border-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                      data-node-id="22:84"
                    >
                      <img
                        src={assets.bagIcon}
                        alt="Tambah ke keranjang"
                        className="w-[28px] h-[28px] object-contain"
                      />
                    </button>
                  </div>
                </div>

                {/* Right Overlapping Plant Image */}
                <div
                  onClick={() => setSelectedProduct(trendyPlant2)}
                  className="relative lg:-mt-[149px] lg:-mb-[50px] w-[320px] sm:w-[460px] xl:w-[601px] xl:h-[732px] shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105"
                  data-node-id="22:77"
                >
                  <img
                    src={trendyPlant2.image}
                    alt={trendyPlant2.name}
                    className="w-full h-full object-contain plant-drop-shadow"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================= */}
          {/* OUR TOP SELLING SECTION (6 Cards Grid)                    */}
          {/* ========================================================= */}
          <section
            id="top-selling"
            className="relative z-20 px-6 sm:px-10 lg:px-[77px] pt-24 lg:pt-[150px]"
          >
            {/* Section Heading with Corner Brackets */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div
                className="relative inline-flex items-center justify-center px-9 py-2"
                data-node-id="22:91"
              >
                <img
                  src={assets.sectionBracketLeft}
                  alt=""
                  className="absolute -left-2 -bottom-2 w-[68.5px] h-[69px] pointer-events-none select-none"
                />
                <h2
                  className="font-semibold text-[36px] sm:text-[48px] lg:text-[55px] text-white heading-shadow text-center leading-normal"
                  data-node-id="22:92"
                >
                  Tanaman Terlaris Kami
                </h2>
                <img
                  src={assets.sectionBracketRight}
                  alt=""
                  className="absolute -right-2 -top-2 w-[68.5px] h-[69px] rotate-180 pointer-events-none select-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm sm:text-base font-medium border transition-all cursor-pointer ${selectedCategory === cat
                      ? 'bg-white text-[#171f12] border-white shadow-lg'
                      : 'bg-white/5 text-white/75 border-white/25 hover:border-white/60 hover:text-white'
                      }`}
                  >
                    {cat === 'Semua' ? 'Semua Tanaman' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Filter State */}
            {topSellingProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/20 my-8">
                <p className="text-2xl text-white/75">
                  Tidak ada tanaman yang cocok dengan "
                  {searchQuery || selectedCategory}".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Semua');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl border border-white/60 text-white hover:bg-white hover:text-[#171f12] transition-colors cursor-pointer"
                >
                  Atur Ulang Filter
                </button>
              </div>
            ) : (
              /* 3-Column Product Grid Matching Figma Coordinates */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-[19px] gap-y-[22px] justify-items-center mt-8">
                {topSellingProducts.map((plant) => (
                  <div
                    key={plant.id}
                    className="relative w-full max-w-[512px] h-[781px] group"
                  >
                    {/* Notched Glass Card Frame SVG (starts at top-[137px], h-[644px]) */}
                    <div className="absolute left-0 top-[137px] w-full h-[644px] pointer-events-none">
                      <img
                        src={assets.cardFrameSvg}
                        alt=""
                        className="w-full h-full block object-fill"
                      />
                    </div>

                    {/* Plant Image Overlapping Top */}
                    <div
                      onClick={() => setSelectedProduct(plant)}
                      className="absolute left-[49px] top-0 w-[377px] h-[459px] cursor-pointer transition-transform duration-500 group-hover:scale-105 flex items-center justify-center"
                    >
                      <img
                        src={plant.image}
                        alt={plant.name}
                        className="w-full h-full object-contain plant-drop-shadow"
                      />
                    </div>

                    {/* Card Text & Price Content */}
                    <div className="absolute left-[72px] right-[71px] top-[494px]">
                      <h3
                        onClick={() => setSelectedProduct(plant)}
                        className="font-normal text-[30px] sm:text-[34px] text-white/75 hover:text-white transition-colors cursor-pointer leading-normal"
                      >
                        {plant.name}
                      </h3>

                      <p className="font-normal text-[19px] sm:text-[22px] text-white/75 mt-[20px] max-w-[330px] leading-normal">
                        {plant.description}
                      </p>

                      <div className="flex items-center justify-between mt-[30px]">
                        <span className="font-normal text-[30px] sm:text-[36px] text-white/75 leading-normal">
                          {plant.priceFormatted}
                        </span>

                        <button
                          type="button"
                          onClick={() => addToCart(plant, false)}
                          aria-label={`Tambah ${plant.name} ke keranjang`}
                          className="w-[57px] h-[57px] rounded-[15px] border-2 border-white/75 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <img
                            src={assets.bagIcon}
                            alt="Tambah ke keranjang"
                            className="w-[30px] h-[30px] object-contain opacity-75"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* CUSTOMER REVIEW SECTION (data-node-id="22:185")           */}
          {/* ========================================================= */}
          <section className="relative z-20 px-6 sm:px-10 lg:px-[77px] pt-28 lg:pt-[214px]">
            {/* Heading */}
            <div className="flex justify-center mb-16 lg:mb-[183px]">
              <div
                className="relative inline-flex items-center justify-center px-9 py-2"
                data-node-id="22:147"
              >
                <img
                  src={assets.sectionBracketLeft}
                  alt=""
                  className="absolute -left-2 -bottom-2 w-[68.5px] h-[69px] pointer-events-none select-none"
                />
                <h2
                  className="font-semibold text-[36px] sm:text-[48px] lg:text-[55px] text-white heading-shadow text-center leading-normal"
                  data-node-id="22:148"
                >
                  Ulasan Pelanggan
                </h2>
                <img
                  src={assets.sectionBracketRight}
                  alt=""
                  className="absolute -right-2 -top-2 w-[68.5px] h-[69px] rotate-180 pointer-events-none select-none"
                />
              </div>
            </div>

            {/* 3 Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[21px] justify-items-center">
              {customerReviews.map((review) => (
                <div
                  key={review.id}
                  className="relative w-full max-w-[512px] h-[414px]"
                >
                  {/* SVG Notched Card Background */}
                  <div className="absolute inset-0 pointer-events-none">
                    <img
                      src={assets.reviewCardSvg}
                      alt=""
                      className="w-full h-full block object-fill"
                    />
                  </div>

                  {/* Reviewer Info & Text */}
                  <div className="relative z-10 px-[48px] pt-[101px]">
                    <div className="flex items-center gap-[19px]">
                      <div className="w-[71px] h-[71px] rounded-[52px] overflow-hidden shrink-0">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[24px] text-white leading-normal">
                          {review.name}
                        </h3>
                        <div className="w-[98px] h-[15px] mt-1">
                          <img
                            src={assets.starsSvg}
                            alt="4.5 bintang"
                            className="w-full h-full block"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="font-normal text-[21px] text-white/75 mt-[41px] max-w-[416px] leading-normal">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* OUR BEST O2 SECTION (data-node-id="22:190")               */}
          {/* ========================================================= */}
          <section
            id="best-o2"
            className="relative z-20 px-6 sm:px-10 lg:px-[77px] pt-28 lg:pt-[214px] pb-20"
          >
            {/* Heading */}
            <div className="flex justify-center mb-20 lg:mb-[214px]">
              <div
                className="relative inline-flex items-center justify-center px-9 py-2"
                data-node-id="22:190"
              >
                <img
                  src={assets.sectionBracketLeft}
                  alt=""
                  className="absolute -left-2 -bottom-2 w-[68.5px] h-[69px] pointer-events-none select-none"
                />
                <h2
                  className="font-semibold text-[36px] sm:text-[48px] lg:text-[55px] text-white heading-shadow text-center leading-normal"
                  data-node-id="22:191"
                >
                  Tanaman O2 Terbaik
                </h2>
                <img
                  src={assets.sectionBracketRight}
                  alt=""
                  className="absolute -right-2 -top-2 w-[68.5px] h-[69px] rotate-180 pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Large Rounded O2 Showcase Container */}
            <div
              className="relative w-full min-h-[755px] rounded-[48px] lg:rounded-[113px] bg-white/5 border-2 border-white/45 px-8 sm:px-14 lg:px-16 py-12 lg:py-0 flex flex-col lg:flex-row items-center justify-between"
              data-node-id="22:194"
            >
              {/* Left Giant O2 Plant Image */}
              <div
                onClick={() => {
                  const found = catalog.find(
                    (p) => p.id === currentO2.productRefId
                  );
                  if (found) setSelectedProduct(found);
                }}
                className="relative lg:-ml-[162px] lg:-mt-[283px] w-[360px] sm:w-[600px] xl:w-[877px] xl:h-[877px] shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105"
                data-node-id="22:195"
              >
                <img
                  src={currentO2.image}
                  alt={currentO2.title}
                  className="w-full h-full object-contain plant-drop-shadow"
                />
              </div>

              {/* Right O2 Details + Controls */}
              <div className="w-full lg:max-w-[740px] lg:py-16 xl:pr-12">
                <h3
                  className="font-semibold text-[28px] sm:text-[38px] text-white/75 max-w-[653px] leading-normal"
                  data-node-id="22:196"
                >
                  {currentO2.title}
                </h3>

                <p
                  className="font-semibold text-[20px] sm:text-[28px] text-white/75 mt-8 lg:mt-[47px] max-w-[678px] leading-normal"
                  data-node-id="22:197"
                >
                  {currentO2.paragraph1}
                </p>

                <p
                  className="font-semibold text-[20px] sm:text-[28px] text-white/75 mt-6 lg:mt-[47px] max-w-[678px] leading-normal"
                  data-node-id="22:198"
                >
                  {currentO2.paragraph2}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-6 mt-10 lg:mt-[47px] max-w-[678px]">
                  <button
                    type="button"
                    onClick={() => {
                      const found = catalog.find(
                        (p) => p.id === currentO2.productRefId
                      );
                      if (found) setSelectedProduct(found);
                    }}
                    className="w-[180px] h-[58px] rounded-[13px] border-2 border-white/75 text-[24px] text-white/75 hover:bg-white hover:text-[#171f12] transition-all duration-300 flex items-center justify-center cursor-pointer"
                    data-node-id="22:199"
                  >
                    Jelajahi
                  </button>

                  {/* Prev / 01/04 / Next Controls */}
                  <div className="flex items-center gap-7">
                    <button
                      type="button"
                      onClick={() =>
                        setO2Index(
                          (prev) =>
                            (prev - 1 + o2Collections.length) %
                            o2Collections.length
                        )
                      }
                      aria-label="Tanaman O2 Sebelumnya"
                      className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      data-node-id="22:203"
                    >
                      <img
                        src={assets.rightArrow}
                        alt="Sebelumnya"
                        className="w-[24px] h-[24px] rotate-180 opacity-45 hover:opacity-80"
                      />
                    </button>

                    <p
                      className="font-semibold text-white/75 select-none"
                      data-node-id="22:204"
                    >
                      <span className="text-[24px]">0{o2Index + 1}/</span>
                      <span className="text-[18px]">0{o2Collections.length}</span>
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setO2Index((prev) => (prev + 1) % o2Collections.length)
                      }
                      aria-label="Tanaman O2 Berikutnya"
                      className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      data-node-id="22:202"
                    >
                      <img
                        src={assets.rightArrow}
                        alt="Berikutnya"
                        className="w-[24px] h-[24px] opacity-75 hover:opacity-100"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slider Dots (data-node-id="22:208") */}
            <div
              className="flex items-center justify-center gap-3 mt-14 lg:mt-[68px]"
              data-node-id="22:208"
            >
              {o2Collections.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setO2Index(idx)}
                  aria-label={`Slide O2 ${idx + 1}`}
                  className={`h-[9px] rounded-full transition-all cursor-pointer ${o2Index === idx
                    ? 'w-[38px] bg-white'
                    : 'w-[9px] bg-white/50 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* FOOTER SECTION (bg-[#222c1d], data-node-id="22:209")       */}
          {/* ========================================================= */}
          <footer
            id="footer"
            className="relative z-20 bg-[#222c1d] w-full min-h-[577px] px-6 sm:px-10 lg:px-[73px] pt-16 lg:pt-[96px] pb-14 mt-16 lg:mt-[120px]"
            data-node-id="22:209"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
              {/* Column 1: Planto Brand & Socials */}
              <div className="lg:col-span-5">
                <div
                  className="flex items-center gap-[11px]"
                  data-node-id="22:210"
                >
                  <img
                    src={assets.logoPlant}
                    alt="Planto"
                    className="w-[60px] h-[60px] object-contain"
                    data-node-id="22:211"
                  />
                  <span
                    className="font-black text-[38px] text-white/75 leading-none mt-2"
                    data-node-id="22:212"
                  >
                    Planto.
                  </span>
                </div>

                <p
                  className="font-medium text-[20px] sm:text-[24px] text-white mt-8 lg:mt-[38px] max-w-[589px] leading-normal"
                  data-node-id="22:213"
                >
                  Planto adalah platform e-commerce yang berfokus pada penjualan
                  tanaman hias secara online. Kami menyediakan berbagai jenis
                  tanaman hias berkualitas tinggi dengan harga terjangkau, lengkap
                  dengan pupuk dan aksesori perawatan.
                </p>

                <div
                  className="flex items-center gap-[45px] mt-12 lg:mt-[120px] font-semibold text-[24px] text-white"
                  data-node-id="22:217"
                >
                  <a
                    href="#fb"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Mengikuti Planto di Facebook!');
                    }}
                    className="hover:text-[#4ade80] transition-colors"
                    data-node-id="22:214"
                  >
                    FACEBOOK
                  </a>
                  <a
                    href="#ig"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Mengikuti Planto di Instagram!');
                    }}
                    className="hover:text-[#4ade80] transition-colors"
                    data-node-id="22:215"
                  >
                    INSTAGRAM
                  </a>
                  <a
                    href="#tt"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Mengikuti Planto di TikTok!');
                    }}
                    className="hover:text-[#4ade80] transition-colors"
                    data-node-id="22:216"
                  >
                    TIKTOK
                  </a>
                </div>
              </div>

              {/* Column 2: Tautan Cepat */}
              <div className="lg:col-span-3">
                <h4
                  className="font-semibold text-[28px] text-white/75"
                  data-node-id="22:218"
                >
                  Tentang Kami
                </h4>

                <ul className="mt-8 lg:mt-[49px] space-y-[22px] font-medium text-[24px] text-white/75">
                  <li>
                    <a
                      href="#home"
                      className="hover:text-white transition-colors"
                      data-node-id="22:219"
                    >
                      Beranda
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('top-selling')}
                      className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                      data-node-id="22:220"
                    >
                      <span>Jenis Tanaman</span>
                      <img
                        src={assets.footerPolygon}
                        alt=""
                        className="w-[9px] h-[6px] rotate-180"
                      />
                    </button>
                  </li>
                  <li>
                    <a
                      href="#footer"
                      className="hover:text-white transition-colors"
                      data-node-id="22:221"
                    >
                      Kontak
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Kebijakan Privasi Planto: Data Anda 100% aman.'
                        )
                      }
                      className="hover:text-white transition-colors cursor-pointer"
                      data-node-id="22:222"
                    >
                      Privasi
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Newsletter */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div>
                  <h4
                    className="font-semibold text-[28px] text-white/75"
                    data-node-id="22:225"
                  >
                    Dapatkan Info Terbaru
                  </h4>

                  <form
                    onSubmit={handleSubscribe}
                    className="mt-8 lg:mt-[44px] relative w-full max-w-[563px] h-[67px] rounded-[10px] border-2 border-white flex items-center overflow-hidden"
                    data-node-id="22:226"
                  >
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-full bg-transparent pl-6 lg:pl-[32px] pr-[180px] font-semibold text-[18px] text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Berlangganan"
                      className="absolute right-0 top-0 h-full w-[170px] bg-white text-[#171f12] font-bold text-[18px] tracking-wide flex items-center justify-center cursor-pointer hover:bg-[#4ade80] transition-colors"
                      data-node-id="22:229"
                    >
                      LANGGANAN
                    </button>
                  </form>
                  {subscribed && (
                    <p className="text-sm text-[#4ade80] mt-2">
                      ✓ Berhasil berlangganan info perawatan tanaman & promo
                      mingguan!
                    </p>
                  )}
                </div>

                <p
                  className="font-semibold text-[22px] text-white/75 mt-12 lg:mt-[215px]"
                  data-node-id="22:232"
                >
                  Planto © Hak cipta dilindungi
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE CART DRAWER                                   */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c2617] border-l border-white/20 h-full flex flex-col justify-between p-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#4ade80]" />
                <h3 className="text-2xl font-bold text-white">
                  Keranjang Tanaman ({totalItems})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <img
                    src={assets.logoPlant}
                    alt=""
                    className="w-16 h-16 mx-auto opacity-40 mb-4"
                  />
                  <p className="text-xl text-white/70">
                    Keranjang tanaman Anda kosong
                  </p>
                  <p className="text-sm text-white/50 mt-1">
                    Jelajahi koleksi tanaman kami untuk menambahkan kesegaran
                    alami di ruangan Anda!
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/15"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-contain rounded-xl bg-black/20 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-white/60">
                        {product.category}
                      </p>
                      <p className="text-[#4ade80] font-semibold mt-1">
                        {formatRupiah(product.price * quantity)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1 border border-white/15">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="text-white/75 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="text-white/75 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/15 pt-4 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Kemasan Ramah Lingkungan & Pengiriman</span>
                    <span className="text-[#4ade80]">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openCheckoutPage}
                  className="w-full py-3.5 rounded-xl bg-white text-[#171f12] font-bold text-lg hover:bg-[#4ade80] transition-colors cursor-pointer"
                >
                  Lanjutkan ke Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRODUCT DETAIL MODAL                                      */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-[38px] bg-[#1e2918] border-2 border-white/35 p-6 sm:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center bg-white/5 rounded-3xl p-6 border border-white/15">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain plant-drop-shadow"
              />
            </div>

            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30">
                {selectedProduct.category} • Perawatan{' '}
                {selectedProduct.careLevel}
              </span>
              <h3 className="text-3xl font-bold text-white">
                {selectedProduct.name}
              </h3>
              <p className="text-sm text-white/60">
                {selectedProduct.subtitle}
              </p>
              <p className="text-2xl font-bold text-[#4ade80]">
                {selectedProduct.priceFormatted}
              </p>
              <p className="text-white/80 text-sm leading-relaxed">
                {selectedProduct.longDescription}
              </p>

              {/* Plant Care Specs */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Sun className="w-4 h-4 text-amber-300 mx-auto mb-1" />
                  <p className="text-[11px] text-white/60">Cahaya</p>
                  <p className="text-xs font-semibold text-white">
                    {selectedProduct.light}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Droplets className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                  <p className="text-[11px] text-white/60">Penyiraman</p>
                  <p className="text-xs font-semibold text-white">
                    {selectedProduct.water}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Wind className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
                  <p className="text-[11px] text-white/60">Kadar O2</p>
                  <p className="text-xs font-semibold text-white">
                    {selectedProduct.oxygenBoost}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedProduct, true);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-white text-[#171f12] font-bold hover:bg-[#4ade80] transition-colors cursor-pointer"
                >
                  Beli Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedProduct, false);
                    setSelectedProduct(null);
                  }}
                  className="px-5 py-3.5 rounded-xl border-2 border-white/75 text-white font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE DEMO MODAL                                           */}
      {/* ========================================================= */}
      {isLiveDemoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsLiveDemoOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[32px] bg-[#1e2918] border-2 border-white/35 p-6 sm:p-8 shadow-2xl text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLiveDemoOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/40 flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-[#4ade80] fill-current" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Planto. Pengalaman Bernapas Lega
            </h3>
            <p className="text-white/75 max-w-lg mx-auto">
              Rasakan udara segar di dalam rumah dengan koleksi tanaman pilihan
              kami.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {catalog.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setIsLiveDemoOpen(false);
                    setSelectedProduct(p);
                  }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/15 hover:border-white/50 cursor-pointer transition-all"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-24 h-24 mx-auto object-contain"
                  />
                  <p className="font-semibold text-white mt-2">{p.name}</p>
                  <p className="text-xs text-[#4ade80]">{p.oxygenBoost}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* UNIFIED LOGIN / REGISTER MODAL (NO ADMIN BUTTON SHOWN)    */}
      {/* ========================================================= */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[36px] bg-[#1e2918] border-2 border-white/30 p-7 sm:p-9 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto">
                <img
                  src={assets.logoPlant}
                  alt="Planto"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {authMode === 'login'
                  ? 'Masuk ke Akun Planto.'
                  : 'Daftar Akun Pelanggan'}
              </h3>
              <p className="text-xs text-white/65">
                {authMode === 'login'
                  ? 'Masukkan email dan kata sandi akun Anda untuk melanjutkan.'
                  : 'Buat akun untuk menyimpan alamat pengiriman & riwayat pesanan tanaman.'}
              </p>
            </div>

            {/* Mode Switch Tabs (Masuk / Daftar Pelanggan) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/25 border border-white/15">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${authMode === 'login'
                  ? 'bg-[#4ade80] text-[#171f12]'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${authMode === 'register'
                  ? 'bg-[#4ade80] text-[#171f12]'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                Daftar Baru
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-white/75 mb-1">
                  Alamat Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/75 mb-1">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/75 mb-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={authForm.phone}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-xs text-white focus:outline-none focus:border-[#4ade80]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/75 mb-1">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={authForm.city}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-xs text-white focus:outline-none focus:border-[#4ade80]"
                    />
                  </div>
                </div>
              )}

              {authError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-400/30 px-3 py-2 rounded-xl">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#4ade80] text-[#171f12] font-bold text-base hover:bg-white transition-colors cursor-pointer shadow-lg"
              >
                {authMode === 'login' ? 'Masuk Sekarang' : 'Buat Akun Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOMER ORDER HISTORY & PROFILE MODAL                    */}
      {/* ========================================================= */}
      {isCustomerOrdersOpen && currentUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsCustomerOrdersOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[36px] bg-[#1e2918] border-2 border-white/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#4ade80]/20 border border-[#4ade80]/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#4ade80]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Halo, {currentUser.name}
                  </h3>
                  <p className="text-xs text-white/60">{currentUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerOrdersOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h4 className="font-semibold text-sm text-[#4ade80] uppercase tracking-wider">
                Riwayat Pesanan Tanaman Saya
              </h4>

              {orders.filter((o) => o.customerEmail === currentUser.email)
                .length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/10 space-y-2">
                  <Package className="w-10 h-10 text-white/30 mx-auto" />
                  <p className="text-sm text-white/70">
                    Anda belum memiliki riwayat pesanan.
                  </p>
                </div>
              ) : (
                orders
                  .filter((o) => o.customerEmail === currentUser.email)
                  .map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-4 rounded-2xl bg-black/25 border border-white/15 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div>
                          <span className="font-mono font-bold text-sm text-[#4ade80]">
                            #{ord.orderId}
                          </span>
                          <span className="text-xs text-white/50 ml-2">
                            {ord.date}
                          </span>
                        </div>
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#4ade80]/20 text-[#4ade80]">
                          {ord.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-white/75">
                        {ord.items.map((it) => (
                          <p key={it.product.id}>
                            • {it.quantity}x {it.product.name} (
                            {formatRupiah(it.product.price * it.quantity)})
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <span className="text-white/60">{ord.courier}</span>
                        <span className="font-bold text-sm text-white">
                          Total: {formatRupiah(ord.grandTotal)}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADMIN ADD / EDIT PRODUCT FORM MODAL                       */}
      {/* ========================================================= */}
      {isProductFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsProductFormOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[36px] bg-[#1e2918] border-2 border-white/30 p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {editingProduct
                  ? `Edit Tanaman: ${editingProduct.name}`
                  : 'Tambah Produk Tanaman Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductFormOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="flex-1 overflow-y-auto space-y-4 py-4 pr-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Nama Tanaman *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Subjudul Singkat *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.subtitle}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Kategori Tanaman *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as PlantProduct['category'],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#222c1d] border border-white/20 text-sm text-white focus:outline-none"
                  >
                    <option value="Tanaman Indoor">Tanaman Indoor</option>
                    <option value="Tanaman Meja">Tanaman Meja</option>
                    <option value="Tanaman O2">Tanaman O2</option>
                    <option value="Sukulen">Sukulen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Harga (Rupiah) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Posisi Tampilan *
                  </label>
                  <select
                    value={productForm.featuredIn}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        featuredIn: e.target.value as NonNullable<
                          PlantProduct['featuredIn']
                        >,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#222c1d] border border-white/20 text-sm text-white focus:outline-none"
                  >
                    <option value="top-selling">
                      Etalase Tanaman Terlaris
                    </option>
                    <option value="trendy-1">Banner Tanaman Populer 1</option>
                    <option value="trendy-2">Banner Tanaman Populer 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/75 mb-1">
                  Deskripsi Kartu (Singkat 8–10 Kata) *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-xs text-white/75 mb-1">
                  Deskripsi Lengkap (Modal Detail) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={productForm.longDescription}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      longDescription: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/20 text-sm text-white focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              {/* Image Picker: Choose from Figma Gallery or Upload Custom Image */}
              <div className="space-y-2">
                <label className="block text-xs text-white/75">
                  Foto Tanaman (Pilih dari Galeri Planto atau Unggah Foto)
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {PLANT_GALLERY_CHOICES.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() =>
                        setProductForm({ ...productForm, image: g.url })
                      }
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${productForm.image === g.url
                        ? 'bg-[#4ade80]/20 border-[#4ade80]'
                        : 'bg-black/20 border-white/15 hover:border-white/40'
                        }`}
                    >
                      <img
                        src={g.url}
                        alt={g.label}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-[10px] text-white/70 mt-0.5">
                        {g.label}
                      </span>
                    </button>
                  ))}

                  <label className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-dashed border-white/30 text-xs text-white/80 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#4ade80]" />
                    <span>Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Kebutuhan Cahaya
                  </label>
                  <input
                    type="text"
                    value={productForm.light}
                    onChange={(e) =>
                      setProductForm({ ...productForm, light: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/25 border border-white/20 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Jadwal Penyiraman
                  </label>
                  <input
                    type="text"
                    value={productForm.water}
                    onChange={(e) =>
                      setProductForm({ ...productForm, water: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/25 border border-white/20 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/75 mb-1">
                    Kadar Oksigen
                  </label>
                  <input
                    type="text"
                    value={productForm.oxygenBoost}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        oxygenBoost: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/25 border border-white/20 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/25 text-sm text-white/80 hover:bg-white/10 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4ade80] text-[#171f12] font-bold text-sm hover:bg-white transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Tanaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
