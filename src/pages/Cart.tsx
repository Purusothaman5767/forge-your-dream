import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { imageMap, defaultImg } from '@/lib/imageMap';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">
              Browse our customizable products and build something unique.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/products')}>
            <Package className="mr-2 h-4 w-4" /> Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img src={imageMap[item.image || ''] || defaultImg} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display font-semibold text-lg">
                  {item.productName}{item.brand ? ` — ${item.brand}` : ''}
                </h3>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {Object.entries(item.configuration).map(([type, comp]) => (
                    <p key={type} className="flex justify-between max-w-xs">
                      <span className="font-medium">{type}</span>
                      <span>{comp.name} (+${comp.price.toFixed(2)})</span>
                    </p>
                  ))}
                </div>
                <p className="text-primary font-bold text-lg">${item.totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex sm:flex-col items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity || 1}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5 sticky top-24">
            <h2 className="font-display text-xl font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-success font-medium">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            {user ? (
              <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                  Log in to Checkout
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You need an account to place an order
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
