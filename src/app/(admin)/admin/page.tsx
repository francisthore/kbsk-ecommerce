import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { sql, count, sum } from 'drizzle-orm';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

async function getDashboardStats() {
  const [productCount] = await db.select({ count: count() }).from(products);
  const [userCount] = await db.select({ count: count() }).from(users);
  
  // You can add more stats queries here
  return {
    totalProducts: productCount.count,
    totalUsers: userCount.count,
    // totalOrders: orderCount.count,
    // totalRevenue: revenue.sum,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value="0"
          icon={ShoppingCart}
          color="green"
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Revenue"
          value="$0"
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-500">
            No recent activity to display.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
