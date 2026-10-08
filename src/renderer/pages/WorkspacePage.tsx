import React from 'react';
import { WorkspaceToolbar } from '../components/workspace/WorkspaceToolbar';
import { SpreadsheetContainer } from '../components/workspace/SpreadsheetContainer';
import { AISidebar } from '../components/workspace/AISidebar';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { useFileOperations } from '../hooks/useFileOperations';

export const WorkspacePage: React.FC = () => {
  const { dataGrid, setCellValue, loadWorkbookData } = useSpreadsheet();
  const { openFile, saveFile } = useFileOperations(dataGrid, loadWorkbookData);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
      {/* 1. Top Workspace Toolbar */}
      <WorkspaceToolbar onSave={saveFile} onOpen={openFile} />

      {/* 2. Workspace Body: Spreadsheet (90%) + AI Sidebar (10%) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Spreadsheet: fills 90% */}
        <div className="flex-1 h-full overflow-hidden ltr:order-1 rtl:order-last">
          <SpreadsheetContainer
            dataGrid={dataGrid}
            onCellChange={setCellValue}
          />
        </div>

        {/* AI Sidebar: fixed 280px (10%) */}
        <div className="w-[280px] min-w-[280px] h-full overflow-hidden ltr:order-2 rtl:order-first">
          <AISidebar
            dataGrid={dataGrid}
            onApplyFormula={setCellValue}
          />
        </div>
      </div>
    </div>
  );
};
