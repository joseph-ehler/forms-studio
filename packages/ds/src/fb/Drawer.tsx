import { Drawer as FBDrawer, type DrawerProps } from 'flowbite-react';
import * as React from 'react';

import { withContract } from '../utils/withContract';

type Props = Omit<DrawerProps, 'open' | 'onClose'> & {
  ariaLabel: string;
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  debug?: boolean;
};

function DrawerCore({
  ariaLabel,
  open,
  onClose,
  position = 'right',
  children,
  debug,
  ...rest
}: Props) {
  // non-modal semantics by design; no focus trap here
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      data-component="drawer"
      data-state={open ? 'open' : 'closed'}
      data-position={position}
      data-label={ariaLabel}
    >
      <FBDrawer
        open={open}
        onClose={onClose}
        aria-label={ariaLabel}
        position={position}
        {...rest}
      >
        {children}
      </FBDrawer>
    </div>
  );
}

const requireAriaLabel = (p: Props) => {
  if (process.env.NODE_ENV !== 'production' && !p.ariaLabel) {
    throw new Error('[DS.Drawer] ariaLabel is required');
  }
};

export const Drawer = withContract<Props>(DrawerCore, [requireAriaLabel], 'Drawer');
