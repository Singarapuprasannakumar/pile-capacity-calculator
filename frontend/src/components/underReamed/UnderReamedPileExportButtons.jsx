import React, { useState } from 'react';
import { exportUnderReamedToExcel, exportUnderReamedToCSV } from '../../utils/underReamedTableExport';
import { generateUnderReamedPDF } from '../../utils/underReamedPdfReport';
import { FileDown, Download, Printer } from 'lucide-react';

export default function UnderReamedPileExportButtons({ reportOrReports }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const isMultiple = Array.isArray(reportOrReports) && reportOrReports.length > 1;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      generateUnderReamedPDF(reportOrReports);
    } catch (e) {
      console.error('Error generating Under-Reamed Pile PDF:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2.5 no-print">
      
      {/* PDF Download Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={pdfLoading}
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm gap-1.5 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <FileDown className="w-4 h-4 shrink-0" />
        <span>{pdfLoading ? 'Generating PDF...' : isMultiple ? 'Download Combined PDF' : 'Download PDF Report'}</span>
      </button>

      {/* Excel Download Button */}
      <button
        onClick={() => exportUnderReamedToExcel(reportOrReports)}
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition shadow-sm gap-1.5 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{isMultiple ? 'Export Combined Excel' : 'Export Excel'}</span>
      </button>

      {/* CSV Download Button */}
      <button
        onClick={() => exportUnderReamedToCSV(reportOrReports)}
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition shadow-sm gap-1.5 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{isMultiple ? 'Export Combined CSV' : 'Export CSV'}</span>
      </button>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200 shadow-sm gap-1.5 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
      >
        <Printer className="w-4 h-4 shrink-0" />
        <span>Print Report</span>
      </button>

    </div>
  );
}
