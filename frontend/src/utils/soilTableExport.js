import * as XLSX from 'xlsx';

/**
 * Creates a SheetJS worksheet for a single Soil report.
 */
function createSoilReportWorksheet(report) {
  const inputs = report.inputs;
  const props = report.engineeringProperties;
  const notes = report.notes;

  const rows = [
    ['SOIL CLASSIFICATION & ENGINEERING PROPERTIES REPORT'],
    ['Report Number', `#${report.reportNumber}`],
    ['Date & Time', new Date(report.createdAt).toLocaleString()],
    [],
    ['PROJECT INFORMATION'],
    ['Trial Pit / Borehole No.', inputs.trialPit || '–'],
    ['Soil Type Category', report.soilType],
    ['Group Symbol Classification', report.groupSymbol],
    [],
    ['INPUT PARAMETERS'],
    ['Percentage of Fines (%)', parseFloat(inputs.fines)],
    ['Percentage of Gravel (%)', inputs.gravel !== undefined ? parseFloat(inputs.gravel) : '–'],
    ['Percentage of Sand (%)', inputs.sand !== undefined ? parseFloat(inputs.sand) : '–'],
    ['Liquid Limit, WL (%)', inputs.wl !== undefined && inputs.wl !== null ? parseFloat(inputs.wl) : '–'],
    ['Plastic Limit, WP (%)', inputs.wp !== undefined && inputs.wp !== null ? parseFloat(inputs.wp) : '–'],
    ['Uniformity Coefficient (Cu)', inputs.cu !== undefined && inputs.cu !== null ? parseFloat(inputs.cu) : '–'],
    ['Coefficient of Curvature (Cc)', inputs.cc !== undefined && inputs.cc !== null ? parseFloat(inputs.cc) : '–'],
    [],
    ['ENGINEERING NOTES & PLASTICITY'],
    ['Standard Method', notes.classificationMethod],
    ['Plasticity Index', notes.plasticity],
    ['Suitability Overview', notes.recommendedApplications],
    ['Remarks', notes.remarks],
    [],
    ['GEOTECHNICAL ENGINEERING PROPERTIES'],
    ['Permeability when Compacted', props.Permeability_when_Compacted],
    ['Shearing Strength (Saturated)', props.Shearing_Strength_when_Compacted_and_Saturated],
    ['Compressibility (Saturated)', props.Compressibility_when_Compacted_and_Saturated],
    ['Workability as construction fill', props.Workability_as_Construction_Matterial],
    ['Homogeneous Dam Embankment', props['Rolled_Earth_Dams_Homogeneous_Embankment(1-14)']],
    ['Rolled Earth Dam Core', props.Rolled_Earth_Dams_core],
    ['Rolled Earth Dam Shell', props.Rolled_Earth_Dams_shell],
    ['Foundations (Seepage Important)', props['Foundations-Seepage_important']],
    ['Foundations (Seepage Not Important)', props['Foundations-Seepage_not_important']],
    ['Roadway Surfacing Suitability', props.Roadways_Surfacing]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 38 }, { wch: 35 }];
  return ws;
}

/**
 * Exports single or multiple Soil Classification reports to Excel.
 */
