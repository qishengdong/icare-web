import { useState } from "react";
import { useCare } from "../lib/care-context";
import { getShiftLabel, type ShiftReport } from "../lib/care-data";

interface Props { onBack: () => void; }

export default function ShiftReportPage({ onBack }: Props) {
  const { generateReport } = useCare();
  const [report, setReport] = useState<ShiftReport | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const r = generateReport();
      setReport(r);
      setGenerating(false);
    }, 600);
  };

  const handleShare = () => {
    if (!report) return;
    const text = formatReportText(report);
    if (navigator.share) {
      navigator.share({ title: "iCare 交班记录", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("交班记录已复制到剪贴板，可粘贴到微信发送");
    }
  };

  const formatReportText = (r: ShiftReport): string => {
    const lines = [
      `📋 iCare 交班记录`,
      `📅 ${r.date} ${getShiftLabel(r.shift)}`,
      `⏰ 生成时间: ${r.generatedAt}`,
      ``,
      `✅ 完成率: ${Math.round(r.completionRate * 100)}%`,
      `已完成: ${r.completedTasks.join("、") || "无"}`,
      r.missedTasks.length > 0 ? `❌ 未完成: ${r.missedTasks.join("、")}` : "",
      ``,
    ];
    if (r.vitalsSummary.length > 0) {
      lines.push(`📊 生命体征:`);
      r.vitalsSummary.forEach(v => lines.push(`  ${v.isAbnormal ? "⚠️" : "✅"} ${v.type}: ${v.latest}`));
      lines.push("");
    }
    lines.push(`💧 出入量: 入${r.intakeSummary.totalIntake}ml / 出${r.intakeSummary.totalOutput}ml`);
    if (r.abnormalEvents.length > 0) {
      lines.push(``, `⚠️ 异常事件 (${r.abnormalEvents.length}):`);
      r.abnormalEvents.forEach(e => lines.push(`  ${e.status === "resolved" ? "✅" : "❗"} ${e.description} [${e.status}]`));
    }
    if (r.nextShiftFocus.length > 0) {
      lines.push(``, `📌 下班重点:`);
      r.nextShiftFocus.forEach(f => lines.push(`  • ${f}`));
    }
    return lines.filter(l => l !== undefined).join("\n");
  };

  const rateColor = report ? (report.completionRate >= 0.8 ? "#2E7D32" : report.completionRate >= 0.5 ? "#E65100" : "#C62828") : "#2E7D32";

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
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>交班记录</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>系统自动生成，一键分享</p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {!report ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>📋</p>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>点击下方按钮自动生成本班次交班记录</p>
            <button onClick={handleGenerate} disabled={generating} className="press-feedback" style={{
              padding: "14px 32px", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #3D7A4A, #2E5E38)", color: "#fff",
              fontSize: "16px", fontWeight: 700, opacity: generating ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(61,122,74,0.3)",
            }}>
              {generating ? "生成中..." : "生成交班记录"}
            </button>
          </div>
        ) : (
          <>
            {/* Report Header */}
            <div className="card-elevated" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700 }}>{report.date} {getShiftLabel(report.shift)}</h3>
                <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{report.generatedAt}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ position: "relative", width: "56px", height: "56px" }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke={rateColor} strokeWidth="4"
                      strokeDasharray={`${report.completionRate * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <span style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 800, color: rateColor,
                  }}>{Math.round(report.completionRate * 100)}%</span>
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>完成 {report.completedTasks.length} 项</p>
                  {report.missedTasks.length > 0 && (
                    <p style={{ fontSize: "12px", color: "#C62828", marginTop: "2px" }}>未完成: {report.missedTasks.join("、")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vitals */}
            {report.vitalsSummary.length > 0 && (
              <div className="card" style={{ padding: "16px" }}>
                <h3 className="section-title" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📊</span> 生命体征
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {report.vitalsSummary.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{v.type}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: v.isAbnormal ? "#C62828" : "var(--color-text)" }}>{v.latest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* I/O */}
            <div className="card" style={{ padding: "16px" }}>
              <h3 className="section-title" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>💧</span> 出入量
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "var(--color-primary-light)", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600 }}>入量</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-primary-dark)" }}>{report.intakeSummary.totalIntake}<span style={{ fontSize: "11px", fontWeight: 500 }}>ml</span></p>
                </div>
                <div style={{ background: "var(--color-warning-light)", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--color-warning)", fontWeight: 600 }}>出量</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-warning)" }}>{report.intakeSummary.totalOutput}<span style={{ fontSize: "11px", fontWeight: 500 }}>ml</span></p>
                </div>
              </div>
            </div>

            {/* Abnormal Events */}
            {report.abnormalEvents.length > 0 && (
              <div style={{
                borderRadius: "14px", padding: "16px",
                background: "linear-gradient(135deg, #FFEBEE, #FFF5F5)", border: "1px solid #FFCDD2",
              }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#C62828", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <span>🚨</span> 异常事件 ({report.abnormalEvents.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {report.abnormalEvents.map(e => (
                    <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{
                        width: "8px", height: "8px", borderRadius: "50%", marginTop: "5px", flexShrink: 0,
                        background: e.status === "resolved" ? "#66BB6A" : "#EF5350",
                      }} />
                      <div>
                        <p style={{ fontSize: "13px", color: "var(--color-text)" }}>{e.description}</p>
                        <p style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{e.time} · {e.status === "resolved" ? "已解决" : "待处理"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Shift Focus */}
            {report.nextShiftFocus.length > 0 && (
              <div style={{
                borderRadius: "14px", padding: "16px",
                background: "linear-gradient(135deg, #FFF8E1, #FFF3E0)", border: "1px solid #FFE0B2",
              }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#E65100", marginBottom: "8px" }}>📌 下班重点</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {report.nextShiftFocus.map((f, i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#E65100", lineHeight: 1.5 }}>• {f}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <button onClick={handleShare} className="press-feedback" style={{
              width: "100%", padding: "14px", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #3D7A4A, #2E5E38)", color: "#fff",
              fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(61,122,74,0.3)",
            }}>
              📤 分享交班记录
            </button>
          </>
        )}
      </div>
    </div>
  );
}
