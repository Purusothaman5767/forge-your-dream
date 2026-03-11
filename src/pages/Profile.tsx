import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Package, ShoppingBag, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [builds, setBuilds] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) setName(profile.name || '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('builds').select('*, products(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([b, o]) => {
      setBuilds(b.data || []);
      setOrders(o.data || []);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile.id);
    setSaving(false);
    if (error) toast.error('Failed to save');
    else toast.success('Profile updated!');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">My Profile</h1>
      </div>

      {/* Account details */}
      <div className="bg-card border rounded-xl p-6 space-y-4 mb-8">
        <h2 className="font-display text-lg font-semibold">Account Details</h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled />
        </div>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Saved Builds */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Saved Builds ({builds.length})</h2>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : builds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved builds.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {builds.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{b.products?.name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-sm text-primary">${Number(b.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Orders ({orders.length})</h2>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{o.status}</span>
                  </div>
                  <p className="font-bold text-sm">${Number(o.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>View All</Button>
        </div>
      </div>
    </div>
  );
}