export function exportSoilToExcel(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const wb = XLSX.utils.book_new();

  if (reports.length === 1) {
    const ws = createSoilReportWorksheet(reports[0]);
    XLSX.utils.book_append_sheet(wb, ws, `Report ${reports[0].reportNumber}`);
  } else {
    // Add individual sheets
    reports.forEach((report) => {
      const ws = createSoilReportWorksheet(report);
      XLSX.utils.book_append_sheet(wb, ws, `Report ${report.reportNumber}`);
    });

    // Add Comparison Summary sheet
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Soil Category', 
      'Group Symbol', 
      'Fines %', 
      'Gravel %', 
      'Sand %', 
      'WL %', 
      'WP %', 
      'Cu', 
      'Cc',
      'Permeability',
      'Shear Strength',
      'Compressibility',
      'Workability',
      'Homogeneous Dam',
      'Dam Core',
      'Dam Shell',
      'Foundation Seepage Imp.',
      'Foundation Seepage Not Imp.',
      'Roadway Surfacing'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit || '–',
      r.soilType,
      r.groupSymbol,
      r.inputs.fines,
      r.inputs.gravel !== undefined ? r.inputs.gravel : '–',
      r.inputs.sand !== undefined ? r.inputs.sand : '–',
      r.inputs.wl !== undefined && r.inputs.wl !== null ? r.inputs.wl : '–',
      r.inputs.wp !== undefined && r.inputs.wp !== null ? r.inputs.wp : '–',
      r.inputs.cu !== undefined && r.inputs.cu !== null ? r.inputs.cu : '–',
      r.inputs.cc !== undefined && r.inputs.cc !== null ? r.inputs.cc : '–',
      r.engineeringProperties.Permeability_when_Compacted,
      r.engineeringProperties.Shearing_Strength_when_Compacted_and_Saturated,
      r.engineeringProperties.Compressibility_when_Compacted_and_Saturated,
      r.engineeringProperties.Workability_as_Construction_Matterial,
      r.engineeringProperties['Rolled_Earth_Dams_Homogeneous_Embankment(1-14)'],
      r.engineeringProperties.Rolled_Earth_Dams_core,
      r.engineeringProperties.Rolled_Earth_Dams_shell,
      r.engineeringProperties['Foundations-Seepage_important'],
      r.engineeringProperties['Foundations-Seepage_not_important'],
      r.engineeringProperties.Roadways_Surfacing
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    
    // Auto-fit summary columns
    const colWidths = summaryHeaders.map((h, i) => {
      let maxLen = h.length;
      summaryRows.forEach((row) => {
        const val = row[i];
        const str = typeof val === 'number' ? val.toFixed(2) : String(val);
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
  XLSX.writeFile(wb, `soil-classification-${suffix}-${dateStr}.xlsx`);
}

/**
 * Exports Soil Classification data to CSV.
 */
export function exportSoilToCSV(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  let ws;
  let prefix = 'soil-report';

  if (reports.length === 1) {
    ws = createSoilReportWorksheet(reports[0]);
    prefix = `soil-report-${reports[0].reportNumber}`;
  } else {
    const summaryHeaders = [
      'Report', 
      'Trial Pit', 
      'Soil Category', 
      'Group Symbol', 
      'Fines %', 
      'Gravel %', 
      'Sand %', 
      'WL %', 
      'WP %', 
      'Cu', 
      'Cc',
      'Permeability',
      'Shear Strength',
      'Compressibility',
      'Workability',
      'Homogeneous Dam',
      'Dam Core',
      'Dam Shell',
      'Foundation Seepage Imp.',
      'Foundation Seepage Not Imp.',
      'Roadway Surfacing'
    ];

    const summaryRows = reports.map((r) => [
      `Report #${r.reportNumber}`,
      r.inputs.trialPit || '–',
      r.soilType,
      r.groupSymbol,
      r.inputs.fines,
      r.inputs.gravel !== undefined ? r.inputs.gravel : '–',
      r.inputs.sand !== undefined ? r.inputs.sand : '–',
      r.inputs.wl !== undefined && r.inputs.wl !== null ? r.inputs.wl : '–',
      r.inputs.wp !== undefined && r.inputs.wp !== null ? r.inputs.wp : '–',
      r.inputs.cu !== undefined && r.inputs.cu !== null ? r.inputs.cu : '–',
      r.inputs.cc !== undefined && r.inputs.cc !== null ? r.inputs.cc : '–',
      r.engineeringProperties.Permeability_when_Compacted,
      r.engineeringProperties.Shearing_Strength_when_Compacted_and_Saturated,
      r.engineeringProperties.Compressibility_when_Compacted_and_Saturated,
      r.engineeringProperties.Workability_as_Construction_Matterial,
      r.engineeringProperties['Rolled_Earth_Dams_Homogeneous_Embankment(1-14)'],
      r.engineeringProperties.Rolled_Earth_Dams_core,
      r.engineeringProperties.Rolled_Earth_Dams_shell,
      r.engineeringProperties['Foundations-Seepage_important'],
      r.engineeringProperties['Foundations-Seepage_not_important'],
      r.engineeringProperties.Roadways_Surfacing
    ]);

    ws = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    prefix = 'soil-comparison';
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
