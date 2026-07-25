import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DARK = [30, 41, 59];       // slate-800
const LIGHT_GRAY = [248, 250, 252]; // slate-50

export function generateFootingPDF(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  if (reports.length === 1) {
    drawSingleFootingReport(doc, reports[0], 1, 1);
  } else {
    // Page 1: Dashboard comparison
    drawFootingComparisonPage(doc, reports);
    // Page 2+: Individual reports
    reports.forEach((report, index) => {
      doc.addPage();
      drawSingleFootingReport(doc, report, index + 1, reports.length);
    });
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, reports[0].id || 'FOOTING-RAFT', reports[0].createdAt);
  }

  const suffix = reports.length > 1 ? 'comparison' : `report-${reports[0].reportNumber}`;
  doc.save(`footing-raft-${suffix}.pdf`);
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

function drawSingleFootingReport(doc, report, reportIndex, totalReports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FOOTING & RAFT SAFE BEARING PRESSURE REPORT', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Report #${report.reportNumber} of ${totalReports}  |  Geotechnical Shallow Foundation Design Suite`, margin, 21);

  const startY = 42;

  // Project Info Table
  autoTable(doc, {
    startY: startY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['1. PROJECT INFORMATION', '']],
    body: [
      ['Trial Pit Number', report.inputs.trialPit],
      ['Foundation Type', report.inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation'],
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
  });

  // Inputs Parameters Table
  const finalY1 = doc.lastAutoTable.finalY;
  autoTable(doc, {
    startY: finalY1 + 5,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['2. INPUT PARAMETERS', 'Value', 'Unit']],
    body: [
      ['Footing Depth (Df)', report.inputs.D, 'm'],
      ['Footing Width (B)', report.inputs.B, 'm'],
      ['Allowable Settlement (S)', report.inputs.S, 'mm'],
      ["Corrected SPT Value (N'')", report.inputs.N2, ''],
      ['Water Table Depth below base (Zw2)', report.inputs.Zw2, 'm']
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  // Right Column: Factors & Results
  const finalY2 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: startY,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['3. CORRECTION FACTORS', 'Value']],
    body: [
      ['Cd (Depth correction factor)', report.correctionFactors.Cd.toFixed(3)],
      ['Rw2 (Water table correction factor)', report.correctionFactors.Rw2.toFixed(3)]
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 } }
  });

  const finalY3 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY3 + 5,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['4. FINAL RESULTS', 'Value', 'Unit']],
    body: [
      ['Net Safe Bearing Pressure (qns)', report.results.netSafeBearingPressure.toFixed(2), 'kN/m²']
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  // Note Box at the bottom left
  const isWithin = report.inputs.Zw2 < report.inputs.B;
  const wtTitle = isWithin 
    ? "Water table is within depth B below base"
    : "Water table is deeper than foundation influence zone";
  const wtExpression = `Zw2 = ${report.inputs.Zw2.toFixed(2)} m ${isWithin ? '<' : '>='} B = ${report.inputs.B.toFixed(2)} m`;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, finalY2 + 5, pageW / 2 - 15, 36, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ENGINEERING NOTES:', margin + 4, finalY2 + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`* Foundation Type: ${report.inputs.foundationType === 'isolated' ? 'Isolated Footing' : 'Raft Foundation'} Design.`, margin + 4, finalY2 + 14);
  doc.text(`* Calculation Method: Teng's / Peck-Hanson-Thornburn bearing correlations.`, margin + 4, finalY2 + 18);
  doc.text(`* Settlement Limit: Restricted to S = ${report.inputs.S}mm with SPT N'' = ${report.inputs.N2}.`, margin + 4, finalY2 + 22);
  doc.text(`* Water Table Condition: ${wtTitle}`, margin + 4, finalY2 + 26);
  doc.text(`  (${wtExpression})`, margin + 4, finalY2 + 30);
}

function drawFootingComparisonPage(doc, reports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FOOTING & RAFT DESIGN COMPARISON DASHBOARD', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Comparison of different foundation trials, geometry parameters, and net safe pressures', margin, 21);

  // Table
  const headers = [['Report', 'Trial Pit', 'Type', 'Df (m)', 'B (m)', 'S (mm)', "N''", 'Zw2 (m)', 'Cd', 'Rw2', 'Net Safe (kN/m²)']];
  const body = reports.map(r => [
    `Report #${r.reportNumber}`,
    r.inputs.trialPit,
    r.inputs.foundationType === 'isolated' ? 'Isolated' : 'Raft',
    r.inputs.D,
    r.inputs.B,
    r.inputs.S,
    r.inputs.N2,
    r.inputs.Zw2,
    r.correctionFactors.Cd.toFixed(2),
    r.correctionFactors.Rw2.toFixed(2),
    r.results.netSafeBearingPressure.toFixed(2)
  ]);

  autoTable(doc, {
    startY: 42,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: headers,
    body: body,
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5 },
  });
}
