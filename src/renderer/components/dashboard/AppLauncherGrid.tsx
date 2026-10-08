import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppLauncherCard } from './AppLauncherCard';
import { useAppStore } from '../../store/appStore';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import excelIcon from '../../assets/icons/excel-icon.svg';
import wordIcon from '../../assets/icons/word-icon.svg';
import pptIcon from '../../assets/icons/powerpoint-icon.svg';

export const AppLauncherGrid: React.FC = () => {
  const { t } = useTranslation();
  const { setPage, addToast } = useAppStore();
  const { resetSpreadsheet } = useSpreadsheetStore();

  const handleLaunchExcel = () => {
    resetSpreadsheet();
    setPage('workspace');
  };

  const handleDisabledClick = (appName: string) => {
    addToast({
      type: 'info',
      message: `${appName}: ${t('dashboard.apps.comingSoon')}`,
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl place-items-center">
        <AppLauncherCard
          id="word"
          title={t('dashboard.apps.word')}
          iconSrc={wordIcon}
          isAvailable={false}
          onClick={() => handleDisabledClick(t('dashboard.apps.word'))}
          index={0}
        />
        <AppLauncherCard
          id="excel"
          title={t('dashboard.apps.excel')}
          iconSrc={excelIcon}
          isAvailable={true}
          onClick={handleLaunchExcel}
          index={1}
        />
        <AppLauncherCard
          id="powerpoint"
          title={t('dashboard.apps.powerpoint')}
          iconSrc={pptIcon}
          isAvailable={false}
          onClick={() => handleDisabledClick(t('dashboard.apps.powerpoint'))}
          index={2}
        />
      </div>
    </div>
  );
};
