import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { imageMap, defaultImg } from '@/lib/imageMap';
import { ShoppingCart, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';

export default function SharedBuild() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [build, setBuild] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!buildId) return;
    supabase.from('builds').select('*, products(*)').eq('id', buildId).single().then(({ data }) => {
      if (data) { setBuild(data); setProduct(data.products); }
      setLoading(false);
    });
  }, [buildId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = () => {
    if (!build || !product) return;
    const config = build.configuration as Record<string, { name: string; price: number }>;
    addItem({ productId: product.id, productName: product.name, basePrice: Number(product.base_price), configuration: config, totalPrice: Number(build.total_price), image: product.image });
    toast.success('Added to cart!');
    navigate('/cart');
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-12"><div className="max-w-2xl mx-auto space-y-6"><div className="h-8 bg-muted rounded w-1/2 animate-pulse" /><div className="h-64 bg-muted rounded-xl animate-pulse" /><div className="h-32 bg-muted rounded-xl animate-pulse" /></div></div>
  );

  if (!build || !product) return (
    <div className="container mx-auto px-4 py-20 text-center"><p className="text-muted-foreground text-lg">Build not found.</p><Button variant="outline" className="mt-4" onClick={() => navigate('/products')}>Browse Products</Button></div>
  );

  const config = build.configuration as Record<string, { name: string; price: number }>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">Shared Build</h1>
      <p className="text-muted-foreground mb-8">Someone shared this custom configuration with you</p>
      <div className="bg-card border rounded-xl overflow-hidden mb-6">
        <div className="aspect-video">
          <img src={imageMap[product.image || ''] || defaultImg} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold">{product.name}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span>{formatPrice(Number(product.base_price))}</span>
            </div>
            {Object.entries(config).map(([type, comp]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{type}: {comp.name}</span>
                <span>{Number(comp.price) === 0 ? '—' : `+${formatPrice(Number(comp.price))}`}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary text-lg">{formatPrice(Number(build.total_price))}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
