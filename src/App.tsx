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
import { ClipboardList, BarChart3, LayoutDashboard, Menu } from "lucide-react";

type Tab = "home" | "records" | "dashboard" | "more";
type SubPage = { type: "task_detail"; taskId: string } | { type: "abnormal_events" } | { type: "shift_report" } | { type: "settings" } | null;

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "今日任务", icon: <ClipboardList size={22} /> },
    { id: "records", label: "数据记录", icon: <BarChart3 size={22} /> },
    { id: "dashboard", label: "看板", icon: <LayoutDashboard size={22} /> },
    { id: "more", label: "更多", icon: <Menu size={22} /> },
  ];

  return (
    <CareProvider>
      <div className="flex flex-col h-full w-full max-w-[430px] mx-auto bg-[var(--color-bg)] relative shadow-2xl">
        <div className="flex-1 overflow-y-auto scroll-container hide-scrollbar">
          {renderContent()}
        </div>
        {!subPage && (
          <div className="flex items-center justify-around bg-white border-t border-[var(--color-border)] px-2"
               style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)", height: "calc(56px + max(env(safe-area-inset-bottom), 8px))" }}>
            {tabs.map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 pb-1 transition-colors ${
                  activeTab === tab.id ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
                }`}>
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </CareProvider>
  );
}
