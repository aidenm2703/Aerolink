import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, busy = false }) {
  const ref = useRef(null);
  useEffect(() => { const previous = document.activeElement; ref.current?.focus(); return () => previous?.focus(); }, []);
  function keydown(e) {
    if (e.key === 'Escape' && !busy) onClose();
    if (e.key === 'Tab') {
      const nodes = ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]');
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref} onKeyDown={keydown}><header><h2 id="modal-title">{title}</h2><button className="icon-button" disabled={busy} onClick={onClose} aria-label="Cerrar ventana"><X size={20}/></button></header>{children}</section></div>;
}
