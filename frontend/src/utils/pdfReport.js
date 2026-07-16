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

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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

  // ── Section 1: Pile Geometry ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('1. Pile Geometry', margin, y);
  y += 5;

  // Geometry table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Parameter', 'Symbol', 'Value']],
    body: [
      ['Pile Diameter',         'D',    `${fmt(d, 3)} m`],
      ['Pile Perimeter',        'C = πD',  `${fmt(perimeter, 4)} m`],
      ['Pile Tip Area',         'Ap = πD²/4', `${fmt(tipArea, 6)} m²`],
      ['Number of Soil Layers', 'n',    `${layers.length}`],
      ['Factor of Safety',      'FOS',  `${FOS}`],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: DARK,
    },
    headStyles: {
      fillColor: DARK,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 40, textColor: [100, 116, 139] },
      2: { halign: 'right', fontStyle: 'bold' },
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 2: Soil Profile Input ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('2. Soil Layer Input Parameters', margin, y);
  y += 5;

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
      `${i + 1}`,
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
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 24 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 22 },
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 3: Layer-wise Results ─────────────────────────────────────────
  // Check if we need a new page
  if (y > pageH - 80) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('3. Layer-wise Shaft Resistance', margin, y);
  y += 5;

  const resultRows = layerResults.map((lr, i) => {
    const orig = layers[i] || {};
    const ld = (parseFloat(orig.thickness) || 0) / d;
    const method = lr.soilType === 'clay' ? METHOD.clay : ld < 15 ? METHOD.sandLow : METHOD.sandHigh;
    return [
      `${lr.layer ?? (i + 1)}`,
      lr.soilType ? lr.soilType.charAt(0).toUpperCase() + lr.soilType.slice(1) : '—',
      `${lr.thickness ?? '—'} m`,
      method,
      lr.soilType === 'clay' ? `${fmt(lr.skinFrictionClay ?? lr.shaftResistance)} kN` : '—',
      lr.soilType === 'sand' ? `${fmt(lr.skinFrictionSand ?? lr.shaftResistance)} kN` : '—',
      `${fmt(lr.shaftResistance)} kN`,
    ];
  });

  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  // Total row
  resultRows.push([
    '', '', '',
    'TOTALS  (ΣQs)',
    totalClaySF > 0 ? `${fmt(totalClaySF)} kN` : '—',
    totalSandSF > 0 ? `${fmt(totalSandSF)} kN` : '—',
    `${fmt(totalQs)} kN`,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Layer', 'Soil Type', 'Thick.', 'Method', 'Clay Skin Friction', 'Sand Skin Friction', 'Shaft Resistance']],
    body: resultRows,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { fontStyle: 'bold', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === resultRows.length - 1) {
        data.cell.styles.fillColor = LIGHT_BLUE;
        data.cell.styles.textColor = BLUE;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    theme: 'striped',
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Section 4: Summary ────────────────────────────────────────────────────
  if (y > pageH - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('4. Capacity Summary', margin, y);
  y += 6;

  // Summary boxes
  const summaryItems = [
    { label: 'Total Shaft Resistance',   symbol: 'ΣQs', value: fmt(totalQs), unit: 'kN', fill: LIGHT_BLUE,  text: BLUE  },
    { label: 'End Bearing Resistance',   symbol: 'Qp',  value: fmt(Qp),      unit: 'kN', fill: LIGHT_GRAY,  text: DARK  },
    { label: 'Ultimate Pile Capacity',   symbol: 'Qu',  value: fmt(Qu),      unit: 'kN', fill: [241,245,249], text: DARK },
    { label: 'Allowable Pile Capacity',  symbol: 'Qa',  value: fmt(Qa),      unit: 'kN', fill: LIGHT_GREEN, text: GREEN },
  ];

  const boxW = (contentW - 9) / 2;
  const boxH = 22;
  let col = 0, row = 0;

  summaryItems.forEach((item, idx) => {
    col = idx % 2;
    row = Math.floor(idx / 2);
    const bx = margin + col * (boxW + 3);
    const by = y + row * (boxH + 3);

    doc.setFillColor(...item.fill);
    doc.roundedRect(bx, by, boxW, boxH, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...item.text);
    doc.text(item.label.toUpperCase(), bx + 4, by + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.symbol, bx + boxW - 4, by + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...item.text);
    doc.text(item.value, bx + 4, by + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.unit, bx + boxW - 4, by + 17, { align: 'right' });
  });

  y += 2 * (boxH + 3) + 10;

  // ── Formula Reference ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text('5. Formula Reference', margin, y);
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
