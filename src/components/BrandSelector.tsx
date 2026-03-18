import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface BrandSelectorProps {
  productId: string;
  productName: string;
  onSelect: (brand: string) => void;
  onSkip: () => void;
}

export default function BrandSelector({ productId, productName, onSelect, onSkip }: BrandSelectorProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('product_brands')
      .select('brand_name')
      .eq('product_id', productId)
      .then(({ data }) => {
        setBrands((data || []).map((b: any) => b.brand_name));
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="h-8 w-48 bg-muted rounded mx-auto mb-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    // No brands → skip immediately
    onSkip();
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-2 text-center">
        Choose Your Brand
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Select a brand for your {productName}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelected(brand)}
            className={`p-6 rounded-xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5 ${
              selected === brand
                ? 'border-primary bg-accent shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <p className="font-display text-lg font-semibold">{brand}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onSkip}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Skip
        </Button>
        <Button disabled={!selected} onClick={() => selected && onSelect(selected)}>
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
