import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Info,
  Layers,
  ListFilter,
  Pause,
  Play,
  Printer,
  Scissors,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { FIXED_PRODUCTS, SHIFT_CONFIG, TOTAL_MACHINES } from '../../data/constants';
import { getProductById, validateWeight } from '../../services/storage';
import {
  DefectNotification,
  HourlyProductionRecord,
  ProductTolerance,
  ShiftQCData,
} from '../../types';

interface ProductionHourlyTabProps {
  data: ShiftQCData;
  onUpdateRecord: (record: HourlyProductionRecord) => void;
  onAddDefectNotification: (notif: DefectNotification) => void;
  onUpdateDefectNotification: (notif: DefectNotification) => void;
  preselectedMachineId?: number | null;
}

export const ProductionHourlyTab: React.FC<ProductionHourlyTabProps> = ({
  data,
  onUpdateRecord,
  onAddDefectNotification,
  onUpdateDefectNotification,
  preselectedMachineId,
}) => {
  const shiftInfo = SHIFT_CONFIG[data.session.shift];
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'BY_HOUR' | 'BY_MACHINE'>('BY_HOUR');
  const [selectedMachineId, setSelectedMachineId] = useState<number>(preselectedMachineId || 1);
  const [filterStopped, setFilterStopped] = useState<boolean>(false);

  // Trigger automatic defect notification for weight deviation
  const handleWeightChange = (
    rec: HourlyProductionRecord,
    newWeightStr: string,
    prodId: string
  ) => {
    const valNumber = newWeightStr === '' ? null : parseFloat(newWeightStr);
    const updated: HourlyProductionRecord = {
      ...rec,
      actualWeight: valNumber,
      productId: prodId,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateRecord(updated);

    // Auto notification check
    if (valNumber !== null && !isNaN(valNumber) && prodId && !rec.isStopped) {
      const validation = validateWeight(prodId, valNumber);
      if (validation && !validation.isWithin && validation.defectType) {
        const notifId = `notif-wt-${rec.machineId}-${rec.hourIndex}`;
        const existing = data.defectNotifications.find((d) => d.id === notifId);

        const newNotif: DefectNotification = {
          id: notifId,
          machineId: rec.machineId,
          hourLabel: rec.hourLabel,
          productId: prodId,
          productName: validation.productName,
          defectType: validation.defectType,
          deviation: validation.deviationKg,
          nominalOrTolerance: `${validation.minTolerance} – ${validation.maxTolerance} كجم`,
          actualValue: `${valNumber.toFixed(3)} كجم (${validation.deviationKg > 0 ? '+' : ''}${Math.round(validation.deviationKg * 1000)} جم)`,
          createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: existing ? existing.status : 'مفتوح',
          fixTime: existing?.fixTime || '',
          correctiveAction: existing?.correctiveAction || 'فحص وضبط معيار رأس التعبئة بالميزان',
        };

        if (existing) {
          onUpdateDefectNotification(newNotif);
        } else {
          onAddDefectNotification(newNotif);
        }
      }
    }
  };

  // Toggle printing status & create alert if Not OK
  const handlePrintingChange = (rec: HourlyProductionRecord, status: 'OK' | 'Not OK') => {
    const updated: HourlyProductionRecord = {
      ...rec,
      printingStatus: status,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateRecord(updated);

    if (status === 'Not OK') {
      const prod = getProductById(rec.productId);
      const notifId = `notif-prt-${rec.machineId}-${rec.hourIndex}`;
      const existing = data.defectNotifications.find((d) => d.id === notifId);

      const notif: DefectNotification = {
        id: notifId,
        machineId: rec.machineId,
        hourLabel: rec.hourLabel,
        productId: rec.productId,
        productName: prod?.name || 'غير محدد',
        defectType: 'خلل في الطباعة',
        deviation: null,
        nominalOrTolerance: 'بيانات وتاريخ مقروء وواضح بالكامل',
        actualValue: 'طباعة غير واضحة أو مقطوعة أو مشوهة',
        createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        status: existing ? existing.status : 'مفتوح',
        correctiveAction: 'تنظيف كاترينج الطابعة وضبط رأس الطباعة الحبري',
      };
      if (existing) {
        onUpdateDefectNotification(notif);
      } else {
        onAddDefectNotification(notif);
      }
    }
  };

  // Toggle sewing status & create alert if Not OK
  const handleSewingChange = (rec: HourlyProductionRecord, status: 'OK' | 'Not OK') => {
    const updated: HourlyProductionRecord = {
      ...rec,
      sewingStatus: status,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateRecord(updated);

    if (status === 'Not OK') {
      const prod = getProductById(rec.productId);
      const notifId = `notif-sew-${rec.machineId}-${rec.hourIndex}`;
      const existing = data.defectNotifications.find((d) => d.id === notifId);

      const notif: DefectNotification = {
        id: notifId,
        machineId: rec.machineId,
        hourLabel: rec.hourLabel,
        productId: rec.productId,
        productName: prod?.name || 'غير محدد',
        defectType: 'خلل في الخياطة',
        deviation: null,
        nominalOrTolerance: 'خياطة محكمة ومستقيمة بدون تسريب أو ارتخاء',
        actualValue: 'غرز مفكوكة أو خيط مقطوع أو تسريب سكر',
        createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        status: existing ? existing.status : 'مفتوح',
        correctiveAction: 'تغيير إبرة ماكينة الخياطة وضبط شداد الخيط',
      };
      if (existing) {
        onUpdateDefectNotification(notif);
      } else {
        onAddDefectNotification(notif);
      }
    }
  };

  // Toggle machine stopped / running
  const handleToggleStopped = (rec: HourlyProductionRecord) => {
    const nextStopped = !rec.isStopped;
    const updated: HourlyProductionRecord = {
      ...rec,
      isStopped: nextStopped,
      actualWeight: nextStopped ? null : rec.actualWeight,
      printingStatus: nextStopped ? '' : rec.printingStatus,
      sewingStatus: nextStopped ? '' : rec.sewingStatus,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateRecord(updated);
  };

  // Fast replicate product & batch to other active machines for the current hour
  const handleReplicateProduct = (sourceRec: HourlyProductionRecord) => {
    if (!sourceRec.productId) return;
    for (let m = 1; m <= TOTAL_MACHINES; m++) {
      if (m === sourceRec.machineId) continue;
      const key = `${m}_${sourceRec.hourIndex}`;
      const targetRec = data.hourlyProduction[key];
      if (targetRec && !targetRec.isStopped) {
        onUpdateRecord({
          ...targetRec,
          productId: sourceRec.productId,
          batchNumber: sourceRec.batchNumber || targetRec.batchNumber,
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Controller Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                سجل الإنتاج والتفتيش الساعي (12 ساعة)
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300">
                15 ماكينة تعبئة
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              فحص دوري كل ساعة: التحقق اللحظي من سماحية الوزن، فحص الطباعة، والخياطة مع إنشاء إخطارات تلقائية فورية
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('BY_HOUR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'BY_HOUR'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>عرض بالساعة (جميع الماكينات)</span>
              </button>
              <button
                onClick={() => setViewMode('BY_MACHINE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'BY_MACHINE'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>عرض بماكينة محددة (12 ساعة)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hour Selector Carousel / Tabs */}
        {viewMode === 'BY_HOUR' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>اختر ساعة التفتيش (ساعات الوردية الـ 12):</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                الساعة المحددة: {shiftInfo.hours[selectedHourIndex]}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {shiftInfo.hours.map((hour, idx) => {
                const isSelected = selectedHourIndex === idx;

                // Check how many machines in this hour are filled
                let filled = 0;
                let hasAlert = false;
                for (let m = 1; m <= TOTAL_MACHINES; m++) {
                  const rec = data.hourlyProduction[`${m}_${idx}`];
                  if (rec && (rec.actualWeight !== null || rec.isStopped)) {
                    filled += 1;
                  }
                  if (rec && rec.actualWeight !== null && !rec.isStopped) {
                    const v = validateWeight(rec.productId, rec.actualWeight);
                    if (v && !v.isWithin) hasAlert = true;
                  }
                  if (rec && (rec.printingStatus === 'Not OK' || rec.sewingStatus === 'Not OK')) {
                    hasAlert = true;
                  }
                }

                return (
                  <button
                    key={hour}
                    onClick={() => setSelectedHourIndex(idx)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30 font-black'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold">{hour.split(' - ')[0]}</div>
                    <div className={`text-[10px] mt-0.5 font-bold ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      س{idx + 1} ({filled}/15)
                    </div>

                    {hasAlert && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Machine Selector if view mode is BY_MACHINE */}
        {viewMode === 'BY_MACHINE' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>اختر الماكينة لعرض سجلها الكامل (12 ساعة):</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                ماكينة رقم {selectedMachineId}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: TOTAL_MACHINES }, (_, i) => i + 1).map((mId) => (
                <button
                  key={mId}
                  onClick={() => setSelectedMachineId(mId)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition shrink-0 ${
                    selectedMachineId === mId
                      ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ماكينة {mId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main List of Production Cards / Rows */}
      {viewMode === 'BY_HOUR' ? (
        // SHOW ALL 15 MACHINES FOR THE SELECTED HOUR
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              ماكينات التعبئة (1 إلى 15) في الفترة: <strong className="text-blue-600 dark:text-blue-400">{shiftInfo.hours[selectedHourIndex]}</strong>
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filterStopped}
                onChange={(e) => setFilterStopped(e.target.checked)}
                className="rounded text-blue-600 w-3.5 h-3.5"
              />
              <span>إخفاء الماكينات المتوقفة</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: TOTAL_MACHINES }, (_, i) => i + 1)
              .filter((mId) => {
                if (!filterStopped) return true;
                const rec = data.hourlyProduction[`${mId}_${selectedHourIndex}`];
                return !rec?.isStopped;
              })
              .map((mId) => {
                const key = `${mId}_${selectedHourIndex}`;
                const rec =
                  data.hourlyProduction[key] || {
                    id: key,
                    machineId: mId,
                    hourLabel: shiftInfo.hours[selectedHourIndex],
                    hourIndex: selectedHourIndex,
                    isStopped: false,
                    productId: 'saeed-50kg',
                    batchNumber: `BATCH-24-${mId}`,
                    actualWeight: null,
                    printingStatus: '',
                    sewingStatus: '',
                    notes: '',
                    recordedAt: '',
                  };

                return (
                  <MachineHourRowCard
                    key={key}
                    record={rec}
                    onWeightChange={(val, prodId) => handleWeightChange(rec, val, prodId)}
                    onPrintingChange={(status) => handlePrintingChange(rec, status)}
                    onSewingChange={(status) => handleSewingChange(rec, status)}
                    onToggleStopped={() => handleToggleStopped(rec)}
                    onReplicateProduct={() => handleReplicateProduct(rec)}
                    onUpdateNotes={(notes) => onUpdateRecord({ ...rec, notes })}
                    onUpdateBatch={(batchNumber) => onUpdateRecord({ ...rec, batchNumber })}
                  />
                );
              })}
          </div>
        </div>
      ) : (
        // SHOW ALL 12 HOURS FOR THE SELECTED MACHINE
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              سجل ساعات ماكينة رقم <strong className="text-blue-600 dark:text-blue-400">{selectedMachineId}</strong> على مدار الوردية (12 ساعة)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {shiftInfo.hours.map((hourLabel, hIdx) => {
              const key = `${selectedMachineId}_${hIdx}`;
              const rec =
                data.hourlyProduction[key] || {
                  id: key,
                  machineId: selectedMachineId,
                  hourLabel,
                  hourIndex: hIdx,
                  isStopped: false,
                  productId: 'saeed-50kg',
                  batchNumber: `BATCH-24-${selectedMachineId}`,
                  actualWeight: null,
                  printingStatus: '',
                  sewingStatus: '',
                  notes: '',
                  recordedAt: '',
                };

              return (
                <MachineHourRowCard
                  key={key}
                  record={rec}
                  onWeightChange={(val, prodId) => handleWeightChange(rec, val, prodId)}
                  onPrintingChange={(status) => handlePrintingChange(rec, status)}
                  onSewingChange={(status) => handleSewingChange(rec, status)}
                  onToggleStopped={() => handleToggleStopped(rec)}
                  onReplicateProduct={() => handleReplicateProduct(rec)}
                  onUpdateNotes={(notes) => onUpdateRecord({ ...rec, notes })}
                  onUpdateBatch={(batchNumber) => onUpdateRecord({ ...rec, batchNumber })}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual machine-hour card
interface MachineHourRowCardProps {
  record: HourlyProductionRecord;
  onWeightChange: (weightStr: string, prodId: string) => void;
  onPrintingChange: (status: 'OK' | 'Not OK') => void;
  onSewingChange: (status: 'OK' | 'Not OK') => void;
  onToggleStopped: () => void;
  onReplicateProduct: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateBatch: (batch: string) => void;
}

const MachineHourRowCard: React.FC<MachineHourRowCardProps> = ({
  record,
  onWeightChange,
  onPrintingChange,
  onSewingChange,
  onToggleStopped,
  onReplicateProduct,
  onUpdateNotes,
  onUpdateBatch,
}) => {
  const product = getProductById(record.productId);
  const validation = validateWeight(record.productId, record.actualWeight);

  const isOutOfTolerance = validation ? !validation.isWithin : false;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all shadow-sm ${
        record.isStopped
          ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-80'
          : isOutOfTolerance
          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-900 ring-1 ring-rose-400/50'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-800 hover:border-blue-300'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Machine & Hour Tag */}
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                record.isStopped
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : isOutOfTolerance
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#1E3A8A] text-white'
              }`}
            >
              {record.machineId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  ماكينة رقم {record.machineId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  {record.hourLabel}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                {record.recordedAt ? (
                  <span>تم التسجيل: {record.recordedAt}</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">بانتظار التفتيش</span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Stopped Button */}
          <button
            type="button"
            onClick={onToggleStopped}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
              record.isStopped
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
            }`}
          >
            {record.isStopped ? (
              <>
                <StopCircle className="w-3.5 h-3.5" />
                <span>الماكينة متوقفة</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                <span>تعمل (إيقاف؟)</span>
              </>
            )}
          </button>
        </div>

        {/* Operational Inputs If Running */}
        {!record.isStopped ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
            
            {/* 1. Product Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  نوع المنتج *
                </label>
                <button
                  type="button"
                  onClick={onReplicateProduct}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  title="نسخ نفس المنتج لكافة الماكينات في هذه الساعة"
                >
                  <Copy className="w-2.5 h-2.5" />
                  <span>تطبيق للبقية</span>
                </button>
              </div>
              <select
                value={record.productId}
                onChange={(e) => onWeightChange(record.actualWeight !== null ? String(record.actualWeight) : '', e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">-- اختر المنتج --</option>
                {FIXED_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.minTolerance} - {p.maxTolerance})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Batch Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الدفعة (إلزامي) *
              </label>
              <input
                type="text"
                required
                value={record.batchNumber}
                onChange={(e) => onUpdateBatch(e.target.value)}
                placeholder="رقم التشغيلة / الدفعة"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* 3. Actual Weight Input with Real-time Tolerance Check */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  الوزن الفعلي (كجم) *
                </label>
                {product && (
                  <span className="text-[10px] font-mono-numbers text-slate-500 dark:text-slate-400">
                    [{product.minTolerance} – {product.maxTolerance}]
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={record.actualWeight !== null ? record.actualWeight : ''}
                  onChange={(e) => onWeightChange(e.target.value, record.productId)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono-numbers font-black text-sm focus:outline-none transition-all ${
                    isOutOfTolerance
                      ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-600 text-rose-700 dark:text-rose-200 ring-2 ring-rose-500/40 animate-pulse'
                      : validation?.isWithin
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                />
              </div>

              {/* Instant Tolerance Evaluation Indicator */}
              {validation && (
                <div className="mt-1 text-[10px] font-bold">
                  {validation.isWithin ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      مطابق للسماحية
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {validation.defectType} ({validation.deviationKg > 0 ? '+' : ''}{Math.round(validation.deviationKg * 1000)} جم)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 4. Printing & Sewing Checks (OK / Not OK segmented buttons) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>فحص الطباعة & الخياطة</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                
                {/* Printing */}
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">الطباعة:</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => onPrintingChange('OK')}
                      className={`py-1 text-[11px] font-black rounded-md transition ${
                        record.printingStatus === 'OK'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintingChange('Not OK')}
                      className={`py-1 text-[11px] font-black rounded-md transition ${
                        record.printingStatus === 'Not OK'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      Not
                    </button>
                  </div>
                </div>

                {/* Sewing */}
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">الخياطة:</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => onSewingChange('OK')}
                      className={`py-1 text-[11px] font-black rounded-md transition ${
                        record.sewingStatus === 'OK'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => onSewingChange('Not OK')}
                      className={`py-1 text-[11px] font-black rounded-md transition ${
                        record.sewingStatus === 'Not OK'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      Not
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 p-3 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold">
              <StopCircle className="w-4 h-4" />
              الماكينة في حالة توقف تشغيلي خلال هذه الساعة
            </span>
            <input
              type="text"
              placeholder="سبب التوقف (صيانة، نفاذ أكياس، عطل)..."
              value={record.notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs w-64"
            />
          </div>
        )}

      </div>
    </div>
  );
};
