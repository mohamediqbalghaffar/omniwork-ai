import { useCallback } from 'react';
import { useSpreadsheetStore, SelectedCellData } from '../store/spreadsheetStore';
import { spreadsheetService } from '../services/spreadsheet-service';

export function useSelectedCell() {
  const { selectedCell, setSelectedCell } = useSpreadsheetStore();

  const setAddress = useCallback(
    (address: string) => {
      const coord = spreadsheetService.addressToCoordinate(address);
      if (coord) {
        setSelectedCell({
          address: address.toUpperCase(),
          value: selectedCell?.value || '',
          row: coord.row,
          column: coord.col,
        });
      }
    },
    [selectedCell?.value, setSelectedCell]
  );

  const updateCell = useCallback(
    (cell: SelectedCellData | null) => {
      setSelectedCell(cell);
    },
    [setSelectedCell]
  );

  return {
    selectedCell,
    setAddress,
    updateCell,
    isValidAddress: (addr: string) => spreadsheetService.isValidAddress(addr),
  };
}
