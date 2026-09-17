import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '../layout/Logo';

interface AdminLoginFormProps {
  onLoginSuccess?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tanto tu correo como tu contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Credenciales incorrectas. Intenta nuevamente.');
        setIsLoading(false);
        return;
      }

      // Store auth state locally if needed
      if (typeof window !== 'undefined') {
        localStorage.setItem('ledesir_admin_logged', 'true');
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Hard refresh to trigger server-side authenticated state
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo showTagline={false} className="mb-3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-xs font-semibold uppercase tracking-wider mt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Acceso Privado de Gestión</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-wide mt-3">
            Panel de Administración
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-sm">
            Ingresa tus credenciales autorizadas para gestionar el catálogo de fragancias, pedidos y banners de la tienda.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-surface/90 border border-brand-gold/30 shadow-2xl backdrop-blur-xl relative">
          {/* Subtle gold glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">
                <strong>Error de autenticación:</strong> {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ledesir.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/70 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Contraseña de Administrador
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-brand-dark/70 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Note */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sesión Segura Criptográfica
            </span>
            <span className="text-zinc-500 font-mono text-[10px]">HMAC-SHA256</span>
          </div>
        </div>

        {/* Informative Vercel / Supabase Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-[11px] text-zinc-400 leading-relaxed">
          <p>
            🔐 Las credenciales maestras pueden personalizarse en cualquier momento desde las variables de entorno de tu proyecto en{' '}
            <span className="text-white font-medium">Vercel</span> (<code className="text-brand-gold-light font-mono">ADMIN_EMAIL</code> y <code className="text-brand-gold-light font-mono">ADMIN_PASSWORD</code>) o vía <span className="text-white font-medium">Supabase Auth</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
