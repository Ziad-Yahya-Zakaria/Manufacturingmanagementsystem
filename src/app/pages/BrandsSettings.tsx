/**
 * Brands Settings - CRUD for Product Brands
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
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
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Services } from '@/services/ServiceFactory';
import { Brand } from '@/services/types';

export function BrandsSettings() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    name_ar: '',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      const brds = await Services.brands.getAll();
      setBrands(brds);
    } catch (error) {
      console.error('Failed to load brands:', error);
      toast.error('Failed to load brands');
    }
  }

  function openAddModal() {
    setEditingBrand(null);
    setFormData({ name: '', name_ar: '' });
    onOpen();
  }

  function openEditModal(brand: Brand) {
    setEditingBrand(brand);
    setFormData(brand);
    onOpen();
  }

  async function handleSave() {
    if (!formData.name || !formData.name_ar) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingBrand) {
        await Services.brands.update(editingBrand.id!, formData);
        setBrands((prev) =>
          prev.map((b) => (b.id === editingBrand.id ? { ...b, ...formData } : b))
        );
        toast.success('Brand updated successfully');
      } else {
        const id = await Services.brands.create(formData as Omit<Brand, 'id'>);
        setBrands((prev) => [...prev, { ...formData, id } as Brand]);
        toast.success('Brand created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save brand');
    }
  }

  async function handleDelete() {
    if (!brandToDelete) return;
    
    try {
      await Services.brands.delete(brandToDelete);
      setBrands((prev) => prev.filter((b) => b.id !== brandToDelete));
      toast.success('Brand deleted successfully');
      deleteModal.onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete brand. It may be in use by products.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Brands Settings</h1>
          <p className="text-slate-600">Manage product brands</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus />}
          onPress={openAddModal}
        >
          Add Brand
        </Button>
      </div>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag />
            <h2 className="text-xl font-semibold">Brands ({brands.length})</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Brands table">
            <TableHeader>
              <TableColumn>#</TableColumn>
              <TableColumn>BRAND NAME (ENGLISH)</TableColumn>
              <TableColumn>BRAND NAME (ARABIC)</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No brands found">
              {brands.map((brand, index) => (
                <TableRow key={brand.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-semibold text-lg">{brand.name}</TableCell>
                  <TableCell className="font-semibold text-lg">{brand.name_ar}</TableCell>
                  <TableCell>
                    {brand.created_at
                      ? new Date(brand.created_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => openEditModal(brand)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => {
                          setBrandToDelete(brand.id!);
                          deleteModal.onOpen();
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingBrand ? 'Edit Brand' : 'Add New Brand'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Brand Name (English)"
                placeholder="e.g., Premium Select"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Input
                label="Brand Name (Arabic)"
                placeholder="e.g., بريميوم سيليكت"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingBrand ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this brand? Products using this brand will need to be reassigned.
            </p>
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
