import * as React from 'react';
import { twMerge } from 'tailwind-merge';

type Direction = 'vertical' | 'horizontal' | 'responsive';
type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between';
type Spacing = 2 | 3 | 4 | 6 | 8;

type Props = {
  direction?: Direction;
  align?: Align;
  justify?: Justify;
  spacing?: Spacing;
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
};

const dirClass: Record<Direction, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
  responsive: 'flex-col md:flex-row',
};
const alignClass: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};
const justClass: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

export function Stack({
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  spacing = 4,
  wrap = false,
  className,
  children,
}: Props) {
  return (
    <div
      data-component="stack"
      className={twMerge(
        'flex',
        dirClass[direction],
        alignClass[align],
        justClass[justify],
        `gap-${spacing}`,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}
