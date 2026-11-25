import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, Copy, Share2 } from 'lucide-react';
import { Blessing, InspirationItem } from '../../types';
import { getFormattedHijriDayHeader } from '../../lib/hijri';
import { toArabicNumerals } from '../../lib/arabic';
import { parseLocalDateString, useLocalDay } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { ShareCardModal } from '../common/ShareCardModal';
import { BlessingScene, sceneMotifFor } from '../common/BlessingScene';
import { HisnCategoryId } from '../../data/hisnAlMuslim';

interface HomeScreenProps {
  blessing: Blessing;
  inspiration: InspirationItem;
  isCompletedToday: boolean;
  tasbihCount: number;
  onStartReflection: () => void;
  onOpenTasbih: () => void;
  onOpenHisn?: (category?: HisnCategoryId) => void;
}

/** Letters only: harakat, Qur'anic marks and spaces do not take room on a line. */
const letterCount = (text: string) => text.replace(/[ً-ٰٟۖ-ۭ\s]/g, '').length;

/**
 * A verse up to about four lines is written in the sky. A longer one (about one
 * blessing in ten) moves, whole, under the button, and the title takes the sky.
 * A verse is never shortened, and the button never falls below the fold.
 */
const SKY_VERSE_LIMIT = 95;

/** Generic attributions are not names; the reference sheets hide them. */
const GENERIC_SCHOLAR_PREFIXES = ['مستفاد', 'مأثور', 'إشارة'];

