import { ProductTolerance, ShiftType } from '../types';

export const FIXED_PRODUCTS: ProductTolerance[] = [
  {
    id: 'saeed-5kg',
    name: 'سكر السعيد 5 كجم',
    nominalWeightKg: 5.0,
    minTolerance: 5.019,
    maxTolerance: 5.045,
    unit: 'كجم',
    bagType: 'كيس ورقي / بلاستيك 5 كجم',
  },
  {
    id: 'saeed-5.5kg',
    name: 'سكر السعيد 5.5 كجم',
    nominalWeightKg: 5.5,
    minTolerance: 5.519,
    maxTolerance: 5.545,
    unit: 'كجم',
    bagType: 'كيس بلاستيك 5.5 كجم',
  },
  {
    id: 'saeed-10kg',
    name: 'سكر السعيد 10 كجم',
    nominalWeightKg: 10.0,
    minTolerance: 10.029,
    maxTolerance: 10.065,
    unit: 'كجم',
    bagType: 'شوال منسوج 10 كجم',
  },
  {
    id: 'saeed-10.5kg',
    name: 'سكر السعيد 10.5 كجم',
    nominalWeightKg: 10.5,
    minTolerance: 10.529,
    maxTolerance: 10.565,
    unit: 'كجم',
    bagType: 'شوال منسوج 10.5 كجم',
  },
  {
    id: 'saeed-25kg',
    name: 'سكر السعيد 25 كجم',
    nominalWeightKg: 25.0,
    minTolerance: 25.065,
    maxTolerance: 25.120,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 25 كجم',
  },
  {
    id: 'saeed-50kg',
    name: 'سكر السعيد 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
  {
    id: 'hana-50kg',
    name: 'سكر الهنا 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
  {
    id: 'arkan-50kg',
    name: 'سكر أركان 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
  {
    id: 'sami-50kg',
    name: 'سكر السامي 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
  {
    id: 'almas-50kg',
    name: 'سكر الماس 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
  {
    id: 'manaratain-50kg',
    name: 'سكر المنارتين 50 كجم',
    nominalWeightKg: 50.0,
    minTolerance: 50.090,
    maxTolerance: 50.150,
    unit: 'كجم',
    bagType: 'شوال بولي بروبلين 50 كجم',
  },
];

export const TOTAL_MACHINES = 15;
export const MACHINE_IDS = Array.from({ length: TOTAL_MACHINES }, (_, i) => i + 1);

export const MACHINE_CHECK_ITEMS: { key: 'head' | 'surface' | 'belt' | 'sewing' | 'printer' | 'conveyor'; label: string; icon: string }[] = [
  { key: 'head', label: 'رأس الماكينة', icon: 'Settings' },
  { key: 'surface', label: 'سطح الماكينة', icon: 'Layers' },
  { key: 'belt', label: 'سير الماكينة', icon: 'FastForward' },
  { key: 'sewing', label: 'ماكينة الخياطة', icon: 'Scissors' },
  { key: 'printer', label: 'طابعة البيانات', icon: 'Printer' },
  { key: 'conveyor', label: 'السير الخارجي', icon: 'ArrowRightCircle' },
];

export interface ShiftInfo {
  type: ShiftType;
  title: string;
  timing: string;
  description: string;
  hours: string[];
  cleanlinessIntervals: string[];
}

export const SHIFT_CONFIG: Record<ShiftType, ShiftInfo> = {
  A: {
    type: 'A',
    title: 'الوردية الصباحية (A)',
    timing: '08:00 ص – 08:00 م',
    description: 'من الساعة 08:00 صباحاً حتى الساعة 08:00 مساءً',
    hours: [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00',
      '19:00 - 20:00',
    ],
    cleanlinessIntervals: ['الساعة 09:00', 'الساعة 12:00', 'الساعة 15:00', 'الساعة 18:00'],
  },
  B: {
    type: 'B',
    title: 'الوردية الليلية (B)',
    timing: '08:00 م – 08:00 ص',
    description: 'من الساعة 08:00 مساءً حتى الساعة 08:00 صباحاً',
    hours: [
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00',
      '06:00 - 07:00',
      '07:00 - 08:00',
    ],
    cleanlinessIntervals: ['الساعة 21:00', 'الساعة 00:00', 'الساعة 03:00', 'الساعة 06:00'],
  },
};

export const COMMON_BAG_MANUFACTURERS = [
  'شركة الأكياس الوطنية الحديثة',
  'مصنع النيل للتغليف المتقدم',
  'الشركة المتحدة لمنتجات البولي بروبلين',
  'مصنع أكياس الدلتا الصناعي',
  'شركة الشرق الأوسط للمنسوجات والتعبئة',
];

export const COMMON_DEFECT_REASONS = [
  'تمزق في نسيج الكيس',
  'عيب لحام / عدم إحكام القاع',
  'عدم وضوح طباعة الشعار والبيانات',
  'انحراف في مقاسات وأبعاد الكيس',
  'تلف صمام التعبئة',
  'تنسيل في خيوط الحياكة',
  'وجود ثقوب أو تلوث ظاهري',
];
