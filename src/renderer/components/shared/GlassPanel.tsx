import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
  glow?: 'green' | 'blue' | 'none';
  children: React.ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  dark = false,
  glow = 'none',
  children,
  className = '',
  ...props
}) => {
  const baseClass = dark ? 'glass-dark' : 'glass';
  const glowClass =
    glow === 'green' ? 'glow-green' : glow === 'blue' ? 'glow-blue' : '';

  return (
    <div
      className={`${baseClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
