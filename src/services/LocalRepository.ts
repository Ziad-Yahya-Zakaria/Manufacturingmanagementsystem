/**
 * Local Repository Implementation using Dexie.js (IndexedDB)
 * This is the ACTIVE mode for offline-first functionality
 */

import { db } from './database';
import {
  Brand,
  Product,
  ProductionEntry,
  FreshProductionItem,
  FrozenProductionItem,
  ProductionType,
  IRepository,
  IProductionRepository,
} from './types';

// ============================================================================
// GENERIC REPOSITORY IMPLEMENTATION
// ============================================================================

class GenericLocalRepository<T> implements IRepository<T> {
  constructor(private table: any) {}

  async getAll(): Promise<T[]> {
    return await this.table.toArray();
  }

  async getById(id: number): Promise<T | undefined> {
    return await this.table.get(id);
  }

  async create(item: Omit<T, 'id'>): Promise<number> {
    const id = await this.table.add(item);
    return id;
  }

  async update(id: number, item: Partial<T>): Promise<void> {
    await this.table.update(id, item);
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id);
  }

  async bulkCreate(items: Omit<T, 'id'>[]): Promise<void> {
    await this.table.bulkAdd(items);
  }
}

// ============================================================================
// PRODUCTION REPOSITORY (Complex Relationships)
// ============================================================================

class LocalProductionRepository implements IProductionRepository {
  // ========== Production Entries ==========
  async getAllEntries(): Promise<ProductionEntry[]> {
    return await db.production_entries.orderBy('production_date').reverse().toArray();
  }

  async getEntryById(id: number): Promise<ProductionEntry | undefined> {
    return await db.production_entries.get(id);
  }

  async createEntry(entry: Omit<ProductionEntry, 'id'>): Promise<number> {
    const now = new Date();
    const id = await db.production_entries.add({
      ...entry,
      created_at: now,
      updated_at: now,
    });
    return id;
  }

  async updateEntry(id: number, entry: Partial<ProductionEntry>): Promise<void> {
    await db.production_entries.update(id, {
      ...entry,
      updated_at: new Date(),
    });
  }

  async deleteEntry(id: number): Promise<void> {
    // Delete entry and all related items (cascade delete)
    await db.transaction('rw', [db.production_entries, db.fresh_items, db.frozen_items], async () => {
      await db.production_entries.delete(id);
      await db.fresh_items.where('entry_id').equals(id).delete();
      await db.frozen_items.where('entry_id').equals(id).delete();
    });
  }

  // ========== Fresh Production Items ==========
  async getFreshItemsByEntryId(entryId: number): Promise<FreshProductionItem[]> {
    return await db.fresh_items.where('entry_id').equals(entryId).toArray();
  }

  async createFreshItems(items: Omit<FreshProductionItem, 'id'>[]): Promise<void> {
    await db.fresh_items.bulkAdd(items);
  }

  async updateFreshItem(id: number, item: Partial<FreshProductionItem>): Promise<void> {
    await db.fresh_items.update(id, item);
  }

  async deleteFreshItemsByEntryId(entryId: number): Promise<void> {
    await db.fresh_items.where('entry_id').equals(entryId).delete();
  }

  // ========== Frozen Production Items ==========
  async getFrozenItemsByEntryId(entryId: number): Promise<FrozenProductionItem[]> {
    return await db.frozen_items.where('entry_id').equals(entryId).toArray();
  }

  async createFrozenItems(items: Omit<FrozenProductionItem, 'id'>[]): Promise<void> {
    await db.frozen_items.bulkAdd(items);
  }

  async updateFrozenItem(id: number, item: Partial<FrozenProductionItem>): Promise<void> {
    await db.frozen_items.update(id, item);
  }

  async deleteFrozenItemsByEntryId(entryId: number): Promise<void> {
    await db.frozen_items.where('entry_id').equals(entryId).delete();
  }

  // ========== Complex Queries ==========
  async getEntriesByDateRange(startDate: string, endDate: string): Promise<ProductionEntry[]> {
    return await db.production_entries
      .where('production_date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getEntriesByType(type: ProductionType): Promise<ProductionEntry[]> {
    return await db.production_entries.where('production_type').equals(type).toArray();
  }
}

// ============================================================================
// EXPORT INSTANCES
// ============================================================================

export const localBrandsRepository = new GenericLocalRepository<Brand>(db.brands);
export const localProductsRepository = new GenericLocalRepository<Product>(db.products);
export const localProductionRepository = new LocalProductionRepository();
