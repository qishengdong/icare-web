import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  type TaskCheckIn, type VitalSign, type IntakeOutput, type ObservationRecord,
  type PatientInfo, type ShiftType, type AbnormalEvent, type AbnormalEventStatus, type ShiftReport,
  CARE_TASKS, DEFAULT_PATIENT, getTodayStr, getNowTimeStr, getCurrentShift,
  getCheckIns, saveCheckIn, getVitals, saveVital, getIntakeOutput, saveIntakeOutput,
  getObservations, saveObservation, getPatientInfo, savePatientInfo, getAllCheckIns,
  checkVitalAlert, getAbnormalEvents, saveAbnormalEvent, updateAbnormalEventStatus,
  generateShiftReport, saveShiftReport, VITAL_RANGES,
} from "./care-data";

interface CareState {
  todayCheckIns: TaskCheckIn[];
  todayVitals: VitalSign[];
  todayIntakeOutput: IntakeOutput[];
  todayObservations: ObservationRecord[];
  todayAbnormalEvents: AbnormalEvent[];
  allVitals: VitalSign[];
  allCheckIns: TaskCheckIn[];
  allAbnormalEvents: AbnormalEvent[];
  patientInfo: PatientInfo;
  currentShift: ShiftType;
  currentDate: string;
  loading: boolean;
}

type CareAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TODAY_CHECKINS"; payload: TaskCheckIn[] }
  | { type: "SET_TODAY_VITALS"; payload: VitalSign[] }
  | { type: "SET_TODAY_INTAKE_OUTPUT"; payload: IntakeOutput[] }
  | { type: "SET_TODAY_OBSERVATIONS"; payload: ObservationRecord[] }
  | { type: "SET_TODAY_ABNORMAL_EVENTS"; payload: AbnormalEvent[] }
  | { type: "SET_ALL_VITALS"; payload: VitalSign[] }
  | { type: "SET_ALL_CHECKINS"; payload: TaskCheckIn[] }
  | { type: "SET_ALL_ABNORMAL_EVENTS"; payload: AbnormalEvent[] }
  | { type: "SET_PATIENT_INFO"; payload: PatientInfo }
  | { type: "SET_SHIFT"; payload: ShiftType }
  | { type: "SET_DATE"; payload: string }
  | { type: "ADD_CHECKIN"; payload: TaskCheckIn }
  | { type: "ADD_VITAL"; payload: VitalSign }
  | { type: "ADD_INTAKE_OUTPUT"; payload: IntakeOutput }
  | { type: "ADD_OBSERVATION"; payload: ObservationRecord }
  | { type: "ADD_ABNORMAL_EVENT"; payload: AbnormalEvent }
  | { type: "UPDATE_ABNORMAL_EVENT"; payload: { id: string; status: AbnormalEventStatus } };

function careReducer(state: CareState, action: CareAction): CareState {
  switch (action.type) {
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_TODAY_CHECKINS": return { ...state, todayCheckIns: action.payload };
    case "SET_TODAY_VITALS": return { ...state, todayVitals: action.payload };
    case "SET_TODAY_INTAKE_OUTPUT": return { ...state, todayIntakeOutput: action.payload };
    case "SET_TODAY_OBSERVATIONS": return { ...state, todayObservations: action.payload };
    case "SET_TODAY_ABNORMAL_EVENTS": return { ...state, todayAbnormalEvents: action.payload };
    case "SET_ALL_VITALS": return { ...state, allVitals: action.payload };
    case "SET_ALL_CHECKINS": return { ...state, allCheckIns: action.payload };
    case "SET_ALL_ABNORMAL_EVENTS": return { ...state, allAbnormalEvents: action.payload };
    case "SET_PATIENT_INFO": return { ...state, patientInfo: action.payload };
    case "SET_SHIFT": return { ...state, currentShift: action.payload };
    case "SET_DATE": return { ...state, currentDate: action.payload };
    case "ADD_CHECKIN": return { ...state, todayCheckIns: [...state.todayCheckIns, action.payload], allCheckIns: [...state.allCheckIns, action.payload] };
    case "ADD_VITAL": return { ...state, todayVitals: [...state.todayVitals, action.payload], allVitals: [...state.allVitals, action.payload] };
    case "ADD_INTAKE_OUTPUT": return { ...state, todayIntakeOutput: [...state.todayIntakeOutput, action.payload] };
    case "ADD_OBSERVATION": return { ...state, todayObservations: [...state.todayObservations, action.payload] };
    case "ADD_ABNORMAL_EVENT": return { ...state, todayAbnormalEvents: [...state.todayAbnormalEvents, action.payload], allAbnormalEvents: [...state.allAbnormalEvents, action.payload] };
    case "UPDATE_ABNORMAL_EVENT": {
      const upd = (events: AbnormalEvent[]) => events.map((e) => (e.id === action.payload.id ? { ...e, status: action.payload.status } : e));
      return { ...state, todayAbnormalEvents: upd(state.todayAbnormalEvents), allAbnormalEvents: upd(state.allAbnormalEvents) };
    }
    default: return state;
  }
}

