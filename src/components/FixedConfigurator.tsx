import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, Palette, Ruler } from 'lucide-react';

interface FixedOption {
  id: string;
  option_type: string;
  option_value: string;
  price_modifier: number;
}

interface FixedConfiguratorProps {
  productId: string;
  basePrice: number;
  onConfigChange: (config: Record<string, { name: string; price: number }>, total: number) => void;
}

const typeIcons: Record<string, typeof Palette> = {
  Color: Palette,
  Size: Ruler,
  Material: Ruler,
  Connectivity: Ruler,
};

const colorSwatches: Record<string, string> = {
  'Black': 'bg-gray-900',
  'Midnight Black': 'bg-gray-900',
  'White': 'bg-white border border-border',
  'Arctic White': 'bg-white border border-border',
  'Navy': 'bg-blue-900',
  'Ocean Blue': 'bg-blue-600',
  'Red': 'bg-red-600',
  'Crimson Red': 'bg-red-600',
  'Rose Gold': 'bg-pink-300',
  'Silver': 'bg-gray-300',
  'Gray': 'bg-gray-500',
  'Green': 'bg-green-700',
};

export default function FixedConfigurator({ productId, basePrice, onConfigChange }: FixedConfiguratorProps) {
  const [options, setOptions] = useState<FixedOption[]>([]);
  const [selected, setSelected] = useState<Record<string, FixedOption>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('product_fixed_options').select('*').eq('product_id', productId)
      .then(({ data }) => {
        setOptions(data || []);
        setLoading(false);
      });
  }, [productId]);

  const stableOnConfigChange = useCallback(onConfigChange, []);

  useEffect(() => {
    const config: Record<string, { name: string; price: number }> = {};
    let total = basePrice;
    Object.entries(selected).forEach(([type, opt]) => {
      config[type] = { name: opt.option_value, price: Number(opt.price_modifier) };
      total += Number(opt.price_modifier);
    });
    stableOnConfigChange(config, total);
  }, [selected, basePrice, stableOnConfigChange]);

  const optionTypes = [...new Set(options.map(o => o.option_type))];

  if (loading) {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {optionTypes.map(type => {
        const typeOptions = options.filter(o => o.option_type === type);
        const Icon = typeIcons[type] || Palette;
        const isColor = type === 'Color';

        return (
          <div key={type} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {type}
            </h3>
            <div className={isColor ? 'flex flex-wrap gap-3' : 'grid sm:grid-cols-2 md:grid-cols-3 gap-3'}>
              {typeOptions.map(opt => {
                const isSelected = selected[type]?.id === opt.id;

                if (isColor) {
                  const swatch = colorSwatches[opt.option_value] || 'bg-muted';
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelected(prev => ({ ...prev, [type]: opt }))}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent/50'
                      }`}
                      title={opt.option_value}
                    >
                      <div className={`w-10 h-10 rounded-full ${swatch} shadow-sm ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} />
                      <span className="text-[11px] font-medium">{opt.option_value}</span>
                      {Number(opt.price_modifier) > 0 && (
                        <span className="text-[10px] text-primary font-semibold">+${Number(opt.price_modifier).toFixed(2)}</span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(prev => ({ ...prev, [type]: opt }))}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected ? 'border-primary bg-accent shadow-md shadow-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {isSelected && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                    <p className="font-medium text-sm">{opt.option_value}</p>
                    <p className="text-primary font-bold text-sm mt-1">
                      {Number(opt.price_modifier) === 0 ? 'Included' : `+$${Number(opt.price_modifier).toFixed(2)}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
