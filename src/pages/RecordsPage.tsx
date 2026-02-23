import { useState } from "react";
import { useCare } from "../lib/care-context";
import { VITAL_RANGES, type IntakeOutput } from "../lib/care-data";
import { Thermometer, Heart, Droplets, Activity, Wind } from "lucide-react";

type RecordTab = "vitals" | "intake_output" | "observations";

const VITAL_ICONS: Record<string, React.ReactNode> = {
  temperature: <Thermometer size={16} />,
  blood_pressure_sys: <Heart size={16} />,
  blood_pressure_dia: <Heart size={16} />,
  heart_rate: <Activity size={16} />,
  spo2: <Wind size={16} />,
};

const IO_LABELS: Record<string, string> = {
  nasal_feed: "鼻饲", water: "饮水", iv_fluid: "输液", urine: "尿量", stool: "大便",
};

export default function RecordsPage() {
  const { state } = useCare();
  const [tab, setTab] = useState<RecordTab>("vitals");

  const tabs: { id: RecordTab; label: string }[] = [
    { id: "vitals", label: "生命体征" },
    { id: "intake_output", label: "出入量" },
    { id: "observations", label: "观察记录" },
  ];

  // Calculate I/O totals
  const totalIntake = state.todayIntakeOutput
    .filter(r => r.type !== "urine" && r.type !== "stool")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalOutput = state.todayIntakeOutput
    .filter(r => r.type === "urine")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-3 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">数据记录</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">今日护理数据汇总</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white border-b border-[var(--color-border)]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-secondary)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* Vitals Tab */}
        {tab === "vitals" && (
          <div className="space-y-3">
            {state.todayVitals.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-secondary)]">
                <p className="text-sm">今日暂无生命体征记录</p>
                <p className="text-xs mt-1">请在"生命体征测量"任务中录入数据</p>
              </div>
            ) : (
              state.todayVitals.slice().reverse().map(v => {
                const range = VITAL_RANGES[v.type];
                return (
                  <div key={v.id} className={`bg-white rounded-xl p-4 border ${v.isAbnormal ? "border-red-200 bg-red-50" : "border-[var(--color-border)]"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={v.isAbnormal ? "text-red-500" : "text-[var(--color-primary)]"}>
                          {VITAL_ICONS[v.type]}
                        </span>
                        <span className="text-sm font-medium">{range?.label || v.type}</span>
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">{v.time}</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${v.isAbnormal ? "text-red-600" : "text-[var(--color-text)]"}`}>{v.value}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">{range?.unit}</span>
                      {v.isAbnormal && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${v.alertLevel === "red" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
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

        {/* Intake/Output Tab */}
        {tab === "intake_output" && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
              <h3 className="text-sm font-bold mb-3">今日出入量汇总</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600">总入量</p>
                  <p className="text-xl font-bold text-blue-700">{totalIntake}<span className="text-xs font-normal ml-0.5">ml</span></p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-amber-600">总出量(尿)</p>
                  <p className="text-xl font-bold text-amber-700">{totalOutput}<span className="text-xs font-normal ml-0.5">ml</span></p>
                </div>
              </div>
            </div>
            {/* Records */}
            {state.todayIntakeOutput.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <p className="text-sm">今日暂无出入量记录</p>
              </div>
            ) : (
              state.todayIntakeOutput.slice().reverse().map(r => (
                <div key={r.id} className="bg-white rounded-xl p-4 border border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{IO_LABELS[r.type] || r.type}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{r.time}{r.note ? ` · ${r.note}` : ""}</p>
                  </div>
                  <span className="text-lg font-bold text-[var(--color-text)]">{r.amount || "-"}<span className="text-xs font-normal text-[var(--color-text-secondary)]">ml</span></span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Observations Tab */}
        {tab === "observations" && (
          <div className="space-y-3">
            {state.todayObservations.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-secondary)]">
                <p className="text-sm">今日暂无观察记录</p>
              </div>
            ) : (
              state.todayObservations.slice().reverse().map(o => (
                <div key={o.id} className={`bg-white rounded-xl p-4 border ${o.isAbnormal ? "border-orange-200 bg-orange-50" : "border-[var(--color-border)]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.isAbnormal ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                      {o.isAbnormal ? "异常" : "正常"}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{o.time}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text)] mt-1">{o.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
