/** CSS page dimensions and backing bitmap must have the same aspect ratio. */
export function pdfCanvasLayout(width: number, height: number, devicePixelRatio: number) {
  const outputScale = Math.min(devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (width * height)))
  return { width, height, outputScale, bitmapWidth: Math.ceil(width * outputScale), bitmapHeight: Math.ceil(height * outputScale) }
}

export function fitPdfScale(pageWidth: number, containerWidth: number) {
  // Round down so a fitted page never overflows on a narrow screen.
  return Math.min(2.5, Math.max(0.1, Math.floor((containerWidth - 40) / pageWidth * 100) / 100))
}
