import { useState } from "react";
import { useCare } from "../lib/care-context";
import { VITAL_RANGES } from "../lib/care-data";

type RecordTab = "vitals" | "intake_output" | "observations";

const VITAL_EMOJI: Record<string, string> = {
  temperature: "🌡️", blood_pressure_sys: "💓", blood_pressure_dia: "💓",
  heart_rate: "💗", spo2: "🫁",
};

const IO_LABELS: Record<string, { label: string; emoji: string }> = {
  nasal_feed: { label: "鼻饲", emoji: "🍽️" },
  water: { label: "饮水", emoji: "💧" },
  iv_fluid: { label: "输液", emoji: "💉" },
  urine: { label: "尿量", emoji: "🚽" },
  stool: { label: "大便", emoji: "📋" },
};

export default function RecordsPage() {
  const { state } = useCare();
  const [tab, setTab] = useState<RecordTab>("vitals");

  const tabs: { id: RecordTab; label: string }[] = [
    { id: "vitals", label: "生命体征" },
    { id: "intake_output", label: "出入量" },
    { id: "observations", label: "观察记录" },
  ];

  const totalIntake = state.todayIntakeOutput
    .filter(r => r.type !== "urine" && r.type !== "stool")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalOutput = state.todayIntakeOutput
    .filter(r => r.type === "urine")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{
        background: "#FFFFFF", padding: "40px 20px 12px",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)" }}>数据记录</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>今日护理数据汇总</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", background: "#FFFFFF", borderBottom: "1px solid var(--color-border)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 0", fontSize: "13px", fontWeight: tab === t.id ? 600 : 500,
            color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)",
            borderBottom: tab === t.id ? "2px solid var(--color-primary)" : "2px solid transparent",
            background: "none", border: "none", borderBottomStyle: "solid", cursor: "pointer",
            transition: "all 0.2s ease",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Vitals */}
        {tab === "vitals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {state.todayVitals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>📊</p>
                <p style={{ fontSize: "14px" }}>今日暂无生命体征记录</p>
                <p style={{ fontSize: "12px", marginTop: "4px" }}>请在"生命体征测量"任务中录入</p>
              </div>
            ) : (
              state.todayVitals.slice().reverse().map(v => {
                const range = VITAL_RANGES[v.type];
                return (
                  <div key={v.id} className="card" style={{
                    padding: "14px",
                    background: v.isAbnormal ? "linear-gradient(135deg, #FFEBEE, #FFF5F5)" : undefined,
                    borderColor: v.isAbnormal ? "#FFCDD2" : undefined,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>{VITAL_EMOJI[v.type] || "📋"}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{range?.label || v.type}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{v.time}</span>
                    </div>
                    <div style={{ marginTop: "6px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800, color: v.isAbnormal ? "#C62828" : "var(--color-text)" }}>{v.value}</span>
                      <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{range?.unit}</span>
                      {v.isAbnormal && (
                        <span className={v.alertLevel === "red" ? "badge-error" : "badge-warning"} style={{
                          marginLeft: "8px", padding: "2px 8px", borderRadius: "100px",
                          fontSize: "10px", fontWeight: 700,
                        }}>
                          {v.alertLevel === "red" ? "严重异常" : "异常"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Intake/Output */}
        {tab === "intake_output" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="card" style={{ padding: "14px" }}>
              <h3 className="section-title" style={{ marginBottom: "10px" }}>今日出入量汇总</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "var(--color-primary-light)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600 }}>总入量</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-primary-dark)", marginTop: "2px" }}>
                    {totalIntake}<span style={{ fontSize: "11px", fontWeight: 500, marginLeft: "2px" }}>ml</span>
                  </p>
                </div>
                <div style={{ background: "var(--color-warning-light)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--color-warning)", fontWeight: 600 }}>总出量(尿)</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-warning)", marginTop: "2px" }}>
                    {totalOutput}<span style={{ fontSize: "11px", fontWeight: 500, marginLeft: "2px" }}>ml</span>
                  </p>
                </div>
              </div>
            </div>
            {state.todayIntakeOutput.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-secondary)" }}>
                <p style={{ fontSize: "14px" }}>今日暂无出入量记录</p>
              </div>
            ) : (
              state.todayIntakeOutput.slice().reverse().map(r => (
                <div key={r.id} className="card" style={{ padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>{IO_LABELS[r.type]?.emoji || "📋"}</span>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600 }}>{IO_LABELS[r.type]?.label || r.type}</p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{r.time}{r.note ? ` · ${r.note}` : ""}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-text)" }}>
                    {r.amount || "-"}<span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)", marginLeft: "2px" }}>ml</span>
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Observations */}
        {tab === "observations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {state.todayObservations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>👁️</p>
                <p style={{ fontSize: "14px" }}>今日暂无观察记录</p>
              </div>
            ) : (
              state.todayObservations.slice().reverse().map(o => (
                <div key={o.id} className="card" style={{
                  padding: "14px",
                  background: o.isAbnormal ? "linear-gradient(135deg, #FFF3E0, #FFF8E1)" : undefined,
                  borderColor: o.isAbnormal ? "#FFE0B2" : undefined,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span className={o.isAbnormal ? "badge-warning" : "badge-success"} style={{
                      padding: "2px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
                    }}>
                      {o.isAbnormal ? "⚠ 异常" : "✓ 正常"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{o.time}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-text)", lineHeight: 1.5 }}>{o.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
