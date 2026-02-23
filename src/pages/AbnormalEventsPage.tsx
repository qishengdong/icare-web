import { useState } from "react";
import { useCare } from "../lib/care-context";

interface Props { onBack: () => void; }

const STATUS_CONFIG: Record<string, { emoji: string; label: string; bg: string; border: string; color: string }> = {
  pending: { emoji: "⏳", label: "待处理", bg: "linear-gradient(135deg, #FFEBEE, #FFF5F5)", border: "#FFCDD2", color: "#C62828" },
  acknowledged: { emoji: "👁️", label: "已确认", bg: "linear-gradient(135deg, #FFF3E0, #FFF8E1)", border: "#FFE0B2", color: "#E65100" },
  escalated: { emoji: "📤", label: "已上报", bg: "linear-gradient(135deg, #F3E8FF, #FAF5FF)", border: "#E9D5FF", color: "#7C3AED" },
  resolved: { emoji: "✅", label: "已解决", bg: "linear-gradient(135deg, #E8F5E9, #F1F8E9)", border: "#C8E6C9", color: "#2E7D32" },
};

export default function AbnormalEventsPage({ onBack }: Props) {
  const { state, acknowledgeEvent, resolveEvent, escalateEvent } = useCare();
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [showResolveInput, setShowResolveInput] = useState<string | null>(null);

  const events = state.allAbnormalEvents.slice().reverse();
  const pending = events.filter(e => e.status === "pending");
  const inProgress = events.filter(e => e.status === "acknowledged" || e.status === "escalated");
  const resolved = events.filter(e => e.status === "resolved");

  const handleResolve = (eventId: string) => {
    resolveEvent(eventId, resolveNote[eventId] || "已处理");
    setShowResolveInput(null);
  };

  const renderEvent = (event: typeof events[0]) => {
    const config = STATUS_CONFIG[event.status];
    return (
      <div key={event.id} style={{
        borderRadius: "14px", padding: "14px", border: `1px solid ${config.border}`,
        background: config.bg,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: event.alertLevel === "red" ? "#EF5350" : "#FFA726",
            }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: config.color, display: "flex", alignItems: "center", gap: "4px" }}>
              {config.emoji} {config.label}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>{event.date} {event.time}</span>
        </div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>{event.description}</p>

        {event.status === "pending" && (
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button onClick={() => acknowledgeEvent(event.id)} className="press-feedback" style={{
              flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #FFA726, #FB8C00)", color: "#fff",
              fontSize: "12px", fontWeight: 700,
            }}>确认知晓</button>
            <button onClick={() => escalateEvent(event.id)} className="press-feedback" style={{
              flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #AB47BC, #8E24AA)", color: "#fff",
              fontSize: "12px", fontWeight: 700,
            }}>上报医护</button>
          </div>
        )}

        {event.status === "acknowledged" && (
          <div style={{ marginTop: "10px" }}>
            {showResolveInput === event.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input type="text" value={resolveNote[event.id] || ""}
                  onChange={(e) => setResolveNote({ ...resolveNote, [event.id]: e.target.value })}
                  placeholder="处理措施..."
                  style={{
                    width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px",
                    padding: "8px 12px", fontSize: "13px", background: "#FFFFFF",
                  }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleResolve(event.id)} className="press-feedback" style={{
                    flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #66BB6A, #43A047)", color: "#fff",
                    fontSize: "12px", fontWeight: 700,
                  }}>确认解决</button>
                  <button onClick={() => escalateEvent(event.id)} className="press-feedback" style={{
                    flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #AB47BC, #8E24AA)", color: "#fff",
                    fontSize: "12px", fontWeight: 700,
                  }}>上报医护</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowResolveInput(event.id)} className="press-feedback" style={{
                  flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #66BB6A, #43A047)", color: "#fff",
                  fontSize: "12px", fontWeight: 700,
                }}>标记解决</button>
                <button onClick={() => escalateEvent(event.id)} className="press-feedback" style={{
                  flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #AB47BC, #8E24AA)", color: "#fff",
                  fontSize: "12px", fontWeight: 700,
                }}>上报医护</button>
              </div>
            )}
          </div>
        )}

        {event.status === "resolved" && event.resolvedNote && (
          <p style={{ fontSize: "11px", color: "#2E7D32", marginTop: "8px" }}>
            ✅ 处理: {event.resolvedNote} · {event.resolvedAt}
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--color-bg)" }}>
      <div className="header-gradient" style={{ padding: "40px 20px 16px", borderRadius: "0 0 24px 24px" }}>
        <button onClick={onBack} className="press-feedback" style={{
          display: "flex", alignItems: "center", gap: "4px",
          color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500,
          background: "none", border: "none", cursor: "pointer", marginBottom: "10px",
        }}>
          <span style={{ fontSize: "20px" }}>‹</span> 返回
        </button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>异常事件管理</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
          共 {events.length} 条记录 · {pending.length} 条待处理
        </p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: "40px", marginBottom: "8px" }}>✅</p>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>暂无异常事件，一切正常</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#C62828", marginBottom: "8px", paddingLeft: "4px" }}>
                  🔴 待处理 ({pending.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{pending.map(renderEvent)}</div>
              </div>
            )}
            {inProgress.length > 0 && (
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#E65100", marginBottom: "8px", paddingLeft: "4px" }}>
                  🟡 处理中 ({inProgress.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{inProgress.map(renderEvent)}</div>
              </div>
            )}
            {resolved.length > 0 && (
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#2E7D32", marginBottom: "8px", paddingLeft: "4px" }}>
                  🟢 已解决 ({resolved.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{resolved.map(renderEvent)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
