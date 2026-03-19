import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Star, Eye, Wrench } from 'lucide-react';
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
  brands?: string[];
  avgRating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

export default function ProductCard({
  product,
  brands,
  avgRating,
  reviewCount,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
}: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={imageMap[product.image || ''] || defaultImg}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-background hover:text-primary'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
        {product.category && (
          <Badge variant="secondary" className="absolute top-3 left-3 text-xs backdrop-blur-sm">
            {product.category}
          </Badge>
        )}

        {/* Quick action on hover */}
        {onViewDetails && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="w-full backdrop-blur-sm bg-background/90"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product.id);
              }}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Quick View
            </Button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight">{product.name}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">{product.description}</p>

        {/* Brands */}
        {brands && brands.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Available Brands</p>
            <div className="flex flex-wrap gap-1.5">
              {brands.slice(0, 4).map((b) => (
                <span
                  key={b}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium border border-border/50"
                >
                  {b}
                </span>
              ))}
              {brands.length > 4 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  +{brands.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {avgRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= Math.round(avgRating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">From</p>
            <p className="text-primary font-bold text-xl tracking-tight">${Number(product.base_price).toFixed(2)}</p>
          </div>
          <Button
            size="sm"
            className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            onClick={() => navigate(`/configurator/${product.id}`)}
          >
            <Wrench className="mr-1.5 h-3.5 w-3.5" /> Customize
          </Button>
        </div>
      </div>
    </div>
  );
}
