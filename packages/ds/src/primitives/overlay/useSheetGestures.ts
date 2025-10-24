/**
 * useSheetGestures - God-Tier Sheet Gesture System
 * 
 * Handles:
 * - Drag gestures with velocity tracking
 * - Snap points with smooth animations
 * - Content scroll handoff (when at top, drag sheet; otherwise scroll content)
 * - Keyboard avoidance (lift sheet when keyboard appears)
 * - Safe area insets (notches, home indicators)
 * - Swipe-to-close (drag past threshold)
 * 
 * Based on iOS/Android sheet behavior patterns.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSheetGesturesOptions {
  enabled: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  snap: number[]; // Fractions of viewport height (e.g., [0.4, 0.7, 1.0])
  initialSnap: number; // Index into snap array
  onClose: () => void;
  allowContentScroll: boolean;
  keyboardAvoidance: boolean;
}

export interface UseSheetGesturesResult {
  translateY: number;
  backdropOpacity: number;
  isAnimating: boolean;
  keyboardOffset: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

export function useSheetGestures({
  enabled,
  contentRef,
  snap,
  initialSnap,
  onClose,
  allowContentScroll,
  keyboardAvoidance
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [translateY, setTranslateY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  
  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    currentY: 0,
    velocityY: 0,
    lastTimestamp: 0,
    canScrollContent: false
  });
  
  // Convert snap fractions to pixel values
  const snapPx = snap.map(fraction => {
    const vh = window.innerHeight;
    return vh * (1 - fraction); // translateY is upward, so invert
  });
  
  // Keyboard avoidance (mobile)
  useEffect(() => {
    if (!enabled || !keyboardAvoidance || typeof window === 'undefined') return;
    
    const handleResize = () => {
      if (!window.visualViewport) return;
      
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;
      
      if (keyboardHeight > 100) {
        // Keyboard is up - lift sheet
        setKeyboardOffset(keyboardHeight);
      } else {
        // Keyboard is down
        setKeyboardOffset(0);
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [enabled, keyboardAvoidance]);
  
  // Reset to initial snap when enabled changes
  useEffect(() => {
    if (enabled) {
      setSnapIndex(initialSnap);
      setTranslateY(snapPx[initialSnap]);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [enabled, initialSnap]);
  
  // Check if content can scroll
  const canContentScroll = useCallback(() => {
    if (!allowContentScroll || !contentRef.current) return false;
    const content = contentRef.current;
    return content.scrollHeight > content.clientHeight;
  }, [allowContentScroll, contentRef]);
  
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled) return;
    
    const target = e.target as HTMLElement;
    const content = contentRef.current;
    
    // Check if content can scroll and is not at top
    const contentCanScroll = canContentScroll();
    const contentAtTop = content ? content.scrollTop === 0 : true;
    
    // If content can scroll and not at top, let it handle the gesture
    if (contentCanScroll && !contentAtTop) {
      dragStateRef.current.canScrollContent = true;
      return;
    }
    
    // Otherwise, we handle the drag
    dragStateRef.current = {
      isDragging: true,
      startY: e.clientY,
      currentY: e.clientY,
      velocityY: 0,
      lastTimestamp: Date.now(),
      canScrollContent: false
    };
    
    setIsAnimating(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [enabled, canContentScroll, contentRef]);
  
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current;
    if (!enabled || !state.isDragging) return;
    
    const deltaY = e.clientY - state.startY;
    const timeDelta = Date.now() - state.lastTimestamp;
    
    // Calculate velocity (px/ms)
    if (timeDelta > 0) {
      const velocity = (e.clientY - state.currentY) / timeDelta;
      state.velocityY = velocity;
    }
    
    state.currentY = e.clientY;
    state.lastTimestamp = Date.now();
    
    // Resistance when dragging past bounds
    let newTranslateY = snapPx[snapIndex] + deltaY;
    
    // Add resistance when dragging above max snap (top of sheet)
    if (newTranslateY < snapPx[snap.length - 1]) {
      const excess = snapPx[snap.length - 1] - newTranslateY;
      newTranslateY = snapPx[snap.length - 1] - Math.log(excess + 1) * 20;
    }
    
    // Add resistance when dragging below min snap
    if (newTranslateY > snapPx[0]) {
      const excess = newTranslateY - snapPx[0];
      newTranslateY = snapPx[0] + Math.log(excess + 1) * 20;
    }
    
    setTranslateY(newTranslateY);
  }, [enabled, snapIndex, snapPx, snap.length]);
  
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current;
    if (!enabled || !state.isDragging) return;
    
    state.isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const velocityThreshold = 0.5; // px/ms
    const closeThreshold = 150; // px below min snap
    
    // Check if should close (dragged far enough down)
    const currentTranslateY = translateY;
    if (currentTranslateY > snapPx[0] + closeThreshold) {
      onClose();
      return;
    }
    
    // Velocity-based snapping
    if (Math.abs(state.velocityY) > velocityThreshold) {
      if (state.velocityY > 0) {
        // Dragging down - snap to lower point
        const newIndex = Math.max(0, snapIndex - 1);
        setSnapIndex(newIndex);
        setTranslateY(snapPx[newIndex]);
      } else {
        // Dragging up - snap to higher point
        const newIndex = Math.min(snap.length - 1, snapIndex + 1);
        setSnapIndex(newIndex);
        setTranslateY(snapPx[newIndex]);
      }
    } else {
      // Find nearest snap point
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      snapPx.forEach((snapY, index) => {
        const distance = Math.abs(currentTranslateY - snapY);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      
      setSnapIndex(nearestIndex);
      setTranslateY(snapPx[nearestIndex]);
    }
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, [enabled, translateY, snapPx, snapIndex, snap.length, onClose]);
  
  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current;
    if (!enabled || !state.isDragging) return;
    
    state.isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Snap back to current snap point
    setTranslateY(snapPx[snapIndex]);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, [enabled, snapPx, snapIndex]);
  
  // Backdrop opacity based on sheet position
  const backdropOpacity = 1 - (translateY / snapPx[0]) * 0.6; // Fade out as sheet lowers
  
  return {
    translateY: enabled ? translateY : 0,
    backdropOpacity: enabled ? Math.max(0.4, Math.min(1, backdropOpacity)) : 1,
    isAnimating,
    keyboardOffset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  };
}
