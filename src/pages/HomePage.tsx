import { useCare } from "../lib/care-context";
import { CARE_TASKS, getShiftShortLabel, formatDate } from "../lib/care-data";

const TASK_ICONS: Record<string, string> = {
  turn_position: "🔄", oral_care: "🦷", nasal_feeding: "🍽️",
  perineal_care: "🛡️", passive_exercise: "💪", skin_check: "👁️",
  vital_signs: "❤️", intake_output: "💧", neuro_observation: "🧠",
  abdomen_limb_check: "🔍",
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  basic_care: { bg: "#F0F7F1", text: "#3D7A4A", border: "#C8E6C9" },
  observation: { bg: "#F3E8FF", text: "#7C3AED", border: "#DDD6FE" },
  rehabilitation: { bg: "#FFF8E1", text: "#E65100", border: "#FFE0B2" },
  prevention: { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
};

interface Props {
  navigate: (page: any) => void;
}

export default function HomePage({ navigate }: Props) {
  const { state, getCompletionRate, getPendingAlerts } = useCare();
  const rate = getCompletionRate();
  const pendingAlerts = getPendingAlerts();
  const completedIds = new Set(state.todayCheckIns.filter(c => c.completed).map(c => c.taskId));
  const completedCount = completedIds.size;
  const percentage = Math.round(rate * 100);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="header-gradient text-white px-5 pt-10 pb-5" style={{ borderRadius: "0 0 24px 24px" }}>
        <div className="flex items-center justify-between mb-0.5">
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em" }}>{state.patientInfo.name}</h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              {formatDate(state.currentDate)} · {state.patientInfo.careLevel}
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            padding: "5px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
          }}>
            {getShiftShortLabel(state.currentShift)}
          </div>
        </div>

        {/* Key Alert */}
        {state.patientInfo.keyAlerts.length > 0 && (
          <div style={{
            background: "rgba(198,40,40,0.25)", borderRadius: "10px",
            padding: "7px 12px", marginTop: "10px", marginBottom: "12px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚠️</span> {state.patientInfo.keyAlerts[0]}
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-4" style={{ marginTop: "4px" }}>
          <div style={{ position: "relative", width: "56px", height: "56px" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4.5" />
              <circle cx="28" cy="28" r="23" fill="none" stroke="#8BC34A" strokeWidth="4.5"
                strokeDasharray={`${rate * 144.5} 144.5`} strokeLinecap="round" className="progress-ring-circle" />
            </svg>
            <span style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: 800, color: "#fff",
            }}>{percentage}%</span>
          </div>
          <div>
            <p style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>今日护理进度</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              已完成 <span style={{ color: "#8BC34A", fontWeight: 700 }}>{completedCount}</span>/{CARE_TASKS.length} 项任务
            </p>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
      {pendingAlerts.length > 0 && (
        <div style={{ padding: "12px 16px 0" }}>
          <button onClick={() => navigate({ type: "abnormal_events" })}
            className="press-feedback" style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              background: "linear-gradient(135deg, #FFEBEE, #FCE4EC)", border: "1px solid #FFCDD2",
              borderRadius: "14px", padding: "12px 14px", cursor: "pointer",
            }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #EF5350, #C62828)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
            }}>🚨</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#C62828" }}>{pendingAlerts.length} 个异常待处理</p>
              <p style={{ fontSize: "11px", color: "#E53935", marginTop: "1px" }}>{pendingAlerts[0].description}</p>
            </div>
            <span style={{ fontSize: "18px", color: "#EF9A9A" }}>›</span>
          </button>
        </div>
      )}

      {/* Task List */}
      <div style={{ padding: "14px 16px 0" }}>
        <h2 className="section-title" style={{ marginBottom: "10px" }}>护理任务清单</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {CARE_TASKS.map((task) => {
            const done = completedIds.has(task.id);
            const checkIn = state.todayCheckIns.find(c => c.taskId === task.id && c.completed);
            const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.basic_care;

            return (
              <button key={task.id}
                onClick={() => navigate({ type: "task_detail", taskId: task.id })}
                className="press-feedback" style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 14px", borderRadius: "14px", cursor: "pointer",
                  background: done ? "linear-gradient(135deg, #E8F5E9, #F1F8E9)" : "#FFFFFF",
                  border: `1px solid ${done ? "#C8E6C9" : "var(--color-border)"}`,
                  boxShadow: done ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: done ? "#C8E6C9" : catStyle.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                }}>
                  {TASK_ICONS[task.id] || "📋"}
                </div>
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <p style={{
                    fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em",
                    color: done ? "#2E7D32" : "var(--color-text)",
                  }}>{task.name}</p>
                  <p style={{
                    fontSize: "11px", color: "var(--color-text-secondary)",
                    marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{task.frequency}</p>
                  {checkIn && (
                    <p style={{ fontSize: "11px", color: "#2E7D32", fontWeight: 600, marginTop: "2px" }}>
                      ✓ 已完成 {checkIn.time}
                    </p>
                  )}
                </div>
                {done ? (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #66BB6A, #43A047)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "14px", flexShrink: 0,
                  }}>✓</div>
                ) : (
                  <div style={{
                    padding: "5px 14px", borderRadius: "100px",
                    background: "linear-gradient(135deg, #3D7A4A, #2E5E38)",
                    color: "#fff", fontSize: "12px", fontWeight: 600, flexShrink: 0,
                    letterSpacing: "0.02em",
                  }}>打卡</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
