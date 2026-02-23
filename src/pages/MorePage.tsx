import { useCare } from "../lib/care-context";

interface Props { navigate: (page: any) => void; }

export default function MorePage({ navigate }: Props) {
  const { state } = useCare();

  const emergencyCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const dehydrationChecks = [
    "皮肤弹性差（捏起后>2秒回弹）",
    "口唇干燥",
    "眼窝凹陷",
    "尿量减少或颜色深黄",
    "意识变差",
  ];

  return (
    <div style={{ minHeight: "100%", paddingBottom: "16px" }}>
      {/* Header */}
      <div style={{ background: "#FFFFFF", padding: "40px 20px 14px", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)" }}>更多</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>iCare · 照护交付证据链OS</p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Key Alerts */}
        {state.patientInfo.keyAlerts.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE, #FCE4EC)", border: "1px solid #FFCDD2",
            borderRadius: "16px", padding: "14px 16px",
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#C62828", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <span>🛡️</span> 关键警示（必读）
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {state.patientInfo.keyAlerts.map((alert, i) => (
                <p key={i} style={{ fontSize: "13px", color: "#C62828", display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.5 }}>
                  <span style={{ color: "#EF5350", flexShrink: 0 }}>•</span> {alert}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Nursing Tools */}
        <div>
          <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
            护理工具
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { emoji: "📋", label: "交班记录", desc: "自动生成交班单", bg: "linear-gradient(135deg, #E3F2FD, #BBDEFB)", action: () => navigate({ type: "shift_report" }) },
              { emoji: "🚨", label: "异常事件", desc: "查看和处理异常", bg: "linear-gradient(135deg, #FFEBEE, #FFCDD2)", action: () => navigate({ type: "abnormal_events" }) },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="press-feedback" style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "14px", background: "#FFFFFF", borderRadius: "14px",
                border: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)" }}>{item.label}</p>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "1px" }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: "16px", color: "var(--color-text-tertiary)" }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Info */}
        <div>
          <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
            患者信息
          </h3>
          <button onClick={() => navigate({ type: "settings" })} className="press-feedback" style={{
            width: "100%", display: "flex", alignItems: "center", gap: "12px",
            padding: "14px", background: "#FFFFFF", borderRadius: "14px",
            border: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, #F5F5F0, #E8E8E0)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)" }}>患者档案</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "1px" }}>{state.patientInfo.name} · {state.patientInfo.careLevel}</p>
            </div>
            <span style={{ fontSize: "16px", color: "var(--color-text-tertiary)" }}>›</span>
          </button>
        </div>

        {/* Emergency Contacts */}
        <div>
          <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
            紧急联系
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {state.patientInfo.contacts.filter(c => c.phone).map((contact, i) => (
              <button key={i} onClick={() => emergencyCall(contact.phone)} className="press-feedback" style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "14px", background: "#FFFFFF", borderRadius: "14px",
                border: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                }}>📞</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)" }}>{contact.role}</p>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "1px" }}>{contact.name || contact.phone}</p>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700, color: "#FFFFFF",
                  background: "linear-gradient(135deg, #43A047, #2E7D32)",
                  padding: "5px 14px", borderRadius: "100px",
                }}>拨打</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dehydration Checklist */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>💧</span> 脱水预防检查清单
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {dehydrationChecks.map((check, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "16px", height: "16px", borderRadius: "4px",
                  border: "2px solid var(--color-border)", flexShrink: 0,
                }} />
                <p style={{ fontSize: "13px", color: "var(--color-text)" }}>{check}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "var(--color-warning)", fontWeight: 600, marginTop: "10px" }}>
            ⚠️ 出现2项以上请立即联系医护人员！
          </p>
        </div>

        {/* Version */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--color-text-tertiary)", paddingTop: "8px" }}>
          iCare v2.0 · 照护交付证据链OS
        </p>
      </div>
    </div>
  );
}
