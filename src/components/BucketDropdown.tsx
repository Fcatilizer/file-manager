import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from './Icon'

type Props = {
  buckets: string[]
  activeBucket: string
  canManage: boolean
  disabled: boolean
  onSelect: (name: string) => void
  onCreate: () => void
  onDelete: (name: string) => void
  onRefresh: () => void
}

export default function BucketDropdown({ buckets, activeBucket, canManage, disabled, onSelect, onCreate, onDelete, onRefresh }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    const selected = menu?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
    ;(selected || menu?.querySelector<HTMLButtonElement>('[role^="menuitem"]'))?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') || [])
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[next]?.focus()
  }

  return (
    <div className="bucket-dropdown" ref={rootRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false)
    }}>
      <button
        type="button"
        className="bucket-select"
        ref={triggerRef}
        disabled={disabled}
        aria-label={`Buckets: ${activeBucket || 'No bucket selected'}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        title={activeBucket || 'Select or create a bucket'}
      >
        <span className="bucket-select__name">{activeBucket || 'Select bucket'}</span>
        <Icon name="chevronDown" size={13} />
      </button>
      {open && (
        <div className="bucket-menu" ref={menuRef} id={menuId} role="menu" aria-label="Buckets" onKeyDown={handleKeyDown}>
          <div className="bucket-menu__heading" role="presentation">Buckets <span>{buckets.length}</span></div>
          <div className="bucket-menu__list" role="group" aria-label="Available buckets">
            {buckets.length === 0 && <p className="bucket-menu__empty">No buckets available</p>}
            {buckets.map((name) => (
              <div key={name} className={`bucket-menu__row${name === activeBucket ? ' bucket-menu__row--active' : ''}`} role="presentation">
                <button type="button" className="bucket-menu__select" role="menuitemradio" aria-checked={name === activeBucket}
                  onClick={() => { close(); onSelect(name) }} title={name}>
                  <Icon name="database" size={15} />
                  <span>{name}</span>
                  {name === activeBucket && <Icon name="check" size={14} />}
                </button>
                {canManage && (
                  <button type="button" className="bucket-menu__delete" role="menuitem" aria-label={`Delete bucket ${name}`} title={`Delete ${name}`}
                    onClick={() => { close(); onDelete(name) }}>
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="bucket-menu__footer" role="presentation">
            {canManage && (
              <button type="button" className="bucket-menu__action bucket-menu__action--create" role="menuitem" onClick={() => { close(); onCreate() }}>
                <Icon name="plus" size={15} /> Create bucket
              </button>
            )}
            <button type="button" className="bucket-menu__action" role="menuitem" onClick={() => { close(); onRefresh() }}>
              <Icon name="refresh" size={14} /> Refresh buckets
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
