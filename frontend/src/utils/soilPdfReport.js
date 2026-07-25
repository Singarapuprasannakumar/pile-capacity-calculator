import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DARK = [30, 41, 59];       // slate-800
const LIGHT_GRAY = [248, 250, 252]; // slate-50

export function generateSoilPDF(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  if (reports.length === 1) {
    drawSingleSoilReport(doc, reports[0], 1, 1);
  } else {
    // Page 1: Dashboard comparison
    drawSoilComparisonPage(doc, reports);
    // Page 2+: Individual reports
    reports.forEach((report, index) => {
      doc.addPage();
      drawSingleSoilReport(doc, report, index + 1, reports.length);
    });
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, reports[0].id || 'SOIL-CLASS', reports[0].createdAt);
  }

  const suffix = reports.length > 1 ? 'comparison' : `report-${reports[0].reportNumber}`;
  doc.save(`soil-classification-${suffix}.pdf`);
}

function drawFooter(doc, page, totalPages, reportId, createdAt) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(15, pageH - 12, pageW - 15, pageH - 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  
  const dateStr = new Date(createdAt).toLocaleString();
  doc.text(`Report ID: ${reportId}  |  Generated: ${dateStr}`, 15, pageH - 7);
  doc.text(`Page ${page} of ${totalPages}`, pageW - 30, pageH - 7);
}

function drawSingleSoilReport(doc, report, reportIndex, totalReports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SOIL CLASSIFICATION & ENGINEERING PROPERTIES REPORT', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Report #${report.reportNumber} of ${totalReports}  |  Geotechnical USCS Soil Classification Design Suite`, margin, 21);

  const startY = 42;

  // Project Info Table
  autoTable(doc, {
    startY: startY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['1. PROJECT INFORMATION', '']],
    body: [
      ['Trial Pit / Borehole No.', report.inputs.trialPit || '–'],
      ['Soil Category type', report.soilType],
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
  });

  // Inputs Parameters Table
  const finalY1 = doc.lastAutoTable.finalY;
  
  const inputRows = [
    ['Percentage of Fines (fines)', `${report.inputs.fines}%`],
  ];
  if (report.inputs.gravel !== undefined) {
    inputRows.push(['Percentage of Gravel (gravel)', `${report.inputs.gravel}%`]);
  }
  if (report.inputs.sand !== undefined) {
    inputRows.push(['Percentage of Sand (calculated)', `${report.inputs.sand.toFixed(1)}%`]);
  }
  if (report.inputs.wl !== undefined && report.inputs.wl !== null) {
    inputRows.push(['Liquid Limit (WL)', `${report.inputs.wl}%`]);
  }
  if (report.inputs.wp !== undefined && report.inputs.wp !== null) {
    inputRows.push(['Plastic Limit (WP)', `${report.inputs.wp}%`]);
  }
  if (report.inputs.cu !== undefined && report.inputs.cu !== null) {
    inputRows.push(['Uniformity Coefficient (Cu)', report.inputs.cu]);
  }
  if (report.inputs.cc !== undefined && report.inputs.cc !== null) {
    inputRows.push(['Coefficient of Curvature (Cc)', report.inputs.cc]);
  }

  autoTable(doc, {
    startY: finalY1 + 5,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['2. INPUT PARAMETERS', 'Value']],
    body: inputRows,
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 }, 1: { halign: 'right', width: 30 } }
  });

  // Right Column: Classification Results & Suitability
  const finalY2 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: startY,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['3. CLASSIFICATION RESULT', 'Value']],
    body: [
      ['Group Symbol Classification', report.groupSymbol],
      ['Standard Classification Standard', report.notes.classificationMethod],
      ['Plasticity Index / Notes', report.notes.plasticity]
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 } }
  });

  const finalY3 = doc.lastAutoTable.finalY;

  // Engineering Properties Table
  const propRows = Object.entries(report.engineeringProperties).map(([key, val]) => [
    key.replace(/_/g, ' '),
    val
  ]);

  autoTable(doc, {
    startY: finalY3 + 5,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['4. SUITABILITY & PROPERTIES', 'Value']],
    body: propRows,
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
  });

  // Remarks Box at the bottom left
  const finalY4 = doc.lastAutoTable.finalY;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, finalY2 + 5, pageW / 2 - 15, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('REMARKS & APPLICATIONS:', margin + 4, finalY2 + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`* ${report.notes.soilCategory}`, margin + 4, finalY2 + 15);
  
  // Wrap text for remarks
  const wrappedRemarks = doc.splitTextToSize(`* ${report.notes.remarks}`, pageW / 2 - 23);
  doc.text(wrappedRemarks, margin + 4, finalY2 + 20);
}

function drawSoilComparisonPage(doc, reports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SOIL CLASSIFICATION COMPARISON DASHBOARD', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Comparison of different soil trials, sieve categories, and engineering properties', margin, 21);

  // Table
  const headers = [['Report', 'Trial Pit', 'Group Symbol', 'Fines %', 'Gravel %', 'Sand %', 'WL %', 'WP %', 'Permeability', 'Shear Strength']];
  const body = reports.map(r => [
    `Report #${r.reportNumber}`,
    r.inputs.trialPit || '–',
    r.groupSymbol,
    `${r.inputs.fines}%`,
    r.inputs.gravel !== undefined ? `${r.inputs.gravel}%` : '–',
    r.inputs.sand !== undefined ? `${r.inputs.sand.toFixed(1)}%` : '–',
    r.inputs.wl !== undefined && r.inputs.wl !== null ? `${r.inputs.wl}%` : '–',
    r.inputs.wp !== undefined && r.inputs.wp !== null ? `${r.inputs.wp}%` : '–',
    r.engineeringProperties.Permeability_when_Compacted,
    r.engineeringProperties.Shearing_Strength_when_Compacted_and_Saturated
  ]);

  autoTable(doc, {
    startY: 42,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: headers,
    body: body,
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 }
  });
}
