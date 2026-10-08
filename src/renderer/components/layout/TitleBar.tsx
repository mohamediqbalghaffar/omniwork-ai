import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Square, Copy, X, Menu, Wifi, Battery, Bell, User } from 'lucide-react';
import { ipcBridge } from '../../services/ipc-bridge';
import { LanguageToggle } from '../dashboard/LanguageToggle';
import { useAppStore } from '../../store/appStore';

export const TitleBar: React.FC = () => {
  const { t } = useTranslation();
  const [isMax, setIsMax] = useState(false);

  const { setShowApiKeyModal } = useAppStore();

  useEffect(() => {
    ipcBridge.isMaximized().then(setIsMax).catch(() => {});
  }, []);

  const handleMinimize = () => ipcBridge.minimize();
  const handleMaximize = () => {
    ipcBridge.maximize();
    setIsMax(!isMax);
  };
  const handleClose = () => ipcBridge.close();

  return (
    <header className="h-10 w-full bg-slate-900/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 select-none z-50 titlebar-drag flex-shrink-0">
      {/* Left section in LTR / Right in RTL: Logo & Menu */}
      <div className="flex items-center gap-3 rtl:order-2">
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="titlebar-nodrag p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={t('titleBar.menu')}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            {t('app.name')}
          </span>
        </div>
      </div>

      {/* Right section in LTR / Left in RTL: Status Icons, Language Toggle, Window Controls */}
      <div className="flex items-center gap-2 rtl:order-1">
        {/* Mock status icons */}
        <div className="flex items-center gap-2 text-slate-400 text-xs px-2 titlebar-drag">
          <Wifi className="w-3.5 h-3.5 hover:text-slate-200 transition-colors" />
          <Battery className="w-3.5 h-3.5 hover:text-slate-200 transition-colors" />
          <Bell className="w-3.5 h-3.5 hover:text-slate-200 transition-colors" />
        </div>

        {/* Language Switcher */}
        <div className="titlebar-nodrag">
          <LanguageToggle />
        </div>

        {/* User avatar button for AI Setup/Settings */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          title={t('setup.apiKeyTitle')}
          className="titlebar-nodrag w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-white/90 cursor-pointer shadow-sm"
        >
          <User className="w-3.5 h-3.5" />
        </button>

        {/* Native window controls */}
        <div className="flex items-center gap-1 ltr:ml-2 rtl:mr-2 titlebar-nodrag">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Maximize"
          >
            {isMax ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
