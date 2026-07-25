import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DARK = [30, 41, 59];       // slate-800
const LIGHT_GRAY = [248, 250, 252]; // slate-50

export function generateSbcPDF(reportOrReports) {
  let reports = [];
  if (Array.isArray(reportOrReports)) {
    reports = reportOrReports;
  } else {
    reports = [reportOrReports];
  }

  if (reports.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  if (reports.length === 1) {
    drawSingleSbcReport(doc, reports[0], 1, 1);
  } else {
    // Page 1: Dashboard comparison
    drawSbcComparisonPage(doc, reports);
    // Page 2+: Individual reports
    reports.forEach((report, index) => {
      doc.addPage();
      drawSingleSbcReport(doc, report, index + 1, reports.length);
    });
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages, reports[0].id || 'SBC-IS6403', reports[0].createdAt);
  }

  const suffix = reports.length > 1 ? 'comparison' : `report-${reports[0].reportNumber}`;
  doc.save(`sbc-is6403-${suffix}.pdf`);
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

function drawSingleSbcReport(doc, report, reportIndex, totalReports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SAFE BEARING CAPACITY CALCULATION REPORT (IS 6403:1981)', margin, 14);
  
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
      ['Trial Pit Number', report.inputs.trialPit],
      ['Footing Type', report.inputs.footingType.toUpperCase()],
      ['Failure Type', report.inputs.failureType.toUpperCase() + ' Shear Failure']
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
      ['Footing Depth (D)', report.inputs.D, 'm'],
      ['Footing Width (B)', report.inputs.B, 'm'],
      ['Footing Length (L)', report.inputs.L, 'm'],
      ['Cohesion (C)', report.inputs.cohesion, 'kN/m²'],
      ['Friction Angle (phi)', report.inputs.phi, 'degrees'],
      ['Water Table Depth (wt)', report.inputs.wt, 'm'],
      ['Bulk Unit Weight (gamma)', report.inputs.gamma, 'kN/m³'],
      ['Submerged Unit Weight (gamma_sub)', report.inputs.gammaSub, 'kN/m³'],
      ['Inclination of Load (alpha)', report.inputs.alpha, 'degrees'],
      ['Factor of Safety (FS)', report.inputs.FS, '']
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
    head: [['3. BEARING FACTORS', 'Value']],
    body: [
      ['Nc (Cohesion factor)', report.bearingFactors.Nc.toFixed(3)],
      ['Nq (Surcharge factor)', report.bearingFactors.Nq.toFixed(3)],
      ['Nr (Unit weight factor)', report.bearingFactors.Nr.toFixed(3)]
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 } }
  });

  const finalY3 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY3 + 4,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['4. CORRECTION FACTORS', 'Value']],
    body: [
      ['dc (Depth correction for cohesion)', report.correctionFactors.dc.toFixed(3)],
      ['dq (Depth correction for surcharge)', report.correctionFactors.dq.toFixed(3)],
      ['dr (Depth correction for unit weight)', report.correctionFactors.dr.toFixed(3)],
      ['sc (Shape correction for cohesion)', report.correctionFactors.sc.toFixed(3)],
      ['sq (Shape correction for surcharge)', report.correctionFactors.sq.toFixed(3)],
      ['sr (Shape correction for unit weight)', report.correctionFactors.sr.toFixed(3)],
      ['Rw2 (Water table correction factor)', report.correctionFactors.Rw2.toFixed(3)]
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 } }
  });

  const finalY4 = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY4 + 4,
    margin: { left: pageW / 2 + 5, right: margin },
    theme: 'grid',
    head: [['5. FINAL RESULTS', 'Value', 'Unit']],
    body: [
      ['Ultimate Bearing Capacity (qnu)', report.results.ultimateBearingCapacity.toFixed(2), 'kN/m²'],
      ['Safe Bearing Capacity (qs)', report.results.safeBearingCapacity.toFixed(2), 'kN/m²'],
      ['Safe Bearing Capacity (t/m²)', report.results.safeBearingCapacityTon.toFixed(2), 't/m²']
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', width: 30 }, 2: { width: 20 } }
  });

  // Note Box at the bottom left
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, finalY2 + 5, pageW / 2 - 15, 25, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ENGINEERING NOTES (IS 6403:1981):', margin + 4, finalY2 + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`* Failure Mode: ${report.inputs.failureType === 'local' ? 'Local' : 'General'} Shear Failure criteria applied.`, margin + 4, finalY2 + 14);
  doc.text(`* Factor of Safety: FS = ${report.inputs.FS} used to calculate Safe SBC from net ultimate.`, margin + 4, finalY2 + 18);
  doc.text(`* Water Table Condition: wt = ${report.inputs.wt}m relative to footing depth D = ${report.inputs.D}m.`, margin + 4, finalY2 + 22);
}

function drawSbcComparisonPage(doc, reports) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SAFE BEARING CAPACITY COMPARISON DASHBOARD', margin, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Comparison of different trials and footing parameters under IS 6403:1981 standard', margin, 21);

  // Table
  const headers = [['Report', 'Trial Pit', 'Type', 'D (m)', 'B (m)', 'L (m)', 'Cohesion', 'Phi', 'Ultimate (kN/m²)', 'Safe SBC (kN/m²)', 'Safe SBC (t/m²)']];
  const body = reports.map(r => [
    `Report #${r.reportNumber}`,
    r.inputs.trialPit,
    r.inputs.footingType.charAt(0).toUpperCase() + r.inputs.footingType.slice(1),
    r.inputs.D,
    r.inputs.B,
    r.inputs.L,
    r.inputs.cohesion,
    r.inputs.phi,
    r.results.ultimateBearingCapacity.toFixed(2),
    r.results.safeBearingCapacity.toFixed(2),
    r.results.safeBearingCapacityTon.toFixed(2)
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
