import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DARK = [30, 41, 59];       // slate-800
const LIGHT_GRAY = [248, 250, 252]; // slate-50

export function generateUnderReamedPDF(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  if (reports.length === 1) {
    drawSingleReport(doc, reports[0], 1, 1);
  } else {
    // Page 1: Dashboard comparison
    drawComparisonPage(doc, reports);
    // Page 2+: Individual reports
    reports.forEach((report, index) => {
      doc.addPage();
      drawSingleReport(doc, report, index + 1, reports.length);
    });
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, reports[0].id || 'UR-PILE', reports[0].createdAt);
  }

  const suffix = reports.length > 1 ? 'comparison' : `report-${reports[0].reportNumber}`;
  doc.save(`under-reamed-pile-${suffix}.pdf`);
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

function drawSingleReport(doc, report, reportIndex, totalReports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('UNDER-REAMED PILE CAPACITY CALCULATION REPORT', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Report #${report.reportNumber} of ${totalReports}  |  Geotechnical Foundation Engineering Suite`, margin, 21);

  const startY = 42;

  // Project Info Table
  autoTable(doc, {
    startY: startY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['1. PROJECT INFORMATION', '']],
    body: [
      ['Trial Pit / Borehole ID', report.inputs.trialPit || '–'],
      ['Foundation Type', 'Under-Reamed Bored Concrete Pile'],
      ['Design Specification', 'IS 2911 (Part III)']
    ],
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 }, // indigo-600
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
      ['Stem Diameter (D)', report.inputs.D, 'm'],
      ['Cohesion at Pile Tip (Cp)', report.inputs.Cp, 'kPa'],
      ['Cohesion at Bulb Level (Ca\')', report.inputs.Ca_dash, 'kPa'],
      ['Cohesion Along Stem (Ca)', report.inputs.Ca, 'kPa']
    ],
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  // Right Column: Geometry & Results
  const finalY2 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: startY,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['3. DERIVED GEOMETRY', 'Value', 'Unit']],
    body: [
      ['Under-Ream Diameter (Du)', report.geometry.Du.toFixed(3), 'm'],
      ['Tip Area (Ap)', report.geometry.Ap.toFixed(4), 'm²'],
      ['Bulb Area (Aa)', report.geometry.Aa.toFixed(4), 'm²'],
      ['Bulb Height (L1)', report.geometry.L1.toFixed(3), 'm'],
      ['Bulb Surface Area (AB\')', report.geometry.AB_dash.toFixed(3), 'm²'],
      ['Shaft Surface Area (As)', report.geometry.As.toFixed(3), 'm²'],
      ['Stem Extension Area (Ase)', report.geometry.Ase.toFixed(3), 'm²']
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 }, // emerald-500
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  const finalY3 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY3 + 4,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['4. CAPACITY RESULTS', 'Value', 'Unit']],
    body: [
      ['Ultimate Capacity (Qu)', report.capacity.Qu.toFixed(2), 'kN'],
      ['Allowable Capacity (Qa)', report.capacity.Qa.toFixed(2), 'kN'],
      ['Additional Shaft Friction', report.capacity.additionalShaftFriction.toFixed(2), 'kN'],
      ['Total Allowable Capacity (Qa_total)', report.capacity.Qa_total.toFixed(2), 'kN'],
      ['Capacity Increase (Qa_increase)', report.capacity.Qa_increase.toFixed(2), 'kN']
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 }, // amber-500
    bodyStyles: { fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  // Note Box at the bottom left
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, finalY2 + 5, pageW / 2 - 15, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ENGINEERING CONSTANTS & METHODS:', margin + 4, finalY2 + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`* Bearing Capacity Factor: Nc = ${report.engineeringNotes.bearingCapacityFactorNc} (IS 2911 Part III).`, margin + 4, finalY2 + 14);
  doc.text(`* Adhesion Factor: alpha = ${report.engineeringNotes.adhesionFactorAlpha}. Factor of Safety: FS = ${report.engineeringNotes.factorOfSafetyFS}.`, margin + 4, finalY2 + 18);
  doc.text(`* Bulb Height Formula: ${report.engineeringNotes.bulbHeightFormula}.`, margin + 4, finalY2 + 22);
  doc.text(`* Shaft Extension: Le = ${report.engineeringNotes.shaftExtensionLe} m, additional friction calculated.`, margin + 4, finalY2 + 26);
}

function drawComparisonPage(doc, reports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('UNDER-REAMED PILE CAPACITY COMPARISON DASHBOARD', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Comparison of under-reamed pile derived geometries and ultimate/allowable vertical capacities', margin, 21);

  // Table
  const headers = [['Report', 'Borehole ID', 'D (m)', 'Cp (kPa)', 'Ca\' (kPa)', 'Ca (kPa)', 'Du (m)', 'L1 (m)', 'Qu (kN)', 'Qa (kN)', 'Qa_total (kN)', 'Increase (kN)']];
  const body = reports.map(r => [
    `Report #${r.reportNumber}`,
    r.inputs.trialPit || '–',
    r.inputs.D.toFixed(3),
    r.inputs.Cp.toFixed(1),
    r.inputs.Ca_dash.toFixed(1),
    r.inputs.Ca.toFixed(1),
    r.geometry.Du.toFixed(3),
    r.geometry.L1.toFixed(3),
    r.capacity.Qu.toFixed(2),
    r.capacity.Qa.toFixed(2),
    r.capacity.Qa_total.toFixed(2),
    r.capacity.Qa_increase.toFixed(2)
  ]);

  autoTable(doc, {
    startY: 42,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: headers,
    body: body,
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5 },
  });
}
