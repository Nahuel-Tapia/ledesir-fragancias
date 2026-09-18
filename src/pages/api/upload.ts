import type { APIRoute } from 'astro';
import { AuthService } from '../../core/application/services/AuthService';
import { getSupabaseClient } from '../../core/infrastructure/database/supabaseClient';

export const prerender = false;

// Format extensions allowed
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const POST: APIRoute = async ({ request, cookies }) => {
  // 1. Validate Admin Authorization
  const isAuth = await AuthService.isRequestAuthorized(request, cookies);
  if (!isAuth) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No autorizado. Se requiere sesión de administrador para cargar imágenes.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer;
    let fileName = 'image.png';
    let mimeType = 'image/png';
    let fileSize = 0;

    if (contentType.includes('application/json')) {
      // Handled via JSON payload (avoids any browser/proxy form origin restrictions)
      const body = await request.json();
      if (!body.fileData || typeof body.fileData !== 'string') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No se envió ningún dato de imagen en el campo "fileData".',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      fileName = body.fileName || 'image.png';
      mimeType = body.fileType || 'image/png';

      // Remove base64 data URI header if present
      const base64Clean = body.fileData.replace(/^data:image\/[a-z0-9.+_-]+;base64,/, '');
      buffer = Buffer.from(base64Clean, 'base64');
      fileSize = buffer.length;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file || !(file instanceof Blob)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No se envió ningún archivo válido en el campo "file".',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      fileName = file.name || 'image.png';
      mimeType = file.type.toLowerCase() || 'image/png';
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type no admitido. Debe ser application/json o multipart/form-data.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validate MIME Type & Extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'png';
    const isAllowedMime = ALLOWED_MIME_TYPES.has(mimeType);
    const isAllowedExt = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg'].includes(fileExtension);

    if (!isAllowedMime && !isAllowedExt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Formato de imagen no admitido (${mimeType || fileExtension}). Por favor sube archivos PNG, JPG, JPEG, WEBP, AVIF o GIF.`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Validate File Size
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `El archivo supera el tamaño máximo de 10 MB (peso actual: ${(fileSize / (1024 * 1024)).toFixed(1)} MB).`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Sanitize filename & unique prefix
    const cleanBaseName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanBaseName}`;

    // 4. Upload to Supabase Storage if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(uniqueFileName, buffer, {
            contentType: mimeType || 'image/png',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('catalog-images')
            .getPublicUrl(uniqueFileName);

          return new Response(
            JSON.stringify({
              success: true,
              url: publicUrlData.publicUrl,
              fileName: uniqueFileName,
              originalName: fileName,
              mimeType: mimeType || 'image/png',
              size: fileSize,
              storage: 'supabase',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } else if (uploadError) {
          console.warn('[Upload API] Supabase storage upload error:', uploadError.message);
        }
      } catch (storageErr) {
        console.warn('[Upload API] Supabase storage exception:', storageErr);
      }
    }

    // 5. Fallback: Base64 Data URL (ensures zero downtime / works offline & local mock)
    const effectiveMime = mimeType || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: dataUrl,
        fileName: uniqueFileName,
        originalName: fileName,
        mimeType: effectiveMime,
        size: fileSize,
        storage: 'base64_fallback',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[Upload API] Internal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error inesperado al procesar la carga de la imagen.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