interface CareContextValue {
  state: CareState;
  checkInTask: (taskId: string, note?: string) => void;
  recordVital: (type: VitalSign["type"], value: number) => "red" | "orange" | "none";
  recordIntakeOutput: (type: IntakeOutput["type"], amount?: number, note?: string, stoolType?: string) => void;
  recordObservation: (category: ObservationRecord["category"], content: string, isAbnormal: boolean) => void;
  updatePatientInfo: (info: PatientInfo) => void;
  acknowledgeEvent: (eventId: string) => void;
  resolveEvent: (eventId: string, note?: string) => void;
  escalateEvent: (eventId: string) => void;
  generateReport: () => ShiftReport;
  refreshData: () => void;
  getCompletionRate: () => number;
  getPendingAlerts: () => AbnormalEvent[];
}

const CareContext = createContext<CareContextValue | null>(null);

export function CareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(careReducer, {
    todayCheckIns: [], todayVitals: [], todayIntakeOutput: [], todayObservations: [],
    todayAbnormalEvents: [], allVitals: [], allCheckIns: [], allAbnormalEvents: [],
    patientInfo: DEFAULT_PATIENT, currentShift: getCurrentShift(), currentDate: getTodayStr(), loading: true,
  });

  const refreshData = useCallback(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const today = getTodayStr();
    dispatch({ type: "SET_DATE", payload: today });
    dispatch({ type: "SET_SHIFT", payload: getCurrentShift() });
    dispatch({ type: "SET_TODAY_CHECKINS", payload: getCheckIns(today) });
    dispatch({ type: "SET_TODAY_VITALS", payload: getVitals(today) });
    dispatch({ type: "SET_TODAY_INTAKE_OUTPUT", payload: getIntakeOutput(today) });
    dispatch({ type: "SET_TODAY_OBSERVATIONS", payload: getObservations(today) });
    dispatch({ type: "SET_TODAY_ABNORMAL_EVENTS", payload: getAbnormalEvents(today) });
    dispatch({ type: "SET_ALL_VITALS", payload: getVitals() });
    dispatch({ type: "SET_ALL_CHECKINS", payload: getAllCheckIns() });
    dispatch({ type: "SET_ALL_ABNORMAL_EVENTS", payload: getAbnormalEvents() });
    dispatch({ type: "SET_PATIENT_INFO", payload: getPatientInfo() });
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const checkInTask = useCallback((taskId: string, note?: string) => {
    const today = getTodayStr();
    const shift = getCurrentShift();
    const checkIn: TaskCheckIn = { taskId, date: today, time: getNowTimeStr(), shift, note, completed: true };
    saveCheckIn(checkIn);
    dispatch({ type: "ADD_CHECKIN", payload: checkIn });
  }, []);

  const recordVital = useCallback((type: VitalSign["type"], value: number): "red" | "orange" | "none" => {
    const alertLevel = checkVitalAlert(type as keyof typeof VITAL_RANGES, value);
    const vital: VitalSign = { id: `${type}_${Date.now()}`, date: getTodayStr(), time: getNowTimeStr(), type, value, isAbnormal: alertLevel !== "none", alertLevel };
    saveVital(vital);
    dispatch({ type: "ADD_VITAL", payload: vital });
    if (alertLevel !== "none") {
      const range = VITAL_RANGES[type];
      const event: AbnormalEvent = {
        id: `event_${Date.now()}`, date: getTodayStr(), time: getNowTimeStr(), type: "vital", category: type,
        description: `${range.label} ${value}${range.unit} 异常`, alertLevel, status: "pending", relatedVitalId: vital.id,
      };
      saveAbnormalEvent(event);
      dispatch({ type: "ADD_ABNORMAL_EVENT", payload: event });
    }
    return alertLevel;
  }, []);

  const recordIntakeOutputFn = useCallback((type: IntakeOutput["type"], amount?: number, note?: string, stoolType?: string) => {
    const record: IntakeOutput = { id: `${type}_${Date.now()}`, date: getTodayStr(), time: getNowTimeStr(), type, amount, stoolType, note };
    saveIntakeOutput(record);
    dispatch({ type: "ADD_INTAKE_OUTPUT", payload: record });
  }, []);

  const recordObservationFn = useCallback((category: ObservationRecord["category"], content: string, isAbnormal: boolean) => {
    const record: ObservationRecord = { id: `${category}_${Date.now()}`, date: getTodayStr(), time: getNowTimeStr(), category, content, isAbnormal };
    saveObservation(record);
    dispatch({ type: "ADD_OBSERVATION", payload: record });
    if (isAbnormal) {
      const event: AbnormalEvent = {
        id: `event_obs_${Date.now()}`, date: getTodayStr(), time: getNowTimeStr(), type: "observation", category,
        description: content, alertLevel: "orange", status: "pending",
      };
      saveAbnormalEvent(event);
      dispatch({ type: "ADD_ABNORMAL_EVENT", payload: event });
    }
  }, []);

  const updatePatientInfoFn = useCallback((info: PatientInfo) => {
    savePatientInfo(info);
    dispatch({ type: "SET_PATIENT_INFO", payload: info });
  }, []);

  const acknowledgeEvent = useCallback((eventId: string) => {
    updateAbnormalEventStatus(eventId, "acknowledged");
    dispatch({ type: "UPDATE_ABNORMAL_EVENT", payload: { id: eventId, status: "acknowledged" } });
  }, []);

  const resolveEvent = useCallback((eventId: string, note?: string) => {
    updateAbnormalEventStatus(eventId, "resolved", note);
    dispatch({ type: "UPDATE_ABNORMAL_EVENT", payload: { id: eventId, status: "resolved" } });
  }, []);

  const escalateEvent = useCallback((eventId: string) => {
    updateAbnormalEventStatus(eventId, "escalated");
    dispatch({ type: "UPDATE_ABNORMAL_EVENT", payload: { id: eventId, status: "escalated" } });
  }, []);

  const generateReportFn = useCallback((): ShiftReport => {
    const today = getTodayStr();
    const shift = getCurrentShift();
    const report = generateShiftReport(today, shift, state.todayCheckIns, state.todayVitals, state.todayIntakeOutput, state.todayObservations, state.todayAbnormalEvents);
    saveShiftReport(report);
    return report;
  }, [state.todayCheckIns, state.todayVitals, state.todayIntakeOutput, state.todayObservations, state.todayAbnormalEvents]);

  const getCompletionRate = useCallback(() => {
    const completed = new Set(state.todayCheckIns.filter((c) => c.completed).map((c) => c.taskId)).size;
    return CARE_TASKS.length > 0 ? completed / CARE_TASKS.length : 0;
  }, [state.todayCheckIns]);

  const getPendingAlerts = useCallback(() => {
    return state.todayAbnormalEvents.filter((e) => e.status === "pending" || e.status === "acknowledged");
  }, [state.todayAbnormalEvents]);

  return (
    <CareContext.Provider value={{
      state, checkInTask, recordVital, recordIntakeOutput: recordIntakeOutputFn,
      recordObservation: recordObservationFn, updatePatientInfo: updatePatientInfoFn,
      acknowledgeEvent, resolveEvent, escalateEvent, generateReport: generateReportFn,
      refreshData, getCompletionRate, getPendingAlerts,
    }}>
      {children}
    </CareContext.Provider>
  );
}

export function useCare(): CareContextValue {
  const ctx = useContext(CareContext);
  if (!ctx) throw new Error("useCare must be used within CareProvider");
  return ctx;
}
