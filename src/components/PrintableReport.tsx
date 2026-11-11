import React from 'react';
import { CheckCircle, Clock, Factory, FileText, Printer, Scale, X } from 'lucide-react';
import { FIXED_PRODUCTS, SHIFT_CONFIG, TOTAL_MACHINES } from '../data/constants';
import { getProductById, validateWeight } from '../services/storage';
import { ShiftQCData } from '../types';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShiftQCData;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  const shiftInfo = SHIFT_CONFIG[data.session.shift];

  // Calculations
  let totalMeasurements = 0;
  let inToleranceCount = 0;
  Object.values(data.hourlyProduction).forEach((rec) => {
    if (!rec.isStopped && rec.actualWeight !== null) {
      totalMeasurements += 1;
      const v = validateWeight(rec.productId, rec.actualWeight);
      if (v?.isWithin) inToleranceCount += 1;
    }
  });

  const complianceRate =
    totalMeasurements > 0 ? ((inToleranceCount / totalMeasurements) * 100).toFixed(1) : '100.0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden text-right flex flex-col max-h-[95vh]">
        
        {/* Action bar (hidden on print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E3A8A]" />
            <span className="font-extrabold text-sm text-slate-800">
              معاينة التقرير الرسمي لوردية ضبط الجودة (جاهز للطباعة والحفظ كـ PDF)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-black bg-white">
          
          {/* Company / Factory Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-[#1E3A8A]">
                  شركة مصانع وتكرير السكر الوطنية
                </h1>
                <h2 className="text-sm font-bold text-slate-700">
                  قطاع الإنتاج والتشغيل — صالة التعبئة والتغليف (15 خط تعبئة)
                </h2>
                <h3 className="text-xs font-semibold text-slate-500">
                  إدارة توكيد وضبط الجودة النوعية (Quality Assurance & Control)
                </h3>
              </div>

              <div className="text-left space-y-0.5">
                <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-black">
                  نموذج رقم: QC-SGR-04-A
                </div>
                <div className="text-[11px] text-slate-600">
                  تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')} {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="mt-3 py-1.5 px-3 bg-[#1E3A8A] text-white text-center rounded text-sm font-black">
              تقرير الوردية الشامل لضبط جودة تعبئة السكر (24 ساعة)
            </div>
          </div>

          {/* Meta Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 font-bold block">مراقب الجودة المسئول:</span>
              <strong className="text-slate-900 text-sm">{data.session.inspectorName}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">الوردية التشغيلية:</span>
              <strong className="text-blue-900 text-sm">{shiftInfo.title} ({shiftInfo.timing})</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">تاريخ التشغيل:</span>
              <strong className="text-slate-900 text-sm">{data.session.date}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">نسبة المطابقة للسماحية:</span>
              <strong className="text-emerald-700 text-sm font-mono-numbers">%{complianceRate} ({inToleranceCount}/{totalMeasurements})</strong>
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] text-slate-500 font-bold block">إجمالي قياسات الوزن</span>
              <span className="text-lg font-black font-mono-numbers">{totalMeasurements} عينة</span>
            </div>
            <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] text-slate-500 font-bold block">إخطارات الجودة المفتوحة / المسجلة</span>
              <span className="text-lg font-black font-mono-numbers text-rose-700">
                {data.defectNotifications.filter(d => d.status === 'مفتوح').length} مفتوح / {data.defectNotifications.length} إجمالي
              </span>
            </div>
            <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] text-slate-500 font-bold block">أكياس التعبئة التالفة</span>
              <span className="text-lg font-black font-mono-numbers text-amber-700">
                {data.damagedMaterials.reduce((s, i) => s + (i.damagedCount || 0), 0)} كيس
              </span>
            </div>
          </div>

          {/* Section 1: Hourly Production & Weights Table */}
          <div className="space-y-2">
            <h4 className="font-black text-sm text-[#1E3A8A] flex items-center gap-1.5 border-b border-slate-300 pb-1">
              <span>1. سجل تفتيش الأوزان الساعي لماكينات التعبئة (عينة من القراءات النشطة)</span>
            </h4>
            
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-200 text-slate-900 border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 font-bold">الماكينة</th>
                    <th className="p-1.5 font-bold">الساعة</th>
                    <th className="p-1.5 font-bold">المنتج</th>
                    <th className="p-1.5 font-bold">رقم الدفعة</th>
                    <th className="p-1.5 font-bold text-center">الوزن الفعلي</th>
                    <th className="p-1.5 font-bold text-center">السماحية المقبولة</th>
                    <th className="p-1.5 font-bold text-center">الطباعة</th>
                    <th className="p-1.5 font-bold text-center">الخياطة</th>
                    <th className="p-1.5 font-bold text-center">تقييم الوزن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.values(data.hourlyProduction)
                    .filter((rec) => rec.actualWeight !== null || rec.isStopped)
                    .slice(0, 30)
                    .map((rec) => {
                      const prod = getProductById(rec.productId);
                      const val = validateWeight(rec.productId, rec.actualWeight);

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-1.5 font-bold">ماكينة {rec.machineId}</td>
                          <td className="p-1.5">{rec.hourLabel.split(' - ')[0]}</td>
                          <td className="p-1.5">{rec.isStopped ? 'متوقفة' : prod?.name || '-'}</td>
                          <td className="p-1.5 font-mono-numbers">{rec.isStopped ? '-' : rec.batchNumber}</td>
                          <td className="p-1.5 text-center font-mono-numbers font-black">
                            {rec.isStopped ? '-' : `${rec.actualWeight} كجم`}
                          </td>
                          <td className="p-1.5 text-center font-mono-numbers text-slate-600">
                            {prod ? `${prod.minTolerance} - ${prod.maxTolerance}` : '-'}
                          </td>
                          <td className="p-1.5 text-center">{rec.printingStatus || '-'}</td>
                          <td className="p-1.5 text-center">{rec.sewingStatus || '-'}</td>
                          <td className="p-1.5 text-center font-bold">
                            {rec.isStopped ? (
                              'متوقفة'
                            ) : val ? (
                              val.isWithin ? (
                                <span className="text-emerald-700">مطابق</span>
                              ) : (
                                <span className="text-rose-700 font-extrabold">{val.defectType}</span>
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Machine Startup Inspection Table */}
          <div className="space-y-2">
            <h4 className="font-black text-sm text-[#1E3A8A] flex items-center gap-1.5 border-b border-slate-300 pb-1">
              <span>2. تقرير فحص الماكينات الـ 15 في بداية الوردية</span>
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-200 text-slate-900 border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 font-bold">الماكينة</th>
                    <th className="p-1.5 font-bold text-center">رأس الماكينة</th>
                    <th className="p-1.5 font-bold text-center">سطح الماكينة</th>
                    <th className="p-1.5 font-bold text-center">سير الماكينة</th>
                    <th className="p-1.5 font-bold text-center">ماكينة الخياطة</th>
                    <th className="p-1.5 font-bold text-center">طابعة البيانات</th>
                    <th className="p-1.5 font-bold text-center">السير الخارجي</th>
                    <th className="p-1.5 font-bold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.values(data.machineInspections).map((m) => (
                    <tr key={m.machineId}>
                      <td className="p-1.5 font-bold">ماكينة {m.machineId}</td>
                      <td className="p-1.5 text-center">{m.head}</td>
                      <td className="p-1.5 text-center">{m.surface}</td>
                      <td className="p-1.5 text-center">{m.belt}</td>
                      <td className="p-1.5 text-center">{m.sewing}</td>
                      <td className="p-1.5 text-center">{m.printer}</td>
                      <td className="p-1.5 text-center">{m.conveyor}</td>
                      <td className="p-1.5 text-slate-600">{m.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Cleanliness & Defect Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Cleanliness */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-xs text-[#1E3A8A]">3. سجل النظافة الدورية (كل 3 ساعات)</h5>
              <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-right">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5">الفترة</th>
                      <th className="p-1.5 text-center">نظافة الصالة</th>
                      <th className="p-1.5 text-center">حافظات الوزن</th>
                      <th className="p-1.5">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.cleanlinessRecords.map((c) => (
                      <tr key={c.id}>
                        <td className="p-1.5 font-semibold">{c.intervalLabel}</td>
                        <td className="p-1.5 text-center font-bold">{c.hallCleanliness}</td>
                        <td className="p-1.5 text-center font-bold">{c.weightBoxesCleanliness}</td>
                        <td className="p-1.5 text-slate-500">{c.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scale Calibration */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-xs text-[#1E3A8A]">4. تحقق ومعايرة الموازين</h5>
              <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-right">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5">الميزان</th>
                      <th className="p-1.5 text-center">القياسي</th>
                      <th className="p-1.5 text-center">المقاس</th>
                      <th className="p-1.5 text-center">الانحراف</th>
                      <th className="p-1.5 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.scaleVerifications.map((s) => (
                      <tr key={s.id}>
                        <td className="p-1.5 font-semibold">{s.scaleNumber}</td>
                        <td className="p-1.5 text-center font-mono-numbers">{s.calibratedMassKg}</td>
                        <td className="p-1.5 text-center font-mono-numbers">{s.measuredMassKg}</td>
                        <td className="p-1.5 text-center font-mono-numbers font-bold">
                          {s.deviationKg > 0 ? `+${s.deviationKg}` : s.deviationKg} كجم
                        </td>
                        <td className="p-1.5 text-center font-bold">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Section 4: Defect Notifications Register */}
          {data.defectNotifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-black text-sm text-rose-800 border-b border-rose-300 pb-1">
                5. سجل إخطارات حيود الجودة والإجراءات التصحيحية المتخذة
              </h4>
              <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-right">
                  <thead className="bg-rose-50 text-rose-950 border-b border-rose-200">
                    <tr>
                      <th className="p-1.5 font-bold">الماكينة</th>
                      <th className="p-1.5 font-bold">التوقيت</th>
                      <th className="p-1.5 font-bold">المنتج</th>
                      <th className="p-1.5 font-bold">نوع الخلل</th>
                      <th className="p-1.5 font-bold">الانحراف / القيمة</th>
                      <th className="p-1.5 font-bold">وقت الإصلاح</th>
                      <th className="p-1.5 font-bold">الإجراء التصحيحي</th>
                      <th className="p-1.5 font-bold text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.defectNotifications.map((d) => (
                      <tr key={d.id}>
                        <td className="p-1.5 font-bold">ماكينة {d.machineId}</td>
                        <td className="p-1.5">{d.hourLabel}</td>
                        <td className="p-1.5">{d.productName}</td>
                        <td className="p-1.5 font-bold text-rose-700">{d.defectType}</td>
                        <td className="p-1.5 font-mono-numbers">{d.actualValue}</td>
                        <td className="p-1.5">{d.fixTime || '-'}</td>
                        <td className="p-1.5 text-slate-700">{d.correctiveAction || '-'}</td>
                        <td className="p-1.5 text-center font-bold">
                          {d.status === 'تم الإصلاح' ? (
                            <span className="text-emerald-700">تم الإصلاح</span>
                          ) : (
                            <span className="text-rose-700">مفتوح</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Signatures Block */}
          <div className="pt-8 border-t-2 border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <span className="font-extrabold text-slate-800 block">مراقب جودة الوردية (المُعِد)</span>
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="font-bold text-slate-900">{data.session.inspectorName}</span>
              </div>
              <span className="text-[10px] text-slate-500">التوقيع والتاريخ</span>
            </div>

            <div className="space-y-12">
              <span className="font-extrabold text-slate-800 block">مهندس تشغيل وردية التعبئة</span>
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="text-slate-400">....................................</span>
              </div>
              <span className="text-[10px] text-slate-500">التوقيع والاعتماد</span>
            </div>

            <div className="space-y-12">
              <span className="font-extrabold text-slate-800 block">مدير إدارة توكيد وضبط الجودة</span>
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="text-slate-400">....................................</span>
              </div>
              <span className="text-[10px] text-slate-500">الختم والاعتماد النهائي</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
