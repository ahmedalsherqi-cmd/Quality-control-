import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  PackageX,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  COMMON_BAG_MANUFACTURERS,
  COMMON_DEFECT_REASONS,
  FIXED_PRODUCTS,
} from '../../data/constants';
import { DamagedMaterialRecord, ShiftQCData } from '../../types';

interface DamagedMaterialsTabProps {
  data: ShiftQCData;
  onAddDamagedRecord: (record: DamagedMaterialRecord) => void;
  onDeleteDamagedRecord: (id: string) => void;
}

export const DamagedMaterialsTab: React.FC<DamagedMaterialsTabProps> = ({
  data,
  onAddDamagedRecord,
  onDeleteDamagedRecord,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(FIXED_PRODUCTS[0].id);
  const [manufacturer, setManufacturer] = useState(COMMON_BAG_MANUFACTURERS[0]);
  const [damagedCount, setDamagedCount] = useState<number>(10);
  const [defectReason, setDefectReason] = useState(COMMON_DEFECT_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = FIXED_PRODUCTS.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newRecord: DamagedMaterialRecord = {
      id: `dmg-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      manufacturer,
      damagedCount: Number(damagedCount) || 1,
      defectReason,
      notes: notes.trim(),
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddDamagedRecord(newRecord);
    setNotes('');
    setShowAddForm(false);
  };

  const totalDamaged = data.damagedMaterials.reduce(
    (sum, item) => sum + (item.damagedCount || 0),
    0
  );

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              سجل مواد التعبئة والتغليف التالفة
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              إجمالي التوالف: {totalDamaged} كيس
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            توثيق عيوب أكياس السكر بحسب نوع المنتج من المنتجات الـ 11 المعتمدة، الشركات الموردة، وأسباب التلف لمحاسبة الموردين وخفض الفاقد.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل دفعة أكياس تالفة</span>
        </button>
      </div>

      {/* Add New Damaged Record Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-600 shadow-lg space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PackageX className="w-4 h-4 text-rose-600" />
              <span>إدخال تقرير توالف جديد لأكياس التعبئة</span>
            </h3>
            <span className="text-xs text-slate-400">تاريخ الوردية الحالية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Product Bag Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع كيس المنتج (من المنتجات الـ 11) *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              >
                {FIXED_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.bagType})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Manufacturer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الشركة المصنعة / المورد *
              </label>
              <input
                type="text"
                list="manufacturers-list"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              />
              <datalist id="manufacturers-list">
                {COMMON_BAG_MANUFACTURERS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            {/* 3. Damaged Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                عدد الأكياس التالفة *
              </label>
              <input
                type="number"
                min="1"
                required
                value={damagedCount}
                onChange={(e) => setDamagedCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black font-mono-numbers"
              />
            </div>

            {/* 4. Defect Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع العيب / الخلل *
              </label>
              <input
                type="text"
                list="defects-list"
                value={defectReason}
                onChange={(e) => setDefectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              />
              <datalist id="defects-list">
                {COMMON_DEFECT_REASONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات إضافية (أرقام التشغيلات التالفة أو الإجراء المتخذ مع المورد)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم إرجاع الصندوق للمستودع وإبلاغ المشتريات لخصم القيمة"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج بسجل التوالف</span>
            </button>
          </div>
        </form>
      )}

      {/* Damaged Materials Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1E3A8A] text-white">
              <tr>
                <th className="py-3 px-4 font-black">#</th>
                <th className="py-3 px-4 font-black">نوع كيس المنتج (11 منتج)</th>
                <th className="py-3 px-4 font-black">الشركة المصنعة / المورد</th>
                <th className="py-3 px-4 font-black text-center">عدد الأكياس التالفة</th>
                <th className="py-3 px-4 font-black">نوع العيب</th>
                <th className="py-3 px-4 font-black">ملاحظات</th>
                <th className="py-3 px-4 font-black text-center">التوقيت</th>
                <th className="py-3 px-4 font-black text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {data.damagedMaterials.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                  <td className="py-3 px-4 font-black text-slate-400">{index + 1}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                    {item.productName}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{item.manufacturer}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono-numbers font-black px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
                      {item.damagedCount} كيس
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400">
                    {item.defectReason}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {item.notes || '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                    {item.recordedAt}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDeleteDamagedRecord(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="حذف السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {data.damagedMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    لا توجد أكياس تالفة مسجلة في هذه الوردية
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
