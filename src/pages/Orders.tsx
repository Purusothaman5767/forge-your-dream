import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

const STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

function OrderProgress({ status }: { status: string }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="flex items-center gap-0 w-full mt-4">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= activeIdx;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
            </div>
            {!isLast && <div className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${i < activeIdx ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*, builds(configuration, products(name))').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Order History</h1>
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">
                    {order.builds?.products?.name || 'Custom Product'}
                    {order.brand && <span className="text-primary font-semibold"> — {order.brand}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="font-bold text-primary text-lg">{formatPrice(Number(order.total_price))}</span>
              </div>
              <OrderProgress status={order.status} />
              {order.builds?.configuration && (
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-4">
                  {Object.entries(order.builds.configuration as Record<string, { name: string }>).map(([type, comp]) => (
                    <span key={type} className="bg-muted px-2 py-1 rounded">{type}: {comp.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
