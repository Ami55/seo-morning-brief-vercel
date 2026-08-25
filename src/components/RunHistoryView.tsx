import React from 'react';
import { History, CheckCircle2, AlertTriangle, XCircle, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { Run } from '../types';

interface RunHistoryViewProps {
  runs: Run[];
  errorLogs: { id: string; timestamp: string; level: 'error' | 'warn' | 'info'; message: string; context?: string }[];
  onClearErrors: () => Promise<void>;
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({
  runs,
  errorLogs,
  onClearErrors
}) => {
  return (
    <div id="run-history-container" className="space-y-6">
      
      {/* Execution Runs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Research Run History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of all manual and scheduled daily SEO intelligence discovery executions
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            {runs.length} total runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Run ID &amp; Trigger</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Sources / Discovered</th>
                <th className="py-3.5 px-4">Email Delivery</th>
                <th className="py-3.5 px-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((run) => {
                const duration = run.completedAt
                  ? `${((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s`
                  : 'Running...';

                return (
                  <tr key={run.id} id={`run-row-${run.id}`} className="hover:bg-slate-50/60 transition-all">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{run.id}</span>
                      <span className="text-[10px] text-slate-400 capitalize">Trigger: {run.triggeredBy}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                          run.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : run.status === 'running'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {run.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : run.status === 'running' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {run.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      <div>{new Date(run.startedAt).toLocaleDateString()} {new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{run.sourcesChecked} sources</span>
                      <span className="text-slate-400 block text-[11px]">
                        {run.itemsDiscovered} discovered &bull; {run.itemsSelected} selected
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          run.emailStatus === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : run.emailStatus === 'failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {run.emailStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sanitized Error Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Sanitized System &amp; Access Log
            </h3>
          </div>

          {errorLogs.length > 0 && (
            <button
              onClick={onClearErrors}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {errorLogs.length === 0 ? (
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 italic text-center border border-slate-200/60">
            No system warnings or error events recorded. All background runners operating normally.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errorLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl text-xs border ${
                  log.level === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : log.level === 'warn'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono opacity-70 mb-1">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="uppercase font-bold">{log.level} {log.context ? `[${log.context}]` : ''}</span>
                </div>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
