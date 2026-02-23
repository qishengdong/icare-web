import { useState } from "react";
import { useCare } from "../lib/care-context";
import { CARE_TASKS, type IntakeOutput } from "../lib/care-data";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props { taskId: string; onBack: () => void; }

export default function TaskDetailPage({ taskId, onBack }: Props) {
  const task = CARE_TASKS.find(t => t.id === taskId);
  const { state, checkInTask, recordVital, recordIntakeOutput, recordObservation } = useCare();
  const done = state.todayCheckIns.some(c => c.taskId === taskId && c.completed);
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  // Vital sign inputs
  const [temperature, setTemperature] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spo2, setSpo2] = useState("");

  // Intake/output inputs
  const [ioType, setIoType] = useState<IntakeOutput["type"]>("nasal_feed");
  const [ioAmount, setIoAmount] = useState("");
  const [ioNote, setIoNote] = useState("");

  // Observation inputs
  const [obsContent, setObsContent] = useState("");
  const [obsAbnormal, setObsAbnormal] = useState(false);

  if (!task) return <div className="p-4">任务未找到</div>;

  const handleCheckIn = () => {
    // Record vitals if applicable
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
    <div className="min-h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white px-4 pt-12 pb-5">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-100 mb-3">
          <ArrowLeft size={18} /> 返回
        </button>
        <h1 className="text-xl font-bold">{task.name}</h1>
        <p className="text-sm text-blue-100 mt-1">{task.frequency} · {task.description}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Alert Note */}
        {task.alertNote && (
          <div className="bg-[var(--color-error-light)] border border-red-200 rounded-xl p-3">
            <p className="text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {task.alertNote}
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3">操作步骤</h3>
          <div className="space-y-2">
            {task.steps.map((step, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="w-5 h-5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <p className="text-sm text-[var(--color-text)] leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Check Points */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3">检查要点</h3>
          <div className="space-y-2">
            {task.checkPoints.map((cp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--color-border)] rounded" />
                <p className="text-sm text-[var(--color-text)]">{cp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Input: Vitals */}
        {task.dataType === "vitals" && (
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <h3 className="text-sm font-bold mb-3">生命体征录入</h3>
            <div className="space-y-3">
              {[
                { label: "体温 (℃)", value: temperature, set: setTemperature, placeholder: "36.0-37.5" },
                { label: "收缩压 (mmHg)", value: bpSys, set: setBpSys, placeholder: "90-140" },
                { label: "舒张压 (mmHg)", value: bpDia, set: setBpDia, placeholder: "60-90" },
                { label: "心率 (次/分)", value: heartRate, set: setHeartRate, placeholder: "60-100" },
                { label: "血氧 (%)", value: spo2, set: setSpo2, placeholder: "95-100" },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-3">
                  <label className="text-sm text-[var(--color-text-secondary)] w-28 shrink-0">{field.label}</label>
                  <input type="number" value={field.value} onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Input: Intake/Output */}
        {task.dataType === "intake_output" && (
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <h3 className="text-sm font-bold mb-3">出入量记录</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">类型</label>
                <select value={ioType} onChange={(e) => setIoType(e.target.value as IntakeOutput["type"])}
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="nasal_feed">鼻饲</option>
                  <option value="water">饮水</option>
                  <option value="iv_fluid">输液</option>
                  <option value="urine">尿量</option>
                  <option value="stool">大便</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">量 (ml)</label>
                <input type="number" value={ioAmount} onChange={(e) => setIoAmount(e.target.value)}
                  placeholder="输入毫升数" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">备注</label>
                <input type="text" value={ioNote} onChange={(e) => setIoNote(e.target.value)}
                  placeholder="可选" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        )}

        {/* Data Input: Observation */}
        {task.dataType === "observation_text" && (
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <h3 className="text-sm font-bold mb-3">观察记录</h3>
            <textarea value={obsContent} onChange={(e) => setObsContent(e.target.value)}
              placeholder="描述观察到的情况..." rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none" />
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={obsAbnormal} onChange={(e) => setObsAbnormal(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-error)]" />
              <span className="text-sm text-[var(--color-error)]">标记为异常</span>
            </label>
          </div>
        )}

        {/* Note */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-2">备注（可选）</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="记录特殊情况..." rows={2}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none" />
        </div>

        {/* Success / Alert */}
        {showSuccess && (
          <div className={`rounded-xl p-4 ${alertResult ? "bg-[var(--color-error-light)] border border-red-200" : "bg-[var(--color-success-light)] border border-green-200"}`}>
            {alertResult ? (
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">已打卡，但检测到异常</p>
                  <p className="text-xs text-red-600 mt-1">{alertResult}，请立即联系医护人员！</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <p className="text-sm font-bold text-green-700">打卡成功！</p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!done && !showSuccess && (
          <button onClick={handleCheckIn}
            className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-xl text-base font-bold press-feedback">
            确认完成并打卡
          </button>
        )}

        {(done || showSuccess) && (
          <button onClick={onBack}
            className="w-full bg-[var(--color-text-secondary)] text-white py-3.5 rounded-xl text-base font-bold press-feedback">
            返回任务列表
          </button>
        )}
      </div>
    </div>
  );
}
