import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, AlertTriangle, Check, Share2 } from 'lucide-react';
import ReviewSection from '@/components/ReviewSection';
import ImageUploader from '@/components/ImageUploader';
import BrandSelector from '@/components/BrandSelector';
import ConfiguratorPreview from '@/components/ConfiguratorPreview';
import SemiConfigurator from '@/components/SemiConfigurator';
import FixedConfigurator from '@/components/FixedConfigurator';

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
  const [selected, setSelected] = useState<Record<string, { id?: string; name: string; price: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customImage, setCustomImage] = useState('');
  const [sharedBuildId, setSharedBuildId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandStep, setBrandStep] = useState(true);
  const [dynamicTotal, setDynamicTotal] = useState<number | null>(null);

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

  const customizationType: string = product?.customization_type || 'full';
  const componentTypes = [...new Set(components.map(c => c.component_type))];
  const basePrice = product ? Number(product.base_price) : 0;
  const componentTotal = customizationType === 'full'
    ? Object.values(selected).reduce((sum, c) => sum + Number(c.price), 0)
    : 0;
  const totalPrice = dynamicTotal ?? (basePrice + componentTotal);

  const supportsImageUpload = product && ['phone-case', 't-shirt'].includes(product.image);

  const getCompatibilityWarning = () => {
    if (!product || product.image !== 'gaming-pc' || customizationType !== 'full') return null;
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

  const handleDynamicConfigChange = useCallback((config: Record<string, { name: string; price: number }>, total: number) => {
    setSelected(config as any);
    setDynamicTotal(total);
  }, []);

  const buildConfig = () => {
    const config: Record<string, { name: string; price: number }> = {};
    Object.entries(selected).forEach(([type, comp]) => {
      config[type] = { name: comp.name, price: Number(comp.price) };
    });
    return config;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      basePrice,
      configuration: buildConfig(),
      totalPrice,
      image: product.image,
      brand: selectedBrand || undefined,
    });
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      basePrice,
      configuration: buildConfig(),
      totalPrice,
      image: product.image,
      brand: selectedBrand || undefined,
    });
    toast.success('Added to cart!');
    navigate(user ? '/checkout' : '/login');
  };

  const handleSaveBuild = async () => {
    if (!user) { toast.error('Please log in to save builds'); navigate('/login'); return; }
    if (!product) return;
    setSaving(true);
    const { data, error } = await supabase.from('builds').insert({
      user_id: user.id,
      product_id: product.id,
      configuration: buildConfig(),
      total_price: totalPrice,
      brand: selectedBrand,
    } as any).select().single();
    setSaving(false);
    if (error) toast.error('Failed to save build');
    else {
      setSharedBuildId(data.id);
      toast.success('Build saved to your dashboard!');
    }
  };

  const handleShareBuild = () => {
    if (!sharedBuildId) { toast.error('Save the build first to share it'); return; }
    navigator.clipboard.writeText(`${window.location.origin}/build/${sharedBuildId}`);
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

  if (brandStep) {
    return (
      <BrandSelector
        productId={product.id}
        productName={product.name}
        onSelect={(brand) => { setSelectedBrand(brand); setBrandStep(false); }}
        onSkip={() => setBrandStep(false)}
      />
    );
  }

  const hasSelection = Object.keys(selected).length > 0;

  const typeLabel = customizationType === 'full' ? 'Select your components'
    : customizationType === 'semi' ? 'Choose a configuration'
    : 'Choose your options';

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-1">
        Configure: {product.name}{selectedBrand ? ` (${selectedBrand})` : ''}
      </h1>
      <p className="text-muted-foreground mb-8">{typeLabel}</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Config Area */}
        <div className="lg:col-span-2 space-y-6">
          {warning && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{warning}</p>
            </div>
          )}

          {/* Full mode: existing component selectors */}
          {customizationType === 'full' && componentTypes.map(type => {
            const typeComponents = components.filter(c => c.component_type === type);
            return (
              <div key={type} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">{type}</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {typeComponents.map(comp => {
                    const isSelected = selected[type]?.name === comp.name && selected[type]?.price === comp.price;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => handleSelect(type, comp)}
                        className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected ? 'border-primary bg-accent shadow-md shadow-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isSelected && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-primary font-bold text-sm mt-1">
                          {Number(comp.price) === 0 ? 'Included' : `+₹${(Number(comp.price) * 80).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Semi mode: variant selector + optional upgrades */}
          {customizationType === 'semi' && (
            <SemiConfigurator
              productId={product.id}
              basePrice={basePrice}
              onConfigChange={handleDynamicConfigChange}
            />
          )}

          {/* Fixed mode: simple options (color, size, material) */}
          {customizationType === 'fixed' && (
            <FixedConfigurator
              productId={product.id}
              basePrice={basePrice}
              onConfigChange={handleDynamicConfigChange}
            />
          )}

          {supportsImageUpload && (
            <div className="bg-card border border-border rounded-xl p-6">
              <ImageUploader onUpload={setCustomImage} currentUrl={customImage} />
            </div>
          )}

          <ReviewSection productId={product.id} />
        </div>

        {/* Right: Preview + Actions */}
        <div className="space-y-4">
          <ConfiguratorPreview
            product={product}
            selected={selected as any}
            selectedBrand={selectedBrand}
            customImage={customImage}
            basePrice={basePrice}
            totalPrice={totalPrice}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            hasSelection={hasSelection}
          />

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleSaveBuild} disabled={saving || !hasSelection}>
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
  );
}
