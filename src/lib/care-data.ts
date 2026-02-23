// ============ Types ============

export interface CareTask {
  id: string;
  name: string;
  category: "basic_care" | "observation" | "rehabilitation" | "prevention";
  frequency: string;
  icon: string;
  description: string;
  steps: string[];
  checkPoints: string[];
  alertNote?: string;
  requiresData?: boolean;
  dataType?: "vitals" | "intake_output" | "observation_text";
  requiresPhoto?: boolean;
}

export interface TaskCheckIn {
  taskId: string;
  date: string;
  time: string;
  shift: "morning" | "afternoon" | "night";
  note?: string;
  completed: boolean;
  photoUri?: string;
}

export interface VitalSign {
  id: string;
  date: string;
  time: string;
  type: "temperature" | "blood_pressure_sys" | "blood_pressure_dia" | "heart_rate" | "spo2";
  value: number;
  isAbnormal: boolean;
  alertLevel?: "red" | "orange" | "none";
}

export interface IntakeOutput {
  id: string;
  date: string;
  time: string;
  type: "nasal_feed" | "water" | "iv_fluid" | "urine" | "stool";
  amount?: number;
  stoolType?: string;
  note?: string;
}

export interface ObservationRecord {
  id: string;
  date: string;
  time: string;
  category: "neuro" | "abdomen" | "limb" | "skin" | "dehydration";
  content: string;
  isAbnormal: boolean;
}

export type AbnormalEventStatus = "pending" | "acknowledged" | "escalated" | "resolved";

export interface AbnormalEvent {
  id: string;
  date: string;
  time: string;
  type: "vital" | "observation" | "intake_output";
  category: string;
  description: string;
  alertLevel: "red" | "orange";
  status: AbnormalEventStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolvedNote?: string;
  escalatedAt?: string;
  relatedVitalId?: string;
}

export interface ShiftReport {
  id: string;
  date: string;
  shift: ShiftType;
  generatedAt: string;
  completionRate: number;
  completedTasks: string[];
  missedTasks: string[];
  abnormalEvents: AbnormalEvent[];
  vitalsSummary: { type: string; latest: number; isAbnormal: boolean }[];
  intakeSummary: { totalIntake: number; totalOutput: number };
  observations: string[];
  nextShiftFocus: string[];
}

export interface PatientInfo {
  name: string;
  age: number;
  bedNumber: string;
  careLevel: string;
  keyAlerts: string[];
  admissionDate: string;
  contacts: ContactInfo[];
}

export interface ContactInfo {
  role: string;
  name: string;
  phone: string;
}

// ============ Task Definitions ============

