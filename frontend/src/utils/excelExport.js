import * as XLSX from 'xlsx';

/**
 * Exports the pile calculation breakdown table as a clean Excel sheet.
 * Preserves actual numeric values and precision for engineering calculations.
 * 
 * @param {{ diameter: number, layers: object[] }} formData
 * @param {{ layerResults: object[], Qp: number, Qu: number, Qa: number }} results
 */
export function exportTableToExcel(formData, results) {
  const { diameter, layers } = formData;
  const { layerResults, Qp, Qu, Qa } = results;
  const d = parseFloat(diameter) || 1;

  // Determine dynamic column visibility
  const hasClay = layerResults.some(lr => lr.soilType?.toLowerCase() === 'clay');
  const hasSand = layerResults.some(lr => lr.soilType?.toLowerCase() === 'sand');
  
  const showClay = layerResults.length === 0 ? true : hasClay;
  const showSand = layerResults.length === 0 ? true : hasSand;

  const METHOD_LABEL = {
    clay: 'α-Method (Skempton)',
    sandLow: 'Eff. Stress (L/D < 15)',
    sandHigh: 'Eff. Stress (L/D ≥ 15)',
  };

  const SOIL_LABEL = { clay: 'Clay', sand: 'Sand' };

  // Prepare header row
  const headers = ['Layer', 'Soil Type', 'Thickness (m)', 'Method'];
  if (showClay) headers.push('Skin Friction Clay (kN)');
  if (showSand) headers.push('Skin Friction Sand (kN)');
  headers.push('Qs (kN)', 'Qp (kN)', 'Qu (kN)', 'Qa (kN)');

  // Prepare data rows
  const rows = layerResults.map((lr, i) => {
    const layerNo = lr.layer ?? (i + 1);
    const orig = layers[i] || {};
    const ld = (parseFloat(orig.thickness) || parseFloat(lr.thickness) || 0) / d;
    
    const method = lr.soilType === 'clay' ? METHOD_LABEL.clay
                 : ld < 15 ? METHOD_LABEL.sandLow
                 : METHOD_LABEL.sandHigh;

    const rowData = [
      layerNo,
      SOIL_LABEL[lr.soilType] ?? lr.soilType ?? '—',
      parseFloat(lr.thickness) || 0,
      method
    ];

    if (showClay) {
      rowData.push(lr.soilType?.toLowerCase() === 'clay' ? (lr.skinFrictionClay ?? lr.shaftResistance) : null);
    }
    if (showSand) {
      rowData.push(lr.soilType?.toLowerCase() === 'sand' ? (lr.skinFrictionSand ?? lr.shaftResistance) : null);
    }
    
    rowData.push(
      lr.shaftResistance,
      Qp,
      Qu,
      Qa
    );

    return rowData;
  });

  // Calculate totals
  const totalQs = layerResults.reduce((s, lr) => s + (lr.shaftResistance ?? 0), 0);
  const totalClaySF = layerResults.reduce((s, lr) => s + (lr.skinFrictionClay ?? 0), 0);
  const totalSandSF = layerResults.reduce((s, lr) => s + (lr.skinFrictionSand ?? 0), 0);

  const totalRow = ['Totals', '', '', ''];
  if (showClay) totalRow.push(totalClaySF);
  if (showSand) totalRow.push(totalSandSF);
  totalRow.push(totalQs, Qp, Qu, Qa);

  rows.push(totalRow);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths auto-fitted
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach(r => {
      const val = r[i];
      if (val !== undefined && val !== null) {
        const str = typeof val === 'number' ? val.toFixed(3) : val.toString();
        if (str.length > maxLen) maxLen = str.length;
      }
    });
    return { wch: maxLen + 3 };
  });
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pile Calculation');

  // Format file name: Pile_Calculation_Table_YYYY-MM-DD_HH-MM.xlsx
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const filename = `Pile_Calculation_Table_${year}-${month}-${day}_${hours}-${minutes}.xlsx`;

  // Write workbook to file
  XLSX.writeFile(wb, filename);
}
