/**
 * Products Settings - CRUD with SKU Visible
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Services } from '@/services/ServiceFactory';
import { Product, Brand } from '@/services/types';

export function ProductsSettings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    name_ar: '',
    sku: '',
    unit_weight: 0,
    brand_id: 0,
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prods, brds] = await Promise.all([
        Services.products.getAll(),
        Services.brands.getAll(),
      ]);
      setProducts(prods);
      setBrands(brds);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load products');
    }
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: '',
      name_ar: '',
      sku: '',
      unit_weight: 0,
      brand_id: brands[0]?.id || 0,
    });
    onOpen();
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    onOpen();
  }

  async function handleSave() {
    if (!formData.name || !formData.name_ar || !formData.sku || !formData.brand_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        await Services.products.update(editingProduct.id!, formData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...formData } : p))
        );
        toast.success('Product updated successfully');
      } else {
        const id = await Services.products.create(formData as Omit<Product, 'id'>);
        setProducts((prev) => [...prev, { ...formData, id } as Product]);
        toast.success('Product created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save product');
    }
  }

  async function handleDelete() {
    if (!productToDelete) return;
    
    try {
      await Services.products.delete(productToDelete);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
      toast.success('Product deleted successfully');
      deleteModal.onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete product');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Products Settings</h1>
          <p className="text-slate-600">Manage product catalog with SKU tracking</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus />}
          onPress={openAddModal}
        >
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package />
            <h2 className="text-xl font-semibold">Products ({products.length})</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Products table">
            <TableHeader>
              <TableColumn>#</TableColumn>
              <TableColumn>PRODUCT NAME</TableColumn>
              <TableColumn>ARABIC NAME</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>UNIT WEIGHT (KG)</TableColumn>
              <TableColumn>BRAND</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No products found">
              {products.map((product, index) => {
                const brand = brands.find((b) => b.id === product.brand_id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-medium">{product.name_ar}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-sm font-mono">
                        {product.sku}
                      </span>
                    </TableCell>
                    <TableCell>{product.unit_weight.toFixed(2)}</TableCell>
                    <TableCell>{brand?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => openEditModal(product)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => {
                            setProductToDelete(product.id!);
                            deleteModal.onOpen();
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Product Name (English)"
                  placeholder="e.g., Chicken Breast"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isRequired
                />
                <Input
                  label="Product Name (Arabic)"
                  placeholder="e.g., صدور الدجاج"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  isRequired
                />
              </div>
              
              <Input
                label="SKU"
                placeholder="e.g., CHK-BRF-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                isRequired
                description="Stock Keeping Unit - Must be unique"
              />
              
              <Input
                type="number"
                label="Unit Weight (kg)"
                placeholder="e.g., 0.25"
                value={formData.unit_weight?.toString()}
                onChange={(e) => setFormData({ ...formData, unit_weight: parseFloat(e.target.value) || 0 })}
                isRequired
                step="0.01"
                min="0"
              />
              
              <Select
                label="Brand"
                selectedKeys={formData.brand_id ? [formData.brand_id.toString()] : []}
                onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })}
                isRequired
              >
                {brands.map((brand) => (
                  <SelectItem key={brand.id!.toString()} value={brand.id!.toString()}>
                    {brand.name} - {brand.name_ar}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
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
    </div>
  );
}
