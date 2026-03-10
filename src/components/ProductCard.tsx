import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { imageMap, defaultImg } from '@/lib/imageMap';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    base_price: number;
    image: string | null;
    category: string | null;
  };
  avgRating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export default function ProductCard({ product, avgRating, reviewCount, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={imageMap[product.image || ''] || defaultImg}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
          </button>
        )}
        {product.category && (
          <Badge variant="secondary" className="absolute top-3 left-3 text-xs">
            {product.category}
          </Badge>
        )}
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
        {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <p className="text-primary font-bold text-lg">${Number(product.base_price).toFixed(2)}</p>
          <Button size="sm" onClick={() => navigate(`/configurator/${product.id}`)}>
            Customize
          </Button>
        </div>
      </div>
    </div>
  );
}
