import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  $catalog,
  addFragrance,
  updateFragrance,
  deleteFragrance,
  resetToDefaults,
  $banners,
  addBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  syncCatalogWithBackend,
  $isSyncing,
} from '../../stores/catalogStore';
import type { Fragrance, BannerSlide } from '../../types/fragrance';
import { ImageUploader } from './ImageUploader';
import { BrandSelector } from './BrandSelector';
import {
  Package,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface BackendInfo {
  status: string;
  persistence: string;
  databaseConfigured: boolean;
  adapter: string;
}

interface AdminDashboardProps {
  userEmail?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userEmail }) => {
  const catalog = useStore($catalog);
  const banners = useStore($banners);
  const isSyncing = useStore($isSyncing);

  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'orders' | 'backup'>('products');
  const [editingFragrance, setEditingFragrance] = useState<Fragrance | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);

  // Backend Info & Orders
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Form states for Product
  const [productForm, setProductForm] = useState<Partial<Fragrance>>({
    name: '',
    brand: '',
    subtitle: '',
    category: 'arabe',
    families: ['Oriental / Especiado'],
    description: '',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    prices: [
      { size: '5ml', label: 'Decant 5ml', price: 7500, inStock: true },
      { size: '10ml', label: 'Decant 10ml', price: 13500, inStock: true },
      { size: '100ml', label: '100ml Sellado', price: 68000, inStock: true },
    ],
    pyramid: {
      top: ['Canela', 'Bergamota'],
      heart: ['Dátiles', 'Praliné'],
      base: ['Vainilla', 'Ámbar'],
    },
    longevity: 'Modo Bestia (+12h)',
    sillage: 'Pesada / Enorme',
    gender: 'Unisex',
    occasion: 'Noche / Cita Romántica',
    season: 'Otoño / Invierno',
    stock: 15,
    isBestSeller: false,
    isFeatured: true,
    imageFit: 'cover',
    fragranticaUrl: '',
  });

  // Form states for Banner
  const [bannerForm, setBannerForm] = useState<Partial<BannerSlide>>({
    title: '',
    titleAccent: '',
    subtitle: '',
    badge: '✨ Nueva Colección',
    ctaText: 'Ver Colección',
    ctaLink: '/catalogo',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
  });

  useEffect(() => {
    // Fetch backend architecture status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.environment) {
          setBackendInfo({
            status: data.status,
            persistence: data.environment.persistence,
            databaseConfigured: data.environment.databaseConfigured,
            adapter: data.environment.adapter,
          });
        }
      })
      .catch(() => {});

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch (e) {
      console.warn('Orders offline/mock', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Error during logout', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ledesir_admin_logged');
      window.location.reload();
    }
  };

  const handleEditProduct = (fragrance: Fragrance) => {
    setEditingFragrance(fragrance);
    setProductForm(JSON.parse(JSON.stringify(fragrance)));
    setIsCreatingProduct(true);
  };

  const handleNewProduct = () => {
    setEditingFragrance(null);
    setProductForm({
      name: '',
      brand: '',
      subtitle: '',
      category: 'arabe',
      families: ['Oriental / Especiado'],
      description: '',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      prices: [
        { size: '5ml', label: 'Decant 5ml', price: 7500, inStock: true },
        { size: '10ml', label: 'Decant 10ml', price: 13500, inStock: true },
        { size: '100ml', label: '100ml Sellado', price: 68000, inStock: true },
      ],
      pyramid: {
        top: ['Canela', 'Bergamota'],
        heart: ['Dátiles', 'Praliné'],
        base: ['Vainilla', 'Ámbar'],
      },
      longevity: 'Modo Bestia (+12h)',
      sillage: 'Pesada / Enorme',
      gender: 'Unisex',
      occasion: 'Noche / Cita Romántica',
      season: 'Otoño / Invierno',
      stock: 15,
      isBestSeller: false,
      isFeatured: true,
      imageFit: 'cover',
      fragranticaUrl: '',
    });
    setIsCreatingProduct(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand) {
      alert('Por favor completa el nombre y la marca de la fragancia.');
      return;
    }

    if (editingFragrance) {
      await updateFragrance(editingFragrance.id, productForm);
    } else {
      const newId =
        (productForm.name?.toLowerCase().replace(/\s+/g, '-') || 'frag') +
        '-' +
        Date.now().toString().slice(-4);
      await addFragrance({
        ...(productForm as Fragrance),
        id: newId,
      });
    }

    setIsCreatingProduct(false);
    setEditingFragrance(null);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title) {
      alert('Ingresa al menos el título principal del banner.');
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner.id, bannerForm);
    } else {
      const newId = 'slide-' + Date.now().toString().slice(-4);
      await addBanner({
        ...(bannerForm as BannerSlide),
        id: newId,
      });
    }

    setIsCreatingBanner(false);
    setEditingBanner(null);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ledesir_catalogo_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-surface border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-gold font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Panel de Administración • Clean Architecture</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-white tracking-wide mt-1">
            Gestor de Boutique Le Désir
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión desacoplada con soporte de PostgreSQL (Supabase) y Vercel Serverless.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Architecture & DB Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <Database className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-zinc-300">
              {backendInfo?.databaseConfigured ? (
                <span className="text-emerald-400 font-medium">Supabase Conectado</span>
              ) : (
                <span className="text-amber-400 font-medium">Modo Resiliente (Mock)</span>
              )}
            </span>
          </div>

          <button
            onClick={() => syncCatalogWithBackend()}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition"
            title="Sincronizar catálogo con el backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-gold' : ''}`} />
            Sincronizar
          </button>

          <a
            href="/"
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 border border-white/10 transition"
          >
            ← Volver a la Tienda
          </a>

          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Demo
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-brand-surface/60 border border-white/5">
          <span className="text-[11px] text-zinc-400 font-medium">Total Productos</span>
          <p className="text-2xl font-bold text-white mt-1">{catalog.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-brand-surface/60 border border-white/5">
          <span className="text-[11px] text-amber-400 font-medium">Colección Árabe</span>
          <p className="text-2xl font-bold text-white mt-1">
            {catalog.filter((c) => c.category === 'arabe').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-brand-surface/60 border border-white/5">
          <span className="text-[11px] text-blue-400 font-medium">Diseñador & Nicho</span>
          <p className="text-2xl font-bold text-white mt-1">
            {catalog.filter((c) => c.category === 'disenador' || c.category === 'nicho').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-brand-surface/60 border border-white/5">
          <span className="text-[11px] text-emerald-400 font-medium">Pedidos Registrados</span>
          <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          Productos & Decants ({catalog.length})
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 px-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'banners'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Carrusel de Inicio ({banners.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            loadOrders();
          }}
          className={`pb-3 px-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Pedidos Registrados ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Respaldo & Exportación JSON
        </button>
      </div>

      {/* TAB 1: PRODUCTS LIST */}
      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Catálogo de Fragancias</h2>
            <button
              onClick={handleNewProduct}
              className="px-4 py-2 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-gold-light transition shadow-lg shadow-brand-gold/20"
            >
              <Plus className="w-4 h-4" />
              Nueva Fragancia
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((fragrance) => (
              <div
                key={fragrance.id}
                className="p-5 rounded-2xl bg-brand-surface border border-white/10 flex flex-col justify-between hover:border-white/20 transition group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={fragrance.image}
                      alt={fragrance.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-zinc-900"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase font-semibold text-brand-gold tracking-wider">
                        {fragrance.brand}
                      </span>
                      <h3 className="font-bold text-white text-base truncate">{fragrance.name}</h3>
                      <span className="text-xs text-zinc-400 block truncate">
                        {fragrance.subtitle || fragrance.families.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs py-2 border-y border-white/5">
                    <div className="flex justify-between text-zinc-400">
                      <span>Categoría:</span>
                      <span className="text-zinc-200 capitalize">{fragrance.category}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Stock disponible:</span>
                      <span className="text-emerald-400 font-semibold">{fragrance.stock} un.</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Precio regular (100ml):</span>
                      <span className="text-brand-gold font-bold">
                        ${fragrance.prices.find((p) => p.size === '100ml')?.price.toLocaleString('es-AR') ||
                          fragrance.prices[0]?.price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditProduct(fragrance)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar "${fragrance.name}"?`)) {
                        deleteFragrance(fragrance.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BANNERS LIST */}
      {activeTab === 'banners' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Carrusel de Inicio (Hero)</h2>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerForm({
                  title: '',
                  titleAccent: '',
                  subtitle: '',
                  badge: '✨ Nueva Colección',
                  ctaText: 'Ver Colección',
                  ctaLink: '/catalogo',
                  imageUrl:
                    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80',
                  isActive: true,
                });
                setIsCreatingBanner(true);
              }}
              className="px-4 py-2 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-gold-light transition shadow-lg shadow-brand-gold/20"
            >
              <Plus className="w-4 h-4" />
              Nuevo Slide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`p-5 rounded-2xl bg-brand-surface border transition flex flex-col justify-between ${
                  banner.isActive ? 'border-white/10' : 'border-white/5 opacity-50'
                }`}
              >
                <div>
                  <div className="relative h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-brand-gold border border-brand-gold/30">
                      {banner.badge || 'Slide Promocional'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base truncate">{banner.title}</h3>
                  <span className="text-xs text-brand-gold block font-serif truncate">
                    {banner.titleAccent}
                  </span>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{banner.subtitle}</p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                  <button
                    onClick={() => toggleBannerActive(banner.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                      banner.isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {banner.isActive ? 'Activo' : 'Oculto'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBanner(banner);
                        setBannerForm(JSON.parse(JSON.stringify(banner)));
                        setIsCreatingBanner(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar slide "${banner.title}"?`)) {
                          deleteBanner(banner.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Pedidos Registrados</h2>
              <p className="text-xs text-zinc-400">
                Órdenes iniciadas vía WhatsApp y registradas en el backend / Supabase.
              </p>
            </div>
            <button
              onClick={loadOrders}
              disabled={isLoadingOrders}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin text-brand-gold' : ''}`} />
              Actualizar
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl bg-brand-surface border border-white/10 p-12 text-center max-w-lg mx-auto space-y-4">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No hay pedidos registrados aún</h3>
              <p className="text-xs text-zinc-400">
                Cuando un cliente agregue productos al carrito y finalice vía WhatsApp, la orden se registrará automáticamente aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div
                  key={order.id || idx}
                  className="p-5 rounded-2xl bg-brand-surface border border-white/10 hover:border-white/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-xs font-bold font-mono">
                        {order.orderNumber || 'LD-PEDIDO'}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {order.customerName || 'Cliente Anónimo'}
                      </span>
                      {order.customerCity && (
                        <span className="text-[11px] text-zinc-400">({order.customerCity})</span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400">
                      {order.items && Array.isArray(order.items) ? (
                        <span>
                          {order.items.map((it: any) => `${it.quantity}x ${it.name} (${it.size})`).join(' • ')}
                        </span>
                      ) : (
                        <span>1 producto</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block uppercase font-medium">
                        {order.paymentMethod === 'transfer' ? 'Transferencia (-10%)' : 'Tarjeta / Cuotas'}
                      </span>
                      <span className="text-base font-bold text-brand-gold">
                        ${Number(order.total).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {order.status === 'pending_whatsapp' ? 'WhatsApp' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BACKUP / EXPORT */}
      {activeTab === 'backup' && (
        <div className="rounded-3xl bg-brand-surface border border-white/10 p-8 max-w-xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold mx-auto flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Exportar Catálogo en Formato JSON</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Descarga un archivo con todas las fragancias, precios, pirámides olfativas y configuración para resguardo o para sincronizar con PostgreSQL.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="px-6 py-3 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition shadow-lg shadow-brand-gold/20"
          >
            Descargar Archivo JSON ({catalog.length} productos)
          </button>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isCreatingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-brand-surface border border-white/15 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingFragrance ? 'Editar Fragancia' : 'Nueva Fragancia'}
              </h3>
              <button
                onClick={() => setIsCreatingProduct(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Nombre del Perfume *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <BrandSelector
                  value={productForm.brand || ''}
                  onChange={(brand) => setProductForm({ ...productForm, brand })}
                  catalogBrands={catalog.map((c) => c.brand)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={productForm.category || 'arabe'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="arabe">Perfumería Árabe</option>
                    <option value="disenador">Diseñador de Lujo</option>
                    <option value="nicho">Nicho Exclusivo</option>
                    <option value="extra">Accesorios / Extras</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Stock (Unidades)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock || 0}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Género</label>
                  <select
                    value={productForm.gender || 'Unisex'}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>

              {/* Ocasión de Uso y Estación del Año */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Ocasión de Uso Recomendada</label>
                  <select
                    value={productForm.occasion || 'Noche / Cita Romántica'}
                    onChange={(e) => setProductForm({ ...productForm, occasion: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="Noche / Cita Romántica">🌙 Noche / Cita Romántica</option>
                    <option value="Fiesta / Salidas Nocturnas">🎉 Fiesta / Salidas Nocturnas</option>
                    <option value="Uso Diario / Oficina">💼 Uso Diario / Oficina</option>
                    <option value="Eventos Elegantes / Gala">✨ Eventos Elegantes / Gala</option>
                    <option value="Casual / Todo Momento">👕 Casual / Todo Momento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Estación del Año Ideal</label>
                  <select
                    value={productForm.season || 'Otoño / Invierno'}
                    onChange={(e) => setProductForm({ ...productForm, season: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="Otoño / Invierno">❄️ Otoño / Invierno (Climas Fríos)</option>
                    <option value="Primavera / Verano">☀️ Primavera / Verano (Climas Cálidos)</option>
                    <option value="Todo el Año (Versátil)">🌤️ Todo el Año (Versátil)</option>
                    <option value="Invierno">⛄ Solo Invierno</option>
                    <option value="Verano">🌴 Solo Verano</option>
                  </select>
                </div>
              </div>

              {/* Longevidad y Estela (Rendimiento) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Longevidad en Piel (Duración)</label>
                  <select
                    value={productForm.longevity || 'Modo Bestia (+12h)'}
                    onChange={(e) => setProductForm({ ...productForm, longevity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="Modo Bestia (+12h)">🔥 Modo Bestia (+12h)</option>
                    <option value="Larga Duración (8-12h)">⏱️ Larga Duración (8-12h)</option>
                    <option value="Moderada (6-8h)">⌛ Moderada (6-8h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Estela & Proyección</label>
                  <select
                    value={productForm.sillage || 'Pesada / Enorme'}
                    onChange={(e) => setProductForm({ ...productForm, sillage: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="Pesada / Enorme">💨 Pesada / Enorme (Llena habitación)</option>
                    <option value="Moderada">🌬️ Moderada (A un brazo de distancia)</option>
                    <option value="Íntima">🫧 Íntima (A flor de piel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Inspiración Olfativa / Dupe de:</label>
                <input
                  type="text"
                  placeholder="Ej: Vibra Angels' Share de Kilian"
                  value={productForm.inspiredBy || ''}
                  onChange={(e) => setProductForm({ ...productForm, inspiredBy: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-medium text-xs flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Enlace a Fragrantica (Ficha Técnica & Reseñas)</span>
                  </label>
                  {productForm.fragranticaUrl && (
                    <a
                      href={productForm.fragranticaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-gold hover:underline flex items-center gap-1"
                    >
                      Probar enlace ↗
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://www.fragrantica.es/perfume/... o https://www.fragrantica.com/perfume/..."
                  value={productForm.fragranticaUrl || ''}
                  onChange={(e) => setProductForm({ ...productForm, fragranticaUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-gold placeholder-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Permite a los clientes ver las notas detalladas, acordes y votos de la comunidad en Fragrantica desde el catálogo.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Descripción de la Fragancia</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <ImageUploader
                value={productForm.image || ''}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
                imageFit={productForm.imageFit || 'cover'}
                onImageFitChange={(fit) => setProductForm({ ...productForm, imageFit: fit })}
                label="Imagen del Perfume (Catálogo)"
                aspectRatio="product"
                showWatermarkPreview={true}
              />

              {/* Precios y Medidas */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
                <span className="font-bold text-brand-gold block">
                  Precios por Tamaño (Decants & Frasco Sellado)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Decant 5ml ($ ARS)</label>
                    <input
                      type="number"
                      value={productForm.prices?.find((p) => p.size === '5ml')?.price || 7500}
                      onChange={(e) => {
                        const newPrices = (productForm.prices || []).map((p) =>
                          p.size === '5ml' ? { ...p, price: Number(e.target.value) } : p
                        );
                        setProductForm({ ...productForm, prices: newPrices });
                      }}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Decant 10ml ($ ARS)</label>
                    <input
                      type="number"
                      value={productForm.prices?.find((p) => p.size === '10ml')?.price || 13500}
                      onChange={(e) => {
                        const newPrices = (productForm.prices || []).map((p) =>
                          p.size === '10ml' ? { ...p, price: Number(e.target.value) } : p
                        );
                        setProductForm({ ...productForm, prices: newPrices });
                      }}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Frasco Sellado 100ml ($ ARS)</label>
                    <input
                      type="number"
                      value={productForm.prices?.find((p) => p.size === '100ml')?.price || 68000}
                      onChange={(e) => {
                        const newPrices = (productForm.prices || []).map((p) =>
                          p.size === '100ml' ? { ...p, price: Number(e.target.value) } : p
                        );
                        setProductForm({ ...productForm, prices: newPrices });
                      }}
                      className="w-full p-2 rounded-lg bg-zinc-900 border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller || false}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded border-zinc-700 text-brand-gold focus:ring-0"
                  />
                  <span>Marcar como Best Seller 🔥</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured || false}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded border-zinc-700 text-brand-gold focus:ring-0"
                  />
                  <span>Destacar en Inicio</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingProduct(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-gold text-brand-dark font-bold hover:bg-brand-gold-light transition"
                >
                  Guardar Fragancia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BANNER MODAL */}
      {isCreatingBanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-brand-surface border border-white/15 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingBanner ? 'Editar Slide de Inicio' : 'Nuevo Slide de Inicio'}
              </h3>
              <button
                onClick={() => setIsCreatingBanner(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Subtítulo Destacado (Cursiva dorada)</label>
                <input
                  type="text"
                  value={bannerForm.titleAccent || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, titleAccent: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Badge Superior</label>
                <input
                  type="text"
                  value={bannerForm.badge || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Descripción / Bajada</label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Texto del Botón</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Enlace del Botón</label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <ImageUploader
                value={bannerForm.imageUrl || ''}
                onChange={(url) => setBannerForm({ ...bannerForm, imageUrl: url })}
                label="Imagen de Fondo del Slide (Hero)"
                aspectRatio="banner"
                showWatermarkPreview={false}
              />

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingBanner(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-gold text-brand-dark font-bold hover:bg-brand-gold-light transition"
                >
                  Guardar Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
