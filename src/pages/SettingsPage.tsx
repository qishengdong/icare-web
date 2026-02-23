import { useState, useEffect } from "react";
import { useCare } from "../lib/care-context";
import { type PatientInfo } from "../lib/care-data";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

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

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[var(--color-border)]">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[var(--color-primary)] mb-2">
          <ArrowLeft size={18} /> 返回
        </button>
        <h1 className="text-xl font-bold">患者档案</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3">基本信息</h3>
          <div className="space-y-3">
            {[
              { label: "姓名", value: info.name, onChange: (v: string) => updateField("name", v) },
              { label: "年龄", value: String(info.age), onChange: (v: string) => updateField("age", parseInt(v) || 0), type: "number" },
              { label: "床号", value: info.bedNumber, onChange: (v: string) => updateField("bedNumber", v) },
              { label: "护理等级", value: info.careLevel, onChange: (v: string) => updateField("careLevel", v) },
              { label: "入院日期", value: info.admissionDate, onChange: (v: string) => updateField("admissionDate", v), type: "date" },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3">
                <label className="text-sm text-[var(--color-text-secondary)] w-20 shrink-0">{field.label}</label>
                <input type={field.type || "text"} value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Key Alerts */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">关键警示</h3>
            <button onClick={addAlert} className="text-[var(--color-primary)] flex items-center gap-1 text-xs">
              <Plus size={14} /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {info.keyAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={alert} onChange={(e) => updateAlert(i, e.target.value)}
                  className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                <button onClick={() => removeAlert(i)} className="text-red-400 p-1"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-bold mb-3">紧急联系人</h3>
          <div className="space-y-3">
            {info.contacts.map((contact, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">{contact.role}</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)}
                    placeholder="姓名" className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                  <input type="tel" value={contact.phone} onChange={(e) => updateContact(i, "phone", e.target.value)}
                    placeholder="电话" className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave}
          className={`w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 press-feedback ${
            saved ? "bg-green-500 text-white" : "bg-[var(--color-primary)] text-white"
          }`}>
          {saved ? <><Save size={18} /> 已保存</> : <><Save size={18} /> 保存修改</>}
        </button>
      </div>
    </div>
  );
}
