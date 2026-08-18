import React, { useState } from 'react';
import { Activity, Shield, RefreshCw, Clock, Filter } from 'lucide-react';
import { ActivityLog } from '../../types';

interface AdminActivityLogsProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const AdminActivityLogs: React.FC<AdminActivityLogsProps> = ({
  logs,
  onRefresh,
}) => {
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (filterEntity === 'all') return true;
    return log.entityType === filterEntity;
  });

  return (
    <div id="admin-logs-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">System Activity & Audit Logs</h2>
          <p className="text-xs text-slate-400">
            Immutable audit record of all case study modifications, AI executions, and screenshot captures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="rounded-lg border border-[#232e42] bg-[#121723] px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="project">Projects</option>
            <option value="message">Messages</option>
            <option value="screenshot">Screenshots</option>
            <option value="profile">Profile</option>
            <option value="security">Security & Settings</option>
          </select>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg border border-[#232e42] bg-[#121723] px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#202738] bg-[#0c1017]">
        <div className="divide-y divide-[#182030]">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No activity logs found.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 text-xs transition-colors hover:bg-[#0f1420]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#242f42] bg-[#121722] text-amber-400">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {log.action}
                      </span>
                      <span className="rounded bg-[#171e2c] px-2 py-0.2 font-mono text-[9px] text-amber-300">
                        {log.entityType.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-500 shrink-0 ml-4">
                  {new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
