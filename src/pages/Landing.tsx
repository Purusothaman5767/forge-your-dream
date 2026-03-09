import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, Palette, Zap } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import gamingPc from '@/assets/gaming-pc.jpg';
import phoneCase from '@/assets/phone-case.jpg';
import sneakers from '@/assets/sneakers.jpg';

const featured = [
  { name: 'Custom Gaming PC', price: '$500', image: gamingPc, desc: 'Build your dream rig from scratch' },
  { name: 'Custom Phone Case', price: '$15', image: phoneCase, desc: 'Design a case that's uniquely yours' },
  { name: 'Custom Sneakers', price: '$80', image: sneakers, desc: 'Step out in your own style' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Forge workshop" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="relative z-10 container mx-auto px-4 text-center space-y-6 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            Forge Your <span className="text-gradient-forge">Perfect</span> Product
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Configure, customize, and order products built exactly to your specifications.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/products')} className="font-display">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Why CustomForge?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Component Selection', desc: 'Choose from premium components for every product category' },
              { icon: Zap, title: 'Real-Time Pricing', desc: 'See your total update instantly as you configure' },
              { icon: Palette, title: 'Full Customization', desc: 'Every detail is yours to decide, from specs to aesthetics' },
            ].map(f => (
              <div key={f.title} className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map(p => (
              <div key={p.name} className="bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate('/products')}>
                <div className="aspect-square overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                  <p className="text-primary font-bold">From {p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
