import React, { useRef, useState } from 'react';
import { Inspiration } from '../data/inspirations';
import { Share2, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toBlob } from 'html-to-image';

export const InspirationCard: React.FC<{ inspiration: Inspiration }> = ({ inspiration }) => {
    const shareNodeRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // We can leave this but not use it. Or just keep state for safety if needed, we'll remove it.

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
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

            const file = new File([blob], `inspiration-${Date.now()}.png`, { type: 'image/png' });
            const textToShare = `${inspiration.type === 'quran' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}\n- ${inspiration.source}\n\nعبر تطبيق الحمد`;

            let shared = false;
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'تطبيق الحمد',
                        text: textToShare
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
                        await navigator.clipboard.writeText(textToShare);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    } catch(e) {}
                }
            }
        } catch (err: any) {
            console.error("Error sharing:", err);
            // Fallback to text copy if image generation entirely fails
            const textToShare = `${inspiration.type === 'quran' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}\n- ${inspiration.source}\n\nعبر تطبيق الحمد`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(textToShare).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }).catch(() => {});
            }
        } finally {
            setSharing(false);
        }
    };

    return (
        <>
            <div 
                className="mb-8 w-full shrink-0 flex flex-col py-4 bg-gradient-to-l from-brand-quranBg/80 to-brand-surface dark:from-brand-dark-quranBg/80 dark:to-brand-dark-surface rounded-[24px] shadow-sm border border-brand-textPrimary/10 px-4 relative"
            >
                <div className="w-full flex justify-between items-center mb-3 text-right" dir="rtl">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        <span className="text-xs font-bold text-brand-textSecondary dark:text-brand-dark-textSecondary whitespace-nowrap">
                            {inspiration.type === 'quran' ? 'آية اليوم' : 'حديث اليوم'}
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleShare}
                        className="w-8 h-8 rounded-full bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 flex items-center justify-center text-brand-textSecondary hover:text-brand-primary dark:hover:text-brand-dark-primary hover:bg-brand-textPrimary/10 dark:hover:bg-brand-dark-textPrimary/10 transition-colors shrink-0"
                        title="مشاركة"
                        disabled={sharing}
                        dir="ltr"
                    >
                        {sharing ? (
                            <div className="w-3 h-3 border-2 border-brand-textSecondary border-t-transparent rounded-full animate-spin"></div>
                        ) : copied ? (
                            <Check className="w-3 h-3 text-brand-success dark:text-brand-dark-success" />
                        ) : (
                            <Share2 className="w-3 h-3" />
                        )}
                    </button>
                </div>

                <div className="w-full relative z-10 flex flex-col justify-center px-2">
                    <p 
                        className="font-amiri text-[17px] md:text-[19px] leading-[2.2] text-brand-textPrimary dark:text-brand-dark-textPrimary opacity-90 text-center w-full pb-2" 
                        dir="rtl"
                    >
                        {inspiration.type === 'quran' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}
                    </p>
                    <p className="text-[11px] text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-70 font-sans text-center mt-1">
                        {inspiration.source}
                    </p>
                </div>
            </div>

            {/* Hidden Share Card */}
            <div 
                ref={shareNodeRef}
                style={{
                    width: '1080px',
                    height: '1080px',
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
                
                <div style={{ color: '#d4af37', fontSize: '42px', marginBottom: '80px', fontWeight: 'bold' }}>
                    {inspiration.type === 'quran' ? 'آية اليوم' : 'حديث اليوم'}
                </div>
                
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '64px', lineHeight: '2.2', marginBottom: '60px', zIndex: 10 }}>
                    {inspiration.type === 'quran' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}
                </div>

                <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.6)', marginTop: '20px' }}>
                    {inspiration.source}
                </div>

                <div style={{ position: 'absolute', bottom: '80px', left: '80px', fontSize: '40px', color: '#d4af37', fontFamily: 'Amiri, serif', opacity: 0.8 }}>
                    الحمد
                </div>
            </div>
        </>
    );
};