export const CARE_TASKS: CareTask[] = [
  {
    id: "turn_position", name: "翻身与体位", category: "basic_care",
    frequency: "每2小时一次", icon: "rotate-ccw",
    description: "预防压疮、坠积性肺炎",
    steps: ["左右侧卧和平卧交替", "使用软枕支撑背部、膝下", "避免拖、拉、推，防止皮肤擦伤"],
    checkPoints: ["检查骶尾部皮肤", "检查脚后跟皮肤", "检查肘部皮肤", "检查肩胛骨皮肤", "记录本次体位方向"],
    requiresPhoto: true,
  },
  {
    id: "oral_care", name: "口腔护理", category: "basic_care",
    frequency: "早晚各一次，餐后酌情", icon: "smile",
    description: "预防口腔感染、吸入性肺炎",
    steps: ["用软毛牙刷或海绵棒蘸生理盐水/漱口水", "轻刷牙齿、牙龈、舌面", "昏迷或张口困难者用棉签蘸水湿润口腔"],
    checkPoints: ["观察口腔黏膜有无溃疡", "观察有无白斑", "观察有无出血", "记录异常发现"],
  },
  {
    id: "nasal_feeding", name: "鼻饲喂养", category: "basic_care",
    frequency: "遵医嘱定时定量", icon: "plus-circle",
    description: "营养支持，维持身体机能",
    steps: ["营养液加温至37-40℃", "回抽胃内容物确认胃管位置", "如残留>150ml，暂停喂养并告知护士", "抬高床头30-45°，保持30分钟以上", "缓慢推注或重力滴注，每次≤200ml，间隔2小时"],
    checkPoints: ["记录喂养时间", "记录喂养量(ml)", "记录胃内残留量"],
    requiresData: true, dataType: "intake_output",
  },
  {
    id: "perineal_care", name: "会阴护理", category: "basic_care",
    frequency: "每日2次，便后立即", icon: "shield",
    description: "预防尿路感染、失禁性皮炎",
    steps: ["用温水毛巾由前向后擦洗", "保持干燥", "观察尿道口有无红肿、分泌物", "检查尿管是否通畅、有无打折", "便后及时清洁肛周", "涂抹氧化锌软膏保护皮肤"],
    checkPoints: ["尿道口无红肿", "尿管通畅", "皮肤干燥清洁", "记录异常发现"],
  },
  {
    id: "passive_exercise", name: "被动关节活动", category: "rehabilitation",
    frequency: "每日2次，每次15分钟", icon: "activity",
    description: "预防关节挛缩、肌肉萎缩、深静脉血栓",
    steps: ["从大关节到小关节：肩→肘→腕→手指→髋→膝→踝→足趾", "缓慢、轻柔地屈伸、旋转", "每个关节活动5-10次", "遇到明显阻力时立即停止"],
    checkPoints: ["完成上肢关节活动", "完成下肢关节活动", "活动时无异常反应", "记录有无不适"],
  },
  {
    id: "skin_check", name: "皮肤护理与检查", category: "basic_care",
    frequency: "每日1次全身检查", icon: "eye",
    description: "预防压疮、感染",
    steps: ["每次翻身时顺便检查全身皮肤", "重点检查骨突处：骶尾、脚后跟、髋部、肩胛骨、肘部", "检查尿管、鼻饲管周围皮肤", "检查贴胶布处"],
    checkPoints: ["无新发红斑", "无皮肤破损", "无肿胀", "记录发现的问题"],
    requiresPhoto: true,
  },
  {
    id: "vital_signs", name: "生命体征测量", category: "observation",
    frequency: "每日4次，固定时间", icon: "heart",
    description: "监测体温、血压、心率、血氧饱和度",
    steps: ["测量体温（正常36.0-37.5℃）", "测量血压（正常收缩压<120mmHg）", "测量心率（正常60-100次/分）", "测量血氧饱和度（正常95-100%）"],
    checkPoints: ["体温在正常范围", "血压在正常范围", "心率在正常范围", "血氧在正常范围"],
    requiresData: true, dataType: "vitals",
    alertNote: "体温>38℃或<36℃、血压>140或<90、心率>100或<50、血氧<95%时立即报告！",
  },
  {
    id: "intake_output", name: "出入量记录", category: "observation",
    frequency: "每24小时总结", icon: "droplets",
    description: "监测液体平衡，预防脱水或水肿",
    steps: ["记录入量：鼻饲量、饮水量、输液量", "记录出量：用带刻度尿壶测量尿量", "记录大便次数及性状"],
    checkPoints: ["记录24小时总入量", "记录24小时总尿量", "记录大便情况"],
    requiresData: true, dataType: "intake_output",
    alertNote: "24小时尿量<800ml或>2500ml、连续6小时无尿时立即报告！",
  },
  {
    id: "neuro_observation", name: "神经系统观察", category: "observation",
    frequency: "每次接触时观察", icon: "brain",
    description: "监测意识恢复状况",
    steps: ["观察意识：比昨天更清醒还是更嗜睡？", "观察睁眼：能否自主睁眼？持续时间？", "测试呼唤反应：叫名字时有无反应？", "观察肢体活动：有无自主活动？", "观察疼痛表现：有无痛苦表情？"],
    checkPoints: ["记录意识状态变化", "记录睁眼情况", "记录对呼唤的反应", "记录肢体活动", "记录疼痛表现"],
    requiresData: true, dataType: "observation_text",
  },
  {
    id: "abdomen_limb_check", name: "腹部/肢体观察", category: "observation",
    frequency: "腹部每小时，肢体每日1次", icon: "scan",
    description: "监测动脉瘤和血栓风险",
    steps: ["腹部：看有无膨隆、搏动性包块", "腹部：问肚子疼不疼", "腹部：察有无面色苍白、出冷汗", "肢体：看双下肢有无不对称肿胀", "肢体：问腿疼不疼", "肢体：察有无突发胸痛、呼吸困难"],
    checkPoints: ["腹部无异常膨隆", "双下肢对称无肿胀", "无突发疼痛表现", "记录异常发现"],
    alertNote: "出现上述任何异常变化，立即呼叫护士/医生！",
  },
];

// ============ Vital Sign Ranges ============

export const VITAL_RANGES = {
  temperature: { min: 36.0, max: 37.5, unit: "℃", label: "体温", redMin: 36.0, redMax: 38.0, orangeMax: 38.5 },
  blood_pressure_sys: { min: 90, max: 140, unit: "mmHg", label: "收缩压(上压)", redMin: 90, redMax: 160 },
  blood_pressure_dia: { min: 60, max: 90, unit: "mmHg", label: "舒张压(下压)" },
  heart_rate: { min: 60, max: 100, unit: "次/分", label: "心率", redMin: 50, redMax: 100 },
  spo2: { min: 95, max: 100, unit: "%", label: "血氧饱和度", redMax: 90 },
};

