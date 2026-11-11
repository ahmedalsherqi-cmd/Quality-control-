import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Percent,
  Play,
  Scale,
  Sparkles,
  StopCircle,
  TrendingUp,
} from 'lucide-react';
import { FIXED_PRODUCTS, TOTAL_MACHINES } from '../../data/constants';
import { getProductById, validateWeight } from '../../services/storage';
import { ShiftQCData } from '../../types';

interface DashboardTabProps {
  data: ShiftQCData;
  onNavigateTab: (tabId: string, targetMachineId?: number) => void;
  onOpenNotifications: () => void;
  onOpenTolerances: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onNavigateTab,
  onOpenNotifications,
  onOpenTolerances,
}) => {
  // Calculate key metrics
  const openAlerts = data.defectNotifications.filter((d) => d.status === 'مفتوح');
  const allNotificationsCount = data.defectNotifications.length;

  // Hourly records analysis
  let totalCheckedRecords = 0;
  let inToleranceRecords = 0;
  let outToleranceRecords = 0;
  let runningMachinesNow = 0;
  let stoppedMachinesNow = 0;

  // Per machine stats
  const machineStats: Record<number, { total: number; inTolerance: number; stoppedCount: number; currentProduct?: string; currentWeight?: number | null; isWithinCurrent?: boolean }> = {};

  for (let m = 1; m <= TOTAL_MACHINES; m++) {
    machineStats[m] = { total: 0, inTolerance: 0, stoppedCount: 0 };
  }

  Object.values(data.hourlyProduction).forEach((rec) => {
    if (rec.isStopped) {
      machineStats[rec.machineId].stoppedCount += 1;
    } else if (rec.actualWeight !== null) {
      totalCheckedRecords += 1;
      machineStats[rec.machineId].total += 1;
      const val = validateWeight(rec.productId, rec.actualWeight);
      if (val?.isWithin) {
        inToleranceRecords += 1;
        machineStats[rec.machineId].inTolerance += 1;
      } else {
        outToleranceRecords += 1;
      }
    }
  });

  const overallComplianceRate =
    totalCheckedRecords > 0
      ? ((inToleranceRecords / totalCheckedRecords) * 100).toFixed(1)
      : '100.0';

  // Check machine status (based on the first hour or machine inspections)
  for (let m = 1; m <= TOTAL_MACHINES; m++) {
    const insp = data.machineInspections[m];
    const isStoppedInInspection = insp && Object.values(insp).includes('Stop');
    const firstHourRec = data.hourlyProduction[`${m}_0`];

    if (isStoppedInInspection || firstHourRec?.isStopped) {
      stoppedMachinesNow += 1;
    } else {
      runningMachinesNow += 1;
    }

    if (firstHourRec) {
      const prod = getProductById(firstHourRec.productId);
      machineStats[m].currentProduct = prod?.name || (firstHourRec.isStopped ? 'متوقفة' : 'غير محدد');
      machineStats[m].currentWeight = firstHourRec.actualWeight;
      const val = validateWeight(firstHourRec.productId, firstHourRec.actualWeight);
      machineStats[m].isWithinCurrent = val ? val.isWithin : true;
    }
  }

  // Damaged bags total
  const totalDamagedBags = data.damagedMaterials.reduce((acc, curr) => acc + (curr.damagedCount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-l from-[#1E3A8A] via-blue-900 to-indigo-900 text-white p-5 sm:p-6 shadow-md border border-blue-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400 text-blue-950">
                لوحة المراقبة اللحظية
              </span>
              <span className="text-xs text-blue-200">
                صالة تعبئة وتغليف السكر
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              أهلاً بك، {data.session.inspectorName}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
              متابعة مباشرة لـ 15 ماكينة تعبئة، قياسات الأوزان، فحص الطباعة والخياطة، وسماحيات المنتجات الـ 11 على مدار ساعات الوردية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('production')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>تسجيل فحص الساعة الحالية</span>
            </button>
            <button
              onClick={() => onNavigateTab('machines')}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4" />
              <span>فحص بداية الوردية</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Compliance Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              نسبة الالتزام بالسماحية
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900 dark:text-white">
              %{overallComplianceRate}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {inToleranceRecords} مطابق
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            من إجمالي {totalCheckedRecords} عينة وزن مسجلة
          </div>
        </div>

        {/* Open Defects */}
        <div
          onClick={onOpenNotifications}
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            openAlerts.length > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 hover:border-rose-400'
              : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              الإخطارات المفتوحة
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              openAlerts.length > 0
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono-numbers ${
              openAlerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {openAlerts.length}
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              إخطار يتطلب حل
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>إجمالي الإخطارات: {allNotificationsCount}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold underline">عرض</span>
          </div>
        </div>

        {/* Machines Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              حالة الـ 15 ماكينة
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900 dark:text-white">
              {runningMachinesNow}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              تعمل / {TOTAL_MACHINES}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
              <StopCircle className="w-3 h-3" />
              {stoppedMachinesNow} متوقفة
            </span>
          </div>
        </div>

        {/* Damaged Materials */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              أكياس التعبئة التالفة
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900 dark:text-white">
              {totalDamagedBags}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              كيس تالف
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            عبر {data.damagedMaterials.length} تقارير توالف مسجلة
          </div>
        </div>
      </div>

      {/* Grid of the 15 Machines Status */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>مصفوفة حالة ماكينات التعبئة (1 إلى 15)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              انقر على أي ماكينة للانتقال مباشرة إلى سجل فحصها الساعي وتعديل القياسات
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('production')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>فتح جدول الساعات الشامل</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: TOTAL_MACHINES }, (_, i) => i + 1).map((mId) => {
            const insp = data.machineInspections[mId];
            const hasStop = insp && Object.values(insp).includes('Stop');
            const hasNotOk = insp && Object.values(insp).includes('Not OK');
            const stats = machineStats[mId];
            const machineComp = stats.total > 0 ? Math.round((stats.inTolerance / stats.total) * 100) : 100;

            return (
              <button
                key={mId}
                onClick={() => onNavigateTab('production', mId)}
                className={`p-3.5 rounded-xl border text-right transition-all hover:shadow-md active:scale-98 flex flex-col justify-between ${
                  hasStop
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                    : hasNotOk
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-black">
                        {mId}
                      </span>
                      <span>ماكينة {mId}</span>
                    </span>

                    {hasStop ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                        توقف
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        جاهزة
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 font-bold truncate">
                    {stats.currentProduct || 'سكر السعيد'}
                  </div>

                  {stats.currentWeight !== null && stats.currentWeight !== undefined && (
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">آخر وزن:</span>
                      <span className={`font-mono-numbers font-bold ${
                        stats.isWithinCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {stats.currentWeight} كجم
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>مطابقة الوردية:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 font-mono-numbers">
                    %{machineComp}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Sections Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Machine Startup Card */}
        <div
          onClick={() => onNavigateTab('machines')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">
              فحص الماكينات (بداية الوردية)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              فحص بنود الماكينة الـ 6 (الرأس، السطح، السير، الخياطة، الطابعة، السير الخارجي) مع خاصية التعبئة التلقائية عند التوقف.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>فحص الـ 15 ماكينة</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </div>
        </div>

        {/* Cleanliness Card */}
        <div
          onClick={() => onNavigateTab('cleanliness')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">
              نظافة الصالة وحافظات الوزن
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              تقييم نظافة صالة التعبئة دورياً كل 3 ساعات، وفحص حالة وعزل حافظات وأوزان المعايرة.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>سجل النظافة (كل 3 ساعات)</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </div>
        </div>

        {/* Scales & Packaging Materials Card */}
        <div
          onClick={() => onNavigateTab('scales')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">
              معايرة الموازين ومواد التعبئة التالفة
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              توثيق انحرافات الموازين المعايرة بدقة متناهية، ومتابعة عيوب الأكياس التالفة بحسب المصنع.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>سجل الموازين والتوالف</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};
