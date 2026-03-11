import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { imageMap, defaultImg } from '@/lib/imageMap';
import { toast } from 'sonner';
import { Wand2, ShoppingCart } from 'lucide-react';

interface Component {
  id: string;
  component_type: string;
  name: string;
  price: number;
  product_id: string;
}

export default function BudgetBuilder() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [budget, setBudget] = useState('');
  const [suggestion, setSuggestion] = useState<Record<string, Component> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('components').select('*'),
    ]).then(([p, c]) => {
      setProducts(p.data || []);
      setComponents(c.data || []);
      setLoading(false);
    });
  }, []);

  const handleSuggest = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) { toast.error('Select a product'); return; }
    const budgetNum = parseFloat(budget);
    if (!budgetNum || budgetNum <= 0) { toast.error('Enter a valid budget'); return; }

    const remaining = budgetNum - Number(product.base_price);
    if (remaining < 0) { toast.error('Budget is lower than the base price'); return; }

    const productComps = components.filter(c => c.product_id === selectedProduct);
    const types = [...new Set(productComps.map(c => c.component_type))];

    // Greedy: for each type, pick the most expensive option that fits remaining budget
    const result: Record<string, Component> = {};
    let left = remaining;

    for (const type of types) {
      const options = productComps
        .filter(c => c.component_type === type)
        .sort((a, b) => Number(b.price) - Number(a.price));

      const pick = options.find(o => Number(o.price) <= left) || options[options.length - 1];
      if (pick) {
        result[type] = pick;
        left -= Number(pick.price);
      }
    }

    setSuggestion(result);
  };

  const product = products.find(p => p.id === selectedProduct);
  const totalPrice = product
    ? Number(product.base_price) + Object.values(suggestion || {}).reduce((s, c) => s + Number(c.price), 0)
    : 0;

  const handleAddToCart = () => {
    if (!product || !suggestion) return;
    const config: Record<string, { name: string; price: number }> = {};
    Object.entries(suggestion).forEach(([type, comp]) => {
      config[type] = { name: comp.name, price: Number(comp.price) };
    });
    addItem({
      productId: product.id,
      productName: product.name,
      basePrice: Number(product.base_price),
      configuration: config,
      totalPrice,
      image: product.image,
    });
    toast.success('Added to cart!');
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 bg-muted rounded w-1/3 mb-8 animate-pulse" />
        <div className="max-w-xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Wand2 className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">Budget Builder</h1>
      </div>
      <p className="text-muted-foreground mb-8">Enter your budget and we'll suggest the best configuration</p>

      <div className="bg-card border rounded-xl p-6 space-y-4 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product</label>
            <Select value={selectedProduct} onValueChange={v => { setSelectedProduct(v); setSuggestion(null); }}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} (${Number(p.base_price).toFixed(2)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget ($)</label>
            <Input type="number" placeholder="e.g. 1200" value={budget} onChange={e => { setBudget(e.target.value); setSuggestion(null); }} />
          </div>
        </div>
        <Button onClick={handleSuggest} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" /> Suggest Configuration
        </Button>
      </div>

      {suggestion && product && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <img src={imageMap[product.image || ''] || defaultImg} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
            <div>
              <h3 className="font-display font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Suggested within your ${budget} budget</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span>${Number(product.base_price).toFixed(2)}</span>
            </div>
            {Object.entries(suggestion).map(([type, comp]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{type}: {comp.name}</span>
                <span>{Number(comp.price) === 0 ? '—' : `+$${Number(comp.price).toFixed(2)}`}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary text-lg">${totalPrice.toFixed(2)}</span>
            </div>
            {totalPrice <= parseFloat(budget) && (
              <p className="text-xs text-muted-foreground">💰 ${(parseFloat(budget) - totalPrice).toFixed(2)} under budget</p>
            )}
          </div>

          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      )}
    </div>
  );
}
