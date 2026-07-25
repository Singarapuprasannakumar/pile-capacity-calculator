import React, { useState } from 'react';
import { exportFootingToExcel, exportFootingToCSV } from '../../utils/footingTableExport';
import { generateFootingPDF } from '../../utils/footingPdfReport';
import { FileDown, Download, Printer } from 'lucide-react';

export default function FootingRaftExportButtons({ reportOrReports }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const isMultiple = Array.isArray(reportOrReports) && reportOrReports.length > 1;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      generateFootingPDF(reportOrReports);
    } catch (e) {
      console.error('Error generating Footing PDF:', e);
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
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm gap-1.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <FileDown className="w-4 h-4 shrink-0" />
        <span>{pdfLoading ? 'Generating PDF...' : isMultiple ? 'Download Combined PDF' : 'Download PDF Report'}</span>
      </button>

      {/* Excel Download Button */}
      <button
        onClick={() => exportFootingToExcel(reportOrReports)}
        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition shadow-sm gap-1.5 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{isMultiple ? 'Export Combined Excel' : 'Export Excel'}</span>
      </button>

      {/* CSV Download Button */}
      <button
        onClick={() => exportFootingToCSV(reportOrReports)}
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
