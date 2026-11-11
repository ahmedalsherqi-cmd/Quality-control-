import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Printer,
  Scissors,
  Wrench,
  X,
} from 'lucide-react';
import { DefectNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DefectNotification[];
  onUpdateNotification: (updated: DefectNotification) => void;
  onDeleteNotification?: (id: string) => void;
  inspectorName: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onUpdateNotification,
  onDeleteNotification,
  inspectorName,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'مفتوح' | 'تم الإصلاح'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fixTimeInput, setFixTimeInput] = useState('');
  const [actionInput, setActionInput] = useState('');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterStatus === 'ALL') return true;
    return n.status === filterStatus;
  });

  const openCount = notifications.filter((n) => n.status === 'مفتوح').length;
  const resolvedCount = notifications.filter((n) => n.status === 'تم الإصلاح').length;

  const startResolve = (notif: DefectNotification) => {
    setEditingId(notif.id);
    setFixTimeInput(notif.fixTime || '10 دقائق');
    setActionInput(
      notif.correctiveAction ||
        (notif.defectType.includes('وزن')
          ? 'تم استدعاء فني الصيانة وضبط معيار رأس التعبئة'
          : notif.defectType.includes('طباعة')
          ? 'تنظيف رأس الطابعة وتغذية خرطوشة الحبر'
          : 'ضبط شداد خيط الخياطة وتغيير الإبرة')
    );
  };

  const handleSaveResolution = (notif: DefectNotification) => {
    const updated: DefectNotification = {
      ...notif,
      status: 'تم الإصلاح',
      fixTime: fixTimeInput.trim() || 'فوري',
      correctiveAction: actionInput.trim() || 'تم الإصلاح والمتابعة التشغيلية',
      resolvedBy: inspectorName,
    };
    onUpdateNotification(updated);
    setEditingId(null);
  };

  const getDefectIcon = (type: string) => {
    if (type.includes('وزن')) return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (type.includes('طباعة')) return <Printer className="w-5 h-5 text-amber-500" />;
    if (type.includes('خياطة')) return <Scissors className="w-5 h-5 text-purple-500" />;
    return <Layers className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-rose-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  سجل إخطارات وانحرافات الجودة التلقائية
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-rose-800">
                  {openCount} مفتوح
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                إخطارات فورية لحيود الوزن ومشاكل الطباعة والخياطة تتطلب المتابعة والإصلاح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-rose-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              تصفية الحالة:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'ALL'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                الكل ({notifications.length})
              </button>
              <button
                onClick={() => setFilterStatus('مفتوح')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'مفتوح'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900/60'
                }`}
              >
                مفتوح ({openCount})
              </button>
              <button
                onClick={() => setFilterStatus('تم الإصلاح')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'تم الإصلاح'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                تم الإصلاح ({resolvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filtered.map((notif) => {
            const isEditing = editingId === notif.id;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.status === 'مفتوح'
                    ? 'border-rose-300 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left Info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 mt-0.5">
                      {getDefectIcon(notif.defectType)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          ماكينة رقم {notif.machineId}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 font-bold">
                          {notif.productName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          {notif.hourLabel} — {notif.createdAt}
                        </span>
                      </div>

                      <div className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-400 flex flex-wrap items-center gap-2">
                        <span>نوع الخلل: {notif.defectType}</span>
                        {notif.deviation !== null && (
                          <span className="font-mono-numbers px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
                            انحراف: {notif.deviation > 0 ? '+' : ''}{notif.deviation} كجم ({Math.round(notif.deviation * 1000)} جم)
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">القيمة المسجلة: </span>
                        <span className="font-mono-numbers font-bold text-slate-800 dark:text-slate-200">
                          {notif.actualValue}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="font-semibold">المواصفة المقبولة: </span>
                        <span className="font-mono-numbers text-slate-700 dark:text-slate-300">
                          {notif.nominalOrTolerance}
                        </span>
                      </div>

                      {/* Resolved details if already resolved */}
                      {notif.status === 'تم الإصلاح' && !isEditing && (
                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم الإصلاح والمعالجة</span>
                            {notif.fixTime && (
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                (وقت الإصلاح المستغرق: {notif.fixTime})
                              </span>
                            )}
                          </div>
                          {notif.correctiveAction && (
                            <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                              <span className="font-semibold">الإجراء التصحيحي: </span>
                              {notif.correctiveAction}
                            </p>
                          )}
                          {notif.resolvedBy && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                              بواسطة: {notif.resolvedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Status & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        notif.status === 'مفتوح'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                      }`}
                    >
                      {notif.status}
                    </span>

                    {notif.status === 'مفتوح' && !isEditing && (
                      <button
                        onClick={() => startResolve(notif)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-300" />
                        <span>تسجيل الإصلاح</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Resolution Form */}
                {isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4" />
                      <span>إدخال بيانات الإصلاح والإجراء التصحيحي:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          وقت الإصلاح المستغرق (بالدقائق أو التوقيت) *
                        </label>
                        <input
                          type="text"
                          value={fixTimeInput}
                          onChange={(e) => setFixTimeInput(e.target.value)}
                          placeholder="مثال: 12 دقيقة، أو الساعة 10:15"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          الإجراء التصحيحي المتخذ *
                        </label>
                        <input
                          type="text"
                          value={actionInput}
                          onChange={(e) => setActionInput(e.target.value)}
                          placeholder="مثال: إعادة ضبط عيار الميزان الإلكتروني"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveResolution(notif)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد الإصلاح وإغلاق الإخطار</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              لا توجد إخطارات مطابقة
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            يتم توثيق كافة الإخطارات تلقائياً في تقرير إكسيل وتقرير الوردية
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
