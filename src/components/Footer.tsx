import { Flame } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <Flame className="h-5 w-5 text-primary" />
          CustomForge
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CustomForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
