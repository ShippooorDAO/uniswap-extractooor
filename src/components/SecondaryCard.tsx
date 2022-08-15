import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const SecondaryCard = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={`rounded-lg shadow-lg border-2 border-base-300 bg-opacity-30 backdrop-blur-sm${
        className ? ' ' + className : ''
      }`}
    >
      <div className="text-sm px-4 py-2 bg-neutral text-neutral-content rounded-t-lg bg-opacity-80">
        {title}
      </div>
      <div className="m-0 p-2 text-center">{children}</div>
    </div>
  );
};
