/**
 * React Router Configuration
 */

import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { FreshProduction } from './pages/FreshProduction';
import { FrozenProduction } from './pages/FrozenProduction';
import { ProductsSettings } from './pages/ProductsSettings';
import { BrandsSettings } from './pages/BrandsSettings';
import { ProductionHistory } from './pages/ProductionHistory';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'fresh', Component: FreshProduction },
      { path: 'frozen', Component: FrozenProduction },
      { path: 'history', Component: ProductionHistory },
      { path: 'products', Component: ProductsSettings },
      { path: 'brands', Component: BrandsSettings },
      { path: '*', Component: NotFound },
    ],
  },
]);
