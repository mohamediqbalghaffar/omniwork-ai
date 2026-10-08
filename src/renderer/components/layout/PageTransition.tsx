import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {children}
    </div>
  );
};
