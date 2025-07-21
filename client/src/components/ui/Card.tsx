import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge('rounded-lg border bg-white p-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}