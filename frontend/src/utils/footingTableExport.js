import * as XLSX from 'xlsx';

/**
 * Creates a SheetJS worksheet for a single Footing & Raft report.
 */
function createFootingReportWorksheet(report) {
  const inputs = report.inputs;
  const correction = report.correctionFactors;
  const results = report.results;

  const rows = [
    ['FOOTING & RAFT SAFE BEARING PRESSURE REPORT'],
    ['Report Number', `#${report.reportNumber}`],
    ['Date & Time', new Date(report.createdAt).toLocaleString()],
    [],
    ['PROJECT INFORMATION'],
    ['Trial Pit No.', inputs.trialPit],
    ['Foundation Type', inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation'],
    [],
    ['INPUT PARAMETERS'],
    ['Depth of Footing Df (m)', parseFloat(inputs.D)],
    ['Width of Footing B (m)', parseFloat(inputs.B)],
    ['Allowable Settlement S (mm)', parseFloat(inputs.S)],
    ["Corrected SPT Value N''", parseFloat(inputs.N2)],
    ['Water Table Depth Zw2 (m)', parseFloat(inputs.Zw2)],
    [],
    ['CORRECTION FACTORS'],
    ['Cd (Depth Correction)', parseFloat(correction.Cd)],
    ['Rw2 (Water Table Correction)', parseFloat(correction.Rw2)],
    [],
    ['WATER TABLE CONDITION'],
    ['Water Table Condition', inputs.Zw2 < inputs.B ? 'Within depth B below base' : 'Deeper than foundation influence zone'],
    ['Expression', `Zw₂ = ${parseFloat(inputs.Zw2).toFixed(2)} m ${inputs.Zw2 < inputs.B ? '<' : '≥'} B = ${parseFloat(inputs.B).toFixed(2)} m`],
    [],
    ['FINAL RESULTS'],
    ['Net Safe Bearing Pressure (kN/m²)', parseFloat(results.netSafeBearingPressure)]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit columns
  const colWidths = [{ wch: 35 }, { wch: 25 }];
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * Exports a single report or multiple reports to Excel.
 */
export function exportFootingToExcel(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const wb = XLSX.utils.book_new();

  if (reports.length === 1) {
    const report = reports[0];
    const ws = createFootingReportWorksheet(report);
    XLSX.utils.book_append_sheet(wb, ws, `Report ${report.reportNumber}`);
  } else {
    // Add individual reports
    reports.forEach((report) => {
      const ws = createFootingReportWorksheet(report);
      XLSX.utils.book_append_sheet(wb, ws, `Report ${report.reportNumber}`);
    });

    // Add Comparison Summary sheet
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Foundation Type', 
      'Df (m)', 
      'B (m)', 
      'S (mm)', 
      "Corrected N''", 
      'Zw2 (m)', 
      'Cd', 
      'Rw2', 
      'Water Table Condition',
      'WT Expression',
      'Net Safe Pressure (kN/m²)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit,
      r.inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation',
      r.inputs.D,
      r.inputs.B,
      r.inputs.S,
      r.inputs.N2,
      r.inputs.Zw2,
      r.correctionFactors.Cd,
      r.correctionFactors.Rw2,
      r.inputs.Zw2 < r.inputs.B ? 'Within depth B below base' : 'Deeper than foundation influence zone',
      `Zw₂ = ${parseFloat(r.inputs.Zw2).toFixed(2)} m ${r.inputs.Zw2 < r.inputs.B ? '<' : '≥'} B = ${parseFloat(r.inputs.B).toFixed(2)} m`,
      r.results.netSafeBearingPressure
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    
    // Auto-fit summary columns
    const colWidths = summaryHeaders.map((h, i) => {
      let maxLen = h.length;
      summaryRows.forEach((row) => {
        const val = row[i];
        const str = typeof val === 'number' ? val.toFixed(3) : String(val);
        if (str.length > maxLen) maxLen = str.length;
      });
      return { wch: maxLen + 3 };
    });
    summaryWs['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Comparison Summary');
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const suffix = reports.length > 1 ? 'comparison' : `report-${reports[0].reportNumber}`;
  XLSX.writeFile(wb, `footing-raft-${suffix}-${dateStr}.xlsx`);
}

/**
 * Exports Footing data to CSV.
 */
export function exportFootingToCSV(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  let ws;
  let prefix = 'footing-report';

  if (reports.length === 1) {
    ws = createFootingReportWorksheet(reports[0]);
    prefix = `footing-report-${reports[0].reportNumber}`;
  } else {
    // Generate comparison CSV
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Foundation Type', 
      'Df (m)', 
      'B (m)', 
      'S (mm)', 
      "Corrected N''", 
      'Zw2 (m)', 
      'Cd', 
      'Rw2', 
      'Water Table Condition',
      'WT Expression',
      'Net Safe Pressure (kN/m²)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit,
      r.inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation',
      r.inputs.D,
      r.inputs.B,
      r.inputs.S,
      r.inputs.N2,
      r.inputs.Zw2,
      r.correctionFactors.Cd,
      r.correctionFactors.Rw2,
      r.inputs.Zw2 < r.inputs.B ? 'Within depth B below base' : 'Deeper than foundation influence zone',
      `Zw₂ = ${parseFloat(r.inputs.Zw2).toFixed(2)} m ${r.inputs.Zw2 < r.inputs.B ? '<' : '≥'} B = ${parseFloat(r.inputs.B).toFixed(2)} m`,
      r.results.netSafeBearingPressure
    ]);

    ws = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    prefix = 'footing-comparison';
  }

  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  link.download = `${prefix}-${dateStr}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
