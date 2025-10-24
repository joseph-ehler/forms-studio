/**
 * usePopoverPosition - Smart Popover Positioning with Collision Detection
 * 
 * Handles:
 * - Automatic placement (bottom/top/left/right)
 * - Collision detection (flip/shift/resize)
 * - Anchor fitting (match trigger width)
 * - Safe padding around trigger
 * - Fallback detection (when no good placement exists)
 * 
 * Returns style object for positioning the popover.
 */

import { useState, useEffect, useCallback, CSSProperties } from 'react';

export interface UsePopoverPositionOptions {
  enabled: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  fitTrigger: boolean;
  collision: 'flip' | 'shift' | 'resize' | 'flip-shift-resize';
  anchorPadding: number;
  minHeight: number;
}

export interface UsePopoverPositionResult {
  style: CSSProperties;
  placement: 'bottom' | 'top' | 'left' | 'right';
  availableHeight: number;
}

export function usePopoverPosition({
  enabled,
  triggerRef,
  containerRef,
  fitTrigger,
  collision,
  anchorPadding,
  minHeight
}: UsePopoverPositionOptions): UsePopoverPositionResult {
  const [style, setStyle] = useState<CSSProperties>({});
  const [placement, setPlacement] = useState<'bottom' | 'top' | 'left' | 'right'>('bottom');
  const [availableHeight, setAvailableHeight] = useState(9999);
  
  const calculatePosition = useCallback(() => {
    if (!enabled || !triggerRef.current || !containerRef.current) {
      return;
    }
    
    const trigger = triggerRef.current.getBoundingClientRect();
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    // Calculate available space in each direction
    const spaceAbove = trigger.top - anchorPadding;
    const spaceBelow = vh - trigger.bottom - anchorPadding;
    const spaceLeft = trigger.left - anchorPadding;
    const spaceRight = vw - trigger.right - anchorPadding;
    
    // Determine best placement
    let bestPlacement: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
    let maxSpace = spaceBelow;
    
    if (spaceAbove > maxSpace) {
      bestPlacement = 'top';
      maxSpace = spaceAbove;
    }
    
    // Horizontal placements only if vertical space is really limited
    if (maxSpace < minHeight * 0.6) {
      if (spaceRight > maxSpace) {
        bestPlacement = 'right';
        maxSpace = spaceRight;
      }
      if (spaceLeft > maxSpace) {
        bestPlacement = 'left';
        maxSpace = spaceLeft;
      }
    }
    
    // Apply collision strategies
    const shouldFlip = collision.includes('flip');
    const shouldShift = collision.includes('shift');
    const shouldResize = collision.includes('resize');
    
    // Flip if needed
    if (shouldFlip) {
      if (bestPlacement === 'bottom' && spaceBelow < minHeight && spaceAbove > spaceBelow) {
        bestPlacement = 'top';
        maxSpace = spaceAbove;
      } else if (bestPlacement === 'top' && spaceAbove < minHeight && spaceBelow > spaceAbove) {
        bestPlacement = 'bottom';
        maxSpace = spaceBelow;
      }
    }
    
    // Calculate position based on placement
    let top = 0;
    let left = 0;
    let width: number | 'auto' = 'auto';
    let maxHeightValue = maxSpace;
    
    switch (bestPlacement) {
      case 'bottom':
        top = trigger.bottom + anchorPadding;
        left = trigger.left;
        if (fitTrigger) {
          width = trigger.width;
        }
        maxHeightValue = spaceBelow;
        break;
        
      case 'top':
        top = trigger.top - anchorPadding - containerRect.height;
        left = trigger.left;
        if (fitTrigger) {
          width = trigger.width;
        }
        maxHeightValue = spaceAbove;
        break;
        
      case 'right':
        top = trigger.top;
        left = trigger.right + anchorPadding;
        maxHeightValue = Math.min(vh - trigger.top - anchorPadding, trigger.height * 3);
        break;
        
      case 'left':
        top = trigger.top;
        left = trigger.left - anchorPadding - containerRect.width;
        maxHeightValue = Math.min(vh - trigger.top - anchorPadding, trigger.height * 3);
        break;
    }
    
    // Shift horizontally if overflow
    if (shouldShift) {
      if (left + containerRect.width > vw - anchorPadding) {
        left = vw - containerRect.width - anchorPadding;
      }
      if (left < anchorPadding) {
        left = anchorPadding;
      }
    }
    
    // Shift vertically if overflow (for horizontal placements)
    if (shouldShift && (bestPlacement === 'left' || bestPlacement === 'right')) {
      if (top + containerRect.height > vh - anchorPadding) {
        top = vh - containerRect.height - anchorPadding;
      }
      if (top < anchorPadding) {
        top = anchorPadding;
      }
    }
    
    // Resize if needed
    let finalMaxHeight: number | undefined;
    if (shouldResize) {
      finalMaxHeight = Math.max(minHeight * 0.6, maxHeightValue);
    }
    
    setPlacement(bestPlacement);
    setAvailableHeight(maxHeightValue);
    setStyle({
      top: `${top}px`,
      left: `${left}px`,
      width: width === 'auto' ? 'auto' : `${width}px`,
      maxHeight: finalMaxHeight ? `${finalMaxHeight}px` : undefined,
      minWidth: fitTrigger ? `${trigger.width}px` : undefined
    });
  }, [enabled, triggerRef, containerRef, fitTrigger, collision, anchorPadding, minHeight]);
  
  // Recalculate on mount, resize, and scroll
  useEffect(() => {
    if (!enabled) return;
    
    calculatePosition();
    
    const handleUpdate = () => {
      // Use RAF to avoid layout thrashing
      requestAnimationFrame(calculatePosition);
    };
    
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true); // Capture phase for all scrolls
    
    // Initial calculation
    const timer = setTimeout(calculatePosition, 0);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      clearTimeout(timer);
    };
  }, [enabled, calculatePosition]);
  
  return {
    style,
    placement,
    availableHeight
  };
}
