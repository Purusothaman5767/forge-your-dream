import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Wrench, Share2, GitCompareArrows, Copy, Check, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (buildId: string) => {
    const url = `${window.location.origin}/build/${buildId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(buildId);
    toast.success('Build link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [b, o] = await Promise.all([
        supabase.from('builds').select('*, products(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setBuilds(b.data || []);
      setOrders(o.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Dashboard</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-muted-foreground">Here's an overview of your builds and recent orders.</p>
        </div>
        <div className="flex gap-3">
          {builds.length >= 2 && (
            <Button variant="outline" size="lg" onClick={() => navigate('/compare')}>
              <GitCompareArrows className="mr-2 h-4 w-4" /> Compare Builds
            </Button>
          )}
          <Button size="lg" onClick={() => navigate('/products')} className="shadow-lg shadow-primary/20">
            <Wrench className="mr-2 h-4 w-4" /> Start Customizing
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Saved Builds */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Saved Builds</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : builds.length === 0 ? (
            <p className="text-muted-foreground text-sm">No builds yet. Start customizing!</p>
          ) : (
            <div className="space-y-3">
              {builds.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{b.products?.name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}{b.brand ? ` · ${b.brand}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">${Number(b.total_price).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleShare(b.id)}>
                      {copiedId === b.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Share2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{o.status}</span>
                  </div>
                  <p className="font-bold text-sm">${Number(o.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>View All Orders</Button>
        </div>
      </div>
    </div>
  );
}
