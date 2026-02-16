/**
 * Dashboard - Overview and Quick Stats
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardBody, CardHeader, Button } from '@nextui-org/react';
import { Beef, Snowflake, Package, TrendingUp, Calendar } from 'lucide-react';
import { Services } from '@/services/ServiceFactory';
import { ProductionEntry, ProductionType } from '@/services/types';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEntries: 0,
    freshEntries: 0,
    frozenEntries: 0,
    totalProducts: 0,
    recentEntries: [] as ProductionEntry[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const entries = await Services.production.getAllEntries();
      const products = await Services.products.getAll();
      
      setStats({
        totalEntries: entries.length,
        freshEntries: entries.filter(e => e.production_type === ProductionType.FRESH).length,
        frozenEntries: entries.filter(e => e.production_type === ProductionType.FROZEN).length,
        totalProducts: products.length,
        recentEntries: entries.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to Mini Bo Enterprise - Ultimate Edition</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Entries</p>
                <p className="text-3xl font-bold">{stats.totalEntries}</p>
              </div>
              <Calendar size={40} className="opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Fresh Production</p>
                <p className="text-3xl font-bold">{stats.freshEntries}</p>
              </div>
              <Beef size={40} className="opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-700 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Frozen Production</p>
                <p className="text-3xl font-bold">{stats.frozenEntries}</p>
              </div>
              <Snowflake size={40} className="opacity-80" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package size={40} className="opacity-80" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              color="success"
              variant="shadow"
              startContent={<Beef size={24} />}
              onPress={() => navigate('/fresh')}
              className="h-20 text-lg"
            >
              Create Fresh Production Entry
            </Button>
            <Button
              size="lg"
              color="primary"
              variant="shadow"
              startContent={<Snowflake size={24} />}
              onPress={() => navigate('/frozen')}
              className="h-20 text-lg"
            >
              Create Frozen Production Entry
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-2xl font-semibold">Recent Production Entries</h2>
            <Button
              variant="light"
              color="primary"
              onPress={() => navigate('/history')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : stats.recentEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No production entries yet. Create your first entry!
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {entry.production_type === ProductionType.FRESH ? (
                      <Beef className="text-green-600" size={24} />
                    ) : (
                      <Snowflake className="text-cyan-600" size={24} />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {entry.production_type === ProductionType.FRESH ? 'Fresh' : 'Frozen'} Production
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(entry.production_date).toLocaleDateString()} - {entry.shift} Shift
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{entry.supervisor_name}</p>
                    <p className="text-xs text-slate-500">Supervisor</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
