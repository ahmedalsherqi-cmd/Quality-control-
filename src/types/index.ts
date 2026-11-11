export type ShiftType = 'A' | 'B';

export interface ProductTolerance {
  id: string;
  name: string;
  nominalWeightKg: number;
  minTolerance: number;
  maxTolerance: number;
  unit: 'كجم';
  bagType: string;
}

export interface InspectorSession {
  inspectorName: string;
  shift: ShiftType;
  date: string; // YYYY-MM-DD
  startedAt: string;
}

export type MachineCheckStatus = 'OK' | 'Not OK' | 'Stop';

export interface MachineStartInspection {
  machineId: number; // 1 to 15
  head: MachineCheckStatus;      // رأس الماكينة
  surface: MachineCheckStatus;   // سطح الماكينة
  belt: MachineCheckStatus;      // سير الماكينة
  sewing: MachineCheckStatus;    // ماكينة الخياطة
  printer: MachineCheckStatus;   // طابعة البيانات
  conveyor: MachineCheckStatus;  // السير الخارجي
  notes: string;
  inspectorName: string;
  inspectedAt: string;
}

export interface HourlyProductionRecord {
  id: string;
  machineId: number; // 1 to 15
  hourLabel: string; // e.g. "08:00 - 09:00"
  hourIndex: number; // 0 to 11
  isStopped: boolean;
  productId: string; // product id or ''
  batchNumber: string;
  actualWeight: number | null; // in kg
  printingStatus: 'OK' | 'Not OK' | '';
  sewingStatus: 'OK' | 'Not OK' | '';
  notes: string;
  recordedAt: string;
}

export type DefectType = 'زيادة في الوزن' | 'نقص في الوزن' | 'خلل في الطباعة' | 'خلل في الخياطة' | 'عطل ماكينة' | 'أخرى';

export interface DefectNotification {
  id: string;
  machineId: number;
  hourLabel: string;
  productId: string;
  productName: string;
  defectType: DefectType;
  deviation: number | null; // in kg (e.g. +0.035 or -0.020)
  nominalOrTolerance: string;
  actualValue: string;
  createdAt: string;
  status: 'مفتوح' | 'تم الإصلاح';
  fixTime?: string;
  correctiveAction?: string;
  resolvedBy?: string;
}

export interface CleanlinessRecord {
  id: string;
  intervalLabel: string; // e.g. "09:00", "12:00", "15:00", "18:00"
  hallCleanliness: 'OK' | 'Not OK';
  weightBoxesCleanliness: 'OK' | 'Not OK';
  notes: string;
  inspectorName: string;
  recordedAt: string;
}

export interface DamagedMaterialRecord {
  id: string;
  productId: string;
  productName: string;
  manufacturer: string;
  damagedCount: number;
  defectReason: string; // e.g. تمزق قماش، عيب لحام، عدم وضوح طباعة
  notes: string;
  recordedAt: string;
}

export interface ScaleVerificationRecord {
  id: string;
  scaleNumber: string; // e.g. "ميزان رقم 1"
  calibratedMassKg: number; // الكتلة المعايرة القياسية (e.g. 50.000)
  measuredMassKg: number;   // الكتلة المقاسة
  deviationKg: number;      // الانحراف = المقاسة - المعايرة
  status: 'OK' | 'Not OK';
  notes: string;
  verifiedAt: string;
}

export interface ShiftQCData {
  session: InspectorSession;
  machineInspections: Record<number, MachineStartInspection>;
  hourlyProduction: Record<string, HourlyProductionRecord>; // key: `${machineId}_${hourIndex}`
  defectNotifications: DefectNotification[];
  cleanlinessRecords: CleanlinessRecord[];
  damagedMaterials: DamagedMaterialRecord[];
  scaleVerifications: ScaleVerificationRecord[];
  lastUpdated: string;
}
