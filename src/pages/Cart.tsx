import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import gamingPcImg from '@/assets/gaming-pc.jpg';
import phoneCaseImg from '@/assets/phone-case.jpg';
import sneakersImg from '@/assets/sneakers.jpg';

const imageMap: Record<string, string> = {
  'gaming-pc': gamingPcImg,
  'phone-case': phoneCaseImg,
  'sneakers': sneakersImg,
};

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Start configuring a product to add it here</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-card border rounded-xl p-6 flex flex-col sm:flex-row gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img src={imageMap[item.image || ''] || gamingPcImg} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display font-semibold">{item.productName}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {Object.entries(item.configuration).map(([type, comp]) => (
                    <p key={type}>{type}: {comp.name} (+${comp.price.toFixed(2)})</p>
                  ))}
                </div>
                <p className="text-primary font-bold">${item.totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border rounded-lg">
                  <button className="p-2 hover:bg-muted transition-colors" onClick={() => updateQuantity(index, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button className="p-2 hover:bg-muted transition-colors" onClick={() => updateQuantity(index, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button onClick={() => removeItem(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4 h-fit sticky top-20">
          <h3 className="font-display text-lg font-semibold">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.productName} x{item.quantity}</span>
                <span>${(item.totalPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Button className="w-full" onClick={() => {
            if (!user) {
              navigate('/login');
              return;
            }
            navigate('/checkout');
          }}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
