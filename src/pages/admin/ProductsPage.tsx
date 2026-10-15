import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit2, Package, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getProducts, createProduct, updateProduct } from '@/services/productService';
import type { Product, ProductCategory } from '@/types';

export const ProductsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('SUPPLEMENTS');
  const [price, setPrice] = useState(999);
  const [stockQuantity, setStockQuantity] = useState(20);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadProducts = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const list = await getProducts(gymId);
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [gymId]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setCategory('SUPPLEMENTS');
    setPrice(999);
    setStockQuantity(20);
    setDescription('');
    setImageUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStockQuantity(p.stockQuantity);
    setDescription(p.description);
    setImageUrl(p.imageUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || stockQuantity < 0) {
      setError('Please provide valid product details.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Administrator',
        role: profile?.role || 'ADMIN',
      };

      if (editingProduct) {
        await updateProduct(
          gymId,
          editingProduct.id,
          {
            name,
            category,
            price: Number(price),
            stockQuantity: Number(stockQuantity),
            description,
            imageUrl,
          },
          actor
        );
      } else {
        await createProduct(
          gymId,
          {
            name,
            category,
            price: Number(price),
            stockQuantity: Number(stockQuantity),
            description,
            imageUrl,
          },
          actor
        );
      }

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Gym Store & Products
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {filteredProducts.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage supplements, gym gear, apparel, and retail inventory
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Products Grid */}
      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading product inventory...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <Package className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-white">No products found</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Add retail items for gym members to view in their store portal.</p>
          <Button size="sm" onClick={handleOpenCreate}>Add First Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stockQuantity <= 0;
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 5;

            return (
              <Card key={p.id} className="flex flex-col justify-between overflow-hidden p-0">
                {/* Product Image */}
                <div className="h-44 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-800">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-zinc-700" />
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant={isOutOfStock ? 'red' : isLowStock ? 'amber' : 'emerald'}>
                      {isOutOfStock ? 'Out of stock' : `${p.stockQuantity} in stock`}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
                      {p.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-white">₹{p.price.toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(p)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Gym Product'}
        description="Display supplements, merchandise, and gym gear to members."
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Whey Protein Isolate 2kg"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="SUPPLEMENTS">Supplements</option>
                <option value="APPAREL">Apparel</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Price (₹) *"
              type="number"
              required
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity *"
              type="number"
              required
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
            />
            <Input
              label="Image URL"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on flavor, serving size, materials..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
