import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatPrice } from '@/lib/currency';

interface AdminAnalyticsProps {
  orders: any[];
  products: any[];
}

const COLORS = ['hsl(25, 95%, 53%)', 'hsl(220, 14%, 46%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function AdminAnalytics({ orders, products }: AdminAnalyticsProps) {
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const monthlyData: Record<string, number> = {};
  orders.forEach(o => {
    const month = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyData[month] = (monthlyData[month] || 0) + Number(o.total_price);
  });
  const barData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  const statusCounts: Record<string, number> = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="font-display text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="font-display text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
          <p className="font-display text-2xl font-bold">{formatPrice(avgOrderValue)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Revenue by Month</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatPrice(v)} />
                <Bar dataKey="revenue" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Order Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
