import { useState } from "react";
import { useCare } from "../lib/care-context";
import { getShiftLabel, type ShiftReport } from "../lib/care-data";
import { ArrowLeft, FileText, Share2, AlertTriangle, Droplets, ClipboardList } from "lucide-react";

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
    }, 500);
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

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[var(--color-border)]">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--color-primary)] mb-2">
          <ArrowLeft size={18} /> 返回
        </button>
        <h1 className="text-xl font-bold">交班记录</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">系统自动生成，一键分享</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {!report ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-[var(--color-primary)] mx-auto mb-4 opacity-50" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">点击下方按钮自动生成本班次交班记录</p>
            <button onClick={handleGenerate} disabled={generating}
              className="bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl text-base font-bold press-feedback disabled:opacity-50">
              {generating ? "生成中..." : "生成交班记录"}
            </button>
          </div>
        ) : (
          <>
            {/* Report Header */}
            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">{report.date} {getShiftLabel(report.shift)}</h3>
                <span className="text-xs text-[var(--color-text-secondary)]">{report.generatedAt}</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke={report.completionRate >= 0.8 ? "#16A34A" : "#D97706"} strokeWidth="5"
                      strokeDasharray={`${report.completionRate * 175.9} 175.9`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(report.completionRate * 100)}%</span>
                </div>
                <div>
                  <p className="text-sm font-medium">完成 {report.completedTasks.length} 项</p>
                  {report.missedTasks.length > 0 && (
                    <p className="text-xs text-red-500">未完成: {report.missedTasks.join("、")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vitals Summary */}
            {report.vitalsSummary.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><ClipboardList size={14} /> 生命体征</h3>
                <div className="space-y-1">
                  {report.vitalsSummary.map((v, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">{v.type}</span>
                      <span className={`text-sm font-medium ${v.isAbnormal ? "text-red-600" : "text-[var(--color-text)]"}`}>{v.latest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* I/O Summary */}
            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><Droplets size={14} /> 出入量</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600">入量</p>
                  <p className="text-lg font-bold text-blue-700">{report.intakeSummary.totalIntake}ml</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-amber-600">出量</p>
                  <p className="text-lg font-bold text-amber-700">{report.intakeSummary.totalOutput}ml</p>
                </div>
              </div>
            </div>

            {/* Abnormal Events */}
            {report.abnormalEvents.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-red-600"><AlertTriangle size={14} /> 异常事件 ({report.abnormalEvents.length})</h3>
                <div className="space-y-2">
                  {report.abnormalEvents.map(e => (
                    <div key={e.id} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${e.status === "resolved" ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        <p className="text-sm text-[var(--color-text)]">{e.description}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{e.time} · {e.status === "resolved" ? "已解决" : "待处理"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Shift Focus */}
            {report.nextShiftFocus.length > 0 && (
              <div className="bg-[var(--color-warning-light)] rounded-xl p-4 border border-amber-200">
                <h3 className="text-sm font-bold mb-2 text-amber-700">📌 下班重点</h3>
                <div className="space-y-1">
                  {report.nextShiftFocus.map((f, i) => (
                    <p key={i} className="text-sm text-amber-700">• {f}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <button onClick={handleShare}
              className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 press-feedback">
              <Share2 size={18} /> 分享交班记录
            </button>
          </>
        )}
      </div>
    </div>
  );
}
