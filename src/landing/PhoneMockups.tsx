import React from 'react';
import {
  BeadsIcon,
  BookIcon,
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
  CompassIcon,
  CopyIcon,
  GearIcon,
  HomeIcon,
  ShareIcon,
  SparkleIcon,
  TimerIcon,
} from './icons';

/** Geometric eight-point star lattice used behind the hero, closing and reflect screens. */
export const StarPattern: React.FC<{id: string; className?: string}> = ({id, className}) => (
  <svg aria-hidden="true" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="var(--l-pattern)" strokeWidth="1">
          <rect x="40" y="40" width="60" height="60" />
          <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

/**
 * A device frame (352×755) that renders a 390×844 screen scaled to fit.
 * The screens are decorative previews, so they are hidden from assistive tech;
 * `label` describes them instead.
 */
export const PhoneFrame: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div
    role="img"
    aria-label={label}
    className="h-[755px] w-[352px] shrink-0 rounded-[52px] border border-ah-hairline bg-ah-frame p-[10px] [box-shadow:var(--l-raised-shadow)]"
  >
    <div className="h-[735px] w-[332px] overflow-hidden rounded-[42px]">
      <div aria-hidden="true" className="h-[844px] w-[390px] origin-top-right scale-[0.8513]">
        {children}
      </div>
    </div>
  </div>
);

