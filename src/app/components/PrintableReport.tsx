/**
 * ISO Smart-Pagination Print Engine
 * Implements chunking algorithm: Max 6 items per page with repeated headers/footers
 */

import React from 'react';
import {
  Product,
  ProductionEntry,
  FreshProductionItem,
  FrozenProductionItem,
  ProductionType,
} from '@/services/types';
import {
  formatDate,
  getShiftName,
  calculateFreshTotalQuantity,
  calculateTotalWeight,
  formatWeight,
} from '@/utils/calculations';

interface PrintableReportProps {
  entry: ProductionEntry;
  items: FreshProductionItem[] | FrozenProductionItem[];
  products: Product[];
}

const ITEMS_PER_PAGE = 6;

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ entry, items, products }, ref) => {
    // Filter out items with zero quantity
    const filteredItems = items.filter((item) => {
      if ('hour_1' in item) {
        return calculateFreshTotalQuantity(item) > 0;
      } else {
        return item.quantity_boxes > 0;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
      const startIndex = pageIndex * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filteredItems.slice(startIndex, endIndex);
    });

    const isFresh = entry.production_type === ProductionType.FRESH;

    return (
      <div ref={ref} className="print-container">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .print-container {
              width: 100%;
            }
            
            .a4-page {
              width: 100%;
              page-break-after: always;
              page-break-inside: avoid;
              background: white;
            }
            
            .a4-page:last-child {
              page-break-after: auto;
            }
            
            .print-header,
            .print-footer {
              page-break-inside: avoid;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #334155;
              padding: 4px 6px;
              text-align: center;
              font-size: 10pt;
            }
            
            .print-table th {
              background-color: #1e3a8a !important;
              color: white !important;
              font-weight: bold;
            }
            
            .print-table tbody tr:nth-child(even) {
              background-color: #f1f5f9 !important;
            }
            
            .no-print {
              display: none !important;
            }
          }
          
          @media screen {
            .a4-page {
              width: 297mm;
              min-height: 210mm;
              background: white;
              margin: 20px auto;
              padding: 10mm;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
          }
        `}</style>

        {pages.map((pageItems, pageIndex) => (
          <div key={pageIndex} className="a4-page">
            {/* HEADER - Repeats on every page */}
            <div className="print-header mb-4">
              <div className="text-center mb-3">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Mini Bo Enterprise - Ultimate Edition
                </h1>
                <h2 className="text-xl font-semibold text-blue-900">
                  {isFresh ? 'تقرير الفريش - Fresh Production Report' : 'تقرير المجمد - Frozen Production Report'}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3 border border-slate-300 p-2 bg-slate-50">
                <div>
                  <strong>التاريخ / Date:</strong> {formatDate(entry.production_date, 'ar')}
                </div>
                <div>
                  <strong>الوردية / Shift:</strong> {getShiftName(entry.shift, 'ar')} / {getShiftName(entry.shift, 'en')}
                </div>
                <div>
                  <strong>المشرف / Supervisor:</strong> {entry.supervisor_name}
                </div>
              </div>

              <div className="text-right text-xs text-slate-600 mb-2">
                Page {pageIndex + 1} of {totalPages}
              </div>
            </div>

            {/* TABLE CONTENT */}
            {isFresh ? (
              <FreshTable items={pageItems as FreshProductionItem[]} products={products} />
            ) : (
              <FrozenTable items={pageItems as FrozenProductionItem[]} products={products} />
            )}

            {/* FOOTER - Repeats on every page */}
            <div className="print-footer mt-6">
              <div className="border-t-2 border-slate-300 pt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Prepared By:</div>
                  <div className="mt-2 border-b border-slate-400 w-40"></div>
                  <div className="text-xs text-slate-500 mt-1">Signature & Date</div>
                </div>
                <div>
                  <div className="font-semibold">Reviewed By:</div>
                  <div className="mt-2 border-b border-slate-400 w-40"></div>
                  <div className="text-xs text-slate-500 mt-1">Signature & Date</div>
                </div>
                <div>
                  <div className="font-semibold">Approved By:</div>
                  <div className="mt-2 border-b border-slate-400 w-40"></div>
                  <div className="text-xs text-slate-500 mt-1">Signature & Date</div>
                </div>
              </div>

              {entry.notes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
                  <strong>Notes:</strong> {entry.notes}
                </div>
              )}

              <div className="text-center text-xs text-slate-500 mt-3">
                Generated on {new Date().toLocaleString('en-US')} | Mini Bo Enterprise - ISO Compliant Report
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';

// ============================================================================
// FRESH TABLE COMPONENT
// ============================================================================

function FreshTable({ items, products }: { items: FreshProductionItem[]; products: Product[] }) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th rowSpan={2}>#</th>
          <th rowSpan={2}>المنتج<br/>Product</th>
          <th colSpan={12}>الساعات / Hours</th>
          <th rowSpan={2}>المجموع<br/>Total Qty</th>
          <th rowSpan={2}>الوزن الكلي<br/>Total Weight (kg)</th>
        </tr>
        <tr>
          {Array.from({ length: 12 }, (_, i) => (
            <th key={i}>{i + 1}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const product = products.find((p) => p.id === item.product_id);
          if (!product) return null;

          const totalQty = calculateFreshTotalQuantity(item);
          const totalWeight = calculateTotalWeight(totalQty, product.unit_weight);

          return (
            <tr key={item.id || index}>
              <td>{index + 1}</td>
              <td className="text-left px-2">
                {product.name_ar}<br/>
                <span className="text-xs text-slate-600">{product.name}</span>
              </td>
              <td>{item.hour_1 || '-'}</td>
              <td>{item.hour_2 || '-'}</td>
              <td>{item.hour_3 || '-'}</td>
              <td>{item.hour_4 || '-'}</td>
              <td>{item.hour_5 || '-'}</td>
              <td>{item.hour_6 || '-'}</td>
              <td>{item.hour_7 || '-'}</td>
              <td>{item.hour_8 || '-'}</td>
              <td>{item.hour_9 || '-'}</td>
              <td>{item.hour_10 || '-'}</td>
              <td>{item.hour_11 || '-'}</td>
              <td>{item.hour_12 || '-'}</td>
              <td className="font-bold">{totalQty}</td>
              <td className="font-bold">{formatWeight(totalWeight)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ============================================================================
// FROZEN TABLE COMPONENT
// ============================================================================

function FrozenTable({ items, products }: { items: FrozenProductionItem[]; products: Product[] }) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th>#</th>
          <th>المنتج / Product</th>
          <th>العدد (كراتين)<br/>Quantity (Boxes)</th>
          <th>الوزن الصافي<br/>Net Weight (kg)</th>
          <th>الوزن الإجمالي<br/>Gross Weight (kg)</th>
          <th>ملاحظات<br/>Notes</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const product = products.find((p) => p.id === item.product_id);
          if (!product) return null;

          return (
            <tr key={item.id || index}>
              <td>{index + 1}</td>
              <td className="text-left px-2">
                {product.name_ar}<br/>
                <span className="text-xs text-slate-600">{product.name}</span>
              </td>
              <td className="font-bold">{item.quantity_boxes}</td>
              <td className="font-bold">{formatWeight(item.net_weight)}</td>
              <td className="font-bold">{formatWeight(item.gross_weight)}</td>
              <td className="text-xs text-left px-2">{item.notes || '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
