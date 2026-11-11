import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  FileSpreadsheet,
  Home,
  Layers,
  Moon,
  PackageX,
  Play,
  Printer,
  Scale,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PrintableReport } from './components/PrintableReport';
import { TolerancesModal } from './components/TolerancesModal';
import { CleanlinessTab } from './components/tabs/CleanlinessTab';
import { DamagedMaterialsTab } from './components/tabs/DamagedMaterialsTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { MachineInspectionTab } from './components/tabs/MachineInspectionTab';
import { ProductionHourlyTab } from './components/tabs/ProductionHourlyTab';
import { ScalesTab } from './components/tabs/ScalesTab';
import {
  createInitialShiftData,
  exportShiftToExcel,
  loadShiftQCData,
  saveShiftQCData,
} from './services/storage';
import {
  CleanlinessRecord,
  DamagedMaterialRecord,
  DefectNotification,
  HourlyProductionRecord,
  InspectorSession,
  MachineStartInspection,
  ScaleVerificationRecord,
  ShiftQCData,
} from './types';

export default function App() {
  // Offline-First status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sugar_qc_theme') === 'dark';
  });

  // Shift QC Data
  const [qcData, setQcData] = useState<ShiftQCData>(() => {
    const saved = loadShiftQCData();
    if (saved) return saved;

    const defaultSession: InspectorSession = {
      inspectorName: 'م. أحمد الشافعي',
      shift: 'A',
      date: new Date().toISOString().split('T')[0],
      startedAt: '08:00 ص',
    };
    const fresh = createInitialShiftData(defaultSession);
    saveShiftQCData(fresh);
    return fresh;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'production' | 'machines' | 'cleanliness' | 'damaged' | 'scales'
  >('dashboard');

  const [preselectedMachineId, setPreselectedMachineId] = useState<number | null>(null);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isTolerancesModalOpen, setIsTolerancesModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sugar_qc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sugar_qc_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist data automatically
  const updateAndSaveData = (updater: (prev: ShiftQCData) => ShiftQCData) => {
    setQcData((prev) => {
      const updated = updater(prev);
      saveShiftQCData(updated);
      return updated;
    });
  };

  // Login / Switch shift handler
  const handleLogin = (session: InspectorSession, isNewShift: boolean) => {
    if (isNewShift) {
      const fresh = createInitialShiftData(session);
      setQcData(fresh);
      saveShiftQCData(fresh);
    } else {
      updateAndSaveData((prev) => ({
        ...prev,
        session,
      }));
    }
    setIsLoginModalOpen(false);
  };

  // Update hourly production record
  const handleUpdateHourlyRecord = (record: HourlyProductionRecord) => {
    updateAndSaveData((prev) => ({
      ...prev,
      hourlyProduction: {
        ...prev.hourlyProduction,
        [record.id]: record,
      },
    }));
  };

  // Add defect notification
  const handleAddDefectNotification = (notif: DefectNotification) => {
    updateAndSaveData((prev) => {
      const exists = prev.defectNotifications.some((d) => d.id === notif.id);
      if (exists) return prev;
      return {
        ...prev,
        defectNotifications: [notif, ...prev.defectNotifications],
      };
    });
  };

  // Update defect notification
  const handleUpdateDefectNotification = (notif: DefectNotification) => {
    updateAndSaveData((prev) => ({
      ...prev,
      defectNotifications: prev.defectNotifications.map((d) =>
        d.id === notif.id ? notif : d
      ),
    }));
  };

  // Update machine start inspection
  const handleUpdateMachineInspection = (inspection: MachineStartInspection) => {
    updateAndSaveData((prev) => ({
      ...prev,
      machineInspections: {
        ...prev.machineInspections,
        [inspection.machineId]: inspection,
      },
    }));
  };

  // Update cleanliness record
  const handleUpdateCleanliness = (record: CleanlinessRecord) => {
    updateAndSaveData((prev) => ({
      ...prev,
      cleanlinessRecords: prev.cleanlinessRecords.map((c) =>
        c.id === record.id ? record : c
      ),
    }));
  };

  const handleAddCleanliness = (record: CleanlinessRecord) => {
    updateAndSaveData((prev) => ({
      ...prev,
      cleanlinessRecords: [...prev.cleanlinessRecords, record],
    }));
  };

  // Damaged materials
  const handleAddDamagedRecord = (record: DamagedMaterialRecord) => {
    updateAndSaveData((prev) => ({
      ...prev,
      damagedMaterials: [record, ...prev.damagedMaterials],
    }));
  };

  const handleDeleteDamagedRecord = (id: string) => {
    updateAndSaveData((prev) => ({
      ...prev,
      damagedMaterials: prev.damagedMaterials.filter((m) => m.id !== id),
    }));
  };

  // Scales verification
  const handleAddScaleVerification = (record: ScaleVerificationRecord) => {
    updateAndSaveData((prev) => ({
      ...prev,
      scaleVerifications: [record, ...prev.scaleVerifications],
    }));
  };

  const handleDeleteScaleVerification = (id: string) => {
    updateAndSaveData((prev) => ({
      ...prev,
      scaleVerifications: prev.scaleVerifications.filter((s) => s.id !== id),
    }));
  };

  // Navigation tab switcher with machine jump
  const handleNavigateTab = (tabId: string, machineId?: number) => {
    if (machineId) {
      setPreselectedMachineId(machineId);
    }
    setActiveTab(tabId as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count open alerts
  const openAlertsCount = qcData.defectNotifications.filter((d) => d.status === 'مفتوح').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. Header (Sticky) */}
      <Header
        session={qcData.session}
        data={qcData}
        isOnline={isOnline}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenTolerances={() => setIsTolerancesModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onSwitchShift={() => setIsLoginModalOpen(true)}
        onPrintReport={() => setIsPrintReportOpen(true)}
      />

      {/* 2. Primary Navigation Bar */}
      <nav className="sticky top-[60px] sm:top-[66px] z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>لوحة التحكم المباشرة</span>
            </button>

            {/* Production Hourly (Heart of the App) */}
            <button
              onClick={() => setActiveTab('production')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'production'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>فحص الإنتاج الساعي (15 ماكينة)</span>
            </button>

            {/* Machines Inspection */}
            <button
              onClick={() => setActiveTab('machines')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'machines'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>فحص الماكينات (بداية الوردية)</span>
            </button>

            {/* Cleanliness */}
            <button
              onClick={() => setActiveTab('cleanliness')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'cleanliness'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>سجل النظافة (كل 3 ساعات)</span>
            </button>

            {/* Damaged Materials */}
            <button
              onClick={() => setActiveTab('damaged')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'damaged'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PackageX className="w-4 h-4" />
              <span>مواد التعبئة التالفة</span>
            </button>

            {/* Scales Verification */}
            <button
              onClick={() => setActiveTab('scales')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                activeTab === 'scales'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>معايرة الموازين</span>
            </button>

          </div>
        </div>
      </nav>

      {/* 3. Main Operational Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardTab
            data={qcData}
            onNavigateTab={handleNavigateTab}
            onOpenNotifications={() => setIsNotificationsModalOpen(true)}
            onOpenTolerances={() => setIsTolerancesModalOpen(true)}
          />
        )}

        {activeTab === 'production' && (
          <ProductionHourlyTab
            data={qcData}
            onUpdateRecord={handleUpdateHourlyRecord}
            onAddDefectNotification={handleAddDefectNotification}
            onUpdateDefectNotification={handleUpdateDefectNotification}
            preselectedMachineId={preselectedMachineId}
          />
        )}

        {activeTab === 'machines' && (
          <MachineInspectionTab
            data={qcData}
            onUpdateMachineInspection={handleUpdateMachineInspection}
            inspectorName={qcData.session.inspectorName}
          />
        )}

        {activeTab === 'cleanliness' && (
          <CleanlinessTab
            data={qcData}
            onUpdateCleanlinessRecord={handleUpdateCleanliness}
            onAddCleanlinessRecord={handleAddCleanliness}
            inspectorName={qcData.session.inspectorName}
          />
        )}

        {activeTab === 'damaged' && (
          <DamagedMaterialsTab
            data={qcData}
            onAddDamagedRecord={handleAddDamagedRecord}
            onDeleteDamagedRecord={handleDeleteDamagedRecord}
          />
        )}

        {activeTab === 'scales' && (
          <ScalesTab
            data={qcData}
            onAddScaleVerification={handleAddScaleVerification}
            onDeleteScaleVerification={handleDeleteScaleVerification}
          />
        )}
      </main>

      {/* 4. Bottom Quick Touch Bar for Mobile Operations */}
      <aside className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around no-print shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('production')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold ${
            activeTab === 'production'
              ? 'text-blue-600 dark:text-blue-400 font-black'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الإنتاج (ساعة)</span>
        </button>

        <button
          onClick={() => setActiveTab('machines')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold ${
            activeTab === 'machines'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>الماكينات</span>
        </button>

        <button
          onClick={() => setIsNotificationsModalOpen(true)}
          className="relative flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>الإخطارات</span>
          {openAlertsCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
              {openAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => exportShiftToExcel(qcData)}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>إكسيل</span>
        </button>
      </aside>

      {/* 5. Modals and Drawers */}
      {isLoginModalOpen && (
        <LoginModal
          currentSession={qcData.session}
          onLogin={handleLogin}
          canCancel={true}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}

      {isTolerancesModalOpen && (
        <TolerancesModal
          isOpen={isTolerancesModalOpen}
          onClose={() => setIsTolerancesModalOpen(false)}
        />
      )}

      {isNotificationsModalOpen && (
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          notifications={qcData.defectNotifications}
          onUpdateNotification={handleUpdateDefectNotification}
          inspectorName={qcData.session.inspectorName}
        />
      )}

      {isPrintReportOpen && (
        <PrintableReport
          isOpen={isPrintReportOpen}
          onClose={() => setIsPrintReportOpen(false)}
          data={qcData}
        />
      )}

    </div>
  );
}
