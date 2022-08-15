import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Card = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={`rounded-lg shadow-lg border-2 border-base-300 bg-base-100 bg-opacity-30 backdrop-blur-sm${
        className ? ' ' + className : ''
      } `}
    >
      {title && (
        <div className="px-4 py-2 bg-neutral text-neutral-content rounded-t-lg bg-opacity-80">
          <div>{title}</div>
        </div>
      )}
      {children}
    </div>
  );
};
