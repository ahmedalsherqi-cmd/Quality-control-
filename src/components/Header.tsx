import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  Moon,
  Printer,
  RefreshCw,
  Sun,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { SHIFT_CONFIG } from '../data/constants';
import { exportShiftToExcel } from '../services/storage';
import { InspectorSession, ShiftQCData } from '../types';

interface HeaderProps {
  session: InspectorSession;
  data: ShiftQCData;
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTolerances: () => void;
  onOpenNotifications: () => void;
  onSwitchShift: () => void;
  onPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  data,
  isOnline,
  isDarkMode,
  onToggleDarkMode,
  onOpenTolerances,
  onOpenNotifications,
  onSwitchShift,
  onPrintReport,
}) => {
  const shiftInfo = SHIFT_CONFIG[session.shift];
  const openDefectsCount = data.defectNotifications.filter((d) => d.status === 'مفتوح').length;

  return (
    <header className="sticky top-0 z-30 bg-[#1E3A8A] text-white shadow-lg border-b border-blue-950 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Shift Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-black text-xl shadow-inner text-amber-300">
                QC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                    صالة تعبئة السكر — نظام ضبط الجودة
                  </h1>
                  <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-700/80 text-blue-100 border border-blue-500/40">
                    صناعي ميداني
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200 mt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <User className="w-3.5 h-3.5 text-blue-300" />
                    المراقب: {session.inspectorName}
                  </span>
                  <span className="text-blue-400">•</span>
                  <span className="flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-amber-400 text-blue-950 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {shiftInfo.title} ({shiftInfo.timing})
                  </span>
                  <span className="hidden md:inline-flex text-blue-400">•</span>
                  <span className="hidden md:flex items-center gap-1 text-[11px] text-blue-200">
                    <Calendar className="w-3 h-3" />
                    {session.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Shift Switcher */}
            <button
              onClick={onSwitchShift}
              className="md:hidden text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-1 text-blue-100 font-medium"
              title="تبديل الوردية أو المراقب"
            >
              <RefreshCw className="w-3 h-3" />
              تبديل
            </button>
          </div>

          {/* Action Tools & Status Indicators */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
            
            {/* Offline-First Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              }`}
              title={isOnline ? 'النظام متصل ويحفظ محلياً فورياً' : 'وضع غير متصل — الحفظ نشط محلياً دون انقطاع'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>متصل / حفظ محلي</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>محلي (Offline-First)</span>
                </>
              )}
            </div>

            {/* Tolerances Quick Ref Button */}
            <button
              onClick={onOpenTolerances}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 border border-blue-600/60 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>سماحيات الأوزان (11)</span>
            </button>

            {/* Quality Defect Alerts Notification Button */}
            <button
              onClick={onOpenNotifications}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm active:scale-95 border ${
                openDefectsCount > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-blue-800/80 hover:bg-blue-700 text-blue-100 border-blue-600/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>إخطارات الجودة</span>
              {openDefectsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-rose-700 font-extrabold text-[11px] flex items-center justify-center">
                  {openDefectsCount}
                </span>
              )}
            </button>

            {/* Export Excel Button */}
            <button
              onClick={() => exportShiftToExcel(data)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition active:scale-95 border border-emerald-500/50"
              title="تصدير بيانات الوردية بالكامل لملف إكسيل Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إكسيل</span>
            </button>

            {/* Print / PDF Report Button */}
            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm transition active:scale-95 border border-indigo-500/50"
              title="معاينة وطباعة تقرير الوردية الرسمي (PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تقرير PDF</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-200 border border-blue-600/60 transition active:scale-95"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              aria-label="تبديل الوضع الليلي"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Desktop Switch Shift */}
            <button
              onClick={onSwitchShift}
              className="hidden md:flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1.5 rounded hover:bg-blue-800 transition"
              title="تغيير المراقب أو الوردية"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تبديل</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
