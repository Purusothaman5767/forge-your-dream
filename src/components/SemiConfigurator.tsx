import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Variant {
  id: string;
  variant_name: string;
  description: string | null;
  price_modifier: number;
  specs: Record<string, string>;
}

interface Component {
  id: string;
  component_type: string;
  name: string;
  price: number;
}

interface SemiConfiguratorProps {
  productId: string;
  basePrice: number;
  onConfigChange: (config: Record<string, { name: string; price: number }>, total: number) => void;
}

export default function SemiConfigurator({ productId, basePrice, onConfigChange }: SemiConfiguratorProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [upgrades, setUpgrades] = useState<Component[]>([]);
  const [selectedUpgrades, setSelectedUpgrades] = useState<Record<string, Component>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('product_variants').select('*').eq('product_id', productId),
      supabase.from('components').select('*').eq('product_id', productId),
    ]).then(([vRes, cRes]) => {
      const v = (vRes.data || []).map((d: any) => ({
        ...d,
        specs: typeof d.specs === 'string' ? JSON.parse(d.specs) : (d.specs || {}),
      }));
      setVariants(v);
      setUpgrades(cRes.data || []);
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

    Object.entries(selectedUpgrades).forEach(([type, comp]) => {
      config[type] = { name: comp.name, price: Number(comp.price) };
      total += Number(comp.price);
    });

    onConfigChange(config, total);
  }, [selectedVariant, selectedUpgrades, basePrice, onConfigChange]);

  const upgradeTypes = [...new Set(upgrades.map(u => u.component_type))];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
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
                onClick={() => { setSelectedVariant(v); setSelectedUpgrades({}); }}
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
                {/* Spec pills */}
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

      {/* Optional Upgrades */}
      {selectedVariant && upgradeTypes.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Optional Upgrades
          </h3>
          {upgradeTypes.map(type => {
            const typeUpgrades = upgrades.filter(u => u.component_type === type);
            return (
              <div key={type} className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">{type}</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {typeUpgrades.map(comp => {
                    const isSelected = selectedUpgrades[type]?.id === comp.id;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => {
                          setSelectedUpgrades(prev => {
                            if (isSelected) {
                              const next = { ...prev };
                              delete next[type];
                              return next;
                            }
                            return { ...prev, [type]: comp };
                          });
                        }}
                        className={`relative p-3 rounded-lg border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected ? 'border-primary bg-accent shadow-md shadow-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isSelected && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-primary font-bold text-sm mt-1">
                          {Number(comp.price) === 0 ? 'Included' : `+$${Number(comp.price).toFixed(2)}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
