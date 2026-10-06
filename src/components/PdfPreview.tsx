import { useEffect, useRef, useState, useCallback } from 'react'
import type { PreviewSource } from '../lib/previewSource'
import { fetchFileBuffer, type FileItem } from '../lib/api'
import { Icon } from './Icon'
import { fitPdfScale, pdfCanvasLayout } from '../lib/pdfLayout'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import '../styles/pdf-preview.css'

// Point PDF.js to the bundled worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

type Props = {
  source?: PreviewSource
  file: FileItem
  bucket: string
  src: string
  activeColor: string
  onDownload: () => void
}

/** Individual PDF Page Renderer with High-DPI Canvas and Cancellation */
function PdfPageItem({
  pdfDoc,
  pageNum,
  scale,
  isCurrent,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy
  pageNum: number
  scale: number
  isCurrent?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [inView, setInView] = useState(pageNum === 1 || isCurrent)
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 })

  // IntersectionObserver to only render visible or near-visible pages
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const scrollParent = el.closest('.pdf-viewport') || null
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { root: scrollParent, rootMargin: '400px 0px 400px 0px', threshold: 0.01 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [pageNum])

  // Render the page when in view or when scale changes
  useEffect(() => {
    if (!inView) return
    let cancelled = false
    let ownedTask: pdfjsLib.RenderTask | null = null

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNum)
        if (cancelled) return

        const unscaledViewport = page.getViewport({ scale: 1.0 })
        if (unscaledViewport.width > 0 && unscaledViewport.height > 0) {
          setPageSize({ width: unscaledViewport.width, height: unscaledViewport.height })
        }

        const canvas = canvasRef.current
        if (!canvas) return

        // Finish cancellation before resizing a canvas used by the previous task.
        const previous = renderTaskRef.current
        if (previous) { previous.cancel(); await previous.promise.catch(() => {}) }
        if (cancelled) return
        const dpr = window.devicePixelRatio || 1
        const viewport = page.getViewport({ scale })
        // Bound the backing bitmap on mobile, including large pages at high zoom.
        const { outputScale, bitmapWidth, bitmapHeight } = pdfCanvasLayout(viewport.width, viewport.height, dpr)
        canvas.width = bitmapWidth
        canvas.height = bitmapHeight
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        const renderTask = page.render({
          canvas,
          viewport,
          transform: [outputScale, 0, 0, outputScale, 0, 0],
        })
        ownedTask = renderTask
        renderTaskRef.current = renderTask
        await renderTask.promise
        if (!cancelled) { setRenderedScale(scale); setRenderError(null) }
      } catch (err: unknown) {
        // PDF.js throws RenderingCancelledException when a render task is cancelled
        const isCancelled =
          err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException'
        if (!isCancelled && !cancelled) {
          setRenderError('This page could not be rendered. Try Native or download the PDF.')
        }
      }
    }

    void renderPage()

    return () => {
      cancelled = true
      ownedTask?.cancel()
      // Leave the task reference until the next effect can await its cancellation.
    }
  }, [pdfDoc, pageNum, scale, inView])

  return (
    <div
      ref={containerRef}
      className={`pdf-page-card ${isCurrent ? 'pdf-page-card--current' : ''}`}
      id={`pdf-page-${pageNum}`}
      style={{
        width: `${pageSize.width * scale}px`,
        height: `${pageSize.height * scale}px`,
      }}
    >
      <div className="pdf-page-badge" aria-hidden="true">
        Page {pageNum}
      </div>
      <canvas ref={canvasRef} className="pdf-page-canvas" />
      {(renderedScale !== scale || renderError) && (
        <div className="pdf-page-placeholder" aria-hidden={!renderError}>
          {!renderError && <div className="spinner spinner--sm" />}
          <span role={renderError ? 'alert' : undefined}>{renderError || `Rendering page ${pageNum}…`}</span>
        </div>
      )}
    </div>
  )
}

