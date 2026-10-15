import React, { useState, useEffect } from 'react';
import { History, Shield, Clock, FileText, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuditLogs } from '@/services/auditService';
import { formatReadableDateTime } from '@/utils/dateUtils';
import type { AuditLog } from '@/types';
import { Badge } from '@/components/ui/Badge';

export const AuditLogsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        const list = await getAuditLogs(gymId, 100);
        setLogs(list);
      } catch (e) {
        console.error('Error fetching audit logs:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Security & Audit Logs
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
            {logs.length}
          </span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Immutable event log of operational modifications, renewals, and administrative actions
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Details / Metadata</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-zinc-300">
                      <span className="text-emerald-400 font-sans">{log.actorName}</span>{' '}
                      <span className="text-zinc-500 font-sans">({log.actorRole})</span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="zinc">{log.entityType}</Badge>
                    </td>

                    <td className="py-3 px-4 text-zinc-400 truncate max-w-[120px]">
                      {log.entityId}
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-sans text-xs max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>

                    <td className="py-3 px-4 text-zinc-500 font-sans text-xs whitespace-nowrap">
                      {formatReadableDateTime(log.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
