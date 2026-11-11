import * as XLSX from 'xlsx';
import { FIXED_PRODUCTS, SHIFT_CONFIG, TOTAL_MACHINES } from '../data/constants';
import {
  CleanlinessRecord,
  DamagedMaterialRecord,
  DefectNotification,
  HourlyProductionRecord,
  InspectorSession,
  MachineStartInspection,
  ProductTolerance,
  ScaleVerificationRecord,
  ShiftQCData,
  ShiftType,
} from '../types';

const STORAGE_KEY = 'sugar_packaging_qc_v1';

export function getProductById(id: string): ProductTolerance | undefined {
  return FIXED_PRODUCTS.find((p) => p.id === id);
}

export interface WeightCheckResult {
  isWithin: boolean;
  deviationKg: number;
  defectType: 'زيادة في الوزن' | 'نقص في الوزن' | null;
  message: string;
  minTolerance: number;
  maxTolerance: number;
  productName: string;
}

export function validateWeight(productId: string, actualWeight: number | null): WeightCheckResult | null {
  if (actualWeight === null || isNaN(actualWeight) || !productId) {
    return null;
  }
  const product = getProductById(productId);
  if (!product) return null;

  const min = product.minTolerance;
  const max = product.maxTolerance;

  if (actualWeight < min) {
    const diff = Number((actualWeight - min).toFixed(3));
    return {
      isWithin: false,
      deviationKg: diff,
      defectType: 'نقص في الوزن',
      message: `نقص في الوزن بمقدار ${Math.abs(diff * 1000).toFixed(0)} جم تحت الحد الأدنى (${min})`,
      minTolerance: min,
      maxTolerance: max,
      productName: product.name,
    };
  } else if (actualWeight > max) {
    const diff = Number((actualWeight - max).toFixed(3));
    return {
      isWithin: false,
      deviationKg: diff,
      defectType: 'زيادة في الوزن',
      message: `زيادة في الوزن بمقدار ${(diff * 1000).toFixed(0)} جم فوق الحد الأقصى (${max})`,
      minTolerance: min,
      maxTolerance: max,
      productName: product.name,
    };
  } else {
    return {
      isWithin: true,
      deviationKg: 0,
      defectType: null,
      message: 'الوزن مطابق للسماحية المعتمدة',
      minTolerance: min,
      maxTolerance: max,
      productName: product.name,
    };
  }
}

