/**
 * Frozen Production Entry Page
 * Features: Boxes/Weight entry grid, SKU hidden in operator view
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
import { useReactToPrint } from 'react-to-print';
import { Services } from '@/services/ServiceFactory';
import {
  Product,
  FrozenProductionItem,
  ProductionType,
  ProductionEntry,
} from '@/services/types';
import { formatDateISO, formatWeight } from '@/utils/calculations';
import { PrintableReport } from '../components/PrintableReport';

export function FrozenProduction() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [entry, setEntry] = useState<Partial<ProductionEntry>>({
    production_date: formatDateISO(new Date()),
    shift: 'morning',
    production_type: ProductionType.FROZEN,
    supervisor_name: '',
    notes: '',
  });
  
  const [items, setItems] = useState<Partial<FrozenProductionItem>[]>([]);
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
          quantity_boxes: 0,
          net_weight: 0,
          gross_weight: 0,
          notes: '',
        }))
      );
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  }

  function updateItem(productId: number, field: keyof FrozenProductionItem, value: any) {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, [field]: value }
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
        .filter((item) => item.quantity_boxes! > 0)
        .map((item) => ({
          ...item,
          entry_id: entryId,
        } as Omit<FrozenProductionItem, 'id'>));

      if (itemsToSave.length > 0) {
        await Services.production.createFrozenItems(itemsToSave);
      }

      toast.success('Frozen production entry saved successfully!');
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
            <h1 className="text-3xl font-bold text-slate-900">Frozen Production Entry</h1>
            <p className="text-slate-600">تقرير المجمد - Boxes & Weight Log</p>
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
          <h2 className="text-xl font-semibold">Frozen Production Grid</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-slate-300 px-3 py-2 text-left w-1/4">
                    Product
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center w-1/6">
                    Quantity (Boxes)
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center w-1/6">
                    Net Weight (kg)
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center w-1/6">
                    Gross Weight (kg)
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left w-1/4">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, pIndex) => {
                  const item = items.find((i) => i.product_id === product.id);
                  if (!item) return null;

                  return (
                    <tr key={product.id} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 px-3 py-2">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-600">{product.name_ar}</div>
                      </td>
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.quantity_boxes || ''}
                          onChange={(e) => updateItem(product.id!, 'quantity_boxes', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.net_weight || ''}
                          onChange={(e) => updateItem(product.id!, 'net_weight', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.gross_weight || ''}
                          onChange={(e) => updateItem(product.id!, 'gross_weight', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.notes || ''}
                          onChange={(e) => updateItem(product.id!, 'notes', e.target.value)}
                        />
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
            items={items as FrozenProductionItem[]}
            products={products}
          />
        )}
      </div>
    </div>
  );
}
