import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    if (!address.trim() || !phone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    // Save builds and create orders
    for (const item of items) {
      const config: Record<string, { name: string; price: number }> = {};
      Object.entries(item.configuration).forEach(([k, v]) => {
        config[k] = { name: v.name, price: v.price };
      });

      const { data: build } = await supabase.from('builds').insert({
        user_id: user.id,
        product_id: item.productId,
        configuration: config,
        total_price: item.totalPrice * item.quantity,
        brand: item.brand || null,
      } as any).select().single();

      await supabase.from('orders').insert({
        user_id: user.id,
        build_id: build?.id,
        total_price: item.totalPrice * item.quantity,
        shipping_address: address,
        phone,
        status: 'confirmed',
      });
    }

    clearCart();
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">Your custom products are being prepared.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/orders')}>View Orders</Button>
          <Button variant="outline" onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="bg-card border rounded-xl p-6 mb-6 space-y-3">
        <h3 className="font-display font-semibold">Order Summary</h3>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.productName} x{item.quantity}</span>
            <span className="font-medium">${(item.totalPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleOrder} className="bg-card border rounded-xl p-6 space-y-6">
        <h3 className="font-display font-semibold">Shipping Details</h3>
        <div className="space-y-2">
          <Label htmlFor="address">Shipping Address</Label>
          <Input id="address" placeholder="123 Main St, City, Country" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Order'}
        </Button>
      </form>
    </div>
  );
}
