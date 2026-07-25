/**
 * Formats a numeric value to exactly 3 decimal places.
 * Returns "-" for null, undefined, or NaN.
 * Note: Genuine 0 or 0.0 is formatted to "0.000" as a valid engineering value.
 */
export function formatEngineeringNumber(v) {
  if (v === undefined || v === null) return '-';
  const n = parseFloat(v);
  if (isNaN(n)) return '-';
  return n.toFixed(3);
}

/**
 * Returns the descriptive engineering method name based on layer properties and pile diameter.
 * Categorization rules:
 * - Clay: α-Method (Clay)
 * - Sand (L/D < 15): Effective Stress Method
 * - Sand (L/D >= 15): Critical Depth Method
 */
export function getEngineeringMethod(layer, diameter) {
  if (!layer || !layer.soilType) return '-';
  if (layer.soilType.toLowerCase() === 'clay') {
    return 'α-Method (Clay)';
  }
  
  // Sand layer
  const thickness = parseFloat(layer.thickness) || 0;
  const d = parseFloat(diameter) || 1;
  const ld = thickness / d;
  
  if (ld < 15) {
    return 'Effective Stress Method';
  }
  return 'Critical Depth Method';
}

/**
 * Helper to generate a unique but reproducible Report ID in PCR-YYYYMMDD-HHMMSS format.
 */
export function generateReportId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `PCR-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Generates a unique, valid Excel sheet name under 31 characters.
 * Format: D-[diameter]_L-[length] (e.g. D-0.300_L-8.000)
 */
export function generateExcelSheetName(diameter, length, existingNames = []) {
  const baseName = `D-${parseFloat(diameter).toFixed(3)}_L-${parseFloat(length).toFixed(1)}`;
  let sheetName = baseName.substring(0, 31);
  let counter = 1;
  
  while (existingNames.includes(sheetName)) {
    const suffix = `_${counter}`;
    sheetName = `${baseName.substring(0, 31 - suffix.length)}${suffix}`;
    counter++;
  }
  
  return sheetName;
}

/**
 * Shared styling configuration for geotechnical engineering tables.
 */
export const ENGINEERING_TABLE = {
  table: "min-w-full border-collapse rounded-lg overflow-hidden",
  header: "bg-blue-600 text-white uppercase text-sm font-semibold tracking-wide",
  headerCell: "px-4 py-3 text-center border border-blue-700",
  bodyCell: "px-4 py-3 border border-gray-200 text-center",
  row: "hover:bg-blue-50 transition-colors",
};

