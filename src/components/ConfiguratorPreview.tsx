import { imageMap, defaultImg } from '@/lib/imageMap';
import { formatPrice, SYMBOL } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Cpu, MemoryStick, HardDrive, Monitor, Palette, Keyboard, Wifi, Battery, Shirt, Smartphone, type LucideIcon } from 'lucide-react';

interface ConfiguratorPreviewProps {
  product: any;
  selected: Record<string, { id: string; name: string; price: number }>;
  selectedBrand: string | null;
  customImage?: string;
  basePrice: number;
  totalPrice: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  hasSelection?: boolean;
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

const componentIcons: Record<string, LucideIcon> = {
  'CPU': Cpu, 'Processor': Cpu, 'RAM': MemoryStick, 'Memory': MemoryStick,
  'Storage': HardDrive, 'SSD': HardDrive, 'GPU': Monitor, 'Graphics': Monitor,
  'Graphics Card': Monitor, 'Display': Monitor, 'Screen': Monitor, 'Color': Palette,
  'Keyboard': Keyboard, 'Connectivity': Wifi, 'Battery': Battery, 'Material': Shirt,
  'Size': Shirt, 'Case': Smartphone, 'Motherboard': Cpu,
};

export default function ConfiguratorPreview({
  product, selected, selectedBrand, customImage, basePrice, totalPrice, onAddToCart, onBuyNow, hasSelection = false,
}: ConfiguratorPreviewProps) {
  const selectedColor = selected['Color']?.name;
  const colorClass = selectedColor ? colorVariants[selectedColor] : null;
  const overlayTypes = ['CPU', 'Processor', 'RAM', 'Memory', 'Storage', 'SSD', 'GPU', 'Graphics', 'Graphics Card'];
  const overlayEntries = Object.entries(selected).filter(([type]) => overlayTypes.includes(type));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5 sticky top-20">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
        <img src={imageMap[product.image] || defaultImg} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {overlayEntries.length > 0 && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />}
        {overlayEntries.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {overlayEntries.map(([type, comp]) => {
              const Icon = componentIcons[type] || Cpu;
              return (
                <span key={type} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md text-[11px] font-semibold text-foreground shadow-sm animate-fade-in">
                  <Icon className="h-3 w-3 text-primary flex-shrink-0" />{comp.name}
                </span>
              );
            })}
          </div>
        )}
        {colorClass && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-background/85 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm animate-fade-in">
            <div className={`w-3.5 h-3.5 rounded-full ring-1 ring-border ${colorClass}`} />
            <span className="text-[11px] font-semibold">{selectedColor}</span>
          </div>
        )}
      </div>

      {customImage && (
        <div className="aspect-square rounded-xl overflow-hidden border border-border max-w-[120px] animate-fade-in">
          <img src={customImage} alt="Your design" className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-bold">{product.name}</h3>
        {selectedBrand && <p className="text-sm text-primary font-semibold mt-0.5">{selectedBrand}</p>}
      </div>

      {Object.keys(selected).length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your Configuration</p>
          <div className="space-y-1.5">
            {Object.entries(selected).map(([type, comp]) => {
              const Icon = componentIcons[type] || Cpu;
              return (
                <div key={type} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/50 border border-border/50 animate-fade-in">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground leading-none">{type}</p>
                    <p className="text-sm font-medium truncate">{comp.name}</p>
                  </div>
                  {Number(comp.price) > 0 && (
                    <span className="text-xs font-semibold text-primary flex-shrink-0">+{formatPrice(Number(comp.price))}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Price</span>
          <span>{formatPrice(basePrice)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary text-lg">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {onAddToCart && (
        <div className="space-y-2 pt-2">
          <Button className="w-full" size="lg" onClick={onAddToCart} disabled={!hasSelection}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
          {onBuyNow && (
            <Button className="w-full" variant="secondary" size="lg" onClick={onBuyNow} disabled={!hasSelection}>
              Buy Now
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
