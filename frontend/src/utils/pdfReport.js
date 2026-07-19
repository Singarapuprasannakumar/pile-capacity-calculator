/**
 * pdfReport.js
 * ─────────────
 * Generates a professional PDF engineering report for pile capacity results.
 * Uses jsPDF + jsPDF-autotable.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PI = Math.PI;
const FOS = 2.5;

const fmt = (v, dec = 3) =>
  typeof v === 'number' && !isNaN(v) ? v.toFixed(dec) : '—';

const METHOD = {
  clay: 'α-Method (Skempton)',
  sandLow: 'Eff. Stress (L/D < 15)',
  sandHigh: 'Eff. Stress (L/D ≥ 15)',
};

/**
 * @param {{ diameter: number, layers: object[] }} formData
 * @param {{ layerResults: object[], Qp: number, Qu: number, Qa: number }} results
 */
export function generatePDF(formData, results) {
  const { diameter, layers } = formData;
  const { layerResults, Qp, Qu, Qa } = results;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── Computed Geometry ─────────────────────────────────────────────────────
  const d = parseFloat(diameter) || 0;
  const perimeter = PI * d;
  const tipArea = (PI * d * d) / 4;
  const totalQs = layerResults.reduce((s, lr) => s + lr.shaftResistance, 0);

  // ── Colors ────────────────────────────────────────────────────────────────
  const BLUE = [37, 99, 235];      // primary-600
  const DARK = [30, 41, 59];       // slate-800
  const LIGHT_BLUE = [239, 246, 255]; // primary-50
  const LIGHT_GRAY = [248, 250, 252]; // slate-50
  const GREEN = [22, 163, 74];     // green-600
  const LIGHT_GREEN = [240, 253, 244];

  let y = margin;

  // ── Header Banner ─────────────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageW, 38, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('PILE CAPACITY ANALYSIS REPORT', margin, 16);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 210, 255);
  doc.text('Geotechnical Engineering · Axial Pile Capacity Calculation', margin, 24);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(190, 210, 255);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, margin, 31);

  // Right: small logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Pile Capacity Calculator', pageW - margin, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(190, 210, 255);
  doc.text('v1.0 · For Design Reference Only', pageW - margin, 26, { align: 'right' });

  y = 48;

  // ── Calculation of Totals ────────────────────────────────────────────────
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  // ── Section 1 & 2: Project Details & Pile Geometry (Side-by-Side) ─────────
  const colW = (contentW - 10) / 2;

  // Heading for 1. Project Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
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
      ['Pile Diameter', `${fmt(d, 3)} m`],
      ['Number of Soil Layers', `${layers.length}`],
      ['Factor of Safety', `${FOS}`],
      ['Date', `${dateStr}`],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
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
      ['Diameter (D)', `${fmt(d, 3)} m`],
      ['Perimeter (C = πD)', `${fmt(perimeter, 4)} m`],
      ['Tip Area (Ap = πD²/4)', `${fmt(tipArea, 6)} m²`],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    theme: 'striped',
  });

  const table2FinalY = doc.lastAutoTable.finalY;
  y = Math.max(table1FinalY, table2FinalY) + 8;

  // ── Section 3: Layer Details ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  doc.text('3. Layer Details', margin, y);
  y += 4;

  const layerRows = layers.map((layer, i) => {
    const dn = d || 1;
    const ld = (parseFloat(layer.thickness) || 0) / dn;
    let params = '';
    if (layer.soilType === 'clay') {
      params = `α = ${layer.alpha || '—'},  Cu = ${layer.cohesion || '—'} kN/m²`;
    } else if (layer.soilType === 'sand') {
      params = `K = ${layer.K || '—'},  φ = ${layer.phi || '—'}°`;
      if (ld < 15) params += `,  ov_top = ${layer.ovTop || '—'},  ov_bot = ${layer.ovBottom || '—'} kN/m²`;
      else params += `,  γ = ${layer.bulkUnit || '—'} kN/m³,  WT = ${layer.waterTableDepth || '—'} m`;
    }
    return [
      `Layer ${i + 1}`,
      layer.soilType ? layer.soilType.charAt(0).toUpperCase() + layer.soilType.slice(1) : '—',
      `${layer.thickness || '—'} m`,
      layer.soilType === 'sand' ? (ld < 15 ? 'L/D < 15' : 'L/D ≥ 15') : '—',
      params,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Soil Type', 'Thickness', 'L/D Check', 'Input Parameters']],
    body: layerRows,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 20 },
      1: { fontStyle: 'bold', cellWidth: 24 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 22 },
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // Start new page to keep summary and tables together nicely
  doc.addPage();
  y = margin;

  // ── Section 4: Calculation Summary ────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  doc.text('4. Calculation Summary', margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Resistance Component', 'Symbol / Equation', 'Calculated Value']],
    body: [
      ['Clay Shaft Resistance', 'ΣQs (Clay)', `${fmt(totalClaySF)} kN`],
      ['Sand Shaft Resistance', 'ΣQs (Sand)', `${fmt(totalSandSF)} kN`],
      ['Total Shaft Resistance', 'ΣQs = ΣQs(Clay) + ΣQs(Sand)', `${fmt(totalQs)} kN`],
      ['End Bearing Resistance', 'Qp', `${fmt(Qp)} kN`],
      ['Ultimate Pile Capacity', 'Qu = ΣQs + Qp', `${fmt(Qu)} kN`],
      ['Allowable Capacity (Safe Load)', `Qa = Qu / FOS  (FOS = ${FOS})`, `${fmt(Qa)} kN`],
    ],
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { textColor: [100, 116, 139], cellWidth: 120 },
      2: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.fillColor = [241, 245, 249];
      } else if (data.row.index === 5) {
        data.cell.styles.fillColor = LIGHT_GREEN;
        data.cell.styles.textColor = GREEN;
      }
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 5: Layer-wise Resistance Table ────────────────────────────────
  if (y > pageH - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  doc.text('5. Layer-wise Resistance Table', margin, y);
  y += 4;

  const hasClay = layerResults.some(lr => lr.soilType?.toLowerCase() === 'clay');
  const hasSand = layerResults.some(lr => lr.soilType?.toLowerCase() === 'sand');

  const showClay = hasClay;
  const showSand = hasSand;

  const headRow = ['Layer', 'Soil Type', 'Thick.', 'Method'];
  if (showClay) headRow.push('Clay SF');
  if (showSand) headRow.push('Sand SF');
  headRow.push('Qs');
  headRow.push('Qp');
  headRow.push('Qu');
  headRow.push('Qa');

  const resultRows = layerResults.map((lr, i) => {
    const orig = layers[i] || {};
    const ld = (parseFloat(orig.thickness) || 0) / d;
    const method = lr.soilType === 'clay' ? METHOD.clay : ld < 15 ? METHOD.sandLow : METHOD.sandHigh;

    const row = [
      `${lr.layer ?? (i + 1)}`,
      lr.soilType ? lr.soilType.charAt(0).toUpperCase() + lr.soilType.slice(1) : '—',
      `${lr.thickness ?? '—'} m`,
      method,
    ];
    if (showClay) {
      row.push(lr.soilType?.toLowerCase() === 'clay' ? `${fmt(lr.skinFrictionClay ?? lr.shaftResistance)} kN` : '—');
    }
    if (showSand) {
      row.push(lr.soilType?.toLowerCase() === 'sand' ? `${fmt(lr.skinFrictionSand ?? lr.shaftResistance)} kN` : '—');
    }
    row.push(`${fmt(lr.shaftResistance)} kN`);
    row.push(`${fmt(Qp)} kN`);
    row.push(`${fmt(Qu)} kN`);
    row.push(`${fmt(Qa)} kN`);
    return row;
  });

  // Total row
  const totalRow = ['', '', '', 'TOTALS (ΣQs)'];
  if (showClay) {
    totalRow.push(totalClaySF > 0 ? `${fmt(totalClaySF)} kN` : '0.000 kN');
  }
  if (showSand) {
    totalRow.push(totalSandSF > 0 ? `${fmt(totalSandSF)} kN` : '0.000 kN');
  }
  totalRow.push(`${fmt(totalQs)} kN`);
  totalRow.push(`${fmt(Qp)} kN`);
  totalRow.push(`${fmt(Qu)} kN`);
  totalRow.push(`${fmt(Qa)} kN`);
  resultRows.push(totalRow);

  // Column styles mapping
  const colStyles = {
    0: { halign: 'center', cellWidth: 12 },
    1: { fontStyle: 'bold', cellWidth: 18 },
    2: { halign: 'center', cellWidth: 16 },
  };
  let colIndex = 4;
  if (showClay) {
    colStyles[colIndex] = { halign: 'right' };
    colIndex++;
  }
  if (showSand) {
    colStyles[colIndex] = { halign: 'right' };
    colIndex++;
  }
  colStyles[colIndex] = { halign: 'right', fontStyle: 'bold' }; // Qs
  colIndex++;
  colStyles[colIndex] = { halign: 'right' }; // Qp
  colIndex++;
  colStyles[colIndex] = { halign: 'right' }; // Qu
  colIndex++;
  colStyles[colIndex] = { halign: 'right', fontStyle: 'bold' }; // Qa

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [headRow],
    body: resultRows,
    styles: { fontSize: 7.5, cellPadding: 2, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: colStyles,
    didParseCell: (data) => {
      if (data.row.index === resultRows.length - 1) {
        data.cell.styles.fillColor = LIGHT_BLUE;
        data.cell.styles.textColor = BLUE;
        data.cell.styles.fontStyle = 'bold';
      }
    },
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
    ['Sand Shaft (L/D < 15)', 'Qs = K × σ\'v_avg × tan(δ) × C × L    where σ\'v_avg = (σ_top + σ_bot)/2'],
    ['Sand Shaft (L/D ≥ 15)', 'Qs = K × σ\'v_avg × tan(δ) × C × L    where σ\'v computed from unit weights'],
    ['Clay End Bearing', 'Qp = 9 × Cu_tip × Ap  (Skempton)'],
    ['Sand End Bearing', 'Qp = σ\'v_tip × Nq × Ap'],
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

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'This report is for engineering reference only. Consult a licensed geotechnical engineer for design decisions.',
      margin,
      pageH - 3.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 3.5, { align: 'right' });
  }

  doc.save(`pile-capacity-report-${now.toISOString().slice(0, 10)}.pdf`);
}
