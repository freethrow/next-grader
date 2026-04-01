'use client'
import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className={`modal ${className}`}>
      <div className="modal-box max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        {title && <h3 className="font-bold text-lg mb-4 pr-8">{title}</h3>}
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
