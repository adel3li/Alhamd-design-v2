import React, { useRef, useState } from 'react';
import { Blessing } from '../types';
import { Share2, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';

export const BlessingCard: React.FC<{ blessing: Blessing; completed: boolean; onStart: () => void }> = ({ blessing, completed, onStart }) => {
  const shareNodeRef = useRef<HTMLDivElement>(null);
  const shareTadabburRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [sharingTadabbur, setSharingTadabbur] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTadabbur, setCopiedTadabbur] = useState(false);
  const [showTadabbur, setShowTadabbur] = useState(false);

  const handleShare = async () => {
    if (!shareNodeRef.current) return;
    setSharing(true);
    try {
      const blob = await toBlob(shareNodeRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0a0c0f',
        style: {
          position: 'static',
          top: 'auto',
          left: 'auto',
          transform: 'none'
        }
      });

      if (!blob) throw new Error("Failed to generate image");

      const file = new File([blob], `alhamd-${blessing.id}.png`, { type: 'image/png' });
      
      const shareText = `«${blessing.title}»\n﴿${blessing.quran.textUthmani}﴾\n- سورة ${blessing.quran.surahName} : ${blessing.quran.ayahNumber}\n\nعبر تطبيق الحمد`;

      let shared = false;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: blessing.title,
            text: shareText,
          });
          shared = true;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
             return;
          }
          console.error("Share API failed, falling back to download:", shareErr);
        }
      } 
      
      if (!shared) {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also fallback copy text
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch(e) {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error sharing:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleShareTadabbur = async () => {
    if (!shareTadabburRef.current) return;
    setSharingTadabbur(true);
    try {
      const blob = await toBlob(shareTadabburRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0a0c0f',
        style: {
          position: 'static',
          top: 'auto',
          left: 'auto',
          transform: 'none'
        }
      });

      if (!blob) throw new Error("Failed to generate image");

      const file = new File([blob], `tadabbur-${blessing.id}.png`, { type: 'image/png' });
      
      const shareText = `«${blessing.title}»\n\n${blessing.hadith.text}\n«${blessing.hadith.source}»\n\n${blessing.tadabbur}\n\n"${blessing.scholarQuote.text}"\n- ${isSpecificScholar(blessing.scholarQuote.scholar) ? blessing.scholarQuote.scholar : blessing.scholarQuote.scholar}\n\nعبر تطبيق الحمد`;

      let shared = false;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `تدبر النعمة - ${blessing.title}`,
            text: shareText,
          });
          shared = true;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
             return;
          }
          console.error("Share API failed, falling back to download:", shareErr);
        }
      } 
      
      if (!shared) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(shareText);
            setCopiedTadabbur(true);
            setTimeout(() => setCopiedTadabbur(false), 2000);
          } catch(e) {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error sharing tadabbur:", err);
      }
    } finally {
      setSharingTadabbur(false);
    }
  };

  const isSpecificScholar = (scholarName: string) => {
    return !scholarName.startsWith('مستفاد') && !scholarName.startsWith('مأثور') && !scholarName.startsWith('إشارة');
  };

  return (
    <div className="bg-gradient-to-b from-brand-surface to-brand-background/50 dark:from-brand-dark-surface dark:to-brand-dark-background/50 rounded-[2rem] p-8 shadow-sm border border-brand-textPrimary/10 flex flex-col items-center text-center relative overflow-hidden group w-full">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-20"></div>
      
      <div data-tour="share" className="absolute top-6 left-6 z-10">
        <button 
          onClick={handleShare}
          disabled={sharing}
          className="w-10 h-10 rounded-full bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 flex items-center justify-center text-brand-textSecondary hover:text-brand-primary dark:hover:text-brand-dark-primary hover:bg-brand-textPrimary/10 dark:hover:bg-brand-dark-textPrimary/10 transition-colors shrink-0"
          title="مشاركة الصورة"
        >
          {sharing ? (
            <div className="w-4 h-4 border-2 border-brand-textSecondary border-t-transparent rounded-full animate-spin"></div>
          ) : copied ? (
            <Check className="w-4 h-4 text-brand-success dark:text-brand-dark-success" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="w-full relative flex flex-col items-center" data-tour="blessing">
        <div className="px-5 py-2 rounded-full bg-brand-background dark:bg-brand-dark-background text-sm text-brand-textSecondary dark:text-brand-dark-textSecondary mb-8 mt-2 font-medium border border-brand-textPrimary/10 shadow-sm">
          {blessing.categoryLabel}
        </div>
        
        <h2 className="text-4xl font-amiri font-bold mb-5 text-brand-textPrimary dark:text-brand-dark-textPrimary">
          {blessing.title}
        </h2>
        
        <p className="text-lg text-brand-textSecondary dark:text-brand-dark-textSecondary mb-8 max-w-[280px] leading-relaxed" style={{ color: 'var(--brand-primary)' }}>
          {blessing.openingLine}
        </p>
      </div>

      <div className="w-full bg-brand-quranBg dark:bg-brand-dark-quranBg rounded-3xl p-8 mb-4 relative border border-brand-textPrimary/5">
        <p className="font-amiri text-2xl leading-[2.2] text-brand-textPrimary dark:text-brand-dark-textPrimary">
          ﴿{blessing.quran.textUthmani}﴾
        </p>
        <p className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary mt-6 tracking-wide uppercase opacity-70">
          سورة {blessing.quran.surahName} : {blessing.quran.ayahNumber}
        </p>
      </div>

      <div className="w-full mb-8 relative" data-tour="reflect-toggle">
        <button 
           onClick={() => setShowTadabbur(!showTadabbur)}
           className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 hover:bg-brand-textPrimary/10 dark:hover:bg-brand-dark-textPrimary/10 transition-colors text-brand-textPrimary dark:text-brand-dark-textPrimary font-medium border border-brand-textPrimary/10"
        >
           <span>تدبّر النعمة</span>
           {showTadabbur ? <ChevronUp className="w-5 h-5 opacity-70" /> : <ChevronDown className="w-5 h-5 opacity-70" />}
        </button>
        <AnimatePresence>
           {showTadabbur && (
              <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 transition={{ duration: 0.3 }}
                 className="overflow-hidden"
              >
                 <div className="p-6 text-right space-y-6 bg-brand-background dark:bg-brand-dark-background border border-t-0 border-brand-textPrimary/10 rounded-b-2xl -mt-2 pt-8 relative">
                    <button 
                       onClick={(e) => { e.stopPropagation(); handleShareTadabbur(); }}
                       disabled={sharingTadabbur}
                       className="absolute left-4 top-4 w-10 h-10 rounded-full bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 flex items-center justify-center text-brand-textSecondary hover:text-brand-primary dark:hover:text-brand-dark-primary hover:bg-brand-textPrimary/10 dark:hover:bg-brand-dark-textPrimary/10 transition-colors z-10"
                       title="مشاركة التدبر"
                    >
                       {sharingTadabbur ? <div className="w-4 h-4 border-2 border-brand-textSecondary border-t-transparent rounded-full animate-spin"></div> : copiedTadabbur ? <Check className="w-4 h-4 text-brand-success dark:text-brand-dark-success" /> : <Share2 className="w-4 h-4" />}
                    </button>
                    <div className="space-y-3 pt-4">
                       <p className="font-amiri text-xl leading-[2.2] text-brand-textPrimary dark:text-brand-dark-textPrimary">
                          {blessing.hadith.text}
                       </p>
                       <p className="text-sm text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80">
                          «{blessing.hadith.source}»
                       </p>
                    </div>

                    <div className="w-12 h-px bg-brand-textPrimary/10"></div>

                    <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary leading-relaxed text-[15px]">
                       {blessing.tadabbur}
                    </p>

                    <div className="w-12 h-px bg-brand-textPrimary/10"></div>

                    <div className="space-y-3">
                       <p className="font-amiri text-lg leading-loose text-brand-textPrimary dark:text-brand-dark-textPrimary opacity-90">
                          "{blessing.scholarQuote.text}"
                       </p>
                       {isSpecificScholar(blessing.scholarQuote.scholar) && (
                          <p className="text-sm tracking-wide" style={{ color: 'var(--brand-primary)' }}>
                             — {blessing.scholarQuote.scholar}
                          </p>
                       )}
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      {completed ? (
        <div className="flex flex-col items-center w-full space-y-5" data-tour="feel-button">
           <div className="flex items-center justify-center gap-3 text-brand-success dark:text-brand-dark-success font-medium bg-brand-success/5 px-6 py-3 rounded-2xl border border-brand-success/10">
             <div className="w-8 h-8 rounded-full bg-brand-success/20 flex items-center justify-center">
               <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1 5L4.5 8.5L12.5 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
             حمدتَ اللهَ اليوم
           </div>
           <button 
             onClick={onStart}
             className="text-brand-textSecondary dark:text-brand-dark-textSecondary underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity text-sm font-medium"
           >
             أعد الاستشعار
           </button>
        </div>
      ) : (
        <button 
          onClick={onStart}
          data-tour="feel-button"
          className="w-full bg-brand-primary dark:bg-brand-dark-primary text-white dark:text-brand-dark-background py-4 flex items-center justify-center rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-brand-primary/20 active:scale-95"
        >
          استشعر النعمة
        </button>
      )}

      {/* Hidden Share Card */}
      <div 
        ref={shareNodeRef}
        style={{
          width: '1080px',
          height: '1350px',
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          background: 'radial-gradient(circle at center, #0f1115 0%, #06070a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px',
          color: '#f2f0e9',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          direction: 'rtl'
        }}
      >
         <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundImage: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
         }} />
         
         <div style={{ color: '#d4af37', fontSize: '48px', marginBottom: '80px', fontWeight: 'bold' }}>
           {blessing.title}
         </div>
         
         <div style={{ fontFamily: 'Amiri, serif', fontSize: '72px', lineHeight: '2.2', marginBottom: '60px', zIndex: 10 }}>
           ﴿{blessing.quran.textUthmani}﴾
         </div>

         <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.6)' }}>
             سورة {blessing.quran.surahName} : {blessing.quran.ayahNumber}
         </div>

         <div style={{ position: 'absolute', bottom: '80px', left: '80px', fontSize: '40px', color: '#d4af37', fontFamily: 'Amiri, serif', opacity: 0.8 }}>
           الحمد
         </div>
      </div>
      {/* Hidden Share Card for Tadabbur */}
      <div 
        ref={shareTadabburRef}
        style={{
          width: '1080px',
          height: 'auto',
          minHeight: '1350px',
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          background: 'radial-gradient(circle at center, #0f1115 0%, #06070a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 120px 200px 120px',
          color: '#f2f0e9',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          direction: 'rtl'
        }}
      >
         <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundImage: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
         }} />
         
         <div style={{ color: '#d4af37', fontSize: '42px', marginBottom: '60px', fontWeight: 'bold' }}>
           تدبّر النعمة: {blessing.title}
         </div>
         
         <div style={{ fontFamily: 'Amiri, serif', fontSize: '48px', lineHeight: '2.2', marginBottom: '20px', zIndex: 10, maxWidth: '900px' }}>
           {blessing.hadith.text}
         </div>
         <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.6)', marginBottom: '80px' }}>
           «{blessing.hadith.source}»
         </div>

         <div style={{ fontSize: '36px', lineHeight: '1.8', color: '#f2f0e9', opacity: 0.9, marginBottom: '80px', maxWidth: '900px' }}>
           {blessing.tadabbur}
         </div>

         <div style={{ fontFamily: 'Amiri, serif', fontSize: '42px', lineHeight: '2', color: '#d4af37', opacity: 0.9, maxWidth: '900px' }}>
           "{blessing.scholarQuote.text}"
         </div>
         {isSpecificScholar(blessing.scholarQuote.scholar) && (
            <div style={{ fontSize: '28px', color: 'rgba(212,175,55,0.8)', marginTop: '20px' }}>
               — {blessing.scholarQuote.scholar}
            </div>
         )}

         <div style={{ position: 'absolute', bottom: '80px', left: '80px', fontSize: '40px', color: '#d4af37', fontFamily: 'Amiri, serif', opacity: 0.8 }}>
           الحمد
         </div>
      </div>
    </div>
  );
};
