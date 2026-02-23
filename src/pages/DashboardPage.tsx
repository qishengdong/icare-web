import { useCare } from "../lib/care-context";
import { CARE_TASKS, getRecentDates, formatDate, getCheckIns, VITAL_RANGES } from "../lib/care-data";

interface Props { navigate: (page: any) => void; }

const STATUS_STYLES: Record<string, { text: string; bg: string; color: string }> = {
  pending: { text: "待处理", bg: "linear-gradient(135deg, #FFEBEE, #FFCDD2)", color: "#C62828" },
  acknowledged: { text: "已确认", bg: "linear-gradient(135deg, #FFF3E0, #FFE0B2)", color: "#E65100" },
  escalated: { text: "已上报", bg: "linear-gradient(135deg, #F3E8FF, #E9D5FF)", color: "#7C3AED" },
  resolved: { text: "已解决", bg: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", color: "#2E7D32" },
};

export default function DashboardPage({ navigate }: Props) {
  const { state, getCompletionRate, getPendingAlerts } = useCare();
  const rate = getCompletionRate();
  const pendingAlerts = getPendingAlerts();
  const percentage = Math.round(rate * 100);

  const recentDates = getRecentDates(7);
  const dailyRates = recentDates.map(date => {
    const dayCheckIns = getCheckIns(date);
    const completed = new Set(dayCheckIns.filter(c => c.completed).map(c => c.taskId)).size;
    return { date, rate: CARE_TASKS.length > 0 ? completed / CARE_TASKS.length : 0 };
  });

  const latestVitals: Record<string, { value: number; isAbnormal: boolean; time: string }> = {};
  for (const v of state.todayVitals) {
    latestVitals[v.type] = { value: v.value, isAbnormal: v.isAbnormal, time: v.time };
  }

  const allEvents = state.allAbnormalEvents.slice().reverse().slice(0, 10);

  const rateColor = rate >= 0.8 ? "#2E7D32" : rate >= 0.5 ? "#E65100" : "#C62828";

  return (
    <div style={{ minHeight: "100%", paddingBottom: "16px" }}>
      {/* Header */}
      <div style={{ background: "#FFFFFF", padding: "40px 20px 14px", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)" }}>照护看板</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>家属远程查看护理进度</p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Today Summary */}
        <div className="card-elevated" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📊</span> 今日护理概览
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: "52px", height: "52px", margin: "0 auto 4px" }}>
                <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke={rateColor} strokeWidth="4"
                    strokeDasharray={`${rate * 138.2} 138.2`} strokeLinecap="round" className="progress-ring-circle" />
                </svg>
                <span style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 800, color: rateColor,
                }}>{percentage}%</span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>完成率</p>
            </div>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text)" }}>{state.todayVitals.length}</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>体征记录</p>
            </div>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontSize: "26px", fontWeight: 800, color: pendingAlerts.length > 0 ? "#C62828" : "#2E7D32" }}>{pendingAlerts.length}</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>待处理异常</p>
            </div>
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📈</span> 7日完成率趋势
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "4px", height: "80px" }}>
            {dailyRates.map((d, i) => {
              const barColor = d.rate >= 0.8 ? "#66BB6A" : d.rate >= 0.5 ? "#FFA726" : d.rate > 0 ? "#EF5350" : "var(--color-border)";
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "100%", background: "#F5F5F0", borderRadius: "4px 4px 0 0", position: "relative", height: "64px" }}>
                    <div style={{
                      position: "absolute", bottom: 0, width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max(d.rate * 100, 3)}%`, background: barColor,
                      transition: "height 0.4s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>
                    {formatDate(d.date).replace("月", "/").replace("日", "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Vitals */}
        {Object.keys(latestVitals).length > 0 && (
          <div className="card" style={{ padding: "16px" }}>
            <h3 className="section-title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>❤️</span> 最新生命体征
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {Object.entries(latestVitals).map(([type, data]) => {
                const range = VITAL_RANGES[type as keyof typeof VITAL_RANGES];
                return (
                  <div key={type} style={{
                    borderRadius: "12px", padding: "12px",
                    background: data.isAbnormal ? "linear-gradient(135deg, #FFEBEE, #FFF5F5)" : "#F5F5F0",
                    border: data.isAbnormal ? "1px solid #FFCDD2" : "1px solid transparent",
                  }}>
                    <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{range?.label || type}</p>
                    <p style={{ fontSize: "20px", fontWeight: 800, color: data.isAbnormal ? "#C62828" : "var(--color-text)", marginTop: "2px" }}>
                      {data.value}<span style={{ fontSize: "11px", fontWeight: 500, marginLeft: "2px" }}>{range?.unit}</span>
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{data.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abnormal Events Timeline */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🚨</span> 异常事件记录
            </h3>
            {allEvents.length > 0 && (
              <button onClick={() => navigate({ type: "abnormal_events" })} className="press-feedback" style={{
                fontSize: "12px", color: "var(--color-primary)", fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "2px",
              }}>
                查看全部 ›
              </button>
            )}
          </div>
          {allEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-text-secondary)" }}>
              <p style={{ fontSize: "24px", marginBottom: "4px" }}>✅</p>
              <p style={{ fontSize: "13px" }}>暂无异常事件，一切正常</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allEvents.slice(0, 5).map(event => {
                const st = STATUS_STYLES[event.status] || STATUS_STYLES.pending;
                return (
                  <div key={event.id} style={{ display: "flex", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                        background: event.alertLevel === "red" ? "#EF5350" : "#FFA726",
                      }} />
                      <div style={{ width: "1px", flex: 1, background: "var(--color-border)" }} />
                    </div>
                    <div style={{ flex: 1, paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "100px",
                          background: st.bg, color: st.color,
                        }}>{st.text}</span>
                        <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>{event.date} {event.time}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--color-text)", marginTop: "4px" }}>{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
