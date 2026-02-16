/**
 * Mini Bo Enterprise - Repository Pattern Type Definitions
 * This architecture allows seamless switching between Local (Offline) and Cloud (Online) modes
 */

// ============================================================================
// CORE DATA MODELS
// ============================================================================

export interface Brand {
  id?: number;
  name: string;
  name_ar: string;
  created_at?: Date;
}

export interface Product {
  id?: number;
  name: string;
  name_ar: string;
  sku: string;
  unit_weight: number; // Weight per unit in kg
  brand_id: number;
  created_at?: Date;
}

export enum ProductionType {
  FRESH = 'FRESH',
  FROZEN = 'FROZEN'
}

export interface ProductionEntry {
  id?: number;
  production_date: string; // ISO Date string
  shift: 'morning' | 'evening';
  production_type: ProductionType;
  supervisor_name: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Fresh Production Item (Hours-based)
export interface FreshProductionItem {
  id?: number;
  entry_id: number;
  product_id: number;
  // Hourly production (12 hours)
  hour_1?: number;
  hour_2?: number;
  hour_3?: number;
  hour_4?: number;
  hour_5?: number;
  hour_6?: number;
  hour_7?: number;
  hour_8?: number;
  hour_9?: number;
  hour_10?: number;
  hour_11?: number;
  hour_12?: number;
  total_quantity?: number; // Auto-calculated
  total_weight?: number; // Auto-calculated
}

// Frozen Production Item
export interface FrozenProductionItem {
  id?: number;
  entry_id: number;
  product_id: number;
  quantity_boxes: number;
  net_weight: number;
  gross_weight: number;
  notes?: string;
}

// ============================================================================
// REPOSITORY INTERFACES (Generic CRUD)
// ============================================================================

export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | undefined>;
  create(item: Omit<T, 'id'>): Promise<number>; // Returns new ID
  update(id: number, item: Partial<T>): Promise<void>;
  delete(id: number): Promise<void>;
  bulkCreate(items: Omit<T, 'id'>[]): Promise<void>;
}

// Specialized repository for production entries with related items
export interface IProductionRepository {
  // Production Entries
  getAllEntries(): Promise<ProductionEntry[]>;
  getEntryById(id: number): Promise<ProductionEntry | undefined>;
  createEntry(entry: Omit<ProductionEntry, 'id'>): Promise<number>;
  updateEntry(id: number, entry: Partial<ProductionEntry>): Promise<void>;
  deleteEntry(id: number): Promise<void>;

  // Fresh Production Items
  getFreshItemsByEntryId(entryId: number): Promise<FreshProductionItem[]>;
  createFreshItems(items: Omit<FreshProductionItem, 'id'>[]): Promise<void>;
  updateFreshItem(id: number, item: Partial<FreshProductionItem>): Promise<void>;
  deleteFreshItemsByEntryId(entryId: number): Promise<void>;

  // Frozen Production Items
  getFrozenItemsByEntryId(entryId: number): Promise<FrozenProductionItem[]>;
  createFrozenItems(items: Omit<FrozenProductionItem, 'id'>[]): Promise<void>;
  updateFrozenItem(id: number, item: Partial<FrozenProductionItem>): Promise<void>;
  deleteFrozenItemsByEntryId(entryId: number): Promise<void>;

  // Complex queries
  getEntriesByDateRange(startDate: string, endDate: string): Promise<ProductionEntry[]>;
  getEntriesByType(type: ProductionType): Promise<ProductionEntry[]>;
}

// ============================================================================
// SERVICE FACTORY TYPES
// ============================================================================

export interface IServiceContainer {
  brands: IRepository<Brand>;
  products: IRepository<Product>;
  production: IProductionRepository;
}

export interface AppConfig {
  USE_CLOUD_API: boolean;
  API_BASE_URL?: string;
}
