/** Native controls and editors retain Space/arrow behavior. */
export function ownsKeyboard(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('input, textarea, select, button, a, audio, video, [contenteditable="true"], [role="slider"], [role="textbox"]')
}

export function previewRowKey(event: import('react').KeyboardEvent<HTMLElement>, open: (key: string) => void) {
  if (event.target !== event.currentTarget || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); open(event.key) }
  else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    const rows = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLElement>('[data-file-key]'))
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : rows.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1)
    rows[index]?.focus()
  }
}
