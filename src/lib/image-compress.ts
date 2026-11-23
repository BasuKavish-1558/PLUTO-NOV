/**
 * Client-side image compression (architecture rule 10): decode, optionally crop
 * to a centred square, scale down, and re-encode as WebP (JPEG where the browser
 * can't encode WebP). Used for profile pictures now and workout photos later.
 */

export type CompressOptions = { maxSize: number; quality?: number; square?: boolean }

export type Box = { sx: number; sy: number; sw: number; sh: number; width: number; height: number }

/** Source crop and output size for an image of width × height. Pure, so it's tested. */
export function computeBox(
  width: number,
  height: number,
  { maxSize, square }: CompressOptions,
): Box {
  const side = Math.min(width, height)
  const sw = square ? side : width
  const sh = square ? side : height
  const sx = square ? Math.round((width - side) / 2) : 0
  const sy = square ? Math.round((height - side) / 2) : 0
  const scale = Math.min(1, maxSize / Math.max(sw, sh))
  return { sx, sy, sw, sh, width: Math.round(sw * scale), height: Math.round(sh * scale) }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function compressImage(file: Blob, options: CompressOptions): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const box = computeBox(bitmap.width, bitmap.height, options)
  const canvas = document.createElement('canvas')
  canvas.width = box.width
  canvas.height = box.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.drawImage(bitmap, box.sx, box.sy, box.sw, box.sh, 0, 0, box.width, box.height)
  bitmap.close()

  const quality = options.quality ?? 0.82
  const webp = await toBlob(canvas, 'image/webp', quality)
  if (webp?.type === 'image/webp') return webp
  const jpeg = await toBlob(canvas, 'image/jpeg', quality)
  if (!jpeg) throw new Error('Could not encode the image')
  return jpeg
}

export const extensionFor = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : 'jpg')
