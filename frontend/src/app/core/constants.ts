// Centralized configuration + Arabic copy so a second language can be added later.

export const CURRENCY = 'EGP';
export const TOKEN_KEY = 'token';
export const USER_KEY = 'household_user';
export const PAGE_SIZE = 20;

export const MONTHS_AR: readonly string[] = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const LABELS = {
  appName: 'مدير مصروفات المنزل',
  dashboard: 'لوحة التحكم',
  transactions: 'المعاملات',
  categories: 'الفئات',
  budgets: 'الموازنات',
  settings: 'الإعدادات',
  login: 'تسجيل الدخول',
  loggingIn: 'جارٍ تسجيل الدخول...',
  logout: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  currentPassword: 'كلمة المرور الحالية',
  newPassword: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور',
  changePassword: 'تغيير كلمة المرور',
  save: 'حفظ',
  saveChanges: 'حفظ التغييرات',
  cancel: 'إلغاء',
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  confirm: 'تأكيد',
  close: 'إغلاق',
  loading: 'جارٍ التحميل...',
  loadMore: 'تحميل المزيد',
  noData: 'لا توجد بيانات لعرضها',
  month: 'الشهر',
  year: 'السنة',
  allMonths: 'كل الأشهر',
  all: 'الكل',
  type: 'النوع',
  expense: 'مصروف',
  expenses: 'المصروفات',
  income: 'إيراد',
  category: 'الفئة',
  paidBy: 'من قام بالدفع',
  note: 'ملاحظة',
  amount: 'المبلغ',
  date: 'التاريخ',
  name: 'الاسم',
  icon: 'الأيقونة',
  noteSearch: 'بحث في الملاحظات',
  totalIncome: 'إجمالي الإيرادات',
  totalExpenses: 'إجمالي المصروفات',
  balance: 'الرصيد',
  expensesByCategory: 'المصروفات حسب الفئة',
  dailyExpenses: 'المصروفات اليومية',
  topCategories: 'أعلى 5 فئات',
  lastTransactions: 'آخر 5 معاملات',
  budgetProgress: 'نسبة الالتزام بالموازنة',
  totalBudget: 'الموازنة الشهرية الإجمالية',
  spentBy: 'من أنفق الأكثر',
  spent: 'المنفق',
  newTransaction: 'معاملة جديدة',
  editTransaction: 'تعديل المعاملة',
  exportCsv: 'تصدير CSV',
  addCategory: 'إضافة فئة',
  editCategory: 'تعديل الفئة',
  monthlyBudget: 'الموازنة الشهرية',
  perCategoryBudget: 'موازنة لكل فئة',
  prevMonth: 'الشهر السابق',
  nextMonth: 'الشهر التالي',
  profile: 'البيانات الشخصية',
  welcome: 'مرحبًا',
  deleteConfirm: 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.',
} as const;

export const MESSAGES = {
  required: 'هذا الحقل مطلوب',
  invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  minPassword: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  passwordMismatch: 'كلمتا المرور غير متطابقتين',
  positiveAmount: 'المبلغ يجب أن يكون أكبر من صفر',
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  loginFailed: 'فشل تسجيل الدخول، يرجى التحقق من البريد وكلمة المرور',
  loadError: 'تعذر تحميل البيانات، يرجى المحاولة مرة أخرى',
  saveSuccess: 'تم الحفظ بنجاح',
  deleteSuccess: 'تم الحذف بنجاح',
  deleteFailed: 'تعذر الحذف، يرجى المحاولة مرة أخرى',
  passwordChanged: 'تم تغيير كلمة المرور بنجاح',
  categoryInUse: 'لا يمكن حذف هذه الفئة لأنها مستخدمة في معاملات أو موازنات',
  unauthorized: 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى',
  networkError: 'تعذر الاتصال بالخادم، يرجى التحقق من الإنترنت',
  genericError: 'حدث خطأ، يرجى المحاولة مرة أخرى',
  noEditData: 'تعذر تحميل بيانات المعاملة، يرجى العودة إلى القائمة',
  exportEmpty: 'لا توجد معاملات لتصديرها',
  enterBudget: 'يرجى إدخال قيمة موازنة واحدة على الأقل',
} as const;

/** Local date in yyyy-mm-dd format (avoids UTC shifting from toISOString). */
export function todayString(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
