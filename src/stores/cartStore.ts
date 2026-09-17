import { atom, computed } from 'nanostores';
import type { CartItem, Coupon } from '../types/fragrance';
import { INITIAL_COUPONS } from '../data/initialBanners';

// Local storage key
const STORAGE_KEY = 'ledesir_cart_v1';
const FREE_SHIPPING_THRESHOLD = 50000;
export const WHATSAPP_PHONE = '5492645162780';
export const BANK_ALIAS = 'ledesir.fragancias';
export const BANK_HOLDER = 'Le Désir Fragancias';
export const TRANSFER_DISCOUNT_PERCENT = 10;

// Initial state from localStorage if client-side
const getInitialItems = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading cart', e);
      }
    }
  }
  return [];
};

// Atoms
export const $cartItems = atom<CartItem[]>(getInitialItems());
export const $isCartOpen = atom<boolean>(false);
export const $appliedCoupon = atom<Coupon | null>(null);
export const $paymentMethod = atom<'transfer' | 'card'>('transfer');

// Persist cart to localStorage on changes
if (typeof window !== 'undefined') {
  $cartItems.subscribe((items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  });
}

// Actions
export const openCart = () => $isCartOpen.set(true);
export const closeCart = () => $isCartOpen.set(false);
export const toggleCart = () => $isCartOpen.set(!$isCartOpen.get());
export const setPaymentMethod = (method: 'transfer' | 'card') => $paymentMethod.set(method);

export const addToCart = (
  fragrance: { id: string; name: string; brand: string; image: string },
  size: '5ml' | '10ml' | '100ml' | 'unidad',
  price: number,
  quantity = 1
) => {
  const currentItems = $cartItems.get();
  const itemId = `${fragrance.id}-${size}`;
  const existingIndex = currentItems.findIndex((item) => item.id === itemId);

  if (existingIndex > -1) {
    const updated = [...currentItems];
    updated[existingIndex].quantity += quantity;
    $cartItems.set(updated);
  } else {
    $cartItems.set([
      ...currentItems,
      {
        id: itemId,
        fragranceId: fragrance.id,
        name: fragrance.name,
        brand: fragrance.brand,
        image: fragrance.image,
        size,
        price,
        quantity,
      },
    ]);
  }
  openCart();
};

export const removeFromCart = (itemId: string) => {
  $cartItems.set($cartItems.get().filter((item) => item.id !== itemId));
};

export const updateQuantity = (itemId: string, newQty: number) => {
  if (newQty <= 0) {
    removeFromCart(itemId);
    return;
  }
  $cartItems.set(
    $cartItems.get().map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
  );
};

export const applyCoupon = (code: string): { success: boolean; message: string } => {
  const cleanCode = code.trim().toUpperCase();
  const coupon = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { success: false, message: 'Cupón no válido o expirado' };
  }

  const subtotal = $cartSubtotal.get();
  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return {
      success: false,
      message: `El cupón requiere una compra mínima de $${coupon.minAmount.toLocaleString('es-AR')}`,
    };
  }

  $appliedCoupon.set(coupon);
  return { success: true, message: `¡Cupón ${coupon.code} aplicado con éxito (-${coupon.discountPercentage}%)!` };
};

export const removeCoupon = () => {
  $appliedCoupon.set(null);
};

export const clearCart = () => {
  $cartItems.set([]);
  $appliedCoupon.set(null);
};

// Computed stores
export const $cartCount = computed($cartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const $cartSubtotal = computed($cartItems, (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const $couponDiscount = computed([$cartSubtotal, $appliedCoupon], (subtotal, coupon) => {
  if (!coupon) return 0;
  return Math.round((subtotal * coupon.discountPercentage) / 100);
});

export const $transferDiscount = computed([$cartSubtotal, $paymentMethod], (subtotal, method) => {
  if (method === 'transfer') {
    return Math.round((subtotal * TRANSFER_DISCOUNT_PERCENT) / 100);
  }
  return 0;
});

export const $cartDiscount = computed(
  [$couponDiscount, $transferDiscount],
  (couponDisc, transferDisc) => couponDisc + transferDisc
);

export const $cartTotal = computed([$cartSubtotal, $cartDiscount], (subtotal, discount) => {
  return Math.max(0, subtotal - discount);
});

export const $freeShippingProgress = computed($cartTotal, (total) => {
  const progress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  return { progress, remaining, isFree: total >= FREE_SHIPPING_THRESHOLD };
});

// Format Argentine currency
export const formatCurrency = (val: number): string => {
  return `$${val.toLocaleString('es-AR')}`;
};

// Generate WhatsApp checkout message
export const generateWhatsAppLink = (customerName = '', customerCity = ''): string => {
  const items = $cartItems.get();
  const subtotal = $cartSubtotal.get();
  const total = $cartTotal.get();
  const coupon = $appliedCoupon.get();
  const couponDisc = $couponDiscount.get();
  const method = $paymentMethod.get();
  const transferDisc = $transferDiscount.get();

  if (items.length === 0) return `https://wa.me/${WHATSAPP_PHONE}`;

  let text = `✨ *¡Hola Le Désir Fragancias!* Quiero coordinar el siguiente pedido desde la tienda:\n\n`;

  items.forEach((item) => {
    text += `🔹 *${item.name}* (${item.brand})\n`;
    text += `   • Medida: ${item.size}\n`;
    text += `   • Cantidad: ${item.quantity}x\n`;
    text += `   • Subtotal: ${formatCurrency(item.price * item.quantity)}\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💵 *Subtotal:* ${formatCurrency(subtotal)}\n`;
  if (coupon && couponDisc > 0) {
    text += `🏷️ *Cupón (${coupon.code}):* -${formatCurrency(couponDisc)}\n`;
  }
  if (method === 'transfer' && transferDisc > 0) {
    text += `💳 *Descuento Transferencia (-10%):* -${formatCurrency(transferDisc)}\n`;
  }
  text += `✨ *TOTAL A PAGAR:* ${formatCurrency(total)}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (method === 'transfer') {
    text += `🏦 *Medio de Pago:* Transferencia Bancaria (Alias: ${BANK_ALIAS})\n`;
    text += `📄 *Comprobante:* Te lo adjunto a continuación de este mensaje.\n\n`;
  } else {
    text += `💳 *Medio de Pago:* Tarjeta / Cuotas\n\n`;
  }

  if (customerName.trim()) {
    text += `👤 *Cliente:* ${customerName.trim()}\n`;
  }
  if (customerCity.trim()) {
    text += `📍 *Ciudad / Localidad:* ${customerCity.trim()}\n`;
  }

  text += `\n¿Tienen stock disponible para despachar? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
};

// Asynchronously record customer order via Clean Architecture backend / Supabase
export const submitOrderToBackend = async (customerName = '', customerCity = '') => {
  const items = $cartItems.get();
  if (items.length === 0) return null;

  const payload = {
    customerName: customerName.trim() || 'Cliente Anónimo',
    customerCity: customerCity.trim() || '',
    paymentMethod: $paymentMethod.get(),
    subtotal: $cartSubtotal.get(),
    discount: $cartDiscount.get(),
    total: $cartTotal.get(),
    couponCode: $appliedCoupon.get()?.code,
    items: items,
    status: 'pending_whatsapp',
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend order recording in offline/mock mode', err);
  }
  return null;
};
