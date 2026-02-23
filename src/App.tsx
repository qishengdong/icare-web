import { useState } from "react";
import { CareProvider } from "./lib/care-context";
import HomePage from "./pages/HomePage";
import RecordsPage from "./pages/RecordsPage";
import DashboardPage from "./pages/DashboardPage";
import MorePage from "./pages/MorePage";
import TaskDetailPage from "./pages/TaskDetailPage";
import AbnormalEventsPage from "./pages/AbnormalEventsPage";
import ShiftReportPage from "./pages/ShiftReportPage";
import SettingsPage from "./pages/SettingsPage";

type Tab = "home" | "records" | "dashboard" | "more";
type SubPage = { type: "task_detail"; taskId: string } | { type: "abnormal_events" } | { type: "shift_report" } | { type: "settings" } | null;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--color-primary)" : "var(--color-text-tertiary)";
  const icons: Record<string, JSX.Element> = {
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" fill={active ? "rgba(61,122,74,0.15)" : "none"} />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" fill={active ? "rgba(61,122,74,0.15)" : "none"} />
      </svg>
    ),
    records: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18" /><path d="M5 20V9" /><path d="M9 20V5" /><path d="M13 20v-8" /><path d="M17 20V7" />
        {active && <circle cx="9" cy="5" r="2" fill="rgba(61,122,74,0.3)" stroke="none" />}
      </svg>
    ),
    dashboard: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" fill={active ? "rgba(61,122,74,0.08)" : "none"} />
        <path d="M12 7v5l3 3" />
        {active && <circle cx="12" cy="12" r="2" fill="rgba(61,122,74,0.3)" stroke="none" />}
      </svg>
    ),
    more: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1.5" fill={color} stroke="none" />
        <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
        <circle cx="12" cy="19" r="1.5" fill={color} stroke="none" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [subPage, setSubPage] = useState<SubPage>(null);

  const navigate = (page: SubPage) => setSubPage(page);
  const goBack = () => setSubPage(null);

  const renderContent = () => {
    if (subPage) {
      switch (subPage.type) {
        case "task_detail":
          return <TaskDetailPage taskId={subPage.taskId} onBack={goBack} />;
        case "abnormal_events":
          return <AbnormalEventsPage onBack={goBack} />;
        case "shift_report":
          return <ShiftReportPage onBack={goBack} />;
        case "settings":
          return <SettingsPage onBack={goBack} />;
      }
    }
    switch (activeTab) {
      case "home": return <HomePage navigate={navigate} />;
      case "records": return <RecordsPage />;
      case "dashboard": return <DashboardPage navigate={navigate} />;
      case "more": return <MorePage navigate={navigate} />;
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "今日任务", icon: "home" },
    { id: "records", label: "数据记录", icon: "records" },
    { id: "dashboard", label: "看板", icon: "dashboard" },
    { id: "more", label: "更多", icon: "more" },
  ];

  return (
    <CareProvider>
      <div className="flex flex-col h-full w-full max-w-[430px] mx-auto bg-[var(--color-bg)] relative"
           style={{ boxShadow: "0 0 60px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 overflow-y-auto scroll-container hide-scrollbar">
          <div className={subPage ? "page-enter" : ""}>
            {renderContent()}
          </div>
        </div>
        {!subPage && (
          <div className="tab-bar-glass flex items-center justify-around px-1"
               style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)", height: "calc(52px + max(env(safe-area-inset-bottom), 6px))" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSubPage(null); }}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 pt-1.5 pb-0.5 press-feedback"
                  style={{ transition: "all 0.2s ease" }}>
                  <TabIcon name={tab.icon} active={isActive} />
                  <span style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--color-primary)" : "var(--color-text-tertiary)",
                    letterSpacing: "0.01em",
                    transition: "color 0.2s ease",
                  }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </CareProvider>
  );
}
