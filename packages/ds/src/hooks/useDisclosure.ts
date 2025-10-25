import { useCallback,useState } from 'react';

/**
 * State management hook for disclosure widgets (modals, drawers, dropdowns, etc.)
 * Returns stable callbacks and props object for spreading
 * 
 * @example
 * ```tsx
 * const modal = useDisclosure();
 * <Button onClick={modal.onOpen}>Open</Button>
 * <Modal {...modal.props} ariaLabel="Example">Content</Modal>
 * ```
 */
export function useDisclosure(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  
  return {
    open,
    onOpen,
    onClose,
    toggle,
    /**
     * Props object for spreading onto disclosure components
     * Typed as const for better intellisense
     */
    props: { open, onClose } as const,
  };
}

/**
 * Alias for useDisclosure - more semantic for modal use cases
 */
export const useModal = useDisclosure;

/**
 * Alias for useDisclosure - more semantic for drawer use cases
 */
export const useDrawer = useDisclosure;
