import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyViewProps {
    onClose: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onClose }) => {
    // Current date for the "last updated" text
    const today = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-[#FDFBF7] dark:bg-[#0B0C10] overflow-y-auto flex flex-col font-sans"
            dir="rtl"
        >
            <div className="max-w-md mx-auto w-full flex flex-col flex-1 pb-safe">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-[#FDFBF7]/90 dark:bg-[#0B0C10]/90 backdrop-blur-md border-b-2 border-[#D4AF37]/20 dark:border-[#D4AF37]/30 px-4 py-4 flex items-center justify-between">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors"
                        aria-label="العودة"
                    >
                        <ChevronRight strokeWidth={2.5} size={24} />
                    </button>
                    
                    <h1 className="text-lg font-semibold text-[#1e1b4b] dark:text-[#E2E8F0]">سياسة الخصوصية</h1>
                    
                    {/* Invisible div for balancing the centered title */}
                    <div className="w-10"></div>
                </header>

                <div className="px-6 py-8">
                    {/* Last Updated */}
                    <p className="text-sm text-[#1e1b4b]/60 dark:text-[#E2E8F0]/60 mb-8 text-center">
                        آخر تحديث: {today}
                    </p>

                    <div className="space-y-10">
                        {/* Section 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                مقدمة
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2">
                                نحن نحترم خصوصيتك ونلتزم بحمايتها. صُمم هذا التطبيق ليكون مساحة آمنة لتأملاتك، 
                                ولذلك نعتمد على تخزين بياناتك الشخصية محلياً قدر الإمكان.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                البيانات التي نجمعها
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2 mb-3">
                                تُحفظ تأملاتك وإدخالات يومياتك على جهازك الشخصي فقط، ولا يتم إرسالها إلى خوادمنا. أنت تمتلك بياناتك بالكامل.
                            </p>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base">
                                لغرض تحسين التطبيق، قد نقوم بجمع إحصائيات استخدام مجهولة الهوية مثل الميزات الأكثر استخداماً أو أوقات الاستخدام.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                كيف نستخدم البيانات
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2">
                                نستخدم البيانات التحليلية المجهولة حصرياً لفهم كيفية تفاعل المستخدمين مع التطبيق، 
                                مما يساعدنا في تحسين التجربة وتطوير ميزات تلبي تطلعاتك براحة وسلاسة.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                أطراف خارجية
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2">
                                قد نستعين بخدمات تحليلية مثل <span dir="ltr">PostHog Analytics</span> لجمع معلومات التفاعل غير الشخصية المذكورة أعلاه. 
                                هذه الخدمات تلتزم بسياسات خصوصية صارمة لحماية معلوماتك.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                حقوقك
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2">
                                لأن تدويناتك تُخزن على جهازك، يمكنك في أي وقت مسح بياناتك بالكامل واستعادتها لحالتها الأصلية 
                                ببساطة عن طريق حذف التطبيق أو مسح بياناته من إعدادات جهازك.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#1e1b4b] dark:text-[#FDFBF7] mb-3 pb-2 border-b-2 border-[#D4AF37]/40 inline-block">
                                تواصل معنا
                            </h2>
                            <p className="text-[#1e1b4b]/80 dark:text-[#E2E8F0]/80 leading-relaxed text-base pt-2">
                                إذا كان لديك أي استفسارات أو ملاحظات حول الخصوصية، نسعد بتواصلك معنا عبر:
                                <br />
                                <span className="font-bold inline-block mt-2 font-mono text-sm" dir="ltr">support@example.com</span>
                            </p>
                        </section>
                    </div>
                </div>

                {/* Comfortable bottom padding */}
                <div className="pb-24"></div>
            </div>
        </motion.div>
    );
};
