import { useCare } from "../lib/care-context";
import { FileText, Settings, Phone, AlertTriangle, Droplets, ChevronRight, Shield } from "lucide-react";

interface Props { navigate: (page: any) => void; }

export default function MorePage({ navigate }: Props) {
  const { state } = useCare();

  const emergencyCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const sections = [
    {
      title: "护理工具",
      items: [
        { icon: <FileText size={20} />, label: "交班记录", desc: "自动生成交班单", color: "bg-blue-50 text-blue-600", action: () => navigate({ type: "shift_report" }) },
        { icon: <AlertTriangle size={20} />, label: "异常事件", desc: "查看和处理异常", color: "bg-red-50 text-red-600", action: () => navigate({ type: "abnormal_events" }) },
      ],
    },
    {
      title: "患者信息",
      items: [
        { icon: <Settings size={20} />, label: "患者档案", desc: state.patientInfo.name + " · " + state.patientInfo.careLevel, color: "bg-gray-50 text-gray-600", action: () => navigate({ type: "settings" }) },
      ],
    },
  ];

  // Dehydration checklist
  const dehydrationChecks = [
    "皮肤弹性差（捏起后>2秒回弹）",
    "口唇干燥",
    "眼窝凹陷",
    "尿量减少或颜色深黄",
    "意识变差",
  ];

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">更多</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">iCare 照护交付证据链OS</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Key Alerts */}
        {state.patientInfo.keyAlerts.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-2">
              <Shield size={16} /> 关键警示（必读）
            </h3>
            <div className="space-y-1.5">
              {state.patientInfo.keyAlerts.map((alert, i) => (
                <p key={i} className="text-sm text-red-600 flex items-start gap-2">
                  <span className="text-red-400 shrink-0">•</span> {alert}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={si}>
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <button key={ii} onClick={item.action}
                  className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[var(--color-border)] press-feedback">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Emergency Contacts */}
        <div>
          <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1">紧急联系</h3>
          <div className="space-y-2">
            {state.patientInfo.contacts.filter(c => c.phone).map((contact, i) => (
              <button key={i} onClick={() => emergencyCall(contact.phone)}
                className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[var(--color-border)] press-feedback">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                  <Phone size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{contact.role}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{contact.name || contact.phone}</p>
                </div>
                <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full">拨打</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dehydration Checklist */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" /> 脱水预防检查清单
          </h3>
          <div className="space-y-2">
            {dehydrationChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--color-border)] rounded" />
                <p className="text-sm text-[var(--color-text)]">{check}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-warning)] mt-3">出现2项以上请立即联系医护人员！</p>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[var(--color-text-secondary)] pt-2">iCare v2.0 · 照护交付证据链OS</p>
      </div>
    </div>
  );
}
