import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

interface UseDialogOptions {
  /** Called when the user presses Escape. */
  onClose?: () => void;
  /** Set to false while the dialog is not shown, or while another dialog on top of it should own the keyboard. */
  active?: boolean;
  /** Change this when the dialog's content is replaced (for example a new step), to move focus back to the dialog. */
  focusKey?: string | number;
}

/**
 * Keyboard and focus behaviour for a modal dialog: focus moves into the dialog
 * when it opens, Tab stays inside it, Escape closes it, the page behind does
 * not scroll, and focus returns to where it was when the dialog closes.
 *
 * Attach the returned ref to the dialog's root element, which needs
 * `tabIndex={-1}`, `role="dialog"` and `aria-modal="true"`.
 */
export function useDialog<T extends HTMLElement>({ onClose, active = true, focusKey }: UseDialogOptions = {}) {
  const ref = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard handling, scroll lock, and returning focus on close.
  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      const root = ref.current;
      if (!root) return;

      if (event.key === 'Escape') {
        if (onCloseRef.current) {
          event.stopPropagation();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (!root.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (current === first || current === root)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active]);

  // Move focus into the dialog when it opens and whenever its content is replaced.
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (root && !root.contains(document.activeElement)) {
      root.focus({ preventScroll: true });
    }
  }, [active, focusKey]);

  return ref;
}
