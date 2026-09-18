import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Sparkles,
  Link2,
  Maximize2,
  Layers,
} from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  imageFit?: 'cover' | 'contain';
  onImageFitChange?: (fit: 'cover' | 'contain') => void;
  label?: string;
  aspectRatio?: 'product' | 'banner';
  showWatermarkPreview?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  imageFit = 'cover',
  onImageFitChange,
  label = 'Imagen del Producto',
  aspectRatio = 'product',
  showWatermarkPreview = true,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    sizeFormatted: string;
    format: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processAndUploadFile = async (file: File) => {
    setErrorMessage(null);

    // Validate size (10 MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(`El archivo es demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). Límite: 10 MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const isPng = file.type === 'image/png' || ext === 'png';

    // Auto-detect PNG and suggest 'contain' fit for clean perfume bottle presentation
    if (isPng && onImageFitChange) {
      onImageFitChange('contain');
    }

    setFileMeta({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      format: ext.toUpperCase(),
    });

    try {
      setIsUploading(true);

      // Read file as Base64 Data URL to send via JSON (100% immune to form CSRF origin blocks)
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64DataUrl,
          fileName: file.name,
          fileType: file.type || (isPng ? 'image/png' : 'image/jpeg'),
          fileSize: file.size,
        }),
        credentials: 'include',
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || `Error en el servidor (${response.status})`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al subir la imagen a Supabase.');
      }

      onChange(data.url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Error de conexión al cargar la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-zinc-300 font-semibold text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-brand-gold" />
          <span>{label}</span>
          <span className="text-brand-gold text-[10px] font-normal">(PNG, JPG, WebP, AVIF)</span>
        </label>

        <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-white/10 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === 'upload'
                ? 'bg-brand-gold text-brand-dark font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-brand-gold text-brand-dark font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3 h-3" />
            Enlace URL
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <p className="font-semibold">No se pudo cargar la imagen</p>
            <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODE 1: FILE UPLOAD ZONE */}
      {mode === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif, image/svg+xml"
            className="hidden"
          />

          {!value ? (
            /* Empty State: Drag & Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-brand-gold bg-brand-gold/10 scale-[1.01]'
                  : 'border-white/15 bg-zinc-900/60 hover:border-brand-gold/50 hover:bg-zinc-900/90'
              }`}
            >
              {isUploading ? (
                <div className="py-4 flex flex-col items-center gap-2 text-zinc-300">
                  <RefreshCw className="w-8 h-8 text-brand-gold animate-spin" />
                  <span className="text-xs font-semibold">Subiendo imagen a Supabase Storage...</span>
                  <span className="text-[10px] text-zinc-500">Procesando y generando URL de alta velocidad</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Arrastra y suelta tu imagen aquí, o{' '}
                      <span className="text-brand-gold underline underline-offset-2">explora archivos</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Soporta <strong className="text-zinc-200">PNG</strong> (con o sin fondo transparente),{' '}
                      <strong className="text-zinc-200">JPG, WebP, AVIF, GIF</strong> (hasta 10 MB)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.PNG</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.JPG</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.WEBP</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.AVIF</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Active Image Preview & Action Controls */
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">Imagen cargada con éxito</span>
                  {fileMeta && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono text-[10px]">
                      {fileMeta.format} • {fileMeta.sizeFormatted}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition"
                    title="Subir otra imagen"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-brand-gold" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setFileMeta(null);
                    }}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview Box with Studio Lighting Gradient & Watermark Seal */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 flex items-center justify-center p-2">
                <div
                  className={`w-full ${
                    aspectRatio === 'banner' ? 'aspect-[21/9] sm:aspect-[16/7]' : 'aspect-[4/5] max-h-72'
                  } relative flex items-center justify-center overflow-hidden`}
                >
                  <img
                    src={value}
                    alt="Previsualización de imagen"
                    className={`w-full h-full ${
                      imageFit === 'contain' ? 'object-contain p-4' : 'object-cover'
                    } transition-all duration-300 relative z-0`}
                  />

                  {/* Studio Spotlight & Radial Lighting Gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(255,255,255,0.08)_0%,_rgba(35,35,42,0.25)_45%,_rgba(15,15,18,0.8)_100%)] pointer-events-none z-[1]" />

                  {/* Ambient Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/30 pointer-events-none z-[2]" />

                  {/* Watermark Seal Preview */}
                  {showWatermarkPreview && (
                    <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none select-none">
                      <svg
                        className="w-3 h-3 text-brand-gold flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="9" y="2" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.25" />
                        <path d="M10 6h4v2h-4z" fill="currentColor" fillOpacity="0.5" />
                        <path d="M6 9h12l-1.5 12h-9L6 9z" stroke="currentColor" />
                        <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
                      </svg>
                      <span className="text-[9px] font-editorial uppercase tracking-[0.2em] text-zinc-200 font-semibold leading-none">
                        Le Désir
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DIRECT URL INPUT */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... o enlace directo a .png"
              value={value}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val);
                if (val.toLowerCase().endsWith('.png') && onImageFitChange) {
                  onImageFitChange('contain');
                }
              }}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-gold pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            Puedes pegar cualquier URL externa de alta resolución o enlace directo a un archivo PNG.
          </p>
        </div>
      )}

      {/* IMAGE FIT SELECTOR (CONTAIN VS COVER) */}
      {onImageFitChange && value && (
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-brand-gold" />
            <span>Ajuste en Catálogo:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onImageFitChange('contain')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                imageFit === 'contain'
                  ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold shadow-sm'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Frasco Completo / PNG (Contain)</span>
            </button>

            <button
              type="button"
              onClick={() => onImageFitChange('cover')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                imageFit === 'cover'
                  ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold shadow-sm'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Foto Completa (Cover)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
