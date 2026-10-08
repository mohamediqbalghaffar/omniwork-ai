import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'green' | 'ghost';
  glow?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'blue',
  glow = true,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  let colorStyles = '';
  if (variant === 'blue') {
    colorStyles = 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400';
    if (glow) colorStyles += ' glow-blue hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]';
  } else if (variant === 'green') {
    colorStyles = 'bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-500 hover:to-green-400';
    if (glow) colorStyles += ' glow-green hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]';
  } else {
    colorStyles = 'bg-white/10 hover:bg-white/20 text-slate-100 border border-white/10';
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50 cursor-not-allowed transform-none' : 'active:scale-95 hover:scale-[1.02] cursor-pointer';

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl px-4 py-2 ${colorStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
