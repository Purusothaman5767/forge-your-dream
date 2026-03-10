import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Gaming', 'Accessories', 'Fashion'];

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Record<string, { avg: number; count: number }>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchAll = async () => {
      const [pRes, rRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('reviews').select('product_id, rating'),
      ]);
      setProducts(pRes.data || []);

      // Aggregate reviews
      const agg: Record<string, { sum: number; count: number }> = {};
      (rRes.data || []).forEach((r: any) => {
        if (!agg[r.product_id]) agg[r.product_id] = { sum: 0, count: 0 };
        agg[r.product_id].sum += r.rating;
        agg[r.product_id].count += 1;
      });
      const mapped: Record<string, { avg: number; count: number }> = {};
      Object.entries(agg).forEach(([id, v]) => { mapped[id] = { avg: v.sum / v.count, count: v.count }; });
      setReviews(mapped);

      if (user) {
        const { data: wData } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
        setWishlist(new Set((wData || []).map((w: any) => w.product_id)));
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error('Please log in to add to wishlist'); return; }
    if (wishlist.has(productId)) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
      setWishlist(prev => { const n = new Set(prev); n.delete(productId); return n; });
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      setWishlist(prev => new Set(prev).add(productId));
      toast.success('Added to wishlist');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Products</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">Customizable Products</h1>
      <p className="text-muted-foreground mb-6">Select a product to start configuring</p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              avgRating={reviews[p.id]?.avg}
              reviewCount={reviews[p.id]?.count}
              isWishlisted={wishlist.has(p.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