export function checkVitalAlert(type: keyof typeof VITAL_RANGES, value: number): "red" | "orange" | "none" {
  if (type === "temperature") {
    if (value > 38.0 || value < 36.0) return "red";
    if (value > 37.5) return "orange";
    return "none";
  }
  if (type === "blood_pressure_sys") {
    if (value < 90 || value > 160) return "red";
    if (value > 140) return "orange";
    return "none";
  }
  if (type === "heart_rate") {
    if (value < 50 || value > 100) return "red";
    return "none";
  }
  if (type === "spo2") {
    if (value < 90) return "red";
    if (value < 95) return "orange";
    return "none";
  }
  return "none";
}

// ============ localStorage Storage ============

const KEYS = {
  CHECKINS: "icare_checkins",
  VITALS: "icare_vitals",
  INTAKE_OUTPUT: "icare_intake_output",
  OBSERVATIONS: "icare_observations",
  PATIENT_INFO: "icare_patient_info",
  ABNORMAL_EVENTS: "icare_abnormal_events",
  SHIFT_REPORTS: "icare_shift_reports",
};

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ Check-in Operations ============

export function getCheckIns(date: string): TaskCheckIn[] {
  const all = getJSON<TaskCheckIn[]>(KEYS.CHECKINS, []);
  return all.filter((c) => c.date === date);
}

export function saveCheckIn(checkIn: TaskCheckIn): void {
  const all = getJSON<TaskCheckIn[]>(KEYS.CHECKINS, []);
  const idx = all.findIndex((c) => c.taskId === checkIn.taskId && c.date === checkIn.date);
  if (idx >= 0) all[idx] = checkIn;
  else all.push(checkIn);
  setJSON(KEYS.CHECKINS, all);
}

export function getAllCheckIns(): TaskCheckIn[] {
  return getJSON<TaskCheckIn[]>(KEYS.CHECKINS, []);
}

// ============ Vital Signs Operations ============

export function getVitals(date?: string): VitalSign[] {
  const all = getJSON<VitalSign[]>(KEYS.VITALS, []);
  if (date) return all.filter((v) => v.date === date);
  return all;
}

export function saveVital(vital: VitalSign): void {
  const all = getJSON<VitalSign[]>(KEYS.VITALS, []);
  all.push(vital);
  setJSON(KEYS.VITALS, all);
}

// ============ Intake/Output Operations ============

export function getIntakeOutput(date?: string): IntakeOutput[] {
  const all = getJSON<IntakeOutput[]>(KEYS.INTAKE_OUTPUT, []);
  if (date) return all.filter((r) => r.date === date);
  return all;
}

export function saveIntakeOutput(record: IntakeOutput): void {
  const all = getJSON<IntakeOutput[]>(KEYS.INTAKE_OUTPUT, []);
  all.push(record);
  setJSON(KEYS.INTAKE_OUTPUT, all);
}

// ============ Observation Operations ============

export function getObservations(date?: string): ObservationRecord[] {
  const all = getJSON<ObservationRecord[]>(KEYS.OBSERVATIONS, []);
  if (date) return all.filter((r) => r.date === date);
  return all;
}

export function saveObservation(record: ObservationRecord): void {
  const all = getJSON<ObservationRecord[]>(KEYS.OBSERVATIONS, []);
  all.push(record);
  setJSON(KEYS.OBSERVATIONS, all);
}

// ============ Abnormal Events ============

export function getAbnormalEvents(date?: string): AbnormalEvent[] {
  const all = getJSON<AbnormalEvent[]>(KEYS.ABNORMAL_EVENTS, []);
  if (date) return all.filter((e) => e.date === date);
  return all;
}

export function saveAbnormalEvent(event: AbnormalEvent): void {
  const all = getJSON<AbnormalEvent[]>(KEYS.ABNORMAL_EVENTS, []);
  const idx = all.findIndex((e) => e.id === event.id);
  if (idx >= 0) all[idx] = event;
  else all.push(event);
  setJSON(KEYS.ABNORMAL_EVENTS, all);
}

export function updateAbnormalEventStatus(eventId: string, status: AbnormalEventStatus, note?: string): void {
  const all = getJSON<AbnormalEvent[]>(KEYS.ABNORMAL_EVENTS, []);
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx >= 0) {
    all[idx].status = status;
    if (status === "acknowledged") all[idx].acknowledgedAt = getNowTimeStr();
    if (status === "resolved") { all[idx].resolvedAt = getNowTimeStr(); all[idx].resolvedNote = note; }
    if (status === "escalated") all[idx].escalatedAt = getNowTimeStr();
    setJSON(KEYS.ABNORMAL_EVENTS, all);
  }
}

// ============ Shift Reports ============

