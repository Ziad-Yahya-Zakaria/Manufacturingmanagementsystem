/**
 * Fresh Production Entry Page
 * Features: Hours-based entry grid, SKU hidden in operator view, real-time calculations
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import { Save, Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Services } from '@/services/ServiceFactory';
import {
  Product,
  FreshProductionItem,
  ProductionType,
  ProductionEntry,
} from '@/services/types';
import { calculateFreshTotalQuantity, calculateTotalWeight, formatWeight, formatDateISO } from '@/utils/calculations';
import { PrintableReport } from '../components/PrintableReport';
import { useReactToPrint } from 'react-to-print';

export function FreshProduction() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [entry, setEntry] = useState<Partial<ProductionEntry>>({
    production_date: formatDateISO(new Date()),
    shift: 'morning',
    production_type: ProductionType.FRESH,
    supervisor_name: '',
    notes: '',
  });
  
  const [items, setItems] = useState<Partial<FreshProductionItem>[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const prods = await Services.products.getAll();
      setProducts(prods);
      
      // Initialize items grid
      setItems(
        prods.map((p) => ({
          product_id: p.id!,
          hour_1: 0,
          hour_2: 0,
          hour_3: 0,
          hour_4: 0,
          hour_5: 0,
          hour_6: 0,
          hour_7: 0,
          hour_8: 0,
          hour_9: 0,
          hour_10: 0,
          hour_11: 0,
          hour_12: 0,
        }))
      );
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  }

  function updateItemHour(productId: number, hour: number, value: string) {
    const numValue = parseInt(value) || 0;
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, [`hour_${hour}`]: numValue }
          : item
      )
    );
  }

  async function handleSave() {
    if (!entry.supervisor_name) {
      toast.error('Please enter supervisor name');
      return;
    }

    setSaving(true);
    try {
      // Create entry
      const entryId = await Services.production.createEntry(entry as Omit<ProductionEntry, 'id'>);
      
      // Filter and add items with production
      const itemsToSave = items
        .filter((item) => calculateFreshTotalQuantity(item as FreshProductionItem) > 0)
        .map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          const totalQty = calculateFreshTotalQuantity(item as FreshProductionItem);
          const totalWeight = calculateTotalWeight(totalQty, product?.unit_weight || 0);
          
          return {
            ...item,
            entry_id: entryId,
            total_quantity: totalQty,
            total_weight: totalWeight,
          } as Omit<FreshProductionItem, 'id'>;
        });

      if (itemsToSave.length > 0) {
        await Services.production.createFreshItems(itemsToSave);
      }

      toast.success('Fresh production entry saved successfully!');
      navigate('/history');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  function showPrintPreview() {
    if (!entry.supervisor_name) {
      toast.error('Please fill in all required fields before printing');
      return;
    }
    handlePrint();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate('/')}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Fresh Production Entry</h1>
            <p className="text-slate-600">تقرير الفريش - Hourly Production Log</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="default"
            variant="bordered"
            startContent={<Printer />}
            onPress={showPrintPreview}
          >
            Print Preview
          </Button>
          <Button
            color="success"
            startContent={<Save />}
            onPress={handleSave}
            isLoading={saving}
          >
            Save Entry
          </Button>
        </div>
      </div>

      {/* Entry Metadata */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Entry Information</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Production Date"
              value={entry.production_date}
              onChange={(e) => setEntry({ ...entry, production_date: e.target.value })}
              isRequired
            />
            <Select
              label="Shift"
              selectedKeys={[entry.shift || 'morning']}
              onChange={(e) => setEntry({ ...entry, shift: e.target.value as 'morning' | 'evening' })}
              isRequired
            >
              <SelectItem key="morning" value="morning">
                Morning - صباحي
              </SelectItem>
              <SelectItem key="evening" value="evening">
                Evening - مسائي
              </SelectItem>
            </Select>
            <Input
              label="Supervisor Name"
              placeholder="Enter supervisor name"
              value={entry.supervisor_name}
              onChange={(e) => setEntry({ ...entry, supervisor_name: e.target.value })}
              isRequired
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Notes (Optional)"
              placeholder="Additional notes..."
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Production Grid */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Hourly Production Grid</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-slate-300 px-3 py-2 text-left sticky left-0 bg-blue-900 z-10">
                    Product
                  </th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="border border-slate-300 px-2 py-2 text-center min-w-[60px]">
                      H{i + 1}
                    </th>
                  ))}
                  <th className="border border-slate-300 px-3 py-2 text-center min-w-[80px]">
                    Total Qty
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center min-w-[100px]">
                    Total Weight (kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, pIndex) => {
                  const item = items.find((i) => i.product_id === product.id);
                  if (!item) return null;

                  const totalQty = calculateFreshTotalQuantity(item as FreshProductionItem);
                  const totalWeight = calculateTotalWeight(totalQty, product.unit_weight);

                  return (
                    <tr key={product.id} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 px-3 py-2 sticky left-0 bg-inherit z-10">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-600">{product.name_ar}</div>
                      </td>
                      {Array.from({ length: 12 }, (_, h) => (
                        <td key={h} className="border border-slate-300 px-1 py-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1 text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            value={item[`hour_${h + 1}` as keyof FreshProductionItem] || ''}
                            onChange={(e) => updateItemHour(product.id!, h + 1, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-900">
                        {totalQty}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-center font-bold text-blue-900">
                        {formatWeight(totalWeight)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Hidden Print Component */}
      <div className="hidden">
        {entry.supervisor_name && (
          <PrintableReport
            ref={printRef}
            entry={entry as ProductionEntry}
            items={items as FreshProductionItem[]}
            products={products}
          />
        )}
      </div>
    </div>
  );
}
