import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Scale,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ScaleVerificationRecord, ShiftQCData } from '../../types';

interface ScalesTabProps {
  data: ShiftQCData;
  onAddScaleVerification: (record: ScaleVerificationRecord) => void;
  onDeleteScaleVerification: (id: string) => void;
}

export const ScalesTab: React.FC<ScalesTabProps> = ({
  data,
  onAddScaleVerification,
  onDeleteScaleVerification,
}) => {
  const [scaleNumber, setScaleNumber] = useState('ميزان خط 1 (رأس 1)');
  const [calibratedMass, setCalibratedMass] = useState<number>(50.000);
  const [measuredMass, setMeasuredMass] = useState<number>(50.001);
  const [notes, setNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Live deviation calculation
  const liveDeviation = Number((measuredMass - calibratedMass).toFixed(3));
  // Auto suggestion for status: within ±0.005 kg (±5g) is typically OK for industrial 50kg, or ±1g for small weights
  const isAutoOk = Math.abs(liveDeviation) <= 0.005;
  const [customStatus, setCustomStatus] = useState<'OK' | 'Not OK'>('OK');

  const handleAddVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const deviation = Number((measuredMass - calibratedMass).toFixed(3));

    const newRecord: ScaleVerificationRecord = {
      id: `scale-${Date.now()}`,
      scaleNumber,
      calibratedMassKg: calibratedMass,
      measuredMassKg: measuredMass,
      deviationKg: deviation,
      status: customStatus,
      notes: notes.trim(),
      verifiedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddScaleVerification(newRecord);
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              جدول التحقق اليومي ومعايرة موازين التعبئة
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300">
              كتل قياسية فئة F1 / M1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            التحقق من دقة موازين خطوط الإنتاج والموازين الرقابية باستخدام أوزان معايرة معتمدة وحساب مقدار الانحراف اللحظي.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل تحقق ميزان جديد</span>
        </button>
      </div>

      {/* Add New Scale Verification Form */}
      {showAddModal && (
        <form
          onSubmit={handleAddVerification}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-600 shadow-lg space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>تسجيل قراءة معايرة لميزان تعبئة</span>
            </h3>
            <span className="text-xs text-slate-400">حساب الانحراف التلقائي</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Scale Number */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الميزان / الخط *
              </label>
              <input
                type="text"
                list="scales-list"
                required
                value={scaleNumber}
                onChange={(e) => setScaleNumber(e.target.value)}
                placeholder="ميزان خط 1..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              />
              <datalist id="scales-list">
                {Array.from({ length: 15 }, (_, i) => `ميزان ماكينة ${i + 1}`).map((s) => (
                  <option key={s} value={s} />
                ))}
                <option value="ميزان تحكم المعمل الرقمي" />
                <option value="ميزان التفتيش الميداني 1" />
                <option value="ميزان الشاحنات الأرضي (قبان)" />
              </datalist>
            </div>

            {/* Calibrated Standard Weight */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوزن المعاير (الكتلة القياسية كجم) *
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={calibratedMass}
                onChange={(e) => setCalibratedMass(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black font-mono-numbers"
              />
            </div>

            {/* Measured Mass */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الكتلة المقاسة (قراءة الميزان كجم) *
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={measuredMass}
                onChange={(e) => setMeasuredMass(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black font-mono-numbers"
              />
            </div>

            {/* Deviation (Auto Calculated) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مقدار الانحراف (محسوب)
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono-numbers font-black text-xs text-blue-700 dark:text-blue-300">
                {liveDeviation > 0 ? `+${liveDeviation.toFixed(3)}` : liveDeviation.toFixed(3)} كجم ({Math.round(liveDeviation * 1000)} جم)
              </div>
            </div>

            {/* Status OK / Not OK */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الحالة المعتمدة *
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCustomStatus('OK')}
                  className={`py-1 text-xs font-black rounded-lg transition ${
                    customStatus === 'OK'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setCustomStatus('Not OK')}
                  className={`py-1 text-xs font-black rounded-lg transition ${
                    customStatus === 'Not OK'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Not OK
                </button>
              </div>
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات التحقق الفني (شهادة المعايرة / تاريخ التصفير)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم التصفير والمعايرة بواسطة وزنة 50 كجم فئة F1"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-amber-300" />
              <span>إدراج بسجل الموازين</span>
            </button>
          </div>
        </form>
      )}

      {/* Scales Verification Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1E3A8A] text-white">
              <tr>
                <th className="py-3 px-4 font-black">#</th>
                <th className="py-3 px-4 font-black">رقم الميزان / الخط</th>
                <th className="py-3 px-4 font-black text-center">الوزن المعاير (القياسي)</th>
                <th className="py-3 px-4 font-black text-center">الكتلة المقاسة (القرائية)</th>
                <th className="py-3 px-4 font-black text-center">مقدار الانحراف</th>
                <th className="py-3 px-4 font-black text-center">الحالة</th>
                <th className="py-3 px-4 font-black">ملاحظات التحقق</th>
                <th className="py-3 px-4 font-black text-center">التوقيت</th>
                <th className="py-3 px-4 font-black text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {data.scaleVerifications.map((item, index) => {
                const isPositive = item.deviationKg > 0;
                const isZero = item.deviationKg === 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="py-3 px-4 font-black text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{item.scaleNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono-numbers font-bold text-slate-700 dark:text-slate-300">
                      {item.calibratedMassKg.toFixed(3)} كجم
                    </td>
                    <td className="py-3 px-4 text-center font-mono-numbers font-extrabold text-slate-900 dark:text-white">
                      {item.measuredMassKg.toFixed(3)} كجم
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono-numbers font-black px-2.5 py-1 rounded-full text-xs ${
                          isZero
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : Math.abs(item.deviationKg) <= 0.005
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isPositive ? `+${item.deviationKg.toFixed(3)}` : item.deviationKg.toFixed(3)} كجم ({Math.round(item.deviationKg * 1000)} جم)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-black px-2.5 py-1 rounded-full text-xs ${
                          item.status === 'OK'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                      {item.verifiedAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteScaleVerification(item.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="حذف القيد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {data.scaleVerifications.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                    لم يتم تسجيل موازين في هذا السجل بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
