import * as XLSX from 'xlsx';
import { getEngineeringMethod, generateExcelSheetName, generateReportId } from './engineeringUtils';

/**
 * Exports a single report or legacy form calculations to Excel.
 * Compatible with original signature exportTableToExcel(formData, results)
 * as well as single report object structure exportTableToExcel(report).
 */
export function exportTableToExcel(formDataOrReport, results) {
  let report = null;

  if (formDataOrReport && formDataOrReport.inputs) {
    // If it's a report object
    report = formDataOrReport;
  } else {
    // If it's the legacy signature (formData, results)
    const nowStr = new Date().toISOString();
    const d = parseFloat(formDataOrReport.diameter) || 0;
    const totalLength = formDataOrReport.layers.reduce((sum, l) => sum + (parseFloat(l.thickness) || 0), 0);
    const bearing = formDataOrReport.layers.length > 0 
      ? (formDataOrReport.layers[formDataOrReport.layers.length - 1].soilType === 'clay' ? 'Clay' : 'Sand') 
      : '—';

    report = {
      id: generateReportId(),
      reportNumber: 1,
      createdAt: nowStr,
      diameter: d,
      pileLength: totalLength,
      bearingLayer: bearing,
      inputs: formDataOrReport,
      calculations: results.layerResults,
      outputs: { Qp: results.Qp, Qu: results.Qu, Qa: results.Qa }
    };
  }

  const ws = createReportWorksheet(report);

  // Auto-fit columns
  const headers = [
    'Layer', 
    'Soil Type', 
    'Thickness (m)', 
    'Engineering Method', 
    'Clay Skin Friction (kN)', 
    'Sand Skin Friction (kN)', 
    'Total Shaft Resistance Qs (kN)'
  ];
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    // We scan the first few rows for length estimation
    report.calculations.forEach(lr => {
      const val = lr.thickness; // sample
      if (val !== undefined && val !== null) {
        const str = typeof val === 'number' ? val.toFixed(3) : val.toString();
        if (str.length > maxLen) maxLen = str.length;
      }
    });
    return { wch: maxLen + 5 };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetName = `Report ${report.reportNumber}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  XLSX.writeFile(wb, `pile-capacity-report-${report.reportNumber}-${dateStr}.xlsx`);
}

/**
 * Exports all reports inside a single workbook with multiple sheets.
 * The sheets are named based on pile diameter and length, e.g. D-0.300_L-8.0
 * The final sheet contains the 'Comparison Summary' table.
 */
export function exportCombinedExcel(reports) {
  if (!reports || reports.length === 0) return;

  if (reports.length === 1) {
    exportTableToExcel(reports[0]);
    return;
  }

  const wb = XLSX.utils.book_new();
  const sheetNamesUsed = [];

  // 1. Append each individual report sheet
  reports.forEach((r) => {
    const ws = createReportWorksheet(r);
    
    // Auto-fit columns
    const headers = [
      'Layer', 
      'Soil Type', 
      'Thickness (m)', 
      'Engineering Method', 
      'Clay Skin Friction (kN)', 
      'Sand Skin Friction (kN)', 
      'Total Shaft Resistance Qs (kN)'
    ];
    const colWidths = headers.map((h, i) => {
      let maxLen = h.length;
      r.calculations.forEach(lr => {
        const val = lr.thickness;
        if (val !== undefined && val !== null) {
          const str = typeof val === 'number' ? val.toFixed(3) : val.toString();
          if (str.length > maxLen) maxLen = str.length;
        }
      });
      return { wch: maxLen + 5 };
    });
    ws['!cols'] = colWidths;

    const sheetName = generateExcelSheetName(r.diameter, r.pileLength, sheetNamesUsed);
    sheetNamesUsed.push(sheetName);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // 2. Generate and append the Comparison Summary sheet
  const summaryHeaders = [
    'Report', 
    'Diameter (m)', 
    'Pile Length (m)', 
    'Total Shaft Resistance Qs (kN)', 
    'End Bearing Capacity Qp (kN)', 
    'Ultimate Capacity Qu (kN)', 
    'Allowable Capacity Qa (kN)'
  ];

  const summaryRows = reports.map(r => {
    const totalQs = r.calculations.reduce((s, lr) => s + lr.shaftResistance, 0);
    return [
      `Report #${r.reportNumber}`,
      r.diameter,
      r.pileLength,
      totalQs,
      r.outputs.Qp,
      r.outputs.Qu,
      r.outputs.Qa
    ];
  });

  const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
  
  // Format numbers for Summary Sheet
  for (let key in summaryWs) {
    if (key[0] === '!') continue;
    const cell = summaryWs[key];
    if (typeof cell.v === 'number') {
      const match = key.match(/^([A-Z]+)([0-9]+)$/);
      if (match) {
        const colLetter = match[1];
        if (colLetter !== 'A') {
          cell.z = '0.000'; // 3 decimal places
        } else {
          cell.z = '0';
        }
      }
    }
  }

  // Auto-fit summary columns
  const summaryWidths = summaryHeaders.map((h, i) => {
    let maxLen = h.length;
    summaryRows.forEach(r => {
      const val = r[i];
      if (val !== undefined && val !== null) {
        const str = typeof val === 'number' ? val.toFixed(3) : val.toString();
        if (str.length > maxLen) maxLen = str.length;
      }
    });
    return { wch: maxLen + 3 };
  });
  summaryWs['!cols'] = summaryWidths;

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Comparison Summary');

  // Save the workbook
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  XLSX.writeFile(wb, `pile-capacity-comparison-${dateStr}.xlsx`);
}

