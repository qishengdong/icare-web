import { useState, useEffect } from "react";
import { useCare } from "../lib/care-context";
import { type PatientInfo } from "../lib/care-data";

interface Props { onBack: () => void; }

export default function SettingsPage({ onBack }: Props) {
  const { state, updatePatientInfo } = useCare();
  const [info, setInfo] = useState<PatientInfo>(state.patientInfo);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setInfo(state.patientInfo); }, [state.patientInfo]);

  const handleSave = () => {
    updatePatientInfo(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: keyof PatientInfo, value: any) => {
    setInfo({ ...info, [field]: value });
  };

  const updateContact = (index: number, field: string, value: string) => {
    const contacts = [...info.contacts];
    contacts[index] = { ...contacts[index], [field]: value };
    setInfo({ ...info, contacts });
  };

  const addAlert = () => {
    setInfo({ ...info, keyAlerts: [...info.keyAlerts, ""] });
  };

  const removeAlert = (index: number) => {
    setInfo({ ...info, keyAlerts: info.keyAlerts.filter((_, i) => i !== index) });
  };

  const updateAlert = (index: number, value: string) => {
    const alerts = [...info.keyAlerts];
    alerts[index] = value;
    setInfo({ ...info, keyAlerts: alerts });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid var(--color-border)", borderRadius: "10px",
    padding: "10px 12px", fontSize: "14px", background: "#FFFFFF",
    outline: "none", transition: "border-color 0.2s",
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
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>患者档案</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>仅保留安全信息，不含诊断详情</p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Basic Info */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "12px" }}>基本信息</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "姓名", value: info.name, onChange: (v: string) => updateField("name", v) },
              { label: "年龄", value: String(info.age), onChange: (v: string) => updateField("age", parseInt(v) || 0), type: "number" },
              { label: "床号", value: info.bedNumber, onChange: (v: string) => updateField("bedNumber", v) },
              { label: "护理等级", value: info.careLevel, onChange: (v: string) => updateField("careLevel", v) },
              { label: "入院日期", value: info.admissionDate, onChange: (v: string) => updateField("admissionDate", v), type: "date" },
            ].map((field) => (
              <div key={field.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "13px", color: "var(--color-text-secondary)", width: "60px", flexShrink: 0, fontWeight: 500 }}>{field.label}</label>
                <input type={field.type || "text"} value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* Key Alerts */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 className="section-title">关键警示</h3>
            <button onClick={addAlert} className="press-feedback" style={{
              display: "flex", alignItems: "center", gap: "4px",
              color: "var(--color-primary)", fontSize: "12px", fontWeight: 600,
              background: "none", border: "none", cursor: "pointer",
            }}>
              ＋ 添加
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {info.keyAlerts.map((alert, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="text" value={alert} onChange={(e) => updateAlert(i, e.target.value)}
                  placeholder="输入警示内容..."
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => removeAlert(i)} className="press-feedback" style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "#FFEBEE", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", color: "#C62828", flexShrink: 0,
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-title" style={{ marginBottom: "12px" }}>紧急联系人</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {info.contacts.map((contact, i) => (
              <div key={i} style={{
                background: "var(--color-bg)", borderRadius: "12px", padding: "12px",
              }}>
                <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{contact.role}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="text" value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)}
                    placeholder="姓名" style={inputStyle} />
                  <input type="tel" value={contact.phone} onChange={(e) => updateContact(i, "phone", e.target.value)}
                    placeholder="电话" style={inputStyle} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} className="press-feedback" style={{
          width: "100%", padding: "14px", borderRadius: "14px", border: "none", cursor: "pointer",
          background: saved
            ? "linear-gradient(135deg, #66BB6A, #43A047)"
            : "linear-gradient(135deg, #3D7A4A, #2E5E38)",
          color: "#fff", fontSize: "16px", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          boxShadow: "0 4px 12px rgba(61,122,74,0.3)",
        }}>
          {saved ? "✅ 已保存" : "💾 保存修改"}
        </button>
      </div>
    </div>
  );
}
