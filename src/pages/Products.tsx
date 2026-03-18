import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { Slider } from '@/components/ui/slider';

const CATEGORIES = ['All', 'Electronics', 'Gaming', 'Accessories', 'Fashion'];

type SortOption = 'name' | 'price-asc' | 'price-desc';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Record<string, string[]>>({});
  const [reviews, setReviews] = useState<Record<string, { avg: number; count: number }>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [pRes, rRes, bRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('reviews').select('product_id, rating'),
        supabase.from('product_brands').select('product_id, brand_name'),
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
      Object.entries(agg).forEach(([id, v]) => {
        mapped[id] = { avg: v.sum / v.count, count: v.count };
      });
      setReviews(mapped);

      // Aggregate brands
      const brandMap: Record<string, string[]> = {};
      (bRes.data || []).forEach((b: any) => {
        if (!brandMap[b.product_id]) brandMap[b.product_id] = [];
        brandMap[b.product_id].push(b.brand_name);
      });
      setBrands(brandMap);

      // Price range
      const prices = (pRes.data || []).map((p: any) => Number(p.base_price));
      if (prices.length) {
        setPriceRange([0, Math.max(...prices) + 500]);
      }

      if (user) {
        const { data: wData } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);
        setWishlist(new Set((wData || []).map((w: any) => w.product_id)));
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const maxPrice = useMemo(() => {
    const prices = products.map((p) => Number(p.base_price));
    return prices.length ? Math.max(...prices) + 500 : 5000;
  }, [products]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add to wishlist');
      return;
    }
    if (wishlist.has(productId)) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
      setWishlist((prev) => {
        const n = new Set(prev);
        n.delete(productId);
        return n;
      });
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      setWishlist((prev) => new Set(prev).add(productId));
      toast.success('Added to wishlist');
    }
  };

  const handleViewDetails = (productId: string) => {
    setDetailsProductId(productId);
    setDetailsOpen(true);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === 'All' || p.category === category;
      const price = Number(p.base_price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesCat && matchesPrice;
    });

    result.sort((a: any, b: any) => {
      if (sort === 'price-asc') return Number(a.base_price) - Number(b.base_price);
      if (sort === 'price-desc') return Number(b.base_price) - Number(a.base_price);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, search, category, sort, priceRange]);

  // Group by category for section view
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((p) => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filtered]);

  const showGrouped = category === 'All' && !search;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-10 skeleton-shimmer w-1/3 mb-2" />
        <div className="h-5 skeleton-shimmer w-1/4 mb-8" />
        <div className="flex gap-4 mb-8">
          <div className="h-10 skeleton-shimmer flex-1 max-w-md" />
          <div className="h-10 skeleton-shimmer w-32" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-[4/3] skeleton-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 skeleton-shimmer w-2/3" />
                <div className="h-4 skeleton-shimmer w-full" />
                <div className="h-3 skeleton-shimmer w-1/2" />
                <div className="flex gap-1.5">
                  <div className="h-5 skeleton-shimmer w-12" />
                  <div className="h-5 skeleton-shimmer w-12" />
                  <div className="h-5 skeleton-shimmer w-12" />
                </div>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">
          Customizable Products
        </h1>
        <p className="text-muted-foreground text-lg">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} available to customize
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="default"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
              className={category === c ? 'shadow-lg shadow-primary/20' : ''}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* Expandable Price Filter */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-fade-in">
            <div>
              <p className="text-sm font-medium mb-3">
                Price Range: ${priceRange[0]} — ${priceRange[1]}
              </p>
              <Slider
                min={0}
                max={maxPrice}
                step={50}
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                className="w-full max-w-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/40 mx-auto" />
          <h2 className="font-display text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setPriceRange([0, maxPrice]);
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : showGrouped ? (
        Object.entries(groupedByCategory).map(([cat, prods]) => (
          <section key={cat} className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-primary inline-block" />
              {cat}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {prods.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  brands={brands[p.id]}
                  avgRating={reviews[p.id]?.avg}
                  reviewCount={reviews[p.id]?.count}
                  isWishlisted={wishlist.has(p.id)}
                  onToggleWishlist={toggleWishlist}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p: any) => (
            <ProductCard
              key={p.id}
              product={p}
              brands={brands[p.id]}
              avgRating={reviews[p.id]?.avg}
              reviewCount={reviews[p.id]?.count}
              isWishlisted={wishlist.has(p.id)}
              onToggleWishlist={toggleWishlist}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ProductDetailsModal
        productId={detailsProductId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        brands={detailsProductId ? brands[detailsProductId] : undefined}
        avgRating={detailsProductId ? reviews[detailsProductId]?.avg : undefined}
        reviewCount={detailsProductId ? reviews[detailsProductId]?.count : undefined}
      />
    </div>
  );
}