export function createInitialShiftData(session: InspectorSession): ShiftQCData {
  const shiftInfo = SHIFT_CONFIG[session.shift];

  // 15 machines initial inspections
  const machineInspections: Record<number, MachineStartInspection> = {};
  for (let m = 1; m <= TOTAL_MACHINES; m++) {
    // Seed some initial status
    machineInspections[m] = {
      machineId: m,
      head: 'OK',
      surface: 'OK',
      belt: 'OK',
      sewing: 'OK',
      printer: 'OK',
      conveyor: 'OK',
      notes: '',
      inspectorName: session.inspectorName,
      inspectedAt: session.startedAt,
    };
  }

  // Pre-seed hourly production records
  const hourlyProduction: Record<string, HourlyProductionRecord> = {};
  shiftInfo.hours.forEach((hourLabel, hIndex) => {
    for (let m = 1; m <= TOTAL_MACHINES; m++) {
      const key = `${m}_${hIndex}`;
      hourlyProduction[key] = {
        id: key,
        machineId: m,
        hourLabel,
        hourIndex: hIndex,
        isStopped: false,
        productId: m <= 6 ? 'saeed-50kg' : m <= 10 ? 'saeed-10kg' : 'saeed-5kg',
        batchNumber: `BATCH-24-${session.shift}${String(m).padStart(2, '0')}`,
        actualWeight: null,
        printingStatus: '',
        sewingStatus: '',
        notes: '',
        recordedAt: '',
      };
    }
  });

  // Pre-populate some initial realistic production records for the first 3 hours to demonstrate immediate usability
  const defectNotifications: DefectNotification[] = [];

  // Machine 1, Hour 0: In-spec 50kg
  hourlyProduction['1_0'].actualWeight = 50.120;
  hourlyProduction['1_0'].printingStatus = 'OK';
  hourlyProduction['1_0'].sewingStatus = 'OK';
  hourlyProduction['1_0'].recordedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  // Machine 2, Hour 0: Out-of-spec (50.170kg -> excess)
  hourlyProduction['2_0'].actualWeight = 50.170;
  hourlyProduction['2_0'].printingStatus = 'OK';
  hourlyProduction['2_0'].sewingStatus = 'OK';
  hourlyProduction['2_0'].recordedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  defectNotifications.push({
    id: 'defect-notif-seed-1',
    machineId: 2,
    hourLabel: shiftInfo.hours[0],
    productId: 'saeed-50kg',
    productName: 'سكر السعيد 50 كجم',
    defectType: 'زيادة في الوزن',
    deviation: 0.020,
    nominalOrTolerance: '50.090 – 50.150',
    actualValue: '50.170 كجم (+20 جم)',
    createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    status: 'مفتوح',
    correctiveAction: 'تم استدعاء فني الوزن لضبط عيار الميزان الإلكتروني للرأس',
  });

  // Machine 3, Hour 0: Printing defective
  hourlyProduction['3_0'].actualWeight = 50.115;
  hourlyProduction['3_0'].printingStatus = 'Not OK';
  hourlyProduction['3_0'].sewingStatus = 'OK';
  hourlyProduction['3_0'].recordedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  defectNotifications.push({
    id: 'defect-notif-seed-2',
    machineId: 3,
    hourLabel: shiftInfo.hours[0],
    productId: 'saeed-50kg',
    productName: 'سكر السعيد 50 كجم',
    defectType: 'خلل في الطباعة',
    deviation: null,
    nominalOrTolerance: 'تاريخ الإنتاج ورقم الدفعة مقروء وواضح',
    actualValue: 'حبر باهت وغير مقروء على كعب الشوال',
    createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    status: 'تم الإصلاح',
    fixTime: '15 دقيقة',
    correctiveAction: 'تنظيف رأس الطابعة وتعبئة كارتيدج الحبر الصناعي',
    resolvedBy: session.inspectorName,
  });

  // Machine 4: stopped
  hourlyProduction['4_0'].isStopped = true;
  hourlyProduction['4_0'].productId = '';

  // Cleanliness records
  const cleanlinessRecords: CleanlinessRecord[] = shiftInfo.cleanlinessIntervals.map((interval, idx) => ({
    id: `clean-${idx}`,
    intervalLabel: interval,
    hallCleanliness: idx === 0 ? 'OK' : 'OK',
    weightBoxesCleanliness: idx === 0 ? 'OK' : 'OK',
    notes: idx === 0 ? 'الصالة نظيفة والحاويات معقمة وجاهزة للتشغيل' : '',
    inspectorName: session.inspectorName,
    recordedAt: idx === 0 ? session.startedAt : '',
  }));

  // Damaged materials seed
  const damagedMaterials: DamagedMaterialRecord[] = [
    {
      id: 'dmg-1',
      productId: 'saeed-50kg',
      productName: 'سكر السعيد 50 كجم',
      manufacturer: 'شركة الأكياس الوطنية الحديثة',
      damagedCount: 14,
      defectReason: 'تمزق في نسيج الكيس عند الرفع',
      notes: 'تم عزل الكمية وإخطار مسؤولي التوريد',
      recordedAt: '09:30 ص',
    },
    {
      id: 'dmg-2',
      productId: 'saeed-10kg',
      productName: 'سكر السعيد 10 كجم',
      manufacturer: 'مصنع النيل للتغليف المتقدم',
      damagedCount: 6,
      defectReason: 'عدم وضوح طباعة الشعار والبيانات',
      notes: 'دفعة توريد رقم 882',
      recordedAt: '11:15 ص',
    },
  ];

  // Scale verifications seed (for 5 primary factory scales)
  const scaleVerifications: ScaleVerificationRecord[] = [
    {
      id: 'scale-1',
      scaleNumber: 'ميزان فحص خط 1 (رقم 1)',
      calibratedMassKg: 50.000,
      measuredMassKg: 50.001,
      deviationKg: 0.001,
      status: 'OK',
      notes: 'معايرة بداية الوردية بوزنة معيارية 50 كجم فئة F1',
      verifiedAt: '08:15 ص',
    },
    {
      id: 'scale-2',
      scaleNumber: 'ميزان فحص خط 2 (رقم 2)',
      calibratedMassKg: 50.000,
      measuredMassKg: 50.000,
      deviationKg: 0.000,
      status: 'OK',
      notes: 'مطابق تماماً بدون انحراف',
      verifiedAt: '08:20 ص',
    },
    {
      id: 'scale-3',
      scaleNumber: 'ميزان تحكم المعمل الرقمي',
      calibratedMassKg: 10.000,
      measuredMassKg: 10.002,
      deviationKg: 0.002,
      status: 'OK',
      notes: 'ضمن النطاق المسموح به للموازين الرقمية (±5 جم)',
      verifiedAt: '08:25 ص',
    },
  ];

  return {
    session,
    machineInspections,
    hourlyProduction,
    defectNotifications,
    cleanlinessRecords,
    damagedMaterials,
    scaleVerifications,
    lastUpdated: new Date().toISOString(),
  };
}