/** Renders ﴿…﴾ fragments inside prose in the Qur'an face and colour. */
function withQuranFragments(text: string): React.ReactNode[] {
  return text.split(/(﴿[^﴾]*﴾)/g).map((part, i) =>
    part.startsWith('﴿') ? (
      <span key={i} className="font-quran" style={{ color: 'var(--ayah-color)' }}>{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2.5">
    <h2 className="text-[0.8125rem] font-medium shrink-0" style={{ color: 'var(--accent-text)' }}>{children}</h2>
    <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--accent-stroke)' }} aria-hidden="true" />
    <span className="flex-1 h-px" style={{ background: 'var(--border-hairline)' }} aria-hidden="true" />
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  blessing,
  inspiration,
  isCompletedToday,
  onStartReflection,
}) => {
  const { entries, todayRole, theme } = useStore();
  const today = useLocalDay();
  const [copied, setCopied] = useState<'blessing' | 'inspiration' | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tadabburRef = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const isLight = theme === 'light';
  const motif = sceneMotifFor(blessing.id);
  const dayHeader = getFormattedHijriDayHeader(parseLocalDateString(today) ?? new Date());
  const isWelcome = todayRole === 'welcome';

  const verse = blessing.quran.textUthmani;
  const verseLetters = letterCount(verse);
  const verseInSky = verseLetters <= SKY_VERSE_LIMIT;
  const skyVerseSize = verseLetters <= 60 ? '1.5625rem' : '1.375rem';
  const verseRef = `سورة ${blessing.quran.surahName} · ${toArabicNumerals(blessing.quran.ayahNumber)}`;

  const totalSeconds = (blessing.istisharSteps || []).reduce((sum, s) => sum + (s.durationSec || 0), 0);
  const durationLabel = totalSeconds > 0 ? `${toArabicNumerals(totalSeconds)} ثانية` : null;

  const todayLine = entries.find((e) => e.date === today && e.blessingId === blessing.id)?.text?.trim();

  const scholar = blessing.scholarQuote;
  const scholarName =
    scholar?.scholar && !GENERIC_SCHOLAR_PREFIXES.some((p) => scholar.scholar.startsWith(p))
      ? [scholar.scholar, scholar.work].filter(Boolean).join('، ')
      : null;
  const scholarIsParaphrase = scholar?.attributionType === 'paraphrase';

  const copyText = async (kind: 'blessing' | 'inspiration') => {
    const text =
      kind === 'blessing'
        ? `«${blessing.title}»\n${blessing.openingLine}\n\n﴿${verse}﴾ [سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}]\n\n— تطبيق «الحمد»`
        : `${inspiration.type === 'quran' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}\n(${toArabicNumerals(inspiration.source)})\n— تطبيق «الحمد»`;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setCopied(kind);
    } catch {
      setCopied(null);
      setCopyFailed(true);
    }
    copyTimer.current = setTimeout(() => {
      setCopied(null);
      setCopyFailed(false);
    }, 2200);
  };

  const ctaButton = (id?: string) => (
    <button
      id={id}
      type="button"
      onClick={onStartReflection}
      className="w-full h-14 px-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
      style={{ background: 'var(--scene-cta-bg)', color: 'var(--scene-cta-fg)' }}
    >
      <span className="text-lg font-semibold">استشعر النعمة</span>
      {durationLabel && <span className="text-[0.8125rem]" style={{ color: 'var(--scene-cta-sub)' }}>{durationLabel}</span>}
    </button>
  );

  const doneBlock = (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
        <CheckCircle2 size={18} strokeWidth={1.5} aria-hidden="true" />
        <span>حمدتَ الله اليوم على هذه النعمة</span>
      </div>
      {todayLine && (
        <>
          <span className="mt-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>سطرك اليوم</span>
          <p className="mt-0.5 font-serif text-xl leading-[1.75]" style={{ color: 'var(--text-primary)', textWrap: 'pretty' }}>
            {todayLine}
          </p>
        </>
      )}
      <div className="mt-1 -mr-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => tadabburRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="h-11 px-3 text-sm cursor-pointer"
          style={{ color: 'var(--accent-text)' }}
        >
          اقرأ التدبّر
        </button>
        <span className="w-px h-3.5" style={{ background: 'var(--border-hairline)' }} aria-hidden="true" />
        <button
          id="btn-start-reflection"
          type="button"
          onClick={onStartReflection}
          className="h-11 px-3 text-sm cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          أعد الاستشعار
        </button>
      </div>
    </div>
  );

  const kicker = (
    <div className="flex items-center gap-2.5">
      <span className="text-[0.8125rem] font-medium shrink-0" style={{ color: 'var(--accent-text)' }}>
        {isWelcome ? 'نعمتك الأولى' : 'نعمة اليوم'}
      </span>
      <span className="flex-1 h-px" style={{ background: 'var(--border-hairline)' }} aria-hidden="true" />
      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{blessing.categoryLabel}</span>
    </div>
  );

  const quietButton = 'flex-1 h-11 rounded-[14px] border flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-colors';

  return (
    <div className="w-full min-h-screen pb-28 animate-fade-in" dir="rtl" style={{ background: 'var(--scene-base)' }}>
      {/* The scene. The mobile top bar sits over its sky (pt-16); on wider screens the desktop bar sits above it. */}
      <BlessingScene motif={motif} settled={isCompletedToday} isLight={isLight}>
        <div className="w-full max-w-lg md:max-w-2xl mx-auto px-7 pt-[4.5rem] md:pt-8 flex flex-col items-center text-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dayHeader}</span>

          {verseInSky ? (
            <div className="mt-7 flex flex-col items-center">
              <p
                className="font-quran ayah-text leading-[2.05]"
                style={{ color: 'var(--ayah-color)', fontSize: skyVerseSize, textWrap: 'balance' }}
              >
                ﴿{verse}﴾
              </p>
              <span className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{verseRef}</span>
            </div>
          ) : (
            <div id="card-today-blessing" className="mt-7 flex flex-col items-center">
              <span className="text-[0.8125rem] font-medium" style={{ color: 'var(--accent-text)' }}>
                {isWelcome ? 'نعمتك الأولى' : 'نعمة اليوم'}
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}> · {blessing.categoryLabel}</span>
              </span>
              <h1 className="mt-2 font-serif font-bold text-[2.5rem] leading-[1.35]" style={{ color: 'var(--text-primary)' }}>
                {blessing.title}
              </h1>
              <p className="mt-2 font-serif text-[1.1875rem] leading-[1.7]" style={{ color: 'var(--text-secondary)', textWrap: 'balance' }}>
                {blessing.openingLine}
              </p>
            </div>
          )}
        </div>
      </BlessingScene>

      <div className="w-full max-w-lg md:max-w-2xl mx-auto px-7 -mt-2 relative z-10 flex flex-col">
        {verseInSky ? (
          <>
            <div id="card-today-blessing" className="flex flex-col">
              {kicker}
              <h1 className="mt-2 font-serif font-bold text-[3.125rem] leading-[1.3]" style={{ color: 'var(--text-primary)' }}>
                {blessing.title}
              </h1>
              {!isCompletedToday && (
                <p className="mt-1 font-serif text-xl leading-[1.7]" style={{ color: 'var(--text-secondary)', textWrap: 'pretty' }}>
                  {blessing.openingLine}
                </p>
              )}
            </div>
            <div className="mt-[1.125rem]">{isCompletedToday ? doneBlock : ctaButton('btn-start-reflection')}</div>
          </>
        ) : (
          <>
            {isCompletedToday ? doneBlock : ctaButton('btn-start-reflection')}
            <section className="mt-10 flex flex-col gap-3.5" aria-label="آية اليوم">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[0.8125rem] font-medium shrink-0" style={{ color: 'var(--accent-text)' }}>آية اليوم</h2>
                <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--accent-stroke)' }} aria-hidden="true" />
                <span className="flex-1 h-px" style={{ background: 'var(--border-hairline)' }} aria-hidden="true" />
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{verseRef}</span>
              </div>
              <p className="font-quran ayah-text text-[1.375rem] leading-[2.1] text-center" style={{ color: 'var(--ayah-color)', textWrap: 'pretty' }}>
                ﴿{verse}﴾
              </p>
            </section>
          </>
        )}

        {isWelcome && !isCompletedToday && (
          <span className="mt-2.5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>ومن الغد، نعمةٌ جديدة كل يوم.</span>
        )}

        {blessing.tadabbur && (
          <section ref={tadabburRef} className="mt-11 flex flex-col gap-3.5 scroll-mt-6">
            <SectionHead>تدبّر</SectionHead>
            <p className="text-base leading-[1.95]" style={{ color: 'var(--text-secondary)', textWrap: 'pretty' }}>
              {withQuranFragments(blessing.tadabbur)}
            </p>
          </section>
        )}

        {blessing.hadith?.text && (
          <section className="mt-10 flex flex-col gap-3">
            <SectionHead>من السنّة</SectionHead>
            <p className="font-serif text-xl leading-[1.9]" style={{ color: 'var(--text-primary)', textWrap: 'pretty' }}>«{blessing.hadith.text}»</p>
            {blessing.hadith.source && (
              <span className="-mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{blessing.hadith.source}</span>
            )}
          </section>
        )}

        {scholar?.text && (
          <section className="mt-10 flex flex-col gap-3">
            <SectionHead>فائدة</SectionHead>
            <p className="font-serif text-lg leading-[1.9]" style={{ color: 'var(--text-secondary)', textWrap: 'pretty' }}>{scholar.text}</p>
            {(scholarName || scholarIsParaphrase) && (
              <span className="-mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {[scholarName, scholarIsParaphrase ? 'بالمعنى' : null].filter(Boolean).join(' · ')}
              </span>
            )}
          </section>
        )}

        <div className="mt-8 flex gap-2.5">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className={quietButton}
            style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
          >
            <Share2 size={17} strokeWidth={1.5} aria-hidden="true" />
            مشاركة كبطاقة
          </button>
          <button
            type="button"
            onClick={() => copyText('blessing')}
            className={quietButton}
            style={{ borderColor: 'var(--border-hairline)', color: copied === 'blessing' ? 'var(--accent-text)' : 'var(--text-secondary)' }}
          >
            {copied === 'blessing' ? <Check size={17} strokeWidth={1.5} aria-hidden="true" /> : <Copy size={17} strokeWidth={1.5} aria-hidden="true" />}
            {copied === 'blessing' ? 'نُسخ النص' : 'نسخ النص'}
          </button>
        </div>
        {copyFailed && (
          <span role="status" className="mt-2 text-xs text-center" style={{ color: 'var(--danger)' }}>
            تعذّر النسخ على هذا الجهاز.
          </span>
        )}

        <section id="card-daily-inspiration" className="mt-12 pt-7 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border-hairline)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[0.8125rem] font-medium" style={{ color: 'var(--text-muted)' }}>
              {inspiration.type === 'quran' ? 'آية اليوم' : 'حديث اليوم'}
            </h2>
            <button
              type="button"
              onClick={() => copyText('inspiration')}
              className="w-11 h-11 -ml-3 flex items-center justify-center cursor-pointer"
              style={{ color: copied === 'inspiration' ? 'var(--accent-text)' : 'var(--text-muted)' }}
              aria-label={inspiration.type === 'quran' ? 'نسخ آية اليوم' : 'نسخ حديث اليوم'}
            >
              {copied === 'inspiration' ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
            </button>
          </div>
          {inspiration.type === 'quran' ? (
            <p className="font-quran ayah-text text-[1.3125rem] leading-[2.05]" style={{ color: 'var(--ayah-color)', textWrap: 'pretty' }}>﴿{inspiration.text}﴾</p>
          ) : (
            <p className="font-serif text-[1.1875rem] leading-[1.9]" style={{ color: 'var(--text-primary)', textWrap: 'pretty' }}>«{inspiration.text}»</p>
          )}
          <span className="-mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{toArabicNumerals(inspiration.source)}</span>
        </section>

        {!isCompletedToday && (
          <div className="mt-12 flex flex-col gap-3.5">
            <svg aria-hidden="true" width="200" height="64" viewBox="0 0 200 64" className="self-center">
              <line x1="100" y1="0" x2="100" y2="44" style={{ stroke: 'var(--scene-thread)', strokeOpacity: 0.6 }} />
              <ellipse cx="100" cy="47" rx="14" ry="3.2" fill="none" style={{ stroke: 'var(--scene-ripple)', strokeOpacity: 0.8 }} />
              <ellipse cx="100" cy="47" rx="34" ry="7.7" fill="none" style={{ stroke: 'var(--scene-ripple)', strokeOpacity: 0.45 }} />
              <ellipse cx="100" cy="47" rx="62" ry="14" fill="none" style={{ stroke: 'var(--scene-light)', strokeOpacity: 0.15 }} />
              <circle cx="100" cy="47" r="3" style={{ fill: 'var(--scene-ripple)' }} />
            </svg>
            <span className="text-center font-serif text-xl" style={{ color: 'var(--text-secondary)' }}>والآن، استشعرها.</span>
            {ctaButton()}
          </div>
        )}
      </div>

      {shareOpen && (
        <ShareCardModal blessing={blessing} type="ayah" onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
};
