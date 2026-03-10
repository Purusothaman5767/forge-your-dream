import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const { user } = useAuth();
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
        <h1 className="font-display text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">My Wishlist</h1>
      <p className="text-muted-foreground mb-8">Products you've saved for later</p>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
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
