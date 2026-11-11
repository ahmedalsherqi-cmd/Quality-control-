import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  FastForward,
  Layers,
  Printer,
  Scissors,
  Settings,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { MACHINE_CHECK_ITEMS, TOTAL_MACHINES } from '../../data/constants';
import { MachineCheckStatus, MachineStartInspection, ShiftQCData } from '../../types';

interface MachineInspectionTabProps {
  data: ShiftQCData;
  onUpdateMachineInspection: (inspection: MachineStartInspection) => void;
  inspectorName: string;
}

export const MachineInspectionTab: React.FC<MachineInspectionTabProps> = ({
  data,
  onUpdateMachineInspection,
  inspectorName,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'READY' | 'STOPPED'>('ALL');
  const [lastAutoStoppedMachine, setLastAutoStoppedMachine] = useState<number | null>(null);

  // Automation rule: when 'Stop' is chosen for any item, all remaining items are automatically set to 'Stop'!
  const handleItemStatusChange = (
    currentInspection: MachineStartInspection,
    itemKey: 'head' | 'surface' | 'belt' | 'sewing' | 'printer' | 'conveyor',
    newStatus: MachineCheckStatus
  ) => {
    const updated = { ...currentInspection };
    const itemKeys: Array<'head' | 'surface' | 'belt' | 'sewing' | 'printer' | 'conveyor'> = [
      'head',
      'surface',
      'belt',
      'sewing',
      'printer',
      'conveyor',
    ];

    const itemIndex = itemKeys.indexOf(itemKey);

    if (newStatus === 'Stop') {
      // Set this item and ALL remaining items to 'Stop'
      for (let i = itemIndex; i < itemKeys.length; i++) {
        updated[itemKeys[i]] = 'Stop';
      }
      setLastAutoStoppedMachine(currentInspection.machineId);
      setTimeout(() => setLastAutoStoppedMachine(null), 4000);
    } else {
      updated[itemKey] = newStatus;
    }

    updated.inspectedAt = new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updated.inspectorName = inspectorName;

    onUpdateMachineInspection(updated);
  };

  // Quick mark all 6 items as OK for a specific machine
  const handleMarkAllOk = (machineId: number) => {
    const insp = data.machineInspections[machineId];
    const updated: MachineStartInspection = {
      machineId,
      head: 'OK',
      surface: 'OK',
      belt: 'OK',
      sewing: 'OK',
      printer: 'OK',
      conveyor: 'OK',
      notes: insp?.notes || '',
      inspectorName,
      inspectedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateMachineInspection(updated);
  };

  // Quick mark all remaining uninspected machines as OK
  const handleApproveAllCleanMachines = () => {
    for (let m = 1; m <= TOTAL_MACHINES; m++) {
      const insp = data.machineInspections[m];
      const isStopped = insp && Object.values(insp).includes('Stop');
      if (!isStopped) {
        handleMarkAllOk(m);
      }
    }
  };

  const getStatusBadge = (insp: MachineStartInspection) => {
    const values = [insp.head, insp.surface, insp.belt, insp.sewing, insp.printer, insp.conveyor];
    if (values.includes('Stop')) {
      return (
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-600 text-white flex items-center gap-1">
          <StopCircle className="w-3.5 h-3.5" />
          توقف الماكينة
        </span>
      );
    }
    if (values.includes('Not OK')) {
      return (
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          بها ملاحظات
        </span>
      );
    }
    return (
      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        جاهزة للتشغيل
      </span>
    );
  };

  const getItemIcon = (key: string) => {
    switch (key) {
      case 'head':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'surface':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'belt':
        return <FastForward className="w-4 h-4 text-cyan-500" />;
      case 'sewing':
        return <Scissors className="w-4 h-4 text-purple-500" />;
      case 'printer':
        return <Printer className="w-4 h-4 text-amber-500" />;
      case 'conveyor':
        return <ArrowRight className="w-4 h-4 text-emerald-500" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              قسم فحص الماكينات (مرة واحدة في بداية الوردية)
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300">
              15 ماكينة • 6 بنود فحص
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            البنود الستة: رأس الماكينة، سطح الماكينة، سير الماكينة، ماكينة الخياطة، طابعة البيانات، السير الخارجي.
            <strong className="text-blue-700 dark:text-blue-400 font-extrabold mr-1">
              (ميزة الأتمتة: اختيار حالة Stop لأي بند يعبئ باقي البنود تلقائياً بكلمة 'توقف').
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleApproveAllCleanMachines}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تعيين الكل OK للماكينات السليمة</span>
          </button>
        </div>
      </div>

      {/* Auto Stop Flash Banner */}
      {lastAutoStoppedMachine && (
        <div className="p-3.5 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            تطبيق قاعدة الأتمتة: تم تعبئة البنود المتبقية في ماكينة رقم {lastAutoStoppedMachine} تلقائياً بكلمة "توقف" (Stop).
          </span>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterMode === 'ALL'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          كافة الماكينات (15)
        </button>
        <button
          onClick={() => setFilterMode('READY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterMode === 'READY'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          الماكينات الجاهزة (OK)
        </button>
        <button
          onClick={() => setFilterMode('STOPPED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterMode === 'STOPPED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-800'
          }`}
        >
          الماكينات المتوقفة (Stop)
        </button>
      </div>

      {/* 15 Machines Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: TOTAL_MACHINES }, (_, i) => i + 1)
          .filter((mId) => {
            const insp = data.machineInspections[mId];
            const isStopped = insp && Object.values(insp).includes('Stop');
            if (filterMode === 'STOPPED') return isStopped;
            if (filterMode === 'READY') return !isStopped;
            return true;
          })
          .map((mId) => {
            const insp =
              data.machineInspections[mId] || {
                machineId: mId,
                head: 'OK',
                surface: 'OK',
                belt: 'OK',
                sewing: 'OK',
                printer: 'OK',
                conveyor: 'OK',
                notes: '',
                inspectorName,
                inspectedAt: '',
              };

            return (
              <div
                key={mId}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-sm">
                        {mId}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          ماكينة رقم {mId}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          فحص: {insp.inspectedAt || 'بداية الوردية'}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(insp)}
                  </div>

                  {/* 6 Inspection Items */}
                  <div className="mt-3 space-y-2">
                    {MACHINE_CHECK_ITEMS.map((item) => {
                      const currentVal = insp[item.key] as MachineCheckStatus;

                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/50"
                        >
                          <div className="flex items-center gap-2">
                            {getItemIcon(item.key)}
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {item.label}
                            </span>
                          </div>

                          {/* 3 State Toggle: OK / Not OK / Stop */}
                          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleItemStatusChange(insp, item.key, 'OK')}
                              className={`px-2 py-1 text-[11px] font-black rounded-md transition ${
                                currentVal === 'OK'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemStatusChange(insp, item.key, 'Not OK')}
                              className={`px-2 py-1 text-[11px] font-black rounded-md transition ${
                                currentVal === 'Not OK'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                              }`}
                            >
                              Not OK
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemStatusChange(insp, item.key, 'Stop')}
                              className={`px-2 py-1 text-[11px] font-black rounded-md transition ${
                                currentVal === 'Stop'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                              }`}
                              title="إيقاف الماكينة وتعبئة البنود المتبقية تلقائياً بكلمة توقف"
                            >
                              Stop
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes & Quick OK Button */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={insp.notes}
                    onChange={(e) =>
                      onUpdateMachineInspection({
                        ...insp,
                        notes: e.target.value,
                        inspectedAt: new Date().toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      })
                    }
                    placeholder="ملاحظات فنية أو تفاصيل العطل..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600"
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      المراقب: {insp.inspectorName || inspectorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMarkAllOk(mId)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>تعيين البنود كـ OK</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
