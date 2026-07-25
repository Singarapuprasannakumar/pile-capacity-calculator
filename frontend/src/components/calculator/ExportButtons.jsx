import React from 'react';
import { exportTableToExcel, exportTableToCSV } from '../../utils/tableExport';

const THEMES = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
};

const ExportButtons = ({
  excelData = [],
  csvData = null,
  fileName,
  sheetName = 'Sheet1',
  disabled = false,
  theme = 'blue'
}) => {
  const excelBtnClass = THEMES[theme] || THEMES.blue;
  const targetCsvData = csvData || excelData;

  return (
    <div className="flex gap-2 no-print">
      <button
        onClick={() => exportTableToExcel(excelData, fileName, sheetName)}
        disabled={disabled || !excelData?.length}
        className={`px-3 py-1.5 rounded-lg text-white transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 ${excelBtnClass}`}
      >
        Excel
      </button>
      <button
        onClick={() => exportTableToCSV(targetCsvData, fileName)}
        disabled={disabled || !targetCsvData?.length}
        className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500"
      >
        CSV
      </button>
    </div>
  );
};

export default React.memo(ExportButtons);
