import * as XLSX from 'xlsx';

/**
 * Creates a SheetJS worksheet for a single Under-Reamed Pile report.
 */
function createUnderReamedWorksheet(report) {
  const inputs = report.inputs;
  const geometry = report.geometry;
  const capacity = report.capacity;
  const notes = report.engineeringNotes;

  const rows = [
    ['UNDER-REAMED PILE CAPACITY REPORT'],
    ['Report Number', `#${report.reportNumber}`],
    ['Date & Time', new Date(report.createdAt).toLocaleString()],
    [],
    ['PROJECT INFORMATION'],
    ['Trial Pit / Borehole ID', inputs.trialPit || '–'],
    [],
    ['INPUT PARAMETERS'],
    ['Stem Diameter, D (m)', parseFloat(inputs.D)],
    ['Cohesion at Pile Tip, Cp (kPa)', parseFloat(inputs.Cp)],
    ['Cohesion at Bulb Level, Ca\' (kPa)', parseFloat(inputs.Ca_dash)],
    ['Cohesion Along Stem, Ca (kPa)', parseFloat(inputs.Ca)],
    [],
    ['DERIVED GEOMETRY'],
    ['Under-Ream Diameter, Du (m)', parseFloat(geometry.Du)],
    ['Tip Area, Ap (m²)', parseFloat(geometry.Ap)],
    ['Bulb Area, Aa (m²)', parseFloat(geometry.Aa)],
    ['Bulb Height, L1 (m)', parseFloat(geometry.L1)],
    ['Bulb Surface Area, AB\' (m²)', parseFloat(geometry.AB_dash)],
    ['Shaft Surface Area, As (m²)', parseFloat(geometry.As)],
    ['Stem Extension Area, Ase (m²)', parseFloat(geometry.Ase)],
    [],
    ['CAPACITY RESULTS'],
    ['Ultimate Capacity, Qu (kN)', parseFloat(capacity.Qu)],
    ['Allowable Capacity, Qa (kN)', parseFloat(capacity.Qa)],
    ['Additional Shaft Friction (kN)', parseFloat(capacity.additionalShaftFriction)],
    ['Total Allowable Capacity, Qa_total (kN)', parseFloat(capacity.Qa_total)],
    ['Capacity Increase, Qa_increase (kN)', parseFloat(capacity.Qa_increase)],
    [],
    ['ENGINEERING NOTES & CONSTANTS'],
    ['Bearing Capacity Factor, Nc', parseFloat(notes.bearingCapacityFactorNc)],
    ['Adhesion Factor, alpha', parseFloat(notes.adhesionFactorAlpha)],
    ['Factor of Safety, FS', parseFloat(notes.factorOfSafetyFS)],
    ['Bulb Height Formula', notes.bulbHeightFormula],
    ['Critical Length, L (m)', parseFloat(notes.criticalLengthL)],
    ['Shaft Extension, Le (m)', parseFloat(notes.shaftExtensionLe)]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 38 }, { wch: 35 }];
  return ws;
}

/**
 * Exports single or multiple reports to Excel.
 */
export function exportUnderReamedToExcel(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else if (reportOrReports) {
    reports = [reportOrReports];
  }

  const wb = XLSX.utils.book_new();

  if (reports.length === 1) {
    const ws = createUnderReamedWorksheet(reports[0]);
    XLSX.utils.book_append_sheet(wb, ws, `Report #${reports[0].reportNumber}`);
  } else {
    // Summary tab for comparison mode
    const summaryHeaders = [
      'Report', 
      'Borehole ID', 
      'D (m)', 
      'Cp (kPa)', 
      'Ca\' (kPa)', 
      'Ca (kPa)',
      'Du (m)', 
      'Ap (m²)', 
      'Aa (m²)', 
      'L1 (m)', 
      'AB\' (m²)', 
      'As (m²)', 
      'Qu (kN)', 
      'Qa (kN)', 
      'Additional Friction (kN)', 
      'Qa_total (kN)', 
      'Qa_increase (kN)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit || '–',
      parseFloat(r.inputs.D),
      parseFloat(r.inputs.Cp),
      parseFloat(r.inputs.Ca_dash),
      parseFloat(r.inputs.Ca),
      parseFloat(r.geometry.Du),
      parseFloat(r.geometry.Ap),
      parseFloat(r.geometry.Aa),
      parseFloat(r.geometry.L1),
      parseFloat(r.geometry.AB_dash),
      parseFloat(r.geometry.As),
      parseFloat(r.capacity.Qu),
      parseFloat(r.capacity.Qa),
      parseFloat(r.capacity.additionalShaftFriction),
      parseFloat(r.capacity.Qa_total),
      parseFloat(r.capacity.Qa_increase)
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Comparison Summary');

    // Individual tabs for each trial
    reports.forEach((r) => {
      const ws = createUnderReamedWorksheet(r);
      XLSX.utils.book_append_sheet(wb, ws, `Trial ${r.reportNumber}`);
    });
  }

  const filename = reports.length === 1 
    ? `under_reamed_report_${reports[0].inputs.trialPit || 'TP'}.xlsx`
    : `under_reamed_comparison.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Exports single or multiple reports to CSV.
 */
export function exportUnderReamedToCSV(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else if (reportOrReports) {
    reports = [reportOrReports];
  }

  let ws;
  let prefix = 'under-reamed';

  if (reports.length === 1) {
    ws = createUnderReamedWorksheet(reports[0]);
    prefix = `under-reamed-report-${reports[0].inputs.trialPit || 'TP'}`;
  } else {
    const summaryHeaders = [
      'Report', 
      'Borehole ID', 
      'D (m)', 
      'Cp (kPa)', 
      'Ca\' (kPa)', 
      'Ca (kPa)',
      'Du (m)', 
      'Ap (m²)', 
      'Aa (m²)', 
      'L1 (m)', 
      'AB\' (m²)', 
      'As (m²)', 
      'Qu (kN)', 
      'Qa (kN)', 
      'Additional Friction (kN)', 
      'Qa_total (kN)', 
      'Qa_increase (kN)'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit || '–',
      parseFloat(r.inputs.D),
      parseFloat(r.inputs.Cp),
      parseFloat(r.inputs.Ca_dash),
      parseFloat(r.inputs.Ca),
      parseFloat(r.geometry.Du),
      parseFloat(r.geometry.Ap),
      parseFloat(r.geometry.Aa),
      parseFloat(r.geometry.L1),
      parseFloat(r.geometry.AB_dash),
      parseFloat(r.geometry.As),
      parseFloat(r.capacity.Qu),
      parseFloat(r.capacity.Qa),
      parseFloat(r.capacity.additionalShaftFriction),
      parseFloat(r.capacity.Qa_total),
      parseFloat(r.capacity.Qa_increase)
    ]);

    ws = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    prefix = 'under-reamed-comparison';
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
}
