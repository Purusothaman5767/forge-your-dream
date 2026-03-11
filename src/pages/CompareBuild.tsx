import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GitCompareArrows } from 'lucide-react';

export default function CompareBuild() {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<any[]>([]);
  const [buildA, setBuildA] = useState<string>('');
  const [buildB, setBuildB] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('builds').select('*, products(name)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setBuilds(data || []); setLoading(false); });
  }, [user]);

  const a = builds.find(b => b.id === buildA);
  const b = builds.find(b => b.id === buildB);

  const allTypes = new Set<string>();
  if (a) Object.keys(a.configuration as Record<string, any>).forEach(k => allTypes.add(k));
  if (b) Object.keys(b.configuration as Record<string, any>).forEach(k => allTypes.add(k));

  const configA = (a?.configuration || {}) as Record<string, { name: string; price: number }>;
  const configB = (b?.configuration || {}) as Record<string, { name: string; price: number }>;

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <GitCompareArrows className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">Compare Builds</h1>
      </div>
      <p className="text-muted-foreground mb-8">Select two saved builds to compare side by side</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
        </div>
      ) : builds.length < 2 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">You need at least 2 saved builds to compare.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Build A</label>
              <Select value={buildA} onValueChange={setBuildA}>
                <SelectTrigger><SelectValue placeholder="Select build" /></SelectTrigger>
                <SelectContent>
                  {builds.map(b => (
                    <SelectItem key={b.id} value={b.id} disabled={b.id === buildB}>
                      {b.products?.name} — ${Number(b.total_price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Build B</label>
              <Select value={buildB} onValueChange={setBuildB}>
                <SelectTrigger><SelectValue placeholder="Select build" /></SelectTrigger>
                <SelectContent>
                  {builds.map(b => (
                    <SelectItem key={b.id} value={b.id} disabled={b.id === buildA}>
                      {b.products?.name} — ${Number(b.total_price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {a && b && (
            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Build A</TableHead>
                    <TableHead>Build B</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Product</TableCell>
                    <TableCell>{a.products?.name}</TableCell>
                    <TableCell>{b.products?.name}</TableCell>
                  </TableRow>
                  {[...allTypes].map(type => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">{type}</TableCell>
                      <TableCell>
                        {configA[type] ? (
                          <span>{configA[type].name} <span className="text-muted-foreground text-xs">(+${Number(configA[type].price).toFixed(2)})</span></span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {configB[type] ? (
                          <span>{configB[type].name} <span className="text-muted-foreground text-xs">(+${Number(configB[type].price).toFixed(2)})</span></span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Price</TableCell>
                    <TableCell className="text-primary">${Number(a.total_price).toFixed(2)}</TableCell>
                    <TableCell className="text-primary">${Number(b.total_price).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
