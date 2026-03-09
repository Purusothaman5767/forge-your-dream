import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import gamingPcImg from '@/assets/gaming-pc.jpg';
import phoneCaseImg from '@/assets/phone-case.jpg';
import sneakersImg from '@/assets/sneakers.jpg';

const imageMap: Record<string, string> = {
  'gaming-pc': gamingPcImg,
  'phone-case': phoneCaseImg,
  'sneakers': sneakersImg,
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Products</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">Customizable Products</h1>
      <p className="text-muted-foreground mb-8">Select a product to start configuring</p>
      <div className="grid md:grid-cols-3 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all group">
            <div className="aspect-square overflow-hidden">
              <img
                src={imageMap[p.image] || gamingPcImg}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold text-lg">${Number(p.base_price).toFixed(2)}</p>
                <Button size="sm" onClick={() => navigate(`/configurator/${p.id}`)}>
                  Customize
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
