import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TitleBar } from './components/layout/TitleBar';
import { DirectionProvider } from './components/layout/DirectionProvider';
import { PageTransition } from './components/layout/PageTransition';
import { ToastNotification } from './components/shared/ToastNotification';
import { ApiKeyModal } from './components/shared/ApiKeyModal';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { useAppStore } from './store/appStore';
import { ipcBridge } from './services/ipc-bridge';
import { useBackgroundSync } from './hooks/useBackgroundSync';

export const App: React.FC = () => {
  const {
    currentPage,
    setLanguage,
    addToast,
    showApiKeyModal,
    setShowApiKeyModal,
  } = useAppStore();
  const { t } = useTranslation();

  // Listen to background sync status updates
  useBackgroundSync();

  // Listen for online/offline connectivity changes
  useEffect(() => {
    const handleOffline = () => {
      addToast({
        type: 'warning',
        message: t('errors.noInternet'),
      });
    };

    const handleOnline = () => {
      addToast({
        type: 'success',
        message: 'Internet connection restored',
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [addToast, t]);

  // Load preferences and check for first-launch API key setup
  useEffect(() => {
    ipcBridge
      .getPreferences()
      .then(async (prefs) => {
        if (prefs && prefs.language) {
          setLanguage(prefs.language as 'en' | 'ckb');
        }

        // Check if API key is already configured
        const { hasKey } = await ipcBridge.hasApiKey().catch(() => ({ hasKey: true }));
        if (!hasKey && prefs?.apiKeySkipped !== 'true') {
          setShowApiKeyModal(true);
        }
      })
      .catch(() => {});
  }, [setLanguage, setShowApiKeyModal]);

  return (
    <DirectionProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 select-none">
        {/* Custom frameless TitleBar */}
        <TitleBar />

        {/* Global Toast notifications */}
        <ToastNotification />

        {/* Setup / API Key Modal */}
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
        />

        {/* Page content with smooth transition */}
        <PageTransition>
          {currentPage === 'dashboard' ? <DashboardPage /> : <WorkspacePage />}
        </PageTransition>
      </div>
    </DirectionProvider>
  );
};

export default App;
