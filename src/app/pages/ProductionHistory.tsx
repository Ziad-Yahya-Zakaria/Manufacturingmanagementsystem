/**
 * Production History - View, Print, and Export Past Entries
 */

import { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Printer, Download, Trash2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { Services } from '@/services/ServiceFactory';
import {
  ProductionEntry,
  Product,
  FreshProductionItem,
  FrozenProductionItem,
  ProductionType,
} from '@/services/types';
import { formatDate, getShiftName, getProductionTypeName } from '@/utils/calculations';
import { exportFreshToExcel, exportFrozenToExcel } from '@/utils/exportUtils';
import { PrintableReport } from '../components/PrintableReport';

export function ProductionHistory() {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ProductionType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ProductionEntry | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allEntries, allProducts] = await Promise.all([
        Services.production.getAllEntries(),
        Services.products.getAll(),
      ]);
      
      setEntries(allEntries);
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load production history');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewEntry(entry: ProductionEntry) {
    try {
      let items;
      if (entry.production_type === ProductionType.FRESH) {
        items = await Services.production.getFreshItemsByEntryId(entry.id!);
      } else {
        items = await Services.production.getFrozenItemsByEntryId(entry.id!);
      }
      
      setSelectedEntry(entry);
      setSelectedItems(items);
      onOpen();
    } catch (error) {
      console.error('Failed to load entry details:', error);
      toast.error('Failed to load entry details');
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  async function handlePrintEntry(entry: ProductionEntry) {
    await handleViewEntry(entry);
    setTimeout(() => handlePrint(), 100);
  }

  async function handleExportExcel(entry: ProductionEntry) {
    try {
      let items;
      if (entry.production_type === ProductionType.FRESH) {
        items = await Services.production.getFreshItemsByEntryId(entry.id!);
        await exportFreshToExcel(entry, items, products);
      } else {
        items = await Services.production.getFrozenItemsByEntryId(entry.id!);
        await exportFrozenToExcel(entry, items, products);
      }
      
      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export to Excel');
    }
  }

  async function handleDelete() {
    if (!entryToDelete) return;
    
    try {
      await Services.production.deleteEntry(entryToDelete);
      setEntries((prev) => prev.filter((e) => e.id !== entryToDelete));
      toast.success('Entry deleted successfully');
      deleteModal.onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete entry');
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      filter === '' ||
      entry.supervisor_name.toLowerCase().includes(filter.toLowerCase()) ||
      entry.production_date.includes(filter);
    
    const matchesType = typeFilter === 'all' || entry.production_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Production History</h1>
        <p className="text-slate-600">View, print, and export past production entries</p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <Input
              placeholder="Search by date or supervisor..."
              startContent={<Search size={18} />}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1"
            />
            <Select
              label="Type"
              selectedKeys={[typeFilter]}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-64"
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              <SelectItem key={ProductionType.FRESH} value={ProductionType.FRESH}>
                Fresh Production
              </SelectItem>
              <SelectItem key={ProductionType.FROZEN} value={ProductionType.FROZEN}>
                Frozen Production
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            Production Entries ({filteredEntries.length})
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No entries found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Chip
                        color={entry.production_type === ProductionType.FRESH ? 'success' : 'primary'}
                        variant="flat"
                      >
                        {getProductionTypeName(entry.production_type, 'en')}
                      </Chip>
                      <Chip variant="bordered">
                        {getShiftName(entry.shift, 'en')}
                      </Chip>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Date:</span>{' '}
                        <span className="font-medium">{formatDate(entry.production_date, 'en')}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Supervisor:</span>{' '}
                        <span className="font-medium">{entry.supervisor_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Created:</span>{' '}
                        <span className="font-medium">
                          {new Date(entry.created_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<FileText size={16} />}
                      onPress={() => handleViewEntry(entry)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      color="primary"
                      startContent={<Printer size={16} />}
                      onPress={() => handlePrintEntry(entry)}
                    >
                      Print
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      color="success"
                      startContent={<Download size={16} />}
                      onPress={() => handleExportExcel(entry)}
                    >
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      color="danger"
                      isIconOnly
                      onPress={() => {
                        setEntryToDelete(entry.id!);
                        deleteModal.onOpen();
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* View Modal */}
      <Modal size="5xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">Production Entry Details</h3>
          </ModalHeader>
          <ModalBody>
            {selectedEntry && selectedItems && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Date</p>
                    <p className="font-semibold">{formatDate(selectedEntry.production_date, 'en')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Shift</p>
                    <p className="font-semibold">{getShiftName(selectedEntry.shift, 'en')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Supervisor</p>
                    <p className="font-semibold">{selectedEntry.supervisor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type</p>
                    <p className="font-semibold">
                      {getProductionTypeName(selectedEntry.production_type, 'en')}
                    </p>
                  </div>
                </div>
                
                {selectedEntry.notes && (
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Notes</p>
                    <p>{selectedEntry.notes}</p>
                  </div>
                )}

                <div className="text-sm text-slate-600">
                  Total Items: {selectedItems.length}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this production entry? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={deleteModal.onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hidden Print Component */}
      <div className="hidden">
        {selectedEntry && selectedItems && (
          <PrintableReport
            ref={printRef}
            entry={selectedEntry}
            items={selectedItems}
            products={products}
          />
        )}
      </div>
    </div>
  );
}
