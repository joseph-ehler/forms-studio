/**
 * Screen Reader Announcement Helpers
 * 
 * Primitives for ARIA live regions.
 * Makes SR announcements easy and impossible to get wrong.
 * 
 * Philosophy:
 * - Don't make teams hand-roll ARIA
 * - Provide helpers with correct defaults
 * - Auto-cleanup to prevent region pollution
 */

import React, { useEffect, useRef } from 'react';

type Politeness = 'polite' | 'assertive' | 'off';

interface SrAnnounceProps {
  children: React.ReactNode;
  politeness?: Politeness;
  role?: 'status' | 'alert' | 'log';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

/**
 * Screen Reader Live Region Component
 * 
 * Usage:
 * <SrAnnounce politeness="polite">
 *   Item added to cart
 * </SrAnnounce>
 */
export const SrAnnounce: React.FC<SrAnnounceProps> = ({
  children,
  politeness = 'polite',
  role = 'status',
  atomic = true,
  relevant = 'additions',
}) => {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Global announcement function
 * 
 * Usage:
 * announce('Item added to cart')
 * announce('Error: Invalid email', 'assertive')
 */
export function announce(message: string, politeness: Politeness = 'polite'): void {
  // Create or get global announcement container
  let container = document.getElementById('cascade-sr-announcements');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'cascade-sr-announcements';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    container.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(container);
  }
  
  // Create announcement element
  const announcement = document.createElement('div');
  announcement.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;
  
  container.appendChild(announcement);
  
  // Auto-cleanup after 5 seconds
  setTimeout(() => {
    if (announcement.parentNode === container) {
      container?.removeChild(announcement);
    }
  }, 5000);
}

/**
 * Hook for temporary announcements
 * 
 * Usage:
 * const announce = useSrAnnounce();
 * announce('Selection changed');
 */
export function useSrAnnounce(politeness: Politeness = 'polite') {
  return (message: string) => announce(message, politeness);
}

/**
 * Hook for live announcement region
 * 
 * Usage:
 * const { message, setMessage } = useLiveRegion();
 * setMessage('3 items selected');
 * 
 * <div role="status" aria-live="polite">{message}</div>
 */
export function useLiveRegion(politeness: Politeness = 'polite') {
  const [message, setMessage] = React.useState('');
  const timeoutRef = useRef<number | null>(null);
  
  const updateMessage = (newMessage: string, clearAfterMs = 5000) => {
    setMessage(newMessage);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Auto-clear after delay
    if (clearAfterMs > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setMessage('');
      }, clearAfterMs);
    }
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    message,
    setMessage: updateMessage,
    clearMessage: () => setMessage(''),
    politeness,
  };
}

/**
 * Preset announcements for common actions
 */
export const announcements = {
  selectionAdded: (item: string, count: number) => 
    announce(`Added ${item}. ${count} item${count === 1 ? '' : 's'} selected.`),
  
  selectionRemoved: (item: string, count: number) =>
    announce(`Removed ${item}. ${count} item${count === 1 ? '' : 's'} selected.`),
  
  overlayOpened: (title: string) =>
    announce(`${title} dialog opened.`),
  
  overlayClosed: (title: string) =>
    announce(`${title} dialog closed.`),
  
  formError: (field: string, error: string) =>
    announce(`Error in ${field}: ${error}`, 'assertive'),
  
  formSuccess: (message: string) =>
    announce(message, 'polite'),
  
  loading: (resource: string) =>
    announce(`Loading ${resource}...`, 'polite'),
  
  loaded: (resource: string) =>
    announce(`${resource} loaded.`, 'polite'),
};

/**
 * Auto-initialize on import
 */
if (typeof window !== 'undefined') {
  // Ensure container exists
  if (!document.getElementById('cascade-sr-announcements')) {
    const container = document.createElement('div');
    container.id = 'cascade-sr-announcements';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    container.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(container);
      });
    }
  }
}
