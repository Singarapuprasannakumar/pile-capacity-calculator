/**
 * pdfReport.js
 * ─────────────
 * Generates professional PDF engineering reports for pile capacity calculations.
 * Supports individual report exports and combined multi-report comparison exports.
 * Uses jsPDF + jsPDF-autotable.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatEngineeringNumber, getEngineeringMethod, generateReportId } from './engineeringUtils';

const PI = Math.PI;
const FOS = 2.5;
const DARK = [30, 41, 59];       // slate-800
const LIGHT_GRAY = [248, 250, 252]; // slate-50

/**
 * Main function to generate an individual report PDF.
 * Compatible with original signature generatePDF(formData, results) 
 * as well as the new single report object structure generatePDF(report).
 */
export function generatePDF(formDataOrReport, results) {
  let report = null;

  if (formDataOrReport && formDataOrReport.inputs) {
    // If it's a report object from comparison mode
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

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Draw the single report pages
  drawSingleReportPages(doc, report, report.reportNumber);

  // Apply footer page numbering
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, report.id, report.createdAt);
  }

  doc.save(`pile-capacity-report-no-${report.reportNumber}.pdf`);
}

/**
 * Generates a combined PDF report containing a Comparison Summary Dashboard
 * followed by all calculated reports page-by-page.
 */
export function generateCombinedPDF(reports) {
  if (!reports || reports.length === 0) return;

  // Fallback to standard single report if there is only 1 report
  if (reports.length === 1) {
    generatePDF(reports[0]);
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ─── PAGE 1: COMPARISON SUMMARY DASHBOARD ──────────────────────────────────
  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 38, 'F');

  // Title & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PILE CAPACITY COMPARISON REPORT', margin, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Geotechnical Design Summary & Diameter Comparison Dashboard', margin, 22);

  const dateObj = new Date();
  const dayStr = String(dateObj.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthStr = monthNames[dateObj.getMonth()];
  const yearStr = dateObj.getFullYear();
  const dateFormatted = `${dayStr}-${monthStr}-${yearStr}`;

  doc.setFontSize(7.5);
  doc.text(`Reports Compared: ${reports.length}  |  Generated On: ${dateFormatted}`, margin, 29);

  // Right banner info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Pile Capacity Calculator', pageW - margin, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('Software Version: v1.0', pageW - margin, 24, { align: 'right' });
  doc.text('Academic Design Reference', pageW - margin, 29, { align: 'right' });

  let y = 48;

  // Heading for Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Diameter Comparison Summary Dashboard', margin, y);
  y += 4;

  // Prepare comparison data rows
  const comparisonHeaders = [
    'Report', 
    'Diameter (m)', 
    'Pile Length (m)', 
    'Total Shaft Resistance Qs (kN)', 
    'End Bearing Capacity Qp (kN)', 
    'Ultimate Capacity Qu (kN)', 
    'Allowable Capacity Qa (kN)'
  ];

  const comparisonRows = reports.map(r => {
    const totalQs = r.calculations.reduce((s, lr) => s + lr.shaftResistance, 0);
    return [
      `Report #${r.reportNumber}`,
      formatEngineeringNumber(r.diameter),
      formatEngineeringNumber(r.pileLength),
      formatEngineeringNumber(totalQs),
      formatEngineeringNumber(r.outputs.Qp),
      formatEngineeringNumber(r.outputs.Qu),
      formatEngineeringNumber(r.outputs.Qa)
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [comparisonHeaders],
    body: comparisonRows,
    styles: { fontSize: 8, cellPadding: 3, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'right', fontStyle: 'bold' }
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // Draw Table of Contents card
  if (y < pageH - 50) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Table of Contents', margin, y);
    y += 4;

    const tocRows = [
      ['Page 1', 'Diameter Comparison Summary Dashboard'],
    ];
    reports.forEach((r, idx) => {
      tocRows.push([`Pages ${idx * 2 + 2} - ${idx * 2 + 3}`, `Pile Capacity Report #${r.reportNumber} (Diameter = ${formatEngineeringNumber(r.diameter)} m)`]);
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      tableWidth: 150,
      body: tocRows,
      styles: { fontSize: 7.5, cellPadding: 2, textColor: DARK },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 115 }
      },
      theme: 'plain'
    });
  }

  // ─── APPEND SUBSEQUENT REPORTS ─────────────────────────────────────────────
  reports.forEach((r) => {
    doc.addPage();
    drawSingleReportPages(doc, r, r.reportNumber);
  });

  // ─── FOOTER NUMBERING ACROSS ALL PAGES ─────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  const globalReportId = generateReportId();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, globalReportId, dateFormatted);
  }

  doc.save(`pile-capacity-comparison-report-${dateFormatted}.pdf`);
}

