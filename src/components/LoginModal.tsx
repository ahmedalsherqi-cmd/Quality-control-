import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Factory, ShieldCheck, Sun, Moon } from 'lucide-react';
import { SHIFT_CONFIG } from '../data/constants';
import { InspectorSession, ShiftType } from '../types';

interface LoginModalProps {
  currentSession?: InspectorSession | null;
  onLogin: (session: InspectorSession, isNewShift: boolean) => void;
  canCancel?: boolean;
  onCancel?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentSession,
  onLogin,
  canCancel = false,
  onCancel,
}) => {
  const [inspectorName, setInspectorName] = useState(currentSession?.inspectorName || 'م. أحمد الشافعي');
  const [shift, setShift] = useState<ShiftType>(currentSession?.shift || 'A');
  const [date, setDate] = useState(
    currentSession?.date || new Date().toISOString().split('T')[0]
  );
  const [startNewData, setStartNewData] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim()) {
      setError('يرجى إدخال اسم مراقب الجودة');
      return;
    }

    const session: InspectorSession = {
      inspectorName: inspectorName.trim(),
      shift,
      date,
      startedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    onLogin(session, startNewData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right transition-colors animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-amber-300">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">صالة تعبئة السكر</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-blue-950">
                  إدارة توكيد الجودة
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                تسجيل دخول مراقب الجودة وتحديد الوردية التشغيلية (24 ساعة)
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Inspector Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم مراقب الجودة (الاسم الرباعي أو الوظيفي) *
            </label>
            <input
              type="text"
              required
              value={inspectorName}
              onChange={(e) => {
                setInspectorName(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: أحمد عبد الله - مراقب جودة التعبئة"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              تحديد الوردية التشغيلية النشطة *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Shift A */}
              <button
                type="button"
                onClick={() => setShift('A')}
                className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  shift === 'A'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>الوردية A (الصباحية)</span>
                  </div>
                  {shift === 'A' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="text-xs text-blue-900 dark:text-blue-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>08:00 ص – 08:00 م</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  12 ساعة (من 8 صباحاً إلى 8 مساءً)
                </p>
              </button>

              {/* Shift B */}
              <button
                type="button"
                onClick={() => setShift('B')}
                className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col justify-between ${
                  shift === 'B'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>الوردية B (الليلية)</span>
                  </div>
                  {shift === 'B' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="text-xs text-indigo-900 dark:text-indigo-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>08:00 م – 08:00 ص</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  12 ساعة (من 8 مساءً إلى 8 صباحاً)
                </p>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تاريخ التشغيل والوردية *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Optional: Start Fresh Shift Data */}
          {currentSession && (
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={startNewData}
                onChange={(e) => setStartNewData(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                بدء سجل وردية جديد تماماً وتفريغ الساعات القديمة
              </span>
            </label>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white font-black text-sm shadow-md hover:shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>بدء تسجيل الجودة والإنتاج</span>
            </button>
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
