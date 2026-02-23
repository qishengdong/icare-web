import { useCare } from "../lib/care-context";
import { CARE_TASKS, getShiftShortLabel, formatDate } from "../lib/care-data";
import { AlertTriangle, CheckCircle2, Circle, ChevronRight, RotateCcw, Smile, PlusCircle, Shield, Activity, Eye, Heart, Droplets, Brain, ScanLine } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "rotate-ccw": <RotateCcw size={20} />,
  "smile": <Smile size={20} />,
  "plus-circle": <PlusCircle size={20} />,
  "shield": <Shield size={20} />,
  "activity": <Activity size={20} />,
  "eye": <Eye size={20} />,
  "heart": <Heart size={20} />,
  "droplets": <Droplets size={20} />,
  "brain": <Brain size={20} />,
  "scan": <ScanLine size={20} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  basic_care: "bg-blue-50 text-blue-600",
  observation: "bg-purple-50 text-purple-600",
  rehabilitation: "bg-green-50 text-green-600",
  prevention: "bg-amber-50 text-amber-600",
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

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">{state.patientInfo.name}</h1>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{getShiftShortLabel(state.currentShift)}</span>
        </div>
        <p className="text-sm text-blue-100 mb-4">{formatDate(state.currentDate)} · {state.patientInfo.careLevel}</p>

        {/* Key Alerts Banner */}
        {state.patientInfo.keyAlerts.length > 0 && (
          <div className="bg-red-500/20 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs font-medium text-red-100 flex items-center gap-1">
              <AlertTriangle size={12} /> 关键警示 — {state.patientInfo.keyAlerts[0]}
            </p>
          </div>
        )}

        {/* Progress Ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="5"
                strokeDasharray={`${rate * 175.9} 175.9`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(rate * 100)}%</span>
          </div>
          <div>
            <p className="text-lg font-bold">今日护理进度</p>
            <p className="text-sm text-blue-100">已完成 {completedCount}/{CARE_TASKS.length} 项任务</p>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
      {pendingAlerts.length > 0 && (
        <div className="mx-4 mt-4">
          <button onClick={() => navigate({ type: "abnormal_events" })}
            className="w-full bg-[var(--color-error-light)] border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 press-feedback">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              <AlertTriangle size={16} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-red-700">{pendingAlerts.length} 个异常待处理</p>
              <p className="text-xs text-red-500">{pendingAlerts[0].description}</p>
            </div>
            <ChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="px-4 mt-4">
        <h2 className="text-base font-bold mb-3 text-[var(--color-text)]">护理任务清单</h2>
        <div className="space-y-2.5">
          {CARE_TASKS.map((task) => {
            const done = completedIds.has(task.id);
            const checkIn = state.todayCheckIns.find(c => c.taskId === task.id && c.completed);
            return (
              <button key={task.id}
                onClick={() => navigate({ type: "task_detail", taskId: task.id })}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all press-feedback ${
                  done ? "bg-[var(--color-success-light)] border-green-200" : "bg-white border-[var(--color-border)]"
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? "bg-green-100 text-green-600" : CATEGORY_COLORS[task.category]}`}>
                  {ICON_MAP[task.icon] || <Circle size={20} />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-green-700" : "text-[var(--color-text)]"}`}>{task.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">{task.frequency}</p>
                  {checkIn && <p className="text-xs text-green-500 mt-0.5">已完成 {checkIn.time}</p>}
                </div>
                {done ? (
                  <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                ) : (
                  <span className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-full shrink-0">打卡</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
