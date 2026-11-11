import React, { useState } from 'react';
import { BookOpen, CheckCircle, Scale, Search, X } from 'lucide-react';
import { FIXED_PRODUCTS } from '../data/constants';

interface TolerancesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TolerancesModal: React.FC<TolerancesModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedWeightFilter, setSelectedWeightFilter] = useState<number | 'ALL'>('ALL');

  if (!isOpen) return null;

  const filtered = FIXED_PRODUCTS.filter((prod) => {
    const matchesSearch =
      prod.name.includes(search) || prod.bagType.includes(search);
    const matchesWeight =
      selectedWeightFilter === 'ALL' || prod.nominalWeightKg === selectedWeightFilter;
    return matchesSearch && matchesWeight;
  });

  const weightCategories = [5, 5.5, 10, 10.5, 25, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1E3A8A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  جدول المنتجات وسماحيات الوزن المعتمدة
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-blue-950">
                  11 منتجاً معتمداً
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                المرجع الفني الثابت لضبط الموازين وتفتيش خطوط التعبئة بصالة الإنتاج
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث باسم المنتج أو نوع العبوة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-9 pl-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedWeightFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedWeightFilter === 'ALL'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                الكل (11)
              </button>
              {weightCategories.map((wt) => (
                <button
                  key={wt}
                  onClick={() => setSelectedWeightFilter(wt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    selectedWeightFilter === wt
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {wt} كجم
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table / Cards */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((prod, index) => {
              const diffGramsMin = Math.round((prod.minTolerance - prod.nominalWeightKg) * 1000);
              const diffGramsMax = Math.round((prod.maxTolerance - prod.nominalWeightKg) * 1000);

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {prod.name}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        نوع التعبئة: {prod.bagType}
                      </span>
                    </div>

                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {prod.nominalWeightKg} كجم اسمي
                    </span>
                  </div>

                  {/* Tolerance Bar */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-600 dark:text-slate-400">
                        نطاق السماحية المقبول:
                      </span>
                      <span className="font-mono-numbers font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {prod.minTolerance.toFixed(3)} – {prod.maxTolerance.toFixed(3)} كجم
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>
                        السماحية بالجرام فوق الاسمي:
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-300 font-mono-numbers">
                        +{diffGramsMin} إلى +{diffGramsMax} جم
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              لم يتم العثور على منتجات مطابقة للبحث
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>معتمد ومطابق للمواصفات القياسية للجودة وصناعة السكر</span>
          </div>
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
