import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Package, Sparkles, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge, Card } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { getProducts } from '@/services/productService';
import type { Product, ProductCategory } from '@/types';

export const MemberProductsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        const list = await getProducts(gymId, true); // Only active
        setProducts(list);
      } catch (err) {
        console.error('Error loading products for member:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId]);

  const filtered = products.filter(p => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Gym Store & Official Gear
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Browse supplements, nutrition products, and gear available at the gym reception desk
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'SUPPLEMENTS', 'APPAREL', 'ACCESSORIES', 'BEVERAGES', 'EQUIPMENT'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading gym store catalog...</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <Package className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-white">No products found</p>
          <p className="text-xs text-zinc-400 mt-1">Check back soon for new inventory items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => {
            const isOutOfStock = p.stockQuantity <= 0;

            return (
              <Card key={p.id} className="flex flex-col justify-between overflow-hidden p-0">
                <div className="h-44 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-800">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-zinc-700" />
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant={isOutOfStock ? 'red' : 'emerald'}>
                      {isOutOfStock ? 'Sold Out' : 'Available in Gym'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-lg font-black text-white">₹{p.price.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">Ask at reception desk</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