const RoundIconButton: React.FC<{size: number; children: React.ReactNode; className?: string}> = ({
  size,
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border border-ah-hairline text-ah-body ${className}`}
    style={{width: size, height: size}}
  >
    {children}
  </span>
);

const tabs = [
  {label: 'الرئيسية', Icon: HomeIcon, active: true},
  {label: 'رحلتي', Icon: CompassIcon},
  {label: 'سجل الحمد', Icon: BookIcon},
  {label: 'المداومة', Icon: CalendarIcon},
  {label: 'المسبحة', Icon: BeadsIcon},
];

/** "نعمة اليوم" — the app's home screen. */
export const PhoneHomeScreen: React.FC = () => (
  <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[40px] bg-ah-ground font-sans text-ah-text">
    <div className="flex items-center justify-between border-b border-ah-hairline px-5 pt-[22px] pb-4">
      <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-ah-stroke font-serif text-[22px] text-ah-accent">
        ح
      </span>
      <span className="font-serif text-[26px] leading-none font-bold">الحمد</span>
      <GearIcon className="text-ah-body" />
    </div>

    <div className="flex flex-col gap-0.5 px-5 pt-3.5">
      <span className="text-sm text-ah-muted">السلام عليكم</span>
      <span className="text-[22px] font-bold">٣٠ جمادى الأولى ١٤٤٨ هـ</span>
    </div>

    <div className="mx-4 mt-[18px] flex items-center gap-2.5 rounded-[22px] border border-ah-hairline bg-ah-glass px-3.5 py-2.5">
      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-ah-accent" />
      <span className="shrink-0 text-[13px] font-semibold text-ah-accent">حديث اليوم</span>
      <span className="min-w-0 flex-1 truncate font-serif text-[13px] text-ah-muted">
        — «اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.»
      </span>
      <span className="inline-flex gap-1.5">
        <RoundIconButton size={30}><CopyIcon size={14} /></RoundIconButton>
        <RoundIconButton size={30}><ShareIcon size={14} /></RoundIconButton>
        <RoundIconButton size={30}><ChevronDownIcon size={14} /></RoundIconButton>
      </span>
    </div>

    <div className="relative mx-4 mt-[22px] flex h-[26px] items-center justify-center">
      <span className="absolute inset-x-10 top-[13px] h-px bg-ah-hairline" />
      <span className="relative rounded-full border border-ah-hairline bg-ah-glass px-3.5 py-[3px] text-xs text-ah-body">
        نعمة اليوم
      </span>
    </div>

    <div
      className="mx-4 mt-4 flex flex-col gap-3 rounded-[28px] border bg-ah-glass p-5 [box-shadow:var(--l-card-shadow)]"
      style={{
        borderColor: 'color-mix(in srgb, var(--l-stroke) 60%, transparent)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, var(--l-card-glow), transparent 70%)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-ah-stroke px-3 py-1 text-xs font-semibold text-ah-accent">نعم الدين</span>
        <span className="inline-flex gap-2">
          <RoundIconButton size={36} className="bg-ah-sunken"><CopyIcon size={16} /></RoundIconButton>
          <RoundIconButton size={36} className="bg-ah-sunken"><ShareIcon size={16} /></RoundIconButton>
        </span>
      </div>
      <span className="text-center font-serif text-[30px] leading-normal font-bold">نعمة الإسلام</span>
      <span className="text-center text-sm leading-[1.8] text-ah-body">
        أعظمُ نعمةٍ أنعمَ اللهُ بها عليك: أن هداكَ للإسلام، ولو شاء لتركك في الظلمات.
      </span>
      <div
        className="flex flex-col items-center gap-1.5 rounded-2xl border bg-ah-sunken px-3 py-4"
        style={{borderColor: 'color-mix(in srgb, var(--l-stroke) 30%, transparent)'}}
      >
        <span className="font-quran text-[20px] leading-[2.1] text-ah-ayah">
          ﴿ٱلْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِى وَرَضِيتُ لَكُمُ ٱلْإِسْلَٰمَ دِينًۭا﴾
        </span>
        <span className="text-[11px] text-ah-muted">سورة المائدة : ٣</span>
      </div>
      <div className="flex items-center justify-between border-t border-ah-hairline pt-3">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
          <SparkleIcon size={18} className="text-ah-accent" />
          تدبّر النعمة
        </span>
        <ChevronDownIcon size={18} className="text-ah-body" />
      </div>
      <span className="flex h-[54px] items-center justify-center rounded-2xl bg-ah-cta text-lg font-semibold text-white">
        استشعر النعمة
      </span>
    </div>

    <div className="absolute inset-x-0 bottom-0 grid grid-cols-5 border-t border-ah-hairline bg-ah-tabbar px-1 pt-2.5 pb-[22px]">
      {tabs.map(({label, Icon, active}) => (
        <span
          key={label}
          className={`relative flex flex-col items-center gap-1 text-[11px] ${active ? 'text-ah-accent' : 'text-ah-muted'}`}
        >
          {active && <span className="absolute -top-2.5 h-0.5 w-7 rounded-sm bg-ah-accent" />}
          <Icon />
          {label}
        </span>
      ))}
    </div>
  </div>
);

/** "تخيّل الغياب" — one sentence of the guided reflection. */
export const PhoneReflectScreen: React.FC = () => (
  <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[40px] bg-ah-deep font-sans text-ah-text">
    <StarPattern id="reflectStar" className="absolute inset-0 h-full w-full" />

    <div className="absolute inset-x-5 top-7 flex items-center gap-3">
      <RoundIconButton size={42} className="bg-ah-glass"><CloseIcon size={18} /></RoundIconButton>
      <span className="relative h-2 flex-1">
        <span className="absolute inset-x-0 top-[3px] h-px bg-ah-hairline" />
        <span className="absolute right-0 top-[3px] h-[1.5px] w-[40%] bg-ah-stroke" />
        <span className="absolute -right-0.5 top-0 h-[7px] w-[7px] rounded-full bg-ah-stroke" />
        <span className="absolute right-[40%] top-0 h-[7px] w-[7px] rounded-full bg-ah-stroke" />
      </span>
      <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ah-hairline bg-ah-glass px-3.5 text-[13px] font-semibold text-ah-accent">
        <ShareIcon size={15} />
        مشاركة
      </span>
      <RoundIconButton size={42} className="bg-ah-glass"><TimerIcon size={18} /></RoundIconButton>
    </div>

    <div className="absolute inset-x-8 inset-y-0 flex flex-col items-center justify-center gap-7 text-center">
      <span className="rounded-full border border-ah-hairline bg-ah-pill px-4 py-[5px] text-[13px] font-semibold text-ah-accent">
        تخيّل الغياب
      </span>
      <span className="font-serif text-[30px] leading-[1.8]">
        تخيَّل لو أنك وُلدتَ في أرضٍ لا تعرف الله… تعيش وتموت ولم تسجد له سجدةً واحدة.
      </span>
    </div>

    <span className="absolute inset-x-6 bottom-[30px] flex h-14 items-center justify-center rounded-2xl bg-ah-cta text-lg font-semibold text-white">
      التالي
    </span>
  </div>
);
