/**
 * Export Utilities - Excel & PDF Generation
 */

import ExcelJS from 'exceljs';
import { Product, ProductionEntry, FreshProductionItem, FrozenProductionItem } from '@/services/types';
import { formatDate, formatWeight, calculateFreshTotalQuantity, calculateTotalWeight } from './calculations';

// ============================================================================
// EXCEL EXPORT
// ============================================================================

export async function exportFreshToExcel(
  entry: ProductionEntry,
  items: FreshProductionItem[],
  products: Product[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Fresh Production Report');

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // #
    { width: 25 }, // Product Name
    { width: 15 }, // SKU
    ...Array(12).fill({ width: 8 }), // Hours 1-12
    { width: 12 }, // Total Qty
    { width: 12 }, // Total Weight
  ];

  // Title Row
  worksheet.mergeCells('A1:P1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Fresh Production Report - ${formatDate(entry.production_date, 'en')}`;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Deep blue
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Metadata
  worksheet.mergeCells('A2:D2');
  worksheet.getCell('A2').value = `Shift: ${entry.shift.toUpperCase()}`;
  worksheet.mergeCells('E2:H2');
  worksheet.getCell('E2').value = `Supervisor: ${entry.supervisor_name}`;

  // Header Row
  const headerRow = worksheet.addRow([
    '#',
    'Product Name',
    'SKU',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'H7', 'H8', 'H9', 'H10', 'H11', 'H12',
    'Total Qty',
    'Total Weight (kg)',
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Data Rows
  items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    const totalQty = calculateFreshTotalQuantity(item);
    const totalWeight = calculateTotalWeight(totalQty, product.unit_weight);

    const row = worksheet.addRow([
      index + 1,
      product.name,
      product.sku,
      item.hour_1 || 0,
      item.hour_2 || 0,
      item.hour_3 || 0,
      item.hour_4 || 0,
      item.hour_5 || 0,
      item.hour_6 || 0,
      item.hour_7 || 0,
      item.hour_8 || 0,
      item.hour_9 || 0,
      item.hour_10 || 0,
      item.hour_11 || 0,
      item.hour_12 || 0,
      totalQty,
      totalWeight,
    ]);

    row.alignment = { horizontal: 'center', vertical: 'middle' };
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' },
      };
    }
  });

  // Borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 3) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Fresh_Production_${entry.production_date}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportFrozenToExcel(
  entry: ProductionEntry,
  items: FrozenProductionItem[],
  products: Product[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Frozen Production Report');

  worksheet.columns = [
    { width: 5 }, // #
    { width: 30 }, // Product Name
    { width: 15 }, // SKU
    { width: 15 }, // Quantity (Boxes)
    { width: 15 }, // Net Weight
    { width: 15 }, // Gross Weight
    { width: 30 }, // Notes
  ];

  // Title
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Frozen Production Report - ${formatDate(entry.production_date, 'en')}`;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Metadata
  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = `Shift: ${entry.shift.toUpperCase()}`;
  worksheet.mergeCells('D2:G2');
  worksheet.getCell('D2').value = `Supervisor: ${entry.supervisor_name}`;

  // Header
  const headerRow = worksheet.addRow([
    '#',
    'Product Name',
    'SKU',
    'Quantity (Boxes)',
    'Net Weight (kg)',
    'Gross Weight (kg)',
    'Notes',
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Data
  items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    const row = worksheet.addRow([
      index + 1,
      product.name,
      product.sku,
      item.quantity_boxes,
      item.net_weight,
      item.gross_weight,
      item.notes || '',
    ]);

    row.alignment = { horizontal: 'center', vertical: 'middle' };
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' },
      };
    }
  });

  // Borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 3) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Frozen_Production_${entry.production_date}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
