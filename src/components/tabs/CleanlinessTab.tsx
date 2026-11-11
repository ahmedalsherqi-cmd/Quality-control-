import React, { useState } from 'react';
import {
  Box,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { SHIFT_CONFIG } from '../../data/constants';
import { CleanlinessRecord, ShiftQCData } from '../../types';

interface CleanlinessTabProps {
  data: ShiftQCData;
  onUpdateCleanlinessRecord: (record: CleanlinessRecord) => void;
  onAddCleanlinessRecord: (record: CleanlinessRecord) => void;
  inspectorName: string;
}

export const CleanlinessTab: React.FC<CleanlinessTabProps> = ({
  data,
  onUpdateCleanlinessRecord,
  onAddCleanlinessRecord,
  inspectorName,
}) => {
  const shiftInfo = SHIFT_CONFIG[data.session.shift];
  const [customTime, setCustomTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddNewInterval = () => {
    if (!customTime.trim()) return;
    const newRec: CleanlinessRecord = {
      id: `clean-custom-${Date.now()}`,
      intervalLabel: customTime.trim(),
      hallCleanliness: 'OK',
      weightBoxesCleanliness: 'OK',
      notes: '',
      inspectorName,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onAddCleanlinessRecord(newRec);
    setCustomTime('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              سجل النظافة الدورية وحافظات الوزن
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              تقييم كل 3 ساعات
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            مراقبة نظافة صالة التعبئة والسيور دورياً، والتأكد من نظافة وحماية كتل المعايرة وحافظات الوزن وفقاً لاشتراطات سلامة الغذاء (GMP / HACCP).
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تفتيش نظافة إضافي</span>
        </button>
      </div>

      {/* Add Custom Interval Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-wrap items-center gap-3 animate-in fade-in">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-blue-950 dark:text-blue-200 mb-1">
              وقت أو فترة التفتيش الاستثنائي:
            </label>
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="مثال: الساعة 10:30 (تفتيش مفاجئ عقب تنظيف)"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
          <div className="flex items-end gap-2 pt-5">
            <button
              onClick={handleAddNewInterval}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              حفظ الفترة
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Cleanliness Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.cleanlinessRecords.map((rec, index) => {
          const isHallOk = rec.hallCleanliness === 'OK';
          const isBoxesOk = rec.weightBoxesCleanliness === 'OK';

          return (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>فترة التفتيش: {rec.intervalLabel}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      التسجيل: {rec.recordedAt || 'بانتظار التقييم'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isHallOk && isBoxesOk ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      مستوفي الاشتراطات
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      يوجد ملاحظات نظافة
                    </span>
                  )}
                </div>
              </div>

              {/* Two Mandatory Cleanliness Checks */}
              <div className="space-y-3">
                
                {/* 1. Packaging Hall Cleanliness */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        نظافة صالة التعبئة والسيور (كل 3 ساعات)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        خلو الأرضيات والسيور من انسكاب السكر والغبار
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCleanlinessRecord({
                          ...rec,
                          hallCleanliness: 'OK',
                          recordedAt: new Date().toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })
                      }
                      className={`px-3 py-1 text-xs font-black rounded-md transition ${
                        isHallOk
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCleanlinessRecord({
                          ...rec,
                          hallCleanliness: 'Not OK',
                          recordedAt: new Date().toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })
                      }
                      className={`px-3 py-1 text-xs font-black rounded-md transition ${
                        !isHallOk
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      Not OK
                    </button>
                  </div>
                </div>

                {/* 2. Weight Boxes & Scale Standards Cleanliness */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        نظافة وحالة حافظات الوزن والوزنات
                      </span>
                      <span className="text-[10px] text-slate-400">
                        نظافة صناديق المعايرة وسلامة الكتل القياسية من التآكل
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCleanlinessRecord({
                          ...rec,
                          weightBoxesCleanliness: 'OK',
                          recordedAt: new Date().toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })
                      }
                      className={`px-3 py-1 text-xs font-black rounded-md transition ${
                        isBoxesOk
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCleanlinessRecord({
                          ...rec,
                          weightBoxesCleanliness: 'Not OK',
                          recordedAt: new Date().toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })
                      }
                      className={`px-3 py-1 text-xs font-black rounded-md transition ${
                        !isBoxesOk
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      Not OK
                    </button>
                  </div>
                </div>

              </div>

              {/* Notes & Inspector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <input
                  type="text"
                  value={rec.notes}
                  onChange={(e) =>
                    onUpdateCleanlinessRecord({
                      ...rec,
                      notes: e.target.value,
                      recordedAt: new Date().toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    })
                  }
                  placeholder="ملاحظات النظافة أو توجيهات لفريق عمال النظافة..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-600"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    المراقب: {rec.inspectorName || inspectorName}
                  </span>
                  <span>معتمد في التقرير الرسمي</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
