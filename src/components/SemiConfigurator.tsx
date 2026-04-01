import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronRight } from 'lucide-react';

interface Variant {
  id: string;
  variant_name: string;
  description: string | null;
  price_modifier: number;
  specs: Record<string, string>;
}

interface SemiConfiguratorProps {
  productId: string;
  basePrice: number;
  onConfigChange: (config: Record<string, { name: string; price: number }>, total: number) => void;
}

export default function SemiConfigurator({ productId, basePrice, onConfigChange }: SemiConfiguratorProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('product_variants').select('*').eq('product_id', productId)
      .then(({ data }) => {
        const v = (data || []).map((d: any) => ({
          ...d,
          specs: typeof d.specs === 'string' ? JSON.parse(d.specs) : (d.specs || {}),
        }));
        setVariants(v);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    const config: Record<string, { name: string; price: number }> = {};
    let total = basePrice;

    if (selectedVariant) {
      config['Variant'] = { name: selectedVariant.variant_name, price: Number(selectedVariant.price_modifier) };
      total += Number(selectedVariant.price_modifier);
      Object.entries(selectedVariant.specs).forEach(([key, value]) => {
        config[key] = { name: value, price: 0 };
      });
    }

    onConfigChange(config, total);
  }, [selectedVariant, basePrice, onConfigChange]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <ChevronRight className="h-5 w-5 text-primary" />
          Choose Your Configuration
        </h3>
        <div className="grid gap-3">
          {variants.map(v => {
            const isSelected = selectedVariant?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected ? 'border-primary bg-accent shadow-md shadow-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                {isSelected && <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <p className="font-bold text-base">{v.variant_name}</p>
                    {v.description && <p className="text-sm text-muted-foreground mt-1">{v.description}</p>}
                  </div>
                  <span className="text-primary font-bold text-sm whitespace-nowrap">
                    {Number(v.price_modifier) === 0 ? 'Base' : `+$${Number(v.price_modifier).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(v.specs).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                      <span className="text-foreground font-semibold">{key}:</span> {value}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
