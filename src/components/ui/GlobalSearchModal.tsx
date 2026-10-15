import React, { useState, useEffect } from 'react';
import { Search, Users, CreditCard, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMembers } from '@/services/memberService';
import { getProducts } from '@/services/productService';
import { getComplaints } from '@/services/complaintService';
import type { Member, Product, Complaint } from '@/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !profile?.gymId || !searchTerm.trim()) {
      setMembers([]);
      setProducts([]);
      setComplaints([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [mList, pList, cList] = await Promise.all([
          getMembers(profile.gymId, { search: searchTerm }),
          getProducts(profile.gymId),
          getComplaints(profile.gymId),
        ]);

        const term = searchTerm.toLowerCase();
        setMembers(mList.slice(0, 5));
        setProducts(pList.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)).slice(0, 5));
        setComplaints(cList.filter(c => c.title.toLowerCase().includes(term) || c.category.toLowerCase().includes(term) || c.memberName.toLowerCase().includes(term)).slice(0, 5));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, profile?.gymId]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const hasResults = members.length > 0 || products.length > 0 || complaints.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden z-10">
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search members, products, problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-xs text-zinc-500 text-center py-6">Searching GymOS database...</p>
          )}

          {!loading && searchTerm.trim() && !hasResults && (
            <p className="text-xs text-zinc-500 text-center py-6">No matching records found for "{searchTerm}".</p>
          )}

          {/* Members Category */}
          {members.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Members ({members.length})
              </p>
              <div className="space-y-1">
                {members.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleSelect(`/admin/members/${m.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {m.fullName}
                      </p>
                      <p className="text-[11px] text-zinc-400">{m.email} • {m.phone}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Category */}
          {products.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> Products ({products.length})
              </p>
              <div className="space-y-1">
                {products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect('/admin/products')}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-zinc-400">{p.category} • ₹{p.price} • Stock: {p.stockQuantity}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints Category */}
          {complaints.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" /> Maintenance & Problems ({complaints.length})
              </p>
              <div className="space-y-1">
                {complaints.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect('/admin/problems')}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-zinc-400">By {c.memberName} • {c.category} • Status: {c.status}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
