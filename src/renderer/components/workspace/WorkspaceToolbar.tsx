import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, FolderOpen, FileText, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { LanguageToggle } from '../dashboard/LanguageToggle';

interface WorkspaceToolbarProps {
  onSave?: () => void;
  onOpen?: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({ onSave, onOpen }) => {
  const { t } = useTranslation();
  const { setPage } = useAppStore();
  const { fileName, setFileName, isDirty } = useSpreadsheetStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(fileName);

  const handleBack = () => {
    setPage('dashboard');
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setFileName(tempName.trim());
    } else {
      setTempName(fileName);
    }
    setIsEditingName(false);
  };

  return (
    <div className="h-11 w-full bg-slate-900/85 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between select-none z-30 flex-shrink-0">
      {/* Left side (LTR): Back button, File Icon & Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          title={t('workspace.toolbar.back')}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 back-button-icon" />
        </button>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                autoFocus
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setTempName(fileName);
                    setIsEditingName(false);
                  }
                }}
                className="bg-white/10 text-white text-xs px-2 py-0.5 rounded border border-blue-500/50 outline-none"
              />
              <button
                onClick={handleSaveName}
                className="text-emerald-400 hover:text-emerald-300 p-0.5"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span
              onDoubleClick={() => setIsEditingName(true)}
              title="Double click to rename"
              className="text-sm font-medium text-slate-200 hover:text-white cursor-pointer"
            >
              {fileName || t('workspace.toolbar.untitled')}
              {isDirty && <span className="text-amber-400 ltr:ml-1 rtl:mr-1">*</span>}
            </span>
          )}
        </div>
      </div>

      {/* Right side (LTR): Save, Open, Language Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          title={t('workspace.toolbar.save')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-blue-400" />
          <span>{t('workspace.toolbar.save')}</span>
        </button>

        <button
          onClick={onOpen}
          title={t('workspace.toolbar.open')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('workspace.toolbar.open')}</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <LanguageToggle />
      </div>
    </div>
  );
};
