/**
 * Cloud API Repository Implementation (Future Implementation)
 * This will use Axios to communicate with a REST API backend
 */

import axios, { AxiosInstance } from 'axios';
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

class GenericApiRepository<T> implements IRepository<T> {
  constructor(
    private client: AxiosInstance,
    private endpoint: string
  ) {}

  async getAll(): Promise<T[]> {
    const response = await this.client.get<T[]>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<T | undefined> {
    try {
      const response = await this.client.get<T>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      return undefined;
    }
  }

  async create(item: Omit<T, 'id'>): Promise<number> {
    const response = await this.client.post<{ id: number }>(this.endpoint, item);
    return response.data.id;
  }

  async update(id: number, item: Partial<T>): Promise<void> {
    await this.client.patch(`${this.endpoint}/${id}`, item);
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`);
  }

  async bulkCreate(items: Omit<T, 'id'>[]): Promise<void> {
    await this.client.post(`${this.endpoint}/bulk`, items);
  }
}

class ApiProductionRepository implements IProductionRepository {
  constructor(private client: AxiosInstance) {}

  // ========== Production Entries ==========
  async getAllEntries(): Promise<ProductionEntry[]> {
    const response = await this.client.get<ProductionEntry[]>('/production/entries');
    return response.data;
  }

  async getEntryById(id: number): Promise<ProductionEntry | undefined> {
    try {
      const response = await this.client.get<ProductionEntry>(`/production/entries/${id}`);
      return response.data;
    } catch {
      return undefined;
    }
  }

  async createEntry(entry: Omit<ProductionEntry, 'id'>): Promise<number> {
    const response = await this.client.post<{ id: number }>('/production/entries', entry);
    return response.data.id;
  }

  async updateEntry(id: number, entry: Partial<ProductionEntry>): Promise<void> {
    await this.client.patch(`/production/entries/${id}`, entry);
  }

  async deleteEntry(id: number): Promise<void> {
    await this.client.delete(`/production/entries/${id}`);
  }

  // ========== Fresh Production Items ==========
  async getFreshItemsByEntryId(entryId: number): Promise<FreshProductionItem[]> {
    const response = await this.client.get<FreshProductionItem[]>(
      `/production/entries/${entryId}/fresh-items`
    );
    return response.data;
  }

  async createFreshItems(items: Omit<FreshProductionItem, 'id'>[]): Promise<void> {
    await this.client.post('/production/fresh-items/bulk', items);
  }

  async updateFreshItem(id: number, item: Partial<FreshProductionItem>): Promise<void> {
    await this.client.patch(`/production/fresh-items/${id}`, item);
  }

  async deleteFreshItemsByEntryId(entryId: number): Promise<void> {
    await this.client.delete(`/production/entries/${entryId}/fresh-items`);
  }

  // ========== Frozen Production Items ==========
  async getFrozenItemsByEntryId(entryId: number): Promise<FrozenProductionItem[]> {
    const response = await this.client.get<FrozenProductionItem[]>(
      `/production/entries/${entryId}/frozen-items`
    );
    return response.data;
  }

  async createFrozenItems(items: Omit<FrozenProductionItem, 'id'>[]): Promise<void> {
    await this.client.post('/production/frozen-items/bulk', items);
  }

  async updateFrozenItem(id: number, item: Partial<FrozenProductionItem>): Promise<void> {
    await this.client.patch(`/production/frozen-items/${id}`, item);
  }

  async deleteFrozenItemsByEntryId(entryId: number): Promise<void> {
    await this.client.delete(`/production/entries/${entryId}/frozen-items`);
  }

  // ========== Complex Queries ==========
  async getEntriesByDateRange(startDate: string, endDate: string): Promise<ProductionEntry[]> {
    const response = await this.client.get<ProductionEntry[]>(
      `/production/entries/date-range?start=${startDate}&end=${endDate}`
    );
    return response.data;
  }

  async getEntriesByType(type: ProductionType): Promise<ProductionEntry[]> {
    const response = await this.client.get<ProductionEntry[]>(
      `/production/entries/type/${type}`
    );
    return response.data;
  }
}

/**
 * Create API Repository instances
 * @param baseURL - API base URL (e.g., 'https://api.minibo.com/v1')
 */
export function createApiRepositories(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    brands: new GenericApiRepository<Brand>(client, '/brands'),
    products: new GenericApiRepository<Product>(client, '/products'),
    production: new ApiProductionRepository(client),
  };
}
