import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { DollarSign, Package, ShoppingBag, BarChart3, Plus, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import AdminAnalytics from '@/components/AdminAnalytics';
import { formatPrice } from '@/lib/currency';

const CATEGORIES = ['Electronics', 'Gaming', 'Accessories', 'Fashion'];

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newImage, setNewImage] = useState('');

  const [compProductId, setCompProductId] = useState('');
  const [compType, setCompType] = useState('');
  const [compName, setCompName] = useState('');
  const [compPrice, setCompPrice] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').then(({ data }) => {
      setIsAdmin(data && data.length > 0);
    });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('components').select('*, products(name)').order('product_id'),
    ]).then(([p, o, c]) => {
      setProducts(p.data || []);
      setOrders(o.data || []);
      setComponents(c.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  if (isAdmin === null) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (isAdmin === false) return <Navigate to="/dashboard" replace />;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert({ name: newName, description: newDesc, base_price: parseFloat(newPrice), category: newCategory, image: newImage || null }).select().single();
    if (error) { toast.error('Failed to add product'); return; }
    setProducts(prev => [...prev, data]);
    setNewName(''); setNewDesc(''); setNewPrice(''); setNewImage('');
    toast.success('Product added!');
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('components').insert({ product_id: compProductId, component_type: compType, name: compName, price: parseFloat(compPrice) }).select('*, products(name)').single();
    if (error) { toast.error('Failed to add component'); return; }
    setComponents(prev => [...prev, data]);
    setCompType(''); setCompName(''); setCompPrice('');
    toast.success('Component added!');
  };

  const handleDeleteComponent = async (id: string) => {
    const { error } = await supabase.from('components').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setComponents(prev => prev.filter(c => c.id !== id));
    toast.success('Component deleted');
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success('Order updated');
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: formatPrice(totalRevenue) },
          { icon: Package, label: 'Products', value: products.length },
          { icon: ShoppingBag, label: 'Orders', value: orders.length },
          { icon: BarChart3, label: 'Confirmed', value: confirmedOrders },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="h-4 w-4" />
              <span className="text-sm">{s.label}</span>
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdminAnalytics orders={orders} products={products} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <form onSubmit={handleAddProduct} className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Product</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Base Price</Label><Input type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Image Key</Label><Input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="e.g. gaming-pc" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} /></div>
            <Button type="submit">Add Product</Button>
          </form>

          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead className="w-20"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{formatPrice(Number(p.base_price))}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <form onSubmit={handleAddComponent} className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Component</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Product</Label>
                <Select value={compProductId} onValueChange={setCompProductId}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Type</Label><Input value={compType} onChange={e => setCompType(e.target.value)} placeholder="e.g. CPU, RAM" required /></div>
              <div className="space-y-2"><Label>Name</Label><Input value={compName} onChange={e => setCompName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" value={compPrice} onChange={e => setCompPrice(e.target.value)} required /></div>
            </div>
            <Button type="submit">Add Component</Button>
          </form>

          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Product</TableHead><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead className="w-20"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {components.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.products?.name}</TableCell>
                    <TableCell>{c.component_type}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{formatPrice(Number(c.price))}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteComponent(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Address</TableHead><TableHead className="w-40">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{formatPrice(Number(o.total_price))}</TableCell>
                    <TableCell><span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground capitalize">{o.status}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{o.shipping_address || '—'}</TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(v) => handleUpdateOrderStatus(o.id, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
