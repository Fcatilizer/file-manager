import test from 'node:test'
import assert from 'node:assert/strict'
import { fitPdfScale, pdfCanvasLayout } from '../src/lib/pdfLayout.ts'

test('fit keeps portrait and landscape PDF pages inside mobile and desktop viewports', () => {
  for (const width of [595, 842, 2000]) {
    for (const container of [288, 350, 768, 1400]) {
      const scale = fitPdfScale(width, container)
      assert.ok(width * scale <= container - 40)
      assert.ok(scale > 0)
    }
  }
})

test('high DPI uses backing pixels without changing CSS page dimensions', () => {
  const layout = pdfCanvasLayout(595, 842, 3)
  assert.deepEqual(layout, { width: 595, height: 842, outputScale: 2, bitmapWidth: 1190, bitmapHeight: 1684 })
})

test('large zoomed pages bound bitmap memory while retaining their aspect ratio', () => {
  const layout = pdfCanvasLayout(2400, 3600, 3)
  assert.ok(layout.bitmapWidth * layout.bitmapHeight < 8_010_000)
  assert.ok(Math.abs(layout.bitmapWidth / layout.bitmapHeight - 2 / 3) < 0.001)
  assert.equal(layout.width, 2400)
  assert.equal(layout.height, 3600)
})