/**
 * Draws the standard page layout of a single report:
 * Page 1: Metadata blocks, Layer Details table.
 * Page 2: Summary values table, Layer-wise shaft calculations table with integrated Final Results, Formula references.
 */
function drawSingleReportPages(doc, report, reportNum) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const d = report.diameter;
  const perimeter = PI * d;
  const tipArea = (PI * d * d) / 4;
  const totalQs = report.calculations.reduce((s, lr) => s + lr.shaftResistance, 0);
  const totalLength = report.pileLength;
  const bearingLayer = report.bearingLayer;
  const gwLevel = report.groundwater;

  // Format date
  const dateObj = new Date(report.createdAt);
  const dayStr = String(dateObj.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthStr = monthNames[dateObj.getMonth()];
  const dateFormatted = `${dayStr}-${monthStr}-${dateObj.getFullYear()}`;
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let y = margin;

  // ── Header Banner ─────────────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.rect(0, doc.internal.getCurrentPageInfo().pageNumber === 1 && doc.internal.getNumberOfPages() === 1 ? 0 : 0, pageW, 38, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`PILE CAPACITY REPORT #${reportNum}`, margin, 15);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Geotechnical report details for pile diameter ${formatEngineeringNumber(d)} m`, margin, 22);

  // Report details
  doc.setFontSize(7.5);
  doc.text(`Report ID: ${report.id}  |  Calculated: ${dateFormatted} at ${timeStr}`, margin, 29);

  // Right banner info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Pile Capacity Calculator', pageW - margin, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('Software Version: v1.0', pageW - margin, 24, { align: 'right' });
  doc.text('Academic Design Reference', pageW - margin, 29, { align: 'right' });

  y = 48;

  // ── Section 1 & 2: Project Details & Pile Geometry (Side-by-Side) ─────────
  const colW = (contentW - 10) / 2;

  // Heading for 1. Project Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('1. Project Details', margin, y);

  // Heading for 2. Pile Geometry
  doc.text('2. Pile Geometry', margin + colW + 10, y);
  y += 4;

  // Project Details Table
  autoTable(doc, {
    startY: y,
    margin: { left: margin },
    tableWidth: colW,
    head: [['Parameter', 'Value']],
    body: [
      ['Pile Diameter', `${formatEngineeringNumber(d)} m`],
      ['Pile Length', `${formatEngineeringNumber(totalLength)} m`],
      ['Factor of Safety', '2.500'],
      ['Bearing Layer', bearingLayer],
      ['Groundwater Level', gwLevel !== '—' ? gwLevel : 'Not Encountered'],
    ],
    styles: { fontSize: 8, cellPadding: 2.2, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    theme: 'striped',
  });

  const table1FinalY = doc.lastAutoTable.finalY;

  // Pile Geometry Table
  autoTable(doc, {
    startY: y,
    margin: { left: margin + colW + 10 },
    tableWidth: colW,
    head: [['Parameter', 'Value']],
    body: [
      ['Diameter (D)', `${formatEngineeringNumber(d)} m`],
      ['Perimeter (C = πD)', `${formatEngineeringNumber(perimeter)} m`],
      ['Tip Area (Ap = πD²/4)', `${formatEngineeringNumber(tipArea)} m²`],
    ],
    styles: { fontSize: 8, cellPadding: 2.2, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    theme: 'striped',
  });

  const table2FinalY = doc.lastAutoTable.finalY;
  y = Math.max(table1FinalY, table2FinalY) + 6;

  // ── Section 3: Layer Details ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('3. Layer Details', margin, y);
  y += 4;

  const layerRows = report.inputs.layers.map((layer, i) => {
    const dn = d || 1;
    const ld = (parseFloat(layer.thickness) || 0) / dn;
    let params = '';
    if (layer.soilType === 'clay') {
      params = `α = ${formatEngineeringNumber(layer.alpha)},  Cu = ${formatEngineeringNumber(layer.cohesion)} kN/m²`;
    } else if (layer.soilType === 'sand') {
      params = `K = ${formatEngineeringNumber(layer.K)},  φ = ${formatEngineeringNumber(layer.phi)}°`;
      if (ld < 15) params += `,  ov_top = ${formatEngineeringNumber(layer.ovTop)},  ov_bot = ${formatEngineeringNumber(layer.ovBottom)} kN/m²`;
      else params += `,  γ = ${formatEngineeringNumber(layer.bulkUnit)} kN/m³,  WT = ${formatEngineeringNumber(layer.waterTableDepth)} m`;
    }
    return [
      `Layer ${i + 1}`,
      layer.soilType ? layer.soilType.charAt(0).toUpperCase() + layer.soilType.slice(1) : '—',
      `${formatEngineeringNumber(layer.thickness)} m`,
      layer.soilType === 'sand' ? (ld < 15 ? 'L/D < 15' : 'L/D ≥ 15') : '—',
      params,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Soil Type', 'Thickness', 'L/D Check', 'Input Parameters']],
    body: layerRows,
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 20 },
      1: { fontStyle: 'bold', cellWidth: 24 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 24 },
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 6;

  if (y < pageH - 25) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const disclaimerMsg = "Note: All capacities are calculated based on the selected engineering methods and user-provided soil parameters. Results should be verified by a qualified geotechnical engineer before use in design.";
    doc.text(disclaimerMsg, margin, y + 4);
  }

  // ─── PAGE 2: TABLES & CALCULATIONS ─────────────────────────────────────────
  doc.addPage();
  y = margin;

  // ── Section 4: Calculation Summary ────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('4. Calculation Summary', margin, y);
  y += 4;

  const totalClaySF = report.calculations.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = report.calculations.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Resistance Component', 'Symbol / Equation', 'Calculated Value']],
    body: [
      ['Clay Shaft Resistance', 'ΣQs (Clay)', `${formatEngineeringNumber(totalClaySF)} kN`],
      ['Sand Shaft Resistance', 'ΣQs (Sand)', `${formatEngineeringNumber(totalSandSF)} kN`],
      ['Total Shaft Resistance', 'ΣQs = ΣQs(Clay) + ΣQs(Sand)', `${formatEngineeringNumber(totalQs)} kN`],
      ['End Bearing Resistance', 'Qp', `${formatEngineeringNumber(report.outputs.Qp)} kN`],
      ['Ultimate Pile Capacity', 'Qu = ΣQs + Qp', `${formatEngineeringNumber(report.outputs.Qu)} kN`],
      ['Allowable Capacity (Safe Load)', `Qa = Qu / FOS  (FOS = ${FOS})`, `${formatEngineeringNumber(report.outputs.Qa)} kN`],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { textColor: [100, 116, 139], cellWidth: 120 },
      2: { halign: 'right', fontStyle: 'bold' }
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 5: Layer-wise Shaft Resistance Calculations (with Integrated Final Results) ──
  if (y > pageH - 75) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('5. Layer-wise Shaft Resistance Calculations', margin, y);
  y += 4;

  const headRow = [
    'Layer', 
    'Soil Type', 
    'Thickness (m)', 
    'Engineering Method', 
    'Clay Skin Friction (kN)', 
    'Sand Skin Friction (kN)', 
    'Total Shaft Resistance Qs (kN)'
  ];

  const resultRows = report.calculations.map((lr, i) => {
    const orig = report.inputs.layers[i] || {};
    const method = getEngineeringMethod(lr, d);

    const isClay = lr.soilType?.toLowerCase() === 'clay';
    const isSand = lr.soilType?.toLowerCase() === 'sand';

    const claySF = isClay ? `${formatEngineeringNumber(lr.skinFrictionClay ?? lr.shaftResistance)} kN` : '-';
    const sandSF = isSand ? `${formatEngineeringNumber(lr.skinFrictionSand ?? lr.shaftResistance)} kN` : '-';

    return [
      `${lr.layer ?? (i + 1)}`,
      lr.soilType ? lr.soilType.charAt(0).toUpperCase() + lr.soilType.slice(1) : '-',
      `${formatEngineeringNumber(lr.thickness)} m`,
      method,
      claySF,
      sandSF,
      `${formatEngineeringNumber(lr.shaftResistance)} kN`
    ];
  });

  // Append Section Header for Final Results directly inside the table rows
  resultRows.push([
    { content: 'FINAL RESULTS', colSpan: 7, styles: { halign: 'center', fontStyle: 'bold', fillColor: [243, 244, 246] } }
  ]);

  // Append Qp, Qu, and Qa rows inside the table
  resultRows.push([
    { content: 'End Bearing Capacity (Qp)', colSpan: 6, styles: { fontStyle: 'bold' } },
    `${formatEngineeringNumber(report.outputs.Qp)} kN`
  ]);
  resultRows.push([
    { content: 'Ultimate Capacity (Qu)', colSpan: 6, styles: { fontStyle: 'bold' } },
    `${formatEngineeringNumber(report.outputs.Qu)} kN`
  ]);
  resultRows.push([
    { content: 'Allowable Capacity (Qa)', colSpan: 6, styles: { fontStyle: 'bold' } },
    `${formatEngineeringNumber(report.outputs.Qa)} kN`
  ]);

  const colStyles = {
    0: { halign: 'center', cellWidth: 15 },
    1: { halign: 'center', cellWidth: 25 },
    2: { halign: 'right', cellWidth: 28 },
    3: { halign: 'center', cellWidth: 79 },
    4: { halign: 'right', cellWidth: 40 },
    5: { halign: 'right', cellWidth: 40 },
    6: { halign: 'right', cellWidth: 40 },
  };

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [headRow],
    body: resultRows,
    styles: { fontSize: 7.5, cellPadding: 2, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: colStyles,
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 6: Formula Reference ──────────────────────────────────────────
  if (y > pageH - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text('6. Formula Reference', margin, y);
  y += 5;

  const formulas = [
    ['Clay Shaft', 'Qs = α × Cu × C × L'],
    ['Sand Shaft (Effective Stress)', 'Qs = K × σ\'v_avg × tan(δ) × C × L    where δ = 0.75φ, σ\'v_avg = (σ_top + σ_bot)/2'],
    ['Sand Shaft (Critical Depth)', 'Qs = K × σ\'v_avg × tan(δ) × C × L    where σ\'v capped at critical depth Dc = 15D'],
    ['Clay End Bearing', 'Qp = 9 × Cu_tip × Ap  (Skempton)'],
    ['Sand End Bearing', 'Qp = σ\'v_tip × Nq × Ap  (overburden capped at Dc = 15D)'],
    ['Ultimate Capacity', 'Qu = ΣQs + Qp'],
    ['Allowable Capacity', `Qa = Qu / FOS  (FOS = ${FOS})`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: formulas,
    styles: { fontSize: 8, cellPadding: 2, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52, textColor: [100, 116, 139] },
    },
    theme: 'striped',
  });
}

/**
 * Draws the standard disclaimer and page numbers in the page footer.
 */
function drawFooter(doc, p, totalPages, reportId, dateStr) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageH - 12, pageW, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);

  // Left Footer
  doc.text(
    `Report ID: ${reportId}  |  Version: v1.0  |  Generated On: ${dateStr}`,
    margin,
    pageH - 4.5
  );

  // Right Footer
  doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 4.5, { align: 'right' });

  // Center Disclaimer
  doc.setFontSize(6.5);
  doc.text(
    'Disclaimer: This report is for engineering reference only. Consult a licensed geotechnical engineer for design decisions.',
    pageW / 2,
    pageH - 8.5,
    { align: 'center' }
  );
}
