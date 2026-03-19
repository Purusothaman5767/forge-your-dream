import { imageMap, defaultImg } from '@/lib/imageMap';
import { Badge } from '@/components/ui/badge';

interface ConfiguratorPreviewProps {
  product: any;
  selected: Record<string, { id: string; name: string; price: number }>;
  selectedBrand: string | null;
  customImage?: string;
  basePrice: number;
  totalPrice: number;
}

const colorVariants: Record<string, string> = {
  'Midnight Black': 'bg-gray-900',
  'Arctic White': 'bg-white border border-border',
  'Ocean Blue': 'bg-blue-600',
  'Forest Green': 'bg-green-700',
  'Crimson Red': 'bg-red-600',
  'Rose Gold': 'bg-pink-300',
  'Silver': 'bg-gray-300',
  'Space Gray': 'bg-gray-600',
  'RGB Lighting': 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500',
};

export default function ConfiguratorPreview({
  product,
  selected,
  selectedBrand,
  customImage,
  basePrice,
  totalPrice,
}: ConfiguratorPreviewProps) {
  const selectedColor = selected['Color']?.name;
  const colorClass = selectedColor ? colorVariants[selectedColor] : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5 sticky top-20">
      {/* Product Image */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <img
          src={imageMap[product.image] || defaultImg}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {colorClass && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className={`w-4 h-4 rounded-full ${colorClass}`} />
            <span className="text-xs font-medium">{selectedColor}</span>
          </div>
        )}
      </div>

      {/* Custom upload preview */}
      {customImage && (
        <div className="aspect-square rounded-xl overflow-hidden border border-border max-w-[120px]">
          <img src={customImage} alt="Your design" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Brand & Product Name */}
      <div>
        <h3 className="font-display text-lg font-bold">{product.name}</h3>
        {selectedBrand && (
          <p className="text-sm text-primary font-semibold mt-0.5">{selectedBrand}</p>
        )}
      </div>

      {/* Selected Components as Badges */}
      {Object.keys(selected).length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Configuration
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(selected).map(([type, comp]) => (
              <Badge
                key={type}
                variant="secondary"
                className="text-[11px] font-medium"
              >
                {comp.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Price</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        {Object.entries(selected).map(([type, comp]) => (
          Number(comp.price) > 0 && (
            <div key={type} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">{type}</span>
              <span className="flex-shrink-0">+${Number(comp.price).toFixed(2)}</span>
            </div>
          )
        ))}
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary text-lg">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
