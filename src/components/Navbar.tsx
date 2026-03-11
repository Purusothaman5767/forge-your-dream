import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, Menu, X, Flame, Heart, Shield, User, GitCompareArrows, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').then(({ data }) => {
      setIsAdmin(!!(data && data.length > 0));
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLink = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Flame className="h-6 w-6 text-primary" />
          CustomForge
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/products" className={navLink}>Products</Link>
          <Link to="/budget-builder" className={navLink} title="Budget Builder">
            <Wand2 className="h-4 w-4" />
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={navLink}>Dashboard</Link>
              <Link to="/orders" className={navLink}>Orders</Link>
              <Link to="/compare" className={navLink} title="Compare Builds">
                <GitCompareArrows className="h-4 w-4" />
              </Link>
              <Link to="/wishlist" className={navLink}>
                <Heart className="h-4 w-4" />
              </Link>
              <Link to="/profile" className={navLink}>
                <User className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className={navLink}>
                  <Shield className="h-4 w-4" />
                </Link>
              )}
            </>
          )}
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background p-4 space-y-3 animate-fade-in">
          <Link to="/products" className="block text-sm" onClick={() => setOpen(false)}>Products</Link>
          <Link to="/budget-builder" className="block text-sm" onClick={() => setOpen(false)}>Budget Builder</Link>
          {user && (
            <>
              <Link to="/dashboard" className="block text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/orders" className="block text-sm" onClick={() => setOpen(false)}>Orders</Link>
              <Link to="/compare" className="block text-sm" onClick={() => setOpen(false)}>Compare Builds</Link>
              <Link to="/wishlist" className="block text-sm" onClick={() => setOpen(false)}>Wishlist</Link>
              <Link to="/profile" className="block text-sm" onClick={() => setOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" className="block text-sm" onClick={() => setOpen(false)}>Admin</Link>}
            </>
          )}
          <Link to="/cart" className="block text-sm" onClick={() => setOpen(false)}>Cart ({items.length})</Link>
          {user ? (
            <button className="text-sm text-destructive" onClick={() => { handleSignOut(); setOpen(false); }}>Logout</button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setOpen(false); }}>Login</Button>
              <Button size="sm" onClick={() => { navigate('/signup'); setOpen(false); }}>Sign Up</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
