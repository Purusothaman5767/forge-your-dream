import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Star, Tag } from 'lucide-react';
import { imageMap, defaultImg } from '@/lib/imageMap';
import { formatPrice } from '@/lib/currency';

interface ProductDetailsModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands?: string[];
  avgRating?: number;
  reviewCount?: number;
}

export default function ProductDetailsModal({ productId, open, onOpenChange, brands, avgRating, reviewCount }: ProductDetailsModalProps) {
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [componentTypes, setComponentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId || !open) return;
    setLoading(true);
    Promise.all([
      supabase.from('products').select('*').eq('id', productId).single(),
      supabase.from('components').select('component_type').eq('product_id', productId),
    ]).then(([pRes, cRes]) => {
      setProduct(pRes.data);
      setComponentTypes([...new Set((cRes.data || []).map((c: any) => c.component_type))]);
      setLoading(false);
    });
  }, [productId, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {loading || !product ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        ) : (
          <>
            <DialogHeader><DialogTitle className="font-display text-xl">{product.name}</DialogTitle></DialogHeader>
            <div className="rounded-lg overflow-hidden aspect-video">
              <img src={imageMap[product.image] || defaultImg} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm text-muted-foreground">{product.description}</p>

            {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
            )}

            {brands && brands.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Tag className="h-3 w-3" /> Available Brands</p>
                <div className="flex flex-wrap gap-2">{brands.map((b) => <Badge key={b} variant="outline">{b}</Badge>)}</div>
              </div>
            )}

            {componentTypes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Customizable Components</p>
                <div className="flex flex-wrap gap-2">{componentTypes.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Starting at</p>
                <p className="text-primary font-bold text-2xl">{formatPrice(Number(product.base_price))}</p>
              </div>
              <Button className="shadow-lg shadow-primary/20" onClick={() => { onOpenChange(false); navigate(`/configurator/${product.id}`); }}>
                <Wrench className="mr-2 h-4 w-4" /> Start Customizing
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
