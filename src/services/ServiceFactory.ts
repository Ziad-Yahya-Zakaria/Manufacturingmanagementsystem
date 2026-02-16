/**
 * Service Factory - Centralized Access Point
 * Allows instant switching between Local (Offline) and Cloud (Online) modes
 */

import { IServiceContainer, AppConfig } from './types';
import {
  localBrandsRepository,
  localProductsRepository,
  localProductionRepository,
} from './LocalRepository';
import { createApiRepositories } from './ApiRepository';

// ============================================================================
// CONFIGURATION
// ============================================================================

const config: AppConfig = {
  // Set to true to use Cloud API (requires backend)
  // Set to false to use Local IndexedDB (Offline-First)
  USE_CLOUD_API: import.meta.env.VITE_USE_CLOUD_API === 'true' || false,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.minibo.com/v1',
};

// ============================================================================
// SERVICE CONTAINER FACTORY
// ============================================================================

function createServiceContainer(): IServiceContainer {
  if (config.USE_CLOUD_API) {
    console.log('🌐 Using Cloud API Mode:', config.API_BASE_URL);
    return createApiRepositories(config.API_BASE_URL!);
  } else {
    console.log('💾 Using Local Offline Mode (Dexie/IndexedDB)');
    return {
      brands: localBrandsRepository,
      products: localProductsRepository,
      production: localProductionRepository,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const Services = createServiceContainer();

/**
 * Usage Example:
 * 
 * import { Services } from '@/services/ServiceFactory';
 * 
 * // Brands
 * const brands = await Services.brands.getAll();
 * const brandId = await Services.brands.create({ name: 'New Brand', name_ar: 'علامة جديدة' });
 * 
 * // Products
 * const products = await Services.products.getAll();
 * 
 * // Production
 * const entries = await Services.production.getAllEntries();
 * const freshItems = await Services.production.getFreshItemsByEntryId(1);
 */
