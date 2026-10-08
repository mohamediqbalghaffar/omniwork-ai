import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface RecentFileChipProps {
  name: string;
  path: string;
  onClick: (path: string, name: string) => void;
}

export const RecentFileChip: React.FC<RecentFileChipProps> = ({ name, path, onClick }) => {
  const truncated = name.length > 20 ? `${name.substring(0, 18)}...` : name;

  return (
    <button
      onClick={() => onClick(path, name)}
      title={path}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
    >
      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>{truncated}</span>
    </button>
  );
};
