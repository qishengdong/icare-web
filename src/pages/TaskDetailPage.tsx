import { useState } from "react";
import { useCare } from "../lib/care-context";
import { CARE_TASKS, type IntakeOutput } from "../lib/care-data";

interface Props { taskId: string; onBack: () => void; }

export default function TaskDetailPage({ taskId, onBack }: Props) {
  const task = CARE_TASKS.find(t => t.id === taskId);
  const { state, checkInTask, recordVital, recordIntakeOutput, recordObservation } = useCare();
  const done = state.todayCheckIns.some(c => c.taskId === taskId && c.completed);
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  const [temperature, setTemperature] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spo2, setSpo2] = useState("");

  const [ioType, setIoType] = useState<IntakeOutput["type"]>("nasal_feed");
  const [ioAmount, setIoAmount] = useState("");
  const [ioNote, setIoNote] = useState("");

  const [obsContent, setObsContent] = useState("");
  const [obsAbnormal, setObsAbnormal] = useState(false);

  if (!task) return <div style={{ padding: "20px" }}>任务未找到</div>;

  const handleCheckIn = () => {
    if (task.dataType === "vitals") {
      const alerts: string[] = [];
      if (temperature) { const r = recordVital("temperature", parseFloat(temperature)); if (r !== "none") alerts.push(`体温${r === "red" ? "严重" : ""}异常`); }
      if (bpSys) { const r = recordVital("blood_pressure_sys", parseFloat(bpSys)); if (r !== "none") alerts.push(`收缩压${r === "red" ? "严重" : ""}异常`); }
      if (bpDia) { const r = recordVital("blood_pressure_dia", parseFloat(bpDia)); if (r !== "none") alerts.push(`舒张压异常`); }
      if (heartRate) { const r = recordVital("heart_rate", parseFloat(heartRate)); if (r !== "none") alerts.push(`心率${r === "red" ? "严重" : ""}异常`); }
      if (spo2) { const r = recordVital("spo2", parseFloat(spo2)); if (r !== "none") alerts.push(`血氧${r === "red" ? "严重" : ""}异常`); }
      if (alerts.length > 0) setAlertResult(alerts.join("、"));
    }
    if (task.dataType === "intake_output" && ioAmount) {
      recordIntakeOutput(ioType, parseFloat(ioAmount), ioNote || undefined);
    }
    if (task.dataType === "observation_text" && obsContent) {
      const cat = task.id === "neuro_observation" ? "neuro" : task.id === "abdomen_limb_check" ? "abdomen" : "skin";
      recordObservation(cat, obsContent, obsAbnormal);
    }
    checkInTask(taskId, note || undefined);
    setShowSuccess(true);
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="header-gradient" style={{ padding: "40px 20px 20px", borderRadius: "0 0 24px 24px" }}>
        <button onClick={onBack} className="press-feedback" style={{
          display: "flex", alignItems: "center", gap: "4px",
          color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 500,
          background: "none", border: "none", cursor: "pointer", marginBottom: "12px",
        }}>
          <span style={{ fontSize: "20px" }}>‹</span> 返回
        </button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{task.name}</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{task.frequency} · {task.description}</p>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Alert Note */}
        {task.alertNote && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE, #FCE4EC)", border: "1px solid #FFCDD2",
            borderRadius: "14px", padding: "12px 14px",
          }}>
            <p style={{ fontSize: "12px", color: "#C62828", display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: 1.5 }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span> {task.alertNote}
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "12px" }}>操作步骤</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {task.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "10px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "7px", flexShrink: 0,
                  background: "var(--color-primary-light)", color: "var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700,
                }}>{i + 1}</div>
                <p style={{ fontSize: "13px", color: "var(--color-text)", lineHeight: 1.6, flex: 1 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Check Points */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "12px" }}>检查要点</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {task.checkPoints.map((cp, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "16px", height: "16px", borderRadius: "4px",
                  border: "2px solid var(--color-border)", flexShrink: 0,
                }} />
                <p style={{ fontSize: "13px", color: "var(--color-text)" }}>{cp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vitals Input */}
        {task.dataType === "vitals" && (
          <div className="card" style={{ padding: "16px" }}>
            <h3 className="section-title" style={{ marginBottom: "12px" }}>生命体征录入</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "体温 (℃)", value: temperature, set: setTemperature, ph: "36.0-37.5" },
                { label: "收缩压 (mmHg)", value: bpSys, set: setBpSys, ph: "90-140" },
                { label: "舒张压 (mmHg)", value: bpDia, set: setBpDia, ph: "60-90" },
                { label: "心率 (次/分)", value: heartRate, set: setHeartRate, ph: "60-100" },
                { label: "血氧 (%)", value: spo2, set: setSpo2, ph: "95-100" },
              ].map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "13px", color: "var(--color-text-secondary)", width: "100px", flexShrink: 0 }}>{f.label}</label>
                  <input type="number" value={f.value} onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph} style={{
                      flex: 1, border: "1px solid var(--color-border)", borderRadius: "10px",
                      padding: "9px 12px", fontSize: "14px", background: "#FAFAF8",
                    }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intake/Output Input */}
        {task.dataType === "intake_output" && (
          <div className="card" style={{ padding: "16px" }}>
            <h3 className="section-title" style={{ marginBottom: "12px" }}>出入量记录</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px", display: "block" }}>类型</label>
                <select value={ioType} onChange={(e) => setIoType(e.target.value as IntakeOutput["type"])}
                  style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", background: "#FAFAF8" }}>
                  <option value="nasal_feed">鼻饲</option>
                  <option value="water">饮水</option>
                  <option value="iv_fluid">输液</option>
                  <option value="urine">尿量</option>
                  <option value="stool">大便</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px", display: "block" }}>量 (ml)</label>
                <input type="number" value={ioAmount} onChange={(e) => setIoAmount(e.target.value)}
                  placeholder="输入毫升数" style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", background: "#FAFAF8" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px", display: "block" }}>备注</label>
                <input type="text" value={ioNote} onChange={(e) => setIoNote(e.target.value)}
                  placeholder="可选" style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", background: "#FAFAF8" }} />
              </div>
            </div>
          </div>
        )}

        {/* Observation Input */}
        {task.dataType === "observation_text" && (
          <div className="card" style={{ padding: "16px" }}>
            <h3 className="section-title" style={{ marginBottom: "12px" }}>观察记录</h3>
            <textarea value={obsContent} onChange={(e) => setObsContent(e.target.value)}
              placeholder="描述观察到的情况..." rows={3}
              style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", resize: "none", background: "#FAFAF8" }} />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={obsAbnormal} onChange={(e) => setObsAbnormal(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--color-error)" }} />
              <span style={{ fontSize: "13px", color: "var(--color-error)", fontWeight: 600 }}>标记为异常</span>
            </label>
          </div>
        )}

        {/* Note */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "8px" }}>备注（可选）</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="记录特殊情况..." rows={2}
            style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", resize: "none", background: "#FAFAF8" }} />
        </div>

        {/* Success / Alert */}
        {showSuccess && (
          <div style={{
            borderRadius: "14px", padding: "14px 16px",
            background: alertResult ? "linear-gradient(135deg, #FFEBEE, #FCE4EC)" : "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
            border: `1px solid ${alertResult ? "#FFCDD2" : "#C8E6C9"}`,
          }}>
            {alertResult ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🚨</span>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#C62828" }}>已打卡，但检测到异常</p>
                  <p style={{ fontSize: "12px", color: "#E53935", marginTop: "4px" }}>{alertResult}，请立即联系医护人员！</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>✅</span>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#2E7D32" }}>打卡成功！</p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!done && !showSuccess && (
          <button onClick={handleCheckIn} className="press-feedback" style={{
            width: "100%", padding: "14px", borderRadius: "14px", border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #3D7A4A, #2E5E38)",
            color: "#fff", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em",
            boxShadow: "0 4px 12px rgba(61,122,74,0.3)",
          }}>
            确认完成并打卡
          </button>
        )}

        {(done || showSuccess) && (
          <button onClick={onBack} className="press-feedback" style={{
            width: "100%", padding: "14px", borderRadius: "14px", border: "none", cursor: "pointer",
            background: "var(--color-text-secondary)", color: "#fff",
            fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em",
          }}>
            返回任务列表
          </button>
        )}
      </div>
    </div>
  );
}