export function getShiftReports(date?: string): ShiftReport[] {
  const all = getJSON<ShiftReport[]>(KEYS.SHIFT_REPORTS, []);
  if (date) return all.filter((r) => r.date === date);
  return all;
}

export function saveShiftReport(report: ShiftReport): void {
  const all = getJSON<ShiftReport[]>(KEYS.SHIFT_REPORTS, []);
  const idx = all.findIndex((r) => r.id === report.id);
  if (idx >= 0) all[idx] = report;
  else all.push(report);
  setJSON(KEYS.SHIFT_REPORTS, all);
}

export function generateShiftReport(
  date: string, shift: ShiftType,
  checkIns: TaskCheckIn[], vitals: VitalSign[],
  intakeOutput: IntakeOutput[], observations: ObservationRecord[],
  abnormalEvents: AbnormalEvent[]
): ShiftReport {
  const completedIds = new Set(checkIns.filter((c) => c.completed).map((c) => c.taskId));
  const completedTasks = CARE_TASKS.filter((t) => completedIds.has(t.id)).map((t) => t.name);
  const missedTasks = CARE_TASKS.filter((t) => !completedIds.has(t.id)).map((t) => t.name);
  const completionRate = CARE_TASKS.length > 0 ? completedIds.size / CARE_TASKS.length : 0;

  const latestVitals: Record<string, { value: number; isAbnormal: boolean }> = {};
  for (const v of vitals) latestVitals[v.type] = { value: v.value, isAbnormal: v.isAbnormal };
  const vitalsSummary = Object.entries(latestVitals).map(([type, data]) => ({ type, latest: data.value, isAbnormal: data.isAbnormal }));

  let totalIntake = 0, totalOutput = 0;
  for (const r of intakeOutput) {
    if (r.type === "urine") totalOutput += r.amount || 0;
    else if (r.type !== "stool" && r.amount) totalIntake += r.amount;
  }

  const obsTexts = observations.map((o) => `${o.isAbnormal ? "⚠️" : "✅"} ${o.content}`);

  const nextShiftFocus: string[] = [];
  if (missedTasks.length > 0) nextShiftFocus.push(`补做未完成任务: ${missedTasks.slice(0, 3).join("、")}`);
  const unresolvedEvents = abnormalEvents.filter((e) => e.status !== "resolved");
  if (unresolvedEvents.length > 0) nextShiftFocus.push(`跟进${unresolvedEvents.length}个未解决异常事件`);
  if (totalIntake - totalOutput > 500) nextShiftFocus.push("注意液体平衡，入量偏多");
  if (totalIntake - totalOutput < -300) nextShiftFocus.push("注意补液，出量偏多");

  return {
    id: `report_${date}_${shift}`, date, shift,
    generatedAt: getNowTimeStr(), completionRate, completedTasks, missedTasks,
    abnormalEvents: abnormalEvents.filter((e) => e.date === date),
    vitalsSummary, intakeSummary: { totalIntake, totalOutput },
    observations: obsTexts, nextShiftFocus,
  };
}

// ============ Patient Info ============

export const DEFAULT_PATIENT: PatientInfo = {
  name: "王骏家", age: 82, bedNumber: "", careLevel: "一级护理",
  keyAlerts: ["腹主动脉瘤 — 禁止腹部按压", "鼻饲管 — 喂养前确认位置", "留置尿管 — 保持通畅", "高钠血症恢复期 — 注意补液"],
  admissionDate: "2026-02-22",
  contacts: [
    { role: "主管医生", name: "", phone: "" },
    { role: "值班护士站", name: "", phone: "" },
    { role: "家属1", name: "", phone: "" },
    { role: "家属2", name: "", phone: "" },
    { role: "急救电话", name: "120", phone: "120" },
  ],
};

export function getPatientInfo(): PatientInfo {
  return getJSON<PatientInfo>(KEYS.PATIENT_INFO, DEFAULT_PATIENT);
}

export function savePatientInfo(info: PatientInfo): void {
  setJSON(KEYS.PATIENT_INFO, info);
}

// ============ Shift & Date Helpers ============

export type ShiftType = "morning" | "afternoon" | "night";

export function getCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 15) return "morning";
  if (hour >= 15 && hour < 23) return "afternoon";
  return "night";
}

export function getShiftLabel(shift: ShiftType): string {
  return { morning: "早班 (7:00-15:00)", afternoon: "中班 (15:00-23:00)", night: "夜班 (23:00-7:00)" }[shift];
}

export function getShiftShortLabel(shift: ShiftType): string {
  return { morning: "早班", afternoon: "中班", night: "夜班" }[shift];
}

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getNowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[1]}月${parts[2]}日`;
}

export function getRecentDates(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return dates;
}
