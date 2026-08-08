import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  /** Target key, e.g. 's', 'Enter', 'f', 'k', 'n', '/', '?', '1' */
  key: string;
  /** Requires Ctrl or Cmd key */
  ctrl?: boolean;
  /** Requires Shift key */
  shift?: boolean;
  /** Requires Alt key */
  alt?: boolean;
  /** Allow execution even when user is typing in an input/textarea */
  allowInInput?: boolean;
  /** Prevent default browser behavior. Defaults to true. */
  preventDefault?: boolean;
  /** Handler function when shortcut triggers */
  handler: (e: KeyboardEvent) => void;
  /** Human-readable description for shortcut cheat sheet */
  description?: string;
  /** Scope / Category label e.g. 'Global', 'API Testing', 'Debugging' */
  category?: 'Global' | 'API Testing' | 'Debugging' | 'Navigation';
}

/**
 * Hook to register custom global or scoped keyboard shortcuts.
 */
export function useKeyboardShortcut(config: ShortcutConfig) {
  const {
    key,
    ctrl = false,
    shift = false,
    alt = false,
    allowInInput = false,
    preventDefault = true,
    handler,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused && !allowInInput) {
        return;
      }

      const matchKey = event.key.toLowerCase() === key.toLowerCase();
      const matchCtrl = ctrl ? event.ctrlKey || event.metaKey : true;
      // If ctrl is explicitly false, ensure ctrl/meta is NOT pressed (unless modifier was key itself)
      const strictCtrl = !ctrl ? !event.ctrlKey && !event.metaKey : matchCtrl;

      const matchShift = shift ? event.shiftKey : !event.shiftKey;
      const matchAlt = alt ? event.altKey : !event.altKey;

      if (matchKey && strictCtrl && matchShift && matchAlt) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [key, ctrl, shift, alt, allowInInput, preventDefault, handler]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook to register multiple keyboard shortcuts at once.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      for (const config of shortcuts) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          allowInInput = false,
          preventDefault = true,
          handler,
        } = config;

        if (isInputFocused && !allowInInput) {
          continue;
        }

        const matchKey = event.key.toLowerCase() === key.toLowerCase();
        const matchCtrl = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const matchShift = shift ? event.shiftKey : !event.shiftKey;
        const matchAlt = alt ? event.altKey : !event.altKey;

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          if (preventDefault) {
            event.preventDefault();
          }
          handler(event);
          break; // Stop after first matching shortcut
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Utility helper to detect OS and return proper shortcut badge representation (e.g., ⌘↵ or Ctrl+Enter)
 */
export function getShortcutDisplay(shortcut: { ctrl?: boolean; shift?: boolean; alt?: boolean; key: string }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');

  let keyDisplay = shortcut.key.toUpperCase();
  if (keyDisplay === 'ENTER') keyDisplay = '↵';
  if (keyDisplay === 'ESCAPE') keyDisplay = 'Esc';

  return isMac ? `${parts.join('')}${keyDisplay}` : `${parts.join('+')}${parts.length ? '+' : ''}${keyDisplay}`;
}
