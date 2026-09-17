import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cartItems,
  $isCartOpen,
  closeCart,
  removeFromCart,
  updateQuantity,
  $cartSubtotal,
  $cartDiscount,
  $cartTotal,
  $appliedCoupon,
  applyCoupon,
  removeCoupon,
  $freeShippingProgress,
  formatCurrency,
  generateWhatsAppLink,
  clearCart,
  $paymentMethod,
  setPaymentMethod,
  $transferDiscount,
  BANK_ALIAS,
  BANK_HOLDER,
  submitOrderToBackend,
} from '../../stores/cartStore';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Tag,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const isOpen = useStore($isCartOpen);
  const items = useStore($cartItems);
  const subtotal = useStore($cartSubtotal);
  const discount = useStore($cartDiscount);
  const total = useStore($cartTotal);
  const coupon = useStore($appliedCoupon);
  const freeShipping = useStore($freeShippingProgress);
  const paymentMethod = useStore($paymentMethod);
  const transferDiscount = useStore($transferDiscount);

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [aliasCopied, setAliasCopied] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode);
    setCouponMessage({ text: result.message, isError: !result.success });
    if (result.success) setCouponCode('');
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(BANK_ALIAS);
    setAliasCopied(true);
    setTimeout(() => setAliasCopied(false), 2000);
  };

  const handleWhatsAppCheckout = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#c5a059', '#e5ca85', '#ffffff', '#10b981'],
      });
    } catch (e) {}

    const link = generateWhatsAppLink(customerName, customerCity);
    submitOrderToBackend(customerName, customerCity);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-surface border-l border-white/10 shadow-2xl flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white tracking-wide">
                Tu Carrito Le Désir
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 sm:px-6 py-3 bg-zinc-950/60 border-b border-white/5 text-xs">
            {freeShipping.isFree ? (
              <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ¡Felicitaciones! Tienes Envío Gratis a todo el país.
              </p>
            ) : (
              <div>
                <p className="text-zinc-300 text-[11px] mb-1.5">
                  Agrega <span className="font-bold text-brand-gold">{formatCurrency(freeShipping.remaining)}</span> más para obtener <span className="text-white font-semibold">Envío Gratis</span>
                </p>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${freeShipping.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-brand-gold">
                  <Sparkles className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">Tu carrito está vacío</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    Explora nuestra selección exclusiva de perfumes árabes, fragancias de diseñador y decants.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-gold text-xs font-semibold border border-brand-gold/20 transition"
                >
                  Explorar Catálogo →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-900 flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-semibold text-white leading-snug">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-brand-gold font-medium">{item.brand}</p>
                      <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5 font-mono">
                        {item.size}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 bg-zinc-900 px-2 py-0.5 rounded-lg border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-zinc-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-white min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-zinc-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-zinc-950/90 border-t border-white/10 space-y-3.5 max-h-[58vh] overflow-y-auto">
              {/* Payment Method Selector (10% OFF Transferencia) */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
                <span className="text-[11px] text-zinc-400 font-semibold block">
                  Elige tu medio de pago:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      paymentMethod === 'transfer'
                        ? 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300 shadow-sm'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Transferencia</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        -10% OFF
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1">Alias Bancario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      paymentMethod === 'card'
                        ? 'border-brand-gold bg-brand-gold/15 text-white shadow-sm'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Tarjeta</span>
                      <CreditCard className="w-3.5 h-3.5 opacity-60" />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1">3 Cuotas sin interés</span>
                  </button>
                </div>

                {/* Alias Box if Transfer is active */}
                {paymentMethod === 'transfer' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Alias para transferir:</span>
                      <span className="font-mono text-xs font-bold text-white">{BANK_ALIAS}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAlias}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      {aliasCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Alias</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      Cupón: <strong>{coupon.code}</strong> (-{coupon.discountPercentage}%)
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-400 hover:text-white text-[11px] underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Cupón (ej. DESIR10)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-gold uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p
                    className={`text-[11px] mt-1 ${
                      couponMessage.isError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Customer quick metadata for WhatsApp */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu Nombre (opcional)"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-white/20"
                />
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Ciudad / Provincia"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200 font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {paymentMethod === 'transfer' && transferDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Descuento Transferencia (-10%)</span>
                    <span>-{formatCurrency(transferDiscount)}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Cupón {coupon.code}</span>
                    <span>-{formatCurrency(Math.round((subtotal * coupon.discountPercentage) / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total a pagar</span>
                  <span className="text-brand-gold text-base">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Primary WhatsApp Checkout Button */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Coordinar Pedido por WhatsApp
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>🛡️ Compra segura y atención directa</span>
                <button
                  onClick={clearCart}
                  className="text-zinc-400 hover:text-zinc-300 underline"
                >
                  Vaciar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
