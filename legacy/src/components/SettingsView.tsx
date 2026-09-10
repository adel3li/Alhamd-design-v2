import React, { useRef, useState, useEffect } from "react";
import { useStore } from "../StoreContext";
import { analytics, getConsent, setConsent, ConsentState } from "../services/analytics";
import { userBlessingsStore } from "../lib/userBlessingsStore";
import { haptics } from "../services/haptics";
import { notifications } from "../services/notifications";
import { storage } from "../services/storage";
import { Download, Upload } from "lucide-react";

interface SettingsViewProps {
    onOpenPrivacyPolicy?: () => void;
}

const getBucket = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
};

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenPrivacyPolicy }) => {
    const { state, updateSettings } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [consentState, setConsentState] = useState<ConsentState>('unset');

    useEffect(() => {
        getConsent().then(setConsentState);
    }, []);

    const handleExport = async () => {
        const userBlessingsJson = await userBlessingsStore.exportAll();
        const backup = {
            state,
            userBlessings: JSON.parse(userBlessingsJson || '[]'),
            version: 1,
            date: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `alhamd-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
        analytics.capture('backup_exported');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.state) {
                    await storage.setItem("alhamd_state", JSON.stringify(data.state));
                }
                if (data.userBlessings) {
                    await userBlessingsStore.importAll(JSON.stringify(data.userBlessings));
                }
                analytics.capture('backup_imported');
                alert('تم استعادة البيانات بنجاح.');
                if (data.state) {
                    window.location.reload(); // Quick way to rehydrate the entire app
                }
            } catch (err) {
                console.error("Failed to restore", err);
                alert('فشل استعادة البيانات. تأكد من الملف.');
                analytics.capture('backup_import_failed');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 min-h-full overflow-y-auto pb-24 flex flex-col max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold mb-10 pt-4 px-2">الإعدادات</h2>
            
            <div className="space-y-6">
                <div className="bg-brand-surface dark:bg-brand-dark-surface p-6 rounded-[2rem] shadow-sm border border-brand-textPrimary/5">
                    <h3 className="font-bold mb-6 text-brand-textSecondary dark:text-brand-dark-textSecondary text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        التخصيص
                    </h3>
                    
                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-brand-textPrimary/5">
                        <span className="font-medium text-sm">المظهر</span>
                        <div className="relative">
                            <select 
                                value={state.theme} 
                                onChange={(e) => {
                                    const newTheme = e.target.value as any;
                                    updateSettings({ theme: newTheme });
                                    analytics.capture('theme_changed', { theme: newTheme });
                                }}
                                className="appearance-none bg-brand-background dark:bg-brand-dark-background px-4 py-2 pr-8 rounded-xl text-brand-textPrimary dark:text-brand-dark-textPrimary text-sm font-medium border border-brand-textPrimary/10 focus:ring-2 focus:ring-brand-primary outline-none"
                                dir="ltr"
                            >
                                <option value="light">فاتح</option>
                                <option value="dark">داكن</option>
                                <option value="auto">تلقائي</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-brand-textPrimary/5">
                        <span className="font-medium text-sm">حجم الخط</span>
                        <div className="relative">
                            <select 
                                value={state.textSize} 
                                onChange={(e) => {
                                    const newSize = e.target.value as 'normal' | 'large';
                                    updateSettings({ textSize: newSize });
                                    analytics.capture('text_size_changed', { size: newSize });
                                }}
                                className="appearance-none bg-brand-background dark:bg-brand-dark-background px-4 py-2 pr-8 rounded-xl text-brand-textPrimary dark:text-brand-dark-textPrimary text-sm font-medium border border-brand-textPrimary/10 focus:ring-2 focus:ring-brand-primary outline-none"
                                dir="ltr"
                            >
                                <option value="normal">عادي</option>
                                <option value="large">كبير</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-brand-textPrimary/5 mb-5 pb-5">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">التنبيهات اليومية</span>
                            <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mt-1">تذكير يومي في الوقت المحدد</span>
                        </div>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!state.notificationsEnabled) {
                                    const granted = await notifications.requestPermission();
                                    if (granted) {
                                        analytics.capture('notification_permission_granted');
                                        updateSettings({ notificationsEnabled: true });
                                        const parts = state.notificationTime.split(':');
                                        await notifications.scheduleDaily({
                                            id: 1,
                                            title: 'الحمد',
                                            body: 'حان وقت التفكّر والحمد',
                                            hour: parseInt(parts[0]),
                                            minute: parseInt(parts[1])
                                        });
                                    } else {
                                        analytics.capture('notification_permission_denied');
                                        alert('يرجى تفعيل التنبيهات من إعدادات المتصفح/الجهاز.');
                                    }
                                } else {
                                    await notifications.cancel(1);
                                    updateSettings({ notificationsEnabled: false });
                                }
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${state.notificationsEnabled ? 'bg-brand-primary dark:bg-brand-dark-primary' : 'bg-brand-textPrimary/20 dark:bg-brand-dark-textPrimary/20'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${state.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-brand-textPrimary/5">
                        <span className="font-medium text-sm">وقت التذكير</span>
                        <input 
                            type="time" 
                            value={state.notificationTime}
                            onChange={async (e) => {
                                const newTime = e.target.value;
                                updateSettings({ notificationTime: newTime });
                                analytics.capture('reminder_set', { bucket: getBucket(newTime) });
                                
                                if (state.notificationsEnabled) {
                                    const parts = newTime.split(':');
                                    await notifications.scheduleDaily({
                                        id: 1,
                                        title: 'الحمد',
                                        body: 'حان وقت التفكّر والحمد',
                                        hour: parseInt(parts[0]),
                                        minute: parseInt(parts[1])
                                    });
                                }
                            }}
                            className="bg-brand-background dark:bg-brand-dark-background px-4 py-2 rounded-xl text-brand-textPrimary dark:text-brand-dark-textPrimary text-sm font-medium border border-brand-textPrimary/10 text-center outline-none focus:ring-2 focus:ring-brand-primary"
                            dir="ltr"
                        />
                    </div>

                    <div className="flex items-center justify-between border-b border-brand-textPrimary/5 mb-5 pb-5">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">التنبيهات اللمسية</span>
                            <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mt-1">اهتزاز خفيف للتذكير</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (!state.hapticReminders) {
                                    haptics.impact('light');
                                }
                                updateSettings({ hapticReminders: !state.hapticReminders });
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${state.hapticReminders ? 'bg-brand-primary dark:bg-brand-dark-primary' : 'bg-brand-textPrimary/20 dark:bg-brand-dark-textPrimary/20'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${state.hapticReminders ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col flex-1 pl-4">
                            <span className="font-medium text-sm">تحسين التطبيق (إحصائيات مجهولة)</span>
                            <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mt-1 leading-relaxed">لا نُرسل نصّ تدويناتك أبدًا — بيانات الاستخدام فقط، ويمكنك إيقافها.</span>
                        </div>
                        <button
                            type="button"
                            onClick={async () => {
                                const newConsent = consentState === 'granted' ? 'denied' : 'granted';
                                await setConsent(newConsent);
                                setConsentState(newConsent);
                                if (newConsent === 'granted') {
                                   analytics.capture('app_open');
                                }
                            }}
                            className={`w-12 h-6 flex-shrink-0 rounded-full transition-colors relative ${consentState === 'granted' ? 'bg-brand-primary dark:bg-brand-dark-primary' : 'bg-brand-textPrimary/20 dark:bg-brand-dark-textPrimary/20'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${consentState === 'granted' ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </div>

                <div className="bg-brand-surface dark:bg-brand-dark-surface p-6 rounded-[2rem] shadow-sm border border-brand-textPrimary/5">
                    <h3 className="font-bold mb-6 text-brand-textSecondary dark:text-brand-dark-textSecondary text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        البيانات والنسخ الاحتياطي
                    </h3>
                    <div className="space-y-5">
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-between w-full group hover:bg-brand-textPrimary/5 p-3 -mx-3 rounded-xl transition-colors"
                        >
                            <div className="flex flex-col items-start pl-4">
                                <span className="font-medium text-sm text-brand-textPrimary dark:text-brand-dark-textPrimary">احتفظ بنسخة من بياناتك</span>
                                <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mt-1">يُحفظ ملف على جهازك</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-brand-background dark:bg-brand-dark-background flex items-center justify-center text-brand-textSecondary group-hover:text-brand-primary transition-colors border border-brand-textPrimary/5">
                                <Download className="w-4 h-4" />
                            </div>
                        </button>
                        <hr className="border-brand-textPrimary/5" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-between w-full group hover:bg-brand-textPrimary/5 p-3 -mx-3 rounded-xl transition-colors"
                        >
                            <div className="flex flex-col items-start pl-4">
                                <span className="font-medium text-sm text-brand-textPrimary dark:text-brand-dark-textPrimary">استعادة البيانات</span>
                                <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mt-1">من ملف حفظته سابقاً</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-brand-background dark:bg-brand-dark-background flex items-center justify-center text-brand-textSecondary group-hover:text-brand-primary transition-colors border border-brand-textPrimary/5">
                                <Upload className="w-4 h-4" />
                            </div>
                        </button>
                        <input 
                            type="file" 
                            accept=".json"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImport}
                        />
                    </div>
                </div>

                <div className="bg-brand-surface dark:bg-brand-dark-surface p-6 rounded-[2rem] shadow-sm border border-brand-textPrimary/5">
                    <h3 className="font-bold mb-6 text-brand-textSecondary dark:text-brand-dark-textSecondary text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        عن التطبيق
                    </h3>
                    <div className="space-y-5">
                        <button className="flex items-center justify-between w-full group hover:bg-brand-textPrimary/5 p-3 -mx-3 rounded-xl transition-colors">
                            <span className="font-medium text-sm">شارك التطبيق</span>
                            <div className="w-8 h-8 rounded-full bg-brand-background dark:bg-brand-dark-background flex items-center justify-center text-brand-textSecondary group-hover:text-brand-primary transition-colors border border-brand-textPrimary/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                            </div>
                        </button>
                        <hr className="border-brand-textPrimary/5" />
                        <button 
                            onClick={onOpenPrivacyPolicy}
                            className="flex items-center justify-between w-full group hover:bg-brand-textPrimary/5 p-3 -mx-3 rounded-xl transition-colors"
                        >
                            <span className="font-medium text-sm">سياسة الخصوصية</span>
                            <div className="w-8 h-8 rounded-full bg-brand-background dark:bg-brand-dark-background flex items-center justify-center text-brand-textSecondary group-hover:text-brand-primary transition-colors border border-brand-textPrimary/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </div>
                        </button>
                        <hr className="border-brand-textPrimary/5" />
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>الإصدار</span>
                            <span className="text-brand-textSecondary font-mono bg-brand-background dark:bg-brand-dark-background px-3 py-1 rounded-lg">1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
