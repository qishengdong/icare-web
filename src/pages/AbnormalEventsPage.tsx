import { useState } from "react";
import { useCare } from "../lib/care-context";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, ArrowUpCircle } from "lucide-react";

interface Props { onBack: () => void; }

export default function AbnormalEventsPage({ onBack }: Props) {
  const { state, acknowledgeEvent, resolveEvent, escalateEvent } = useCare();
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [showResolveInput, setShowResolveInput] = useState<string | null>(null);

  const events = state.allAbnormalEvents.slice().reverse();
  const pending = events.filter(e => e.status === "pending");
  const inProgress = events.filter(e => e.status === "acknowledged" || e.status === "escalated");
  const resolved = events.filter(e => e.status === "resolved");

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    pending: { icon: <Clock size={14} />, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "待处理" },
    acknowledged: { icon: <AlertTriangle size={14} />, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "已确认" },
    escalated: { icon: <ArrowUpCircle size={14} />, color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "已上报" },
    resolved: { icon: <CheckCircle2 size={14} />, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "已解决" },
  };

  const handleResolve = (eventId: string) => {
    resolveEvent(eventId, resolveNote[eventId] || "已处理");
    setShowResolveInput(null);
  };

  const renderEvent = (event: typeof events[0]) => {
    const config = statusConfig[event.status];
    return (
      <div key={event.id} className={`rounded-xl p-4 border ${config.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${event.alertLevel === "red" ? "bg-red-500" : "bg-orange-400"}`} />
            <span className={`text-xs font-medium ${config.color} flex items-center gap-1`}>{config.icon} {config.label}</span>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">{event.date} {event.time}</span>
        </div>
        <p className="text-sm font-medium text-[var(--color-text)]">{event.description}</p>

        {/* Actions */}
        {event.status === "pending" && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => acknowledgeEvent(event.id)}
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">确认知晓</button>
            <button onClick={() => escalateEvent(event.id)}
              className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">上报医护</button>
          </div>
        )}
        {event.status === "acknowledged" && (
          <div className="mt-3">
            {showResolveInput === event.id ? (
              <div className="space-y-2">
                <input type="text" value={resolveNote[event.id] || ""} onChange={(e) => setResolveNote({ ...resolveNote, [event.id]: e.target.value })}
                  placeholder="处理措施..." className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none" />
                <div className="flex gap-2">
                  <button onClick={() => handleResolve(event.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">确认解决</button>
                  <button onClick={() => escalateEvent(event.id)} className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">上报医护</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowResolveInput(event.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">标记解决</button>
                <button onClick={() => escalateEvent(event.id)} className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-xs font-medium press-feedback">上报医护</button>
              </div>
            )}
          </div>
        )}
        {event.status === "resolved" && event.resolvedNote && (
          <p className="text-xs text-green-600 mt-2">处理: {event.resolvedNote} · {event.resolvedAt}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[var(--color-border)]">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--color-primary)] mb-2">
          <ArrowLeft size={18} /> 返回
        </button>
        <h1 className="text-xl font-bold">异常事件管理</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">暂无异常事件，一切正常</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-red-600 mb-2">待处理 ({pending.length})</h3>
                <div className="space-y-2">{pending.map(renderEvent)}</div>
              </div>
            )}
            {inProgress.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-orange-600 mb-2">处理中 ({inProgress.length})</h3>
                <div className="space-y-2">{inProgress.map(renderEvent)}</div>
              </div>
            )}
            {resolved.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-green-600 mb-2">已解决 ({resolved.length})</h3>
                <div className="space-y-2">{resolved.map(renderEvent)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
