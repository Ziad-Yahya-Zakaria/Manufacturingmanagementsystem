/**
 * Dexie.js Database Schema - Offline-First IndexedDB
 */

import Dexie, { Table } from 'dexie';
import {
  Brand,
  Product,
  ProductionEntry,
  FreshProductionItem,
  FrozenProductionItem,
} from './types';

export class MiniBoDatabase extends Dexie {
  brands!: Table<Brand, number>;
  products!: Table<Product, number>;
  production_entries!: Table<ProductionEntry, number>;
  fresh_items!: Table<FreshProductionItem, number>;
  frozen_items!: Table<FrozenProductionItem, number>;

  constructor() {
    super('MiniBoEnterpriseDB');

    this.version(1).stores({
      brands: '++id, name, name_ar, created_at',
      products: '++id, name, name_ar, sku, brand_id, unit_weight, created_at',
      production_entries:
        '++id, production_date, shift, production_type, supervisor_name, created_at, updated_at',
      fresh_items:
        '++id, entry_id, product_id, total_quantity, total_weight',
      frozen_items:
        '++id, entry_id, product_id, quantity_boxes, net_weight, gross_weight',
    });
  }

  /**
   * Seed initial data for development/demo purposes
   */
  async seedInitialData() {
    const brandCount = await this.brands.count();
    
    if (brandCount === 0) {
      // Seed Brands
      const brandIds = await this.brands.bulkAdd([
        { name: 'Premium Select', name_ar: 'بريميوم سيليكت', created_at: new Date() },
        { name: 'Golden Harvest', name_ar: 'الحصاد الذهبي', created_at: new Date() },
        { name: 'Fresh Valley', name_ar: 'الوادي الطازج', created_at: new Date() },
      ], { allKeys: true });

      // Seed Products
      await this.products.bulkAdd([
        {
          name: 'Chicken Breast Fillet',
          name_ar: 'فيليه صدور الدجاج',
          sku: 'CHK-BRF-001',
          unit_weight: 0.25,
          brand_id: brandIds[0] as number,
          created_at: new Date(),
        },
        {
          name: 'Chicken Wings',
          name_ar: 'أجنحة الدجاج',
          sku: 'CHK-WNG-002',
          unit_weight: 0.15,
          brand_id: brandIds[0] as number,
          created_at: new Date(),
        },
        {
          name: 'Chicken Thighs',
          name_ar: 'أفخاذ الدجاج',
          sku: 'CHK-THG-003',
          unit_weight: 0.3,
          brand_id: brandIds[1] as number,
          created_at: new Date(),
        },
        {
          name: 'Chicken Drumsticks',
          name_ar: 'سيقان الدجاج',
          sku: 'CHK-DRM-004',
          unit_weight: 0.2,
          brand_id: brandIds[1] as number,
          created_at: new Date(),
        },
        {
          name: 'Whole Chicken',
          name_ar: 'دجاج كامل',
          sku: 'CHK-WHL-005',
          unit_weight: 1.5,
          brand_id: brandIds[2] as number,
          created_at: new Date(),
        },
        {
          name: 'Chicken Liver',
          name_ar: 'كبدة الدجاج',
          sku: 'CHK-LVR-006',
          unit_weight: 0.5,
          brand_id: brandIds[2] as number,
          created_at: new Date(),
        },
        {
          name: 'Ground Chicken',
          name_ar: 'دجاج مفروم',
          sku: 'CHK-GRD-007',
          unit_weight: 0.5,
          brand_id: brandIds[0] as number,
          created_at: new Date(),
        },
      ]);

      console.log('✅ Initial data seeded successfully');
    }
  }
}

// Singleton instance
export const db = new MiniBoDatabase();

// Initialize and seed data
db.on('ready', () => {
  db.seedInitialData();
});
