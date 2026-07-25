import * as XLSX from 'xlsx';

/**
 * Creates a SheetJS worksheet for a single SBC report.
 */
function createSbcReportWorksheet(report) {
  const inputs = report.inputs;
  const bearing = report.bearingFactors;
  const correction = report.correctionFactors;
  const results = report.results;

  const rows = [
    ['IS 6403:1981 SAFE BEARING CAPACITY REPORT'],
    ['Report Number', `#${report.reportNumber}`],
    ['Date & Time', new Date(report.createdAt).toLocaleString()],
    [],
    ['PROJECT INFORMATION'],
    ['Trial Pit No.', inputs.trialPit],
    ['Footing Type', inputs.footingType.charAt(0).toUpperCase() + inputs.footingType.slice(1)],
    ['Failure Type', inputs.failureType.charAt(0).toUpperCase() + inputs.failureType.slice(1) + ' Shear Failure'],
    [],
    ['INPUT PARAMETERS'],
    ['Depth of Footing D (m)', parseFloat(inputs.D)],
    ['Width of Footing B (m)', parseFloat(inputs.B)],
    ['Length of Footing L (m)', parseFloat(inputs.L)],
    ['Cohesion (kN/m²)', parseFloat(inputs.cohesion)],
    ['Friction Angle (degrees)', parseFloat(inputs.phi)],
    ['Water Table Depth (m)', parseFloat(inputs.wt)],
    ['Bulk Unit Weight (kN/m³)', parseFloat(inputs.gamma)],
    ['Submerged Unit Weight (kN/m³)', parseFloat(inputs.gammaSub)],
    ['Inclination of Load (degrees)', parseFloat(inputs.alpha)],
    ['Factor of Safety', parseFloat(inputs.FS)],
    [],
    ['BEARING CAPACITY FACTORS'],
    ['Nc', parseFloat(bearing.Nc)],
    ['Nq', parseFloat(bearing.Nq)],
    ['Nr', parseFloat(bearing.Nr)],
    [],
    ['CORRECTION FACTORS'],
    ['dc', parseFloat(correction.dc)],
    ['dq', parseFloat(correction.dq)],
    ['dr', parseFloat(correction.dr)],
    ['sc', parseFloat(correction.sc)],
    ['sq', parseFloat(correction.sq)],
    ['sr', parseFloat(correction.sr)],
    ['Rw2', parseFloat(correction.Rw2)],
    [],
    ['FINAL RESULTS'],
    ['Ultimate Bearing Capacity (kN/m²)', parseFloat(results.ultimateBearingCapacity)],
    ['Safe Bearing Capacity (kN/m²)', parseFloat(results.safeBearingCapacity)],
    ['Safe Bearing Capacity (t/m²)', parseFloat(results.safeBearingCapacityTon)]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit columns
  const colWidths = [{ wch: 35 }, { wch: 25 }];
  ws['!cols'] = colWidths;

  return ws;
}

/**
 * Exports a single SBC report or multiple reports to Excel.
 */
export function exportSbcToExcel(reportOrReports) {
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
    const ws = createSbcReportWorksheet(report);
    XLSX.utils.book_append_sheet(wb, ws, `Report ${report.reportNumber}`);
  } else {
    // Add individual reports
    reports.forEach((report) => {
      const ws = createSbcReportWorksheet(report);
      XLSX.utils.book_append_sheet(wb, ws, `Report ${report.reportNumber}`);
    });

    // Add Comparison Summary sheet
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Footing Type', 
      'D (m)', 
      'B (m)', 
      'L (m)', 
      'Nc', 
      'Nq', 
      'Nr', 
      'Ult SBC (kN/m²)', 
      'Safe SBC (kN/m²)', 
      'Safe SBC (t/m²)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit,
      r.inputs.footingType.charAt(0).toUpperCase() + r.inputs.footingType.slice(1),
      r.inputs.D,
      r.inputs.B,
      r.inputs.L,
      r.bearingFactors.Nc,
      r.bearingFactors.Nq,
      r.bearingFactors.Nr,
      r.results.ultimateBearingCapacity,
      r.results.safeBearingCapacity,
      r.results.safeBearingCapacityTon
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
  XLSX.writeFile(wb, `sbc-is6403-${suffix}-${dateStr}.xlsx`);
}

/**
 * Exports SBC data to CSV (takes the first report or exports summary if multiple).
 */
export function exportSbcToCSV(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  let ws;
  let prefix = 'sbc-report';

  if (reports.length === 1) {
    ws = createSbcReportWorksheet(reports[0]);
    prefix = `sbc-report-${reports[0].reportNumber}`;
  } else {
    // Generate comparison CSV
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Footing Type', 
      'D (m)', 
      'B (m)', 
      'L (m)', 
      'Nc', 
      'Nq', 
      'Nr', 
      'Ult SBC (kN/m²)', 
      'Safe SBC (kN/m²)', 
      'Safe SBC (t/m²)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit,
      r.inputs.footingType,
      r.inputs.D,
      r.inputs.B,
      r.inputs.L,
      r.bearingFactors.Nc,
      r.bearingFactors.Nq,
      r.bearingFactors.Nr,
      r.results.ultimateBearingCapacity,
      r.results.safeBearingCapacity,
      r.results.safeBearingCapacityTon
    ]);

    ws = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    prefix = 'sbc-comparison';
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
