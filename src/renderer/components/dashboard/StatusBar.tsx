import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Rocket } from 'lucide-react';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { useAppStore } from '../../store/appStore';
import { useAIStore } from '../../store/aiStore';
import { RecentFileChip } from './RecentFileChip';
import { GlowButton } from '../shared/GlowButton';
import { ipcBridge } from '../../services/ipc-bridge';

export const StatusBar: React.FC = () => {
  const { t } = useTranslation();
  const { recentFiles, setRecentFiles, setFilePath, setFileName, resetSpreadsheet } = useSpreadsheetStore();
  const { setPage, setShowApiKeyModal } = useAppStore();
  const { backgroundStatus } = useAIStore();

  useEffect(() => {
    ipcBridge.getRecentFiles().then((files) => {
      if (files && files.length > 0) {
        setRecentFiles(files);
      }
    }).catch(() => {});
  }, [setRecentFiles]);

  const handleRecentClick = async (path: string, name: string) => {
    setFilePath(path);
    setFileName(name);
    setPage('workspace');
  };

  const handleInstantLaunch = () => {
    resetSpreadsheet();
    setPage('workspace');
  };

  const getStatusText = () => {
    if (backgroundStatus === 'error') return t('dashboard.statusBar.aiError');
    if (backgroundStatus === ('connecting' as any) || backgroundStatus === ('restarting' as any)) {
      return t('dashboard.statusBar.aiConnecting');
    }
    return t('dashboard.statusBar.aiReady');
  };

  return (
    <footer className="h-14 w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-6 flex items-center justify-between gap-4 select-none flex-shrink-0 z-40">
      {/* 1. AI Status indicator */}
      <button
        onClick={() => setShowApiKeyModal(true)}
        title={t('setup.apiKeyTitle')}
        className="flex items-center gap-2.5 text-xs font-medium text-slate-300 hover:text-white shrink-0 cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            backgroundStatus === 'error'
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              : backgroundStatus === ('connecting' as any) || backgroundStatus === ('restarting' as any)
              ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]'
          }`}
        />
        <span>{getStatusText()}</span>
      </button>

      {/* 2. Recent Files (center) */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-4 no-scrollbar">
        {recentFiles.length > 0 ? (
          recentFiles.map((file) => (
            <RecentFileChip
              key={file.path}
              name={file.name}
              path={file.path}
              onClick={handleRecentClick}
            />
          ))
        ) : (
          <span className="text-xs text-slate-500 italic">
            {t('dashboard.statusBar.noRecentFiles')}
          </span>
        )}
      </div>

      {/* 3. Instant Launch Rocket button */}
      <div className="shrink-0">
        <GlowButton
          variant="green"
          onClick={handleInstantLaunch}
          className="text-xs px-3.5 py-1.5 h-9 gap-1.5 font-semibold"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>{t('dashboard.statusBar.instantLaunch')}</span>
        </GlowButton>
      </div>
    </footer>
  );
};
