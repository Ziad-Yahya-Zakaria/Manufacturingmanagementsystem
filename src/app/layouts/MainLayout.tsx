/**
 * Main Layout with NextUI Navigation
 */

import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import {
  Factory,
  LayoutDashboard,
  Beef,
  Snowflake,
  History,
  Settings,
  Package,
  Tag,
} from 'lucide-react';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isBordered className="bg-blue-900 text-white">
        <NavbarBrand>
          <Factory className="mr-2" size={28} />
          <div>
            <p className="font-bold text-lg">Mini Bo Enterprise</p>
            <p className="text-xs text-blue-200">Ultimate Edition</p>
          </div>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive('/')}>
            <Button
              variant={isActive('/') ? 'solid' : 'light'}
              color={isActive('/') ? 'primary' : 'default'}
              startContent={<LayoutDashboard size={18} />}
              onPress={() => navigate('/')}
              className={isActive('/') ? 'text-white' : 'text-white hover:bg-blue-800'}
            >
              Dashboard
            </Button>
          </NavbarItem>

          <NavbarItem isActive={isActive('/fresh')}>
            <Button
              variant={isActive('/fresh') ? 'solid' : 'light'}
              color={isActive('/fresh') ? 'primary' : 'default'}
              startContent={<Beef size={18} />}
              onPress={() => navigate('/fresh')}
              className={isActive('/fresh') ? 'text-white' : 'text-white hover:bg-blue-800'}
            >
              Fresh Production
            </Button>
          </NavbarItem>

          <NavbarItem isActive={isActive('/frozen')}>
            <Button
              variant={isActive('/frozen') ? 'solid' : 'light'}
              color={isActive('/frozen') ? 'primary' : 'default'}
              startContent={<Snowflake size={18} />}
              onPress={() => navigate('/frozen')}
              className={isActive('/frozen') ? 'text-white' : 'text-white hover:bg-blue-800'}
            >
              Frozen Production
            </Button>
          </NavbarItem>

          <NavbarItem isActive={isActive('/history')}>
            <Button
              variant={isActive('/history') ? 'solid' : 'light'}
              color={isActive('/history') ? 'primary' : 'default'}
              startContent={<History size={18} />}
              onPress={() => navigate('/history')}
              className={isActive('/history') ? 'text-white' : 'text-white hover:bg-blue-800'}
            >
              History
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="light"
                startContent={<Settings size={18} />}
                className="text-white hover:bg-blue-800"
              >
                Settings
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Settings Menu">
              <DropdownItem
                key="products"
                startContent={<Package size={18} />}
                onPress={() => navigate('/products')}
              >
                Products
              </DropdownItem>
              <DropdownItem
                key="brands"
                startContent={<Tag size={18} />}
                onPress={() => navigate('/brands')}
              >
                Brands
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
