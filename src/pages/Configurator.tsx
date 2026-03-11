import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Save, AlertTriangle, Check, Share2, Copy } from 'lucide-react';
import { imageMap, defaultImg } from '@/lib/imageMap';
import ReviewSection from '@/components/ReviewSection';
import ImageUploader from '@/components/ImageUploader';

interface Component {
  id: string;
  component_type: string;
  name: string;
  price: number;
}

export default function Configurator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [selected, setSelected] = useState<Record<string, Component>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customImage, setCustomImage] = useState('');
  const [sharedBuildId, setSharedBuildId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('components').select('*').eq('product_id', id),
    ]).then(([pRes, cRes]) => {
      setProduct(pRes.data);
      setComponents(cRes.data || []);
      setLoading(false);
    });
  }, [id]);

  const componentTypes = [...new Set(components.map(c => c.component_type))];
  const basePrice = product ? Number(product.base_price) : 0;
  const componentTotal = Object.values(selected).reduce((sum, c) => sum + Number(c.price), 0);
  const totalPrice = basePrice + componentTotal;

  const supportsImageUpload = product && ['phone-case', 't-shirt'].includes(product.image);

  const getCompatibilityWarning = () => {
    if (!product || product.image !== 'gaming-pc') return null;
    const cpu = selected['CPU'];
    const motherboard = selected['Motherboard'];
    if (cpu && motherboard) {
      const isIntel = cpu.name.toLowerCase().includes('intel');
      const isAMD = cpu.name.toLowerCase().includes('amd');
      const mbIntel = motherboard.name.toLowerCase().includes('intel');
      const mbAMD = motherboard.name.toLowerCase().includes('amd');
      if ((isIntel && mbAMD) || (isAMD && mbIntel)) {
        return 'Selected CPU and Motherboard are not compatible!';
      }
    }
    return null;
  };

  const warning = getCompatibilityWarning();

  const handleSelect = (type: string, component: Component) => {
    setSelected(prev => ({ ...prev, [type]: component }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    const config: Record<string, { name: string; price: number }> = {};
    Object.entries(selected).forEach(([type, comp]) => {
      config[type] = { name: comp.name, price: Number(comp.price) };
    });
    addItem({
      productId: product.id,
      productName: product.name,
      basePrice,
      configuration: config,
      totalPrice,
      image: product.image,
    });
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const handleSaveBuild = async () => {
    if (!user) { toast.error('Please log in to save builds'); navigate('/login'); return; }
    if (!product) return;
    setSaving(true);
    const config: Record<string, { name: string; price: number }> = {};
    Object.entries(selected).forEach(([type, comp]) => {
      config[type] = { name: comp.name, price: Number(comp.price) };
    });
    const { data, error } = await supabase.from('builds').insert({
      user_id: user.id,
      product_id: product.id,
      configuration: config,
      total_price: totalPrice,
    }).select().single();
    setSaving(false);
    if (error) toast.error('Failed to save build');
    else {
      setSharedBuildId(data.id);
      toast.success('Build saved to your dashboard!');
    }
  };

  const handleShareBuild = () => {
    if (!sharedBuildId) {
      toast.error('Save the build first to share it');
      return;
    }
    const url = `${window.location.origin}/build/${sharedBuildId}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 bg-muted rounded w-1/3 mb-8 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
          </div>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center"><p>Product not found.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">Configure: {product.name}</h1>
      <p className="text-muted-foreground mb-8">Select your components</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Component Selection */}
        <div className="lg:col-span-2 space-y-6">
          {componentTypes.map(type => {
            const typeComponents = components.filter(c => c.component_type === type);
            return (
              <div key={type} className="bg-card border rounded-xl p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">{type}</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {typeComponents.map(comp => {
                    const isSelected = selected[type]?.id === comp.id;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => handleSelect(type, comp)}
                        className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isSelected && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-primary font-bold text-sm mt-1">
                          {Number(comp.price) === 0 ? 'Included' : `+$${Number(comp.price).toFixed(2)}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Image Upload for phone case / t-shirt */}
          {supportsImageUpload && (
            <div className="bg-card border rounded-xl p-6">
              <ImageUploader onUpload={setCustomImage} currentUrl={customImage} />
            </div>
          )}

          {/* Reviews */}
          <ReviewSection productId={product.id} />
        </div>

        {/* Price Panel */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 space-y-4 sticky top-20">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={imageMap[product.image] || defaultImg} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {customImage && (
              <div className="aspect-square rounded-lg overflow-hidden border max-w-[150px]">
                <img src={customImage} alt="Your design" className="w-full h-full object-cover" />
              </div>
            )}

            <h3 className="font-display text-lg font-semibold">Build Summary</h3>

            {warning && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{warning}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {Object.entries(selected).map(([type, comp]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{type}: {comp.name}</span>
                  <span className="flex-shrink-0">{Number(comp.price) === 0 ? '—' : `+$${Number(comp.price).toFixed(2)}`}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleAddToCart} disabled={Object.keys(selected).length === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSaveBuild} disabled={saving || Object.keys(selected).length === 0}>
                <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Build'}
              </Button>
              {sharedBuildId && (
                <Button variant="outline" className="w-full" onClick={handleShareBuild}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Build
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