export function loadShiftQCData(): ShiftQCData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShiftQCData;
  } catch (err) {
    console.error('Error loading QC data from storage', err);
    return null;
  }
}

export function saveShiftQCData(data: ShiftQCData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving QC data to storage', err);
  }
}

export function clearShiftQCData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Export full shift workbook to Excel (.xlsx)
export function exportShiftToExcel(data: ShiftQCData): void {
  const wb = XLSX.utils.book_new();

  // 1. Hourly Production Sheet
  const productionRows: any[] = [];
  const shiftInfo = SHIFT_CONFIG[data.session.shift];

  Object.values(data.hourlyProduction)
    .sort((a, b) => a.hourIndex - b.hourIndex || a.machineId - b.machineId)
    .forEach((rec) => {
      const prod = getProductById(rec.productId);
      const val = validateWeight(rec.productId, rec.actualWeight);

      let weightStatusStr = 'غير مسجل';
      if (rec.isStopped) {
        weightStatusStr = 'الماكينة متوقفة';
      } else if (val) {
        weightStatusStr = val.isWithin ? 'مطابق للسماحية' : `${val.defectType} (${val.deviationKg > 0 ? '+' : ''}${val.deviationKg} كجم)`;
      }

      productionRows.push({
        'رقم الماكينة': `ماكينة ${rec.machineId}`,
        'فترة الساعة': rec.hourLabel,
        'حالة التشغيل': rec.isStopped ? 'متوقفة' : 'تعمل',
        'المنتج': rec.isStopped ? '-' : (prod?.name || rec.productId || '-'),
        'رقم الدفعة': rec.batchNumber || '-',
        'الوزن الفعلي (كجم)': rec.actualWeight !== null ? rec.actualWeight : '-',
        'الحد الأدنى للسماحية': prod?.minTolerance || '-',
        'الحد الأقصى للسماحية': prod?.maxTolerance || '-',
        'تقييم الوزن': weightStatusStr,
        'فحص الطباعة': rec.isStopped ? '-' : (rec.printingStatus || 'لم يفحص'),
        'فحص الخياطة': rec.isStopped ? '-' : (rec.sewingStatus || 'لم يفحص'),
        'ملاحظات': rec.notes || '-',
        'وقت التسجيل': rec.recordedAt || '-',
      });
    });

  const wsProd = XLSX.utils.json_to_sheet(productionRows);
  XLSX.utils.book_append_sheet(wb, wsProd, 'سجل الإنتاج والأوزان');

  // 2. Machine Startup Inspections Sheet
  const machineRows = Object.values(data.machineInspections)
    .sort((a, b) => a.machineId - b.machineId)
    .map((m) => ({
      'رقم الماكينة': `ماكينة ${m.machineId}`,
      'رأس الماكينة': m.head,
      'سطح الماكينة': m.surface,
      'سير الماكينة': m.belt,
      'ماكينة الخياطة': m.sewing,
      'طابعة البيانات': m.printer,
      'السير الخارجي': m.conveyor,
      'ملاحظات': m.notes || '-',
      'المراقب': m.inspectorName,
      'وقت الفحص': m.inspectedAt,
    }));
  const wsMachines = XLSX.utils.json_to_sheet(machineRows);
  XLSX.utils.book_append_sheet(wb, wsMachines, 'فحص الماكينات بالوردية');

  // 3. Defect Notifications Sheet
  const defectRows = data.defectNotifications.map((d) => ({
    'رقم الإخطار': d.id,
    'الماكينة': `ماكينة ${d.machineId}`,
    'الساعة': d.hourLabel,
    'المنتج': d.productName,
    'نوع الخلل': d.defectType,
    'الانحراف': d.deviation !== null ? `${d.deviation > 0 ? '+' : ''}${d.deviation} كجم` : '-',
    'النطاق المقبول': d.nominalOrTolerance,
    'القيمة المسجلة': d.actualValue,
    'حالة الإخطار': d.status,
    'وقت الإصلاح': d.fixTime || '-',
    'الإجراء التصحيحي': d.correctiveAction || '-',
    'تم الحل بواسطة': d.resolvedBy || '-',
    'توقيت التسجيل': d.createdAt,
  }));
  const wsDefects = XLSX.utils.json_to_sheet(defectRows);
  XLSX.utils.book_append_sheet(wb, wsDefects, 'إخطارات الجودة والعيوب');

  // 4. Cleanliness Sheet
  const cleanlinessRows = data.cleanlinessRecords.map((c) => ({
    'الفترة': c.intervalLabel,
    'نظافة صالة التعبئة': c.hallCleanliness,
    'نظافة وحالة حافظات الوزن': c.weightBoxesCleanliness,
    'ملاحظات': c.notes || '-',
    'المراقب': c.inspectorName,
    'وقت التسجيل': c.recordedAt || '-',
  }));
  const wsClean = XLSX.utils.json_to_sheet(cleanlinessRows);
  XLSX.utils.book_append_sheet(wb, wsClean, 'سجل النظافة');

  // 5. Damaged Materials Sheet
  const damagedRows = data.damagedMaterials.map((dm) => ({
    'المنتج': dm.productName,
    'الشركة المصنعة': dm.manufacturer,
    'عدد الأكياس التالفة': dm.damagedCount,
    'نوع العيب': dm.defectReason,
    'ملاحظات': dm.notes || '-',
    'توقيت التسجيل': dm.recordedAt,
  }));
  const wsDamaged = XLSX.utils.json_to_sheet(damagedRows);
  XLSX.utils.book_append_sheet(wb, wsDamaged, 'مواد التعبئة التالفة');

  // 6. Scales Calibration Sheet
  const scalesRows = data.scaleVerifications.map((s) => ({
    'الميزان': s.scaleNumber,
    'الكتلة المعايرة (كجم)': s.calibratedMassKg,
    'الكتلة المقاسة (كجم)': s.measuredMassKg,
    'الانحراف (كجم)': `${s.deviationKg > 0 ? '+' : ''}${s.deviationKg}`,
    'الحالة': s.status,
    'ملاحظات': s.notes || '-',
    'وقت التحقق': s.verifiedAt,
  }));
  const wsScales = XLSX.utils.json_to_sheet(scalesRows);
  XLSX.utils.book_append_sheet(wb, wsScales, 'معايرة الموازين');

  // Export file
  const fileName = `تقرير_جودة_السكر_${data.session.shift}_${data.session.date}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
