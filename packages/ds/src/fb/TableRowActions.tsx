import { Dropdown } from 'flowbite-react';
import * as React from 'react';
import { HiDotsVertical } from 'react-icons/hi';

export type RowAction = 'show' | 'edit' | 'delete' | 'duplicate' | 'archive';

type Props = {
  actions: RowAction[];
  onAction: (action: RowAction) => void;
  labels?: Partial<Record<RowAction, string>>;
  disabled?: Partial<Record<RowAction, boolean>>;
};

const defaultLabels: Record<RowAction, string> = {
  show: 'Show',
  edit: 'Edit',
  delete: 'Delete',
  duplicate: 'Duplicate',
  archive: 'Archive',
};

export function TableRowActions({ actions, onAction, labels = {}, disabled = {} }: Props) {
  const L = { ...defaultLabels, ...labels };
  return (
    <Dropdown
      inline
      arrowIcon={false}
      label={
        <>
          <span className="sr-only">Row actions</span>
          <HiDotsVertical className="h-5 w-5" />
        </>
      }
    >
      {actions.map((a, idx) => {
        const isDestructive = a === 'delete' || a === 'archive';
        const prevIsDestructive =
          idx > 0 && (actions[idx - 1] === 'delete' || actions[idx - 1] === 'archive');
        const needsDivider = isDestructive && !prevIsDestructive && idx !== 0;

        return (
          <div key={a}>
            {needsDivider && <Dropdown.Divider />}
            <Dropdown.Item
              className={isDestructive ? 'text-danger hover:bg-danger/10' : undefined}
              disabled={disabled[a]}
              onClick={() => onAction(a)}
            >
              {L[a]}
            </Dropdown.Item>
          </div>
        );
      })}
    </Dropdown>
  );
}
