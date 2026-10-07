import { Icon } from './Icon'
import '../styles/modal-controls.css'
import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  ariaLabel?: string
  onClose: () => void
  children: ReactNode
  /** Extra classes applied to the card (e.g. size/variant). */
  className?: string
  /** Extra classes applied to the overlay (e.g. fullscreen on mobile). */
  overlayClassName?: string
  /** Content rendered inside the overlay but outside the card (e.g. nav arrows). */
  overlayChildren?: ReactNode
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  /** Called for every keydown; Escape close is handled automatically. */
  onKeyDown?: (e: KeyboardEvent) => void
}

/**
 * Generic modal shell: overlay + card, Escape/backdrop dismissal and
 * body scroll lock. Used by every dialog/preview in the app.
 */
export default function Modal({
  onClose,
  ariaLabel,
  children,
  className = '',
  overlayClassName = '',
  overlayChildren,
  closeOnBackdrop = true,
  closeOnEscape = true,
  onKeyDown,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    overlayRef.current?.focus()
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented || Array.from(document.querySelectorAll('[aria-modal="true"]')).at(-1) !== overlayRef.current) return
      if (e.key === 'Tab') {
        const controls = Array.from(overlayRef.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')).filter(el => el.getClientRects().length)
        const first = controls[0], last = controls.at(-1)
        if (!first) { e.preventDefault(); return }
        if (e.shiftKey && (document.activeElement === first || document.activeElement === overlayRef.current)) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === overlayRef.current)) { e.preventDefault(); first.focus() }
      }
      if (e.key === 'Escape'  && closeOnEscape) onClose()
      onKeyDown?.(e)
    }
    window.addEventListener('keydown', handler)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, closeOnEscape, onKeyDown])

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      className={`modal-overlay ${overlayClassName}`.trim()}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className={`modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {overlayChildren}
    </div>
  )
}

/** Shared close control, placed last in modal headers including file previews. */
export function ModalCloseButton({ onClose, disabled = false, label = 'Close dialog' }: { onClose: () => void; disabled?: boolean; label?: string }) {
  return <button type="button" className="btn btn--icon modal-close" disabled={disabled} onClick={onClose} aria-label={label} title={`${label} (Esc)`}><Icon name="close" size={16} /></button>
}

export function ModalHeader({ children, onClose, disabled = false, label }: { children: ReactNode; onClose: () => void; disabled?: boolean; label?: string }) {
  return <header className="modal-heading">{children}<ModalCloseButton onClose={onClose} disabled={disabled} label={label} /></header>
}