export default function PdfPreview({ source, file, bucket, src, onDownload }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [viewMode, setViewMode] = useState<'scroll' | 'single'>('scroll')
  const [useNative, setUseNative] = useState<boolean>(false)
  const [fitWidth, setFitWidth] = useState(true)

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Load PDF Document
  useEffect(() => {
    let cancelled = false
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | undefined
    const controller = new AbortController()

    async function loadPdf() {
      try {
        const buffer = await (source ? source.buffer(file.key, controller.signal) : fetchFileBuffer(bucket, file.key, controller.signal))
        if (cancelled) return

        loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: `${import.meta.env.BASE_URL}pdfjs-assets/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs-assets/standard_fonts/`,
          wasmUrl: `${import.meta.env.BASE_URL}pdfjs-assets/wasm/`,
        })

        const pdf = await loadingTask.promise
        if (cancelled) return

        setPdfDoc(pdf)
        setNumPages(pdf.numPages)

        // Calculate auto-fit scale based on first page width and window size
        try {
          const firstPage = await pdf.getPage(1)
          const unscaledViewport = firstPage.getViewport({ scale: 1.0 })
          const availableWidth = scrollContainerRef.current?.clientWidth || Math.min(window.innerWidth - 32, 880)
          if (unscaledViewport.width > 0 && availableWidth > 0) {
            setScale(fitPdfScale(unscaledViewport.width, availableWidth))
          }
        } catch {
          // fallback default scale 1.0
        }

        setLoading(false)
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('Failed to load PDF:', err)
          const msg =
            err instanceof Error ? err.message : 'Failed to read PDF document or format is unsupported.'
          setError(msg)
          setLoading(false)
        }
      }
    }

    void loadPdf()

    return () => {
      cancelled = true
      controller.abort()
      void loadingTask?.destroy().catch(() => {})
    }
  }, [file.key, bucket, source])

  // Fit to current container width
  const handleFitWidth = useCallback(() => {
    setFitWidth(true)
    const container = scrollContainerRef.current
    const pdf = pdfDoc
    if (!container || !pdf) return

    pdf.getPage(currentPage).then((page) => {
      const unscaledViewport = page.getViewport({ scale: 1.0 })
      const clientWidth = container.clientWidth
      if (unscaledViewport.width > 0 && clientWidth > 0) {
        setScale(fitPdfScale(unscaledViewport.width, clientWidth))
      }
    }).catch(() => {})
  }, [currentPage, pdfDoc])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !fitWidth || loading || useNative) return
    const observer = new ResizeObserver(handleFitWidth)
    observer.observe(container)
    return () => observer.disconnect()
  }, [fitWidth, loading, useNative, handleFitWidth])

  const handleZoomIn = () => { setFitWidth(false); setScale((s) => Math.min(3.0, parseFloat((s + 0.15).toFixed(2)))) }
  const handleZoomOut = () => { setFitWidth(false); setScale((s) => Math.max(0.1, parseFloat((s - 0.15).toFixed(2)))) }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return
    setCurrentPage(newPage)

    if (viewMode === 'scroll') {
      const pageEl = document.getElementById(`pdf-page-${newPage}`)
      pageEl?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }

  // If user selected browser-native mode on desktop
  if (useNative) {
    return (
      <div className="pdf-preview">
        <div className="pdf-toolbar">
          <span className="pdf-toolbar__title">Browser Native PDF Frame</span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setUseNative(false)}
            title="Switch back to custom canvas reader"
          >
            <Icon name="file" size={13} />
            <span>Switch to Reader</span>
          </button>
        </div>
        <iframe className="preview__frame" src={src} title={file.name} />
      </div>
    )
  }

  return (
    <div className="pdf-preview">
      {/* PDF Viewer Navigation & Zoom Toolbar */}
      <div className="pdf-toolbar">
        <div className="pdf-toolbar__group pdf-toolbar__pagination">
          <button
            type="button"
            className="btn btn--icon btn--sm pdf-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            title="Previous page"
            aria-label="Previous page"
          >
            <Icon name="chevronLeft" size={16} />
          </button>

          <span className="pdf-page-indicator">
            <span className="pdf-page-indicator__current">{currentPage}</span>
            <span className="pdf-page-indicator__sep">/</span>
            <span className="pdf-page-indicator__total">{numPages || '–'}</span>
          </span>

          <button
            type="button"
            className="btn btn--icon btn--sm pdf-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages || loading}
            title="Next page"
            aria-label="Next page"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="pdf-toolbar__group pdf-toolbar__zoom">
          <button
            type="button"
            className="btn btn--icon btn--sm pdf-btn"
            onClick={handleZoomOut}
            disabled={scale <= 0.1 || loading}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Icon name="minus" size={14} />
          </button>

          <span className="pdf-zoom-badge" title="Current zoom level">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            className="btn btn--icon btn--sm pdf-btn"
            onClick={handleZoomIn}
            disabled={scale >= 3.0 || loading}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Icon name="plus" size={14} />
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--sm pdf-btn pdf-btn--fit"
            onClick={handleFitWidth}
            disabled={loading}
            title="Fit to width"
          >
            Fit
          </button>
        </div>

        {/* View mode toggle (Continuous Scroll vs Single Page) */}
        <div className="pdf-toolbar__group pdf-toolbar__modes">
          <div className="pdf-mode-switch" role="group" aria-label="Reading mode">
            <button
              type="button"
              className={`pdf-mode-btn ${viewMode === 'scroll' ? 'pdf-mode-btn--active' : ''}`}
              onClick={() => setViewMode('scroll')}
              title="Continuous vertical scroll"
            >
              Scroll
            </button>
            <button
              type="button"
              className={`pdf-mode-btn ${viewMode === 'single' ? 'pdf-mode-btn--active' : ''}`}
              onClick={() => setViewMode('single')}
              title="Single page view"
            >
              Single
            </button>
          </div>

          {/* Desktop native fallback option */}
          <button
            type="button"
            className="btn btn--ghost btn--sm pdf-btn pdf-btn--native"
            onClick={() => setUseNative(true)}
            title="Open browser native PDF viewer"
          >
            Native
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="pdf-viewport" ref={scrollContainerRef} onScroll={() => {
        if (viewMode !== 'scroll') return
        const container = scrollContainerRef.current
        if (!container) return
        const top = container.getBoundingClientRect().top
        const pages = Array.from(container.querySelectorAll<HTMLElement>('.pdf-page-card'))
        const visible = pages.find(page => page.getBoundingClientRect().bottom > top + 32)
        if (visible) setCurrentPage(Number(visible.id.replace('pdf-page-', '')))
      }}>
        {loading && (
          <div className="pdf-loader-state">
            <div className="spinner" />
            <span className="pdf-loader-text">Loading document pages…</span>
          </div>
        )}

        {error && (
          <div className="preview__empty">
            <div className="preview__empty-icon">
              <Icon name="file" size={42} />
            </div>
            <div className="preview__empty-title">Could not render PDF</div>
            <div className="preview__empty-text">
              {error.includes('Password')
                ? 'This PDF is password-protected. Download it to view with your PDF viewer.'
                : error}
            </div>
            <button className="btn btn--primary" onClick={onDownload}>
              <Icon name="download" size={14} /> Download PDF
            </button>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className={`pdf-pages-stack pdf-pages-stack--${viewMode}`}>
            {viewMode === 'scroll' ? (
              Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <PdfPageItem
                  key={p}
                  pdfDoc={pdfDoc}
                  pageNum={p}
                  scale={scale}
                  isCurrent={p === currentPage}
                />
              ))
            ) : (
              <PdfPageItem
                key={currentPage}
                pdfDoc={pdfDoc}
                pageNum={currentPage}
                scale={scale}
                isCurrent={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
