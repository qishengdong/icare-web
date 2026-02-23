import { useCare } from "../lib/care-context";
import { CARE_TASKS, getRecentDates, formatDate, getCheckIns, VITAL_RANGES } from "../lib/care-data";
import { AlertTriangle, CheckCircle2, TrendingUp, ChevronRight } from "lucide-react";

interface Props { navigate: (page: any) => void; }

export default function DashboardPage({ navigate }: Props) {
  const { state, getCompletionRate, getPendingAlerts } = useCare();
  const rate = getCompletionRate();
  const pendingAlerts = getPendingAlerts();

  // 7-day completion trend
  const recentDates = getRecentDates(7);
  const dailyRates = recentDates.map(date => {
    const dayCheckIns = getCheckIns(date);
    const completed = new Set(dayCheckIns.filter(c => c.completed).map(c => c.taskId)).size;
    return { date, rate: CARE_TASKS.length > 0 ? completed / CARE_TASKS.length : 0 };
  });

  // Latest vitals
  const latestVitals: Record<string, { value: number; isAbnormal: boolean; time: string }> = {};
  for (const v of state.todayVitals) {
    latestVitals[v.type] = { value: v.value, isAbnormal: v.isAbnormal, time: v.time };
  }

  // Abnormal events timeline
  const allEvents = state.allAbnormalEvents.slice().reverse().slice(0, 10);

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: "待处理", color: "bg-red-100 text-red-600" },
    acknowledged: { text: "已确认", color: "bg-orange-100 text-orange-600" },
    escalated: { text: "已上报", color: "bg-purple-100 text-purple-600" },
    resolved: { text: "已解决", color: "bg-green-100 text-green-600" },
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">照护看板</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">家属远程查看护理进度</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Today Summary */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--color-primary)]" /> 今日护理概览
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-1">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke={rate >= 0.8 ? "#16A34A" : rate >= 0.5 ? "#D97706" : "#DC2626"} strokeWidth="4"
                    strokeDasharray={`${rate * 150.8} 150.8`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(rate * 100)}%</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">完成率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-text)]">{state.todayVitals.length}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">体征记录</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${pendingAlerts.length > 0 ? "text-red-600" : "text-green-600"}`}>{pendingAlerts.length}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">待处理异常</p>
            </div>
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--color-primary)]" /> 7日完成率趋势
          </h3>
          <div className="flex items-end justify-between gap-1 h-24">
            {dailyRates.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 rounded-t-sm relative" style={{ height: "80px" }}>
                  <div className="absolute bottom-0 w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(d.rate * 100, 2)}%`,
                      backgroundColor: d.rate >= 0.8 ? "#16A34A" : d.rate >= 0.5 ? "#D97706" : d.rate > 0 ? "#DC2626" : "#E2E8F0",
                    }} />
                </div>
                <span className="text-[9px] text-[var(--color-text-secondary)]">{formatDate(d.date).replace("月", "/").replace("日", "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Vitals */}
        {Object.keys(latestVitals).length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <h3 className="text-sm font-bold mb-3">最新生命体征</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(latestVitals).map(([type, data]) => {
                const range = VITAL_RANGES[type as keyof typeof VITAL_RANGES];
                return (
                  <div key={type} className={`rounded-lg p-3 ${data.isAbnormal ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                    <p className="text-xs text-[var(--color-text-secondary)]">{range?.label || type}</p>
                    <p className={`text-lg font-bold ${data.isAbnormal ? "text-red-600" : "text-[var(--color-text)]"}`}>
                      {data.value}<span className="text-xs font-normal ml-0.5">{range?.unit}</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{data.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abnormal Events Timeline */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> 异常事件记录
            </h3>
            {allEvents.length > 0 && (
              <button onClick={() => navigate({ type: "abnormal_events" })} className="text-xs text-[var(--color-primary)] flex items-center">
                查看全部 <ChevronRight size={14} />
              </button>
            )}
          </div>
          {allEvents.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">暂无异常事件，一切正常</p>
          ) : (
            <div className="space-y-3">
              {allEvents.slice(0, 5).map(event => {
                const st = statusLabel[event.status];
                return (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${event.alertLevel === "red" ? "bg-red-500" : "bg-orange-400"}`} />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${st.color}`}>{st.text}</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">{event.date} {event.time}</span>
                      </div>
                      <p className="text-sm text-[var(--color-text)] mt-1">{event.description}</p>
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
