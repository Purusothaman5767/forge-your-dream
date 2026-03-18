import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlists')
      .select('product_id, products(*)')
      .eq('user_id', user.id);
    setProducts((data || []).map((w: any) => w.products).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed from wishlist');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-9 skeleton-shimmer w-48 mb-2" />
        <div className="h-5 skeleton-shimmer w-64 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-[4/3] skeleton-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 skeleton-shimmer w-2/3" />
                <div className="h-4 skeleton-shimmer w-full" />
                <div className="h-4 skeleton-shimmer w-1/2" />
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <div className="h-7 skeleton-shimmer w-16" />
                  <div className="h-9 skeleton-shimmer w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {products.length} product{products.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Save products you love to keep track of them here.
            </p>
          </div>
          <Button onClick={() => navigate('/products')}>
            <Package className="mr-2 h-4 w-4" /> Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isWishlisted={true}
              onToggleWishlist={removeFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