/**
 * Helper to build the worksheet content array for an individual report
 */
function createReportWorksheet(report) {
  const d = parseFloat(report.diameter) || 1;
  const headers = [
    'Layer', 
    'Soil Type', 
    'Thickness (m)', 
    'Engineering Method', 
    'Clay Skin Friction (kN)', 
    'Sand Skin Friction (kN)', 
    'Total Shaft Resistance Qs (kN)'
  ];

  // Prepare data rows for layers
  const rows = report.calculations.map((lr, i) => {
    const layerNo = lr.layer ?? (i + 1);
    const method = getEngineeringMethod(lr, d);

    const isClay = lr.soilType?.toLowerCase() === 'clay';
    const isSand = lr.soilType?.toLowerCase() === 'sand';

    const claySF = isClay ? (lr.skinFrictionClay ?? lr.shaftResistance) : '-';
    const sandSF = isSand ? (lr.skinFrictionSand ?? lr.shaftResistance) : '-';

    return [
      layerNo,
      lr.soilType ? lr.soilType.charAt(0).toUpperCase() + lr.soilType.slice(1) : '-',
      parseFloat(lr.thickness) || 0,
      method,
      typeof claySF === 'number' ? claySF : '-',
      typeof sandSF === 'number' ? sandSF : '-',
      lr.shaftResistance
    ];
  });

  // Append a blank row, then the Final Results block
  rows.push([]); 
  rows.push(['FINAL RESULTS']);
  rows.push(['Parameter', 'Value']);
  rows.push(['End Bearing Qp (kN)', report.outputs.Qp]);
  rows.push(['Ultimate Qu (kN)', report.outputs.Qu]);
  rows.push(['Allowable Qa (kN)', report.outputs.Qa]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Format cells
  for (let key in ws) {
    if (key[0] === '!') continue;
    const cell = ws[key];
    if (typeof cell.v === 'number') {
      const match = key.match(/^([A-Z]+)([0-9]+)$/);
      if (match) {
        const colLetter = match[1];
        const rowNum = parseInt(match[2], 10);
        
        // Format Layer number as integer
        if (colLetter === 'A' && rowNum <= report.calculations.length + 1) {
          cell.z = '0';
        } else {
          cell.z = '0.000'; // 3 decimal places
        }
      }
    }
  }

  // Freeze the header row
  ws['!views'] = [
    {
      state: 'frozen',
      xSplit: 0,
      ySplit: 1,
      topLeftCell: 'A2',
      activePane: 'bottomLeft'
    }
  ];

  // Enable auto-filter for the Layer columns only
  ws['!autofilter'] = {
    ref: `A1:G${report.calculations.length + 1}`
  };

  return ws;
}
