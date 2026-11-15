import React, {useRef} from 'react';
import {BeadsIcon, BookIcon, CalendarIcon, CloseIcon, CompassIcon, HomeIcon, ShieldIcon} from './icons';
import {PhoneFrame, PhoneHomeScreen, PhoneReflectScreen, StarPattern} from './PhoneMockups';

/** Where the "try the app" buttons point. */
const APP_URL = 'https://app.alhamd.app';
/** Support address for the footer's "contact us" link; the link is hidden while this is empty. */
const SUPPORT_EMAIL = '';

const navLinks = [
  {href: '#story', label: 'الفكرة'},
  {href: '#method', label: 'التأمّل'},
  {href: '#inside', label: 'في التطبيق'},
  {href: '#promise', label: 'خصوصيّتك'},
];

const steps = [
  {title: 'التهيئة والحضور', time: '١٠ ثوانٍ', text: 'خذ نفسًا عميقًا… وأحضر قلبك معي لحظة.'},
  {title: 'تخيّل الغياب', time: '٢٠ ثانية', text: 'تتخيّل يومك وقد غابت النعمة عنه، لحظةً بلحظة.'},
  {title: 'التعمّق', time: '٢٠ ثانية', text: 'تمضي أبعد: ما الذي كان سيتغيّر في قلبك وفي من حولك؟'},
  {title: 'العودة', time: '١٥ ثانية', text: 'تفتح عينيك، فتجدها ما زالت بين يديك.'},
  {title: 'الحمد', time: '١٥ ثانية', text: 'تحمد الله عليها بقلبٍ حاضر، لا بلسانٍ معتاد.'},
];

const features = [
  {Icon: HomeIcon, title: 'نعمة اليوم', text: 'نعمةٌ واحدة يتأمّلها الجميع في اليوم نفسه، معها آيتها وحديث اليوم.'},
  {Icon: CompassIcon, title: 'رحلتي', text: 'مسارك أنت مع النعم، تمضي فيه نعمةً بعد نعمة.'},
  {Icon: BookIcon, title: 'سجل الحمد', text: 'دفترك الخاص، تكتب فيه ما وجدته في نفسك. يبقى على جهازك وحده.'},
  {Icon: CalendarIcon, title: 'المداومة', text: 'أيّامك مع النعم في تقويمٍ هجري، بلا عدّاد ولا أيّامٍ «فائتة».'},
  {Icon: BeadsIcon, title: 'المسبحة', text: 'تسبيحٌ بلمسة، واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين.'},
  {
    Icon: ShieldIcon,
    title: 'نصوصٌ موثّقة',
    text: 'الآيات بالرسم العثماني، والأحاديث بدرجتها، وكلّ نصٍّ يمرّ على أهل العلم قبل نشره.',
  },
];

const promises = [
  {title: 'بلا حساب.', text: 'تفتح التطبيق فتبدأ. لا تسجيل، ولا بريد، ولا كلمة مرور.'},
  {title: 'بلا أرقامٍ تلاحقك.', text: 'لا نقاط ولا شارات ولا سلاسل أيّام. المداومة عندنا محاسبةٌ للنفس، لا سباق.'},
  {title: 'سجلّك لك.', text: 'نصّ سجلّك لا يغادر جهازك. والإحصاءات بإذنك، ولا تتضمّن حرفًا ممّا كتبت.'},
];

const PrimaryCta: React.FC = () => (
  <a
    href={APP_URL}
    className="inline-flex h-14 items-center justify-center rounded-2xl bg-ah-cta px-9 text-lg font-semibold text-white no-underline transition-colors hover:bg-ah-cta-hover"
  >
    ابدأ بنعمة اليوم
  </a>
);

/** The wordmark with its gold thread; the dot sits on the starting (right) end. */
const Wordmark: React.FC<{large?: boolean}> = ({large}) => (
  <span className={`inline-flex flex-col ${large ? 'gap-[26px]' : 'gap-1.5'}`}>
    <span
      className={`font-serif leading-none font-bold text-ah-accent ${large ? 'text-[88px] sm:text-[128px]' : 'text-[30px]'}`}
    >
      الحمد
    </span>
    <span aria-hidden="true" className={`relative block ${large ? 'h-2.5' : 'h-1'}`}>
      <span className={`absolute inset-x-0 bg-ah-stroke ${large ? 'top-1 h-[2.5px]' : 'top-px h-px'}`} />
      <span
        className={`absolute rounded-full bg-ah-stroke ${large ? '-right-[5px] top-0 h-2.5 w-2.5' : '-right-0.5 -top-px h-1 w-1'}`}
      />
    </span>
  </span>
);

const Eyebrow: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span className="text-sm font-semibold text-ah-accent">{children}</span>
);

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <h2 className="m-0 font-serif text-[2.2rem] leading-[1.45] font-bold sm:text-5xl">{children}</h2>
);

/** Shrinks the 352px device frame on very narrow phones so it never overflows. */
const PhoneFit: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="max-[400px]:[zoom:0.85] max-[340px]:[zoom:0.75]">{children}</div>
);

const PrivacyDialog: React.FC<{dialogRef: React.RefObject<HTMLDialogElement | null>}> = ({dialogRef}) => (
  <dialog
    ref={dialogRef}
    aria-labelledby="privacy-title"
    className="m-auto max-h-[90vh] w-[min(560px,calc(100vw-32px))] rounded-3xl border border-ah-hairline bg-ah-ground p-0 text-ah-text backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    onClick={(e) => {
      if (e.target === e.currentTarget) e.currentTarget.close();
    }}
  >
    <div dir="rtl" className="flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-ah-hairline pb-4">
        <h2 id="privacy-title" className="m-0 font-serif text-2xl font-bold">
          سياسة الخصوصية
        </h2>
        <button
          type="button"
          aria-label="إغلاق"
          onClick={() => dialogRef.current?.close()}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ah-hairline bg-ah-glass text-ah-body hover:text-ah-text"
        >
          <CloseIcon size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-4 text-[15px] leading-[1.9] text-ah-body">
        <p className="m-0 font-semibold text-ah-accent">بياناتك بينك وبين الله، لا تغادر جهازك.</p>
        <p className="m-0">
          نحن نحترم خصوصيتك التامة ونلتزم بحمايتها. صُمم تطبيق «الحمد» ليكون مساحة عبادة وتفكّر آمنة، دون أي حسابات أو
          خوادم تجمع بياناتك الشخصية.
        </p>
        <div>
          <h3 className="m-0 text-base font-bold text-ah-text">١. تخزين محلي على جهازك</h3>
          <p className="m-0">
            جميع ما تكتبه في «سجل الحمد» وفي «نِعَمي»، وسجل أيام المداومة، يُخزّن محلياً على ذاكرة جهازك وحدك. لا نملك أي
            وسيلة للاطلاع على ما تدونه.
          </p>
        </div>
        <div>
          <h3 className="m-0 text-base font-bold text-ah-text">٢. النسخ الاحتياطي والاستعادة</h3>
          <p className="m-0">
            النسخ الاحتياطي يتم يدوياً عن طريق تصدير ملف تحتفظ به بنفسك أينما أردت، ويمكنك استرجاعه في أي وقت بضغطة زر.
          </p>
        </div>
        <div>
          <h3 className="m-0 text-base font-bold text-ah-text">٣. الإحصاءات التحسينية (اختيارية)</h3>
          <p className="m-0">
            في حال موافقتك، تُجمع بيانات استخدام تقنية مجهولة الهوية تماماً (مثل فتح التطبيق أو إتمام جولة الاستشعار) بهدف
            تحسين استقرار التطبيق فقط، دون جمع أي نصوص أو معلومات شخصية إطلاقاً.
          </p>
        </div>
      </div>
    </div>
  </dialog>
);

export default function LandingPage() {
  const privacyRef = useRef<HTMLDialogElement>(null);

  return (
    <div dir="rtl" lang="ar" className="bg-ah-page font-sans text-ah-text">
      {/* ═══ HERO ═══ */}
      <section id="top" className="relative overflow-hidden bg-ah-page px-5">
        <StarPattern id="heroStar" className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{background: 'radial-gradient(48% 48% at 50% 78%, var(--l-cone), transparent)'}}
        />

        <header className="relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 py-7">
          <a href="#top" aria-label="الحمد — أعلى الصفحة" className="no-underline">
            <Wordmark />
          </a>
          <nav aria-label="أقسام الصفحة" className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px]">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hidden text-ah-body no-underline transition-colors hover:text-ah-accent md:inline"
              >
                {l.label}
              </a>
            ))}
            <a
              href={APP_URL}
              className="inline-flex h-11 items-center rounded-2xl border border-ah-stroke px-[22px] font-semibold text-ah-accent no-underline transition-colors hover:text-ah-text"
            >
              جرّب التطبيق
            </a>
          </nav>
        </header>

        <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-7 pt-16 pb-14 text-center sm:pt-[88px] sm:pb-[72px]">
          <span className="rounded-full border border-ah-hairline bg-ah-pill px-[18px] py-1.5 text-sm font-semibold text-ah-accent">
            نعمةٌ كلَّ يوم
          </span>
          <h1 className="m-0 font-serif text-[3rem] leading-[1.35] font-bold sm:text-[4rem] lg:text-[5rem]">
            النعمة لا تُرى…
            <br />
            <span className="text-ah-accent">حتى تغيب.</span>
          </h1>
          <p className="m-0 max-w-[34em] text-[17px] leading-[1.9] text-ah-body sm:text-[19px]">
            «الحمد» يضع بين يديك كلَّ يومٍ نعمةً واحدة، ثم يأخذك في دقيقتين من التأمّل: تتخيّل يومك لو غابت، ثم تعود
            إليها فتحمد الله عليها.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <PrimaryCta />
            <span className="inline-flex h-14 items-center px-5 text-[15px] text-ah-muted">
              قريبًا على متجر «جوجل بلاي»
            </span>
          </div>
        </div>

        {/* Hero phone, cropped by the fold */}
        <div className="relative flex h-[540px] justify-center overflow-hidden sm:h-[635px]">
          <PhoneFit>
            <PhoneFrame label="شاشة «نعمة اليوم» في تطبيق الحمد: نعمة الإسلام مع آيتها من سورة المائدة">
              <PhoneHomeScreen />
            </PhoneFrame>
          </PhoneFit>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{background: 'linear-gradient(to bottom, transparent 55%, var(--l-page))'}}
          />
        </div>
      </section>

      {/* ═══ STORY ═══ */}
      <section id="story" className="scroll-mt-4 bg-ah-page px-5 pt-24 pb-28 sm:pt-[120px] sm:pb-[140px]">
        <div className="mx-auto flex max-w-[900px] flex-col gap-10">
          <Eyebrow>الفكرة</Eyebrow>
          <div className="relative flex flex-col gap-5 border-r-[1.5px] border-ah-stroke pr-6 font-serif text-[1.65rem] leading-[1.7] sm:pr-10 sm:text-[2.4rem]">
            <span aria-hidden="true" className="absolute -right-[5px] top-[18px] h-[9px] w-[9px] rounded-full bg-ah-stroke" />
            <p className="m-0">تستيقظ كلَّ صباحٍ فترى النور.</p>
            <p className="m-0">تشرب ماءً باردًا، وتسمع صوتًا تحبّه، وتمشي على قدميك إلى حيث تشاء.</p>
            <p className="m-0 text-ah-muted">ولا تلتفت.</p>
            <p className="m-0 text-ah-muted">فالنعمة إذا دامت صارت عادة، والعادة لا تُشكر.</p>
            <p className="m-0 font-bold text-ah-accent">و«الحمد» يعيد إليك النظر.</p>
          </div>
          <p className="m-0 max-w-[36em] text-[17px] leading-[1.9] text-ah-body">
            الطريقة قديمة قِدَم الشكر نفسه: <span className="font-semibold text-ah-text">استشعار القيمة</span>. لا تعرف قدر
            الشيء حتى تتخيّل فقده. فإذا تخيّلت، ثم عدت إليه فوجدته بين يديك، خرج الحمد من قلبك قبل لسانك.
          </p>
        </div>
      </section>

      {/* ═══ METHOD ═══ */}
      <section id="method" className="scroll-mt-4 border-t border-ah-hairline bg-ah-deep px-5 py-24 sm:py-[120px]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-[72px]">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-10">
            <div className="flex flex-col gap-3.5">
              <Eyebrow>التأمّل</Eyebrow>
              <SectionTitle>دقيقتان، وخمس وقفات</SectionTitle>
              <p className="m-0 max-w-[30em] text-[17px] leading-[1.9] text-ah-body">
                جملةٌ بعد جملة، على خلفيةٍ ساكنة. لا شيء يستعجلك، ولا شيء يشغلك عن النعمة.
              </p>
            </div>

            <ol className="m-0 flex list-none flex-col p-0">
              {steps.map((s, i) => {
                const last = i === steps.length - 1;
                return (
                  <li
                    key={s.title}
                    className={`relative pr-8 ${last ? '' : 'border-r-[1.5px] border-ah-stroke pb-8'}`}
                  >
                    {last ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-1.5 top-2 h-[13px] w-[13px] rounded-full bg-ah-accent"
                        style={{boxShadow: '0 0 0 6px var(--l-halo)'}}
                      />
                    ) : (
                      <span aria-hidden="true" className="absolute -right-[5px] top-2.5 h-[9px] w-[9px] rounded-full bg-ah-stroke" />
                    )}
                    <div className="flex flex-wrap items-baseline gap-3.5">
                      <h3 className={`m-0 font-serif text-2xl leading-normal font-bold ${last ? 'text-ah-accent' : ''}`}>
                        {s.title}
                      </h3>
                      <span className="text-[13px] text-ah-muted">{s.time}</span>
                    </div>
                    <p className="mt-1.5 mb-0 font-serif text-[19px] leading-[1.9] text-ah-body">{s.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mx-auto shrink-0">
            <PhoneFit>
              <PhoneFrame label="شاشة التأمّل «تخيّل الغياب»: جملةٌ واحدة على خلفيةٍ ساكنة، وزرّ «التالي»">
                <PhoneReflectScreen />
              </PhoneFrame>
            </PhoneFit>
          </div>
        </div>
      </section>

      {/* ═══ INSIDE THE APP ═══ */}
      <section id="inside" className="scroll-mt-4 bg-ah-ground px-5 py-24 sm:py-[120px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[36em] flex-col gap-3.5">
              <Eyebrow>في التطبيق</Eyebrow>
              <SectionTitle>خمسة أبواب، وغايةٌ واحدة</SectionTitle>
            </div>
            <p className="m-0 max-w-[26em] text-base leading-[1.9] text-ah-muted">
              كلّ ما في التطبيق يعينك على الشكر، ولا شيء فيه يشغلك عنه.
            </p>
          </div>

          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-x-16 border-t border-ah-hairline p-0">
            {features.map(({Icon, title, text}) => (
              <li key={title} className="flex items-start gap-5 border-b border-ah-hairline py-8">
                <Icon size={26} className="mt-1.5 shrink-0 text-ah-accent" />
                <div className="flex flex-col gap-1.5">
                  <h3 className="m-0 font-serif text-[26px] leading-normal font-bold">{title}</h3>
                  <p className="m-0 text-base leading-[1.8] text-ah-body">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ PROMISE ═══ */}
      <section id="promise" className="scroll-mt-4 border-t border-ah-hairline bg-ah-deep px-5 py-24 sm:py-[120px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-14">
          <div className="flex max-w-[40em] flex-col gap-3.5">
            <Eyebrow>خصوصيّتك ونيّتك</Eyebrow>
            <SectionTitle>الشكر عبادة قلب، فلا نزاحمه بشيء</SectionTitle>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-12">
            {promises.map((p) => (
              <div key={p.title} className="flex flex-col gap-3.5">
                <h3 className="m-0 font-serif text-[2.2rem] leading-[1.4] font-bold text-ah-accent">{p.title}</h3>
                <p className="m-0 text-base leading-[1.9] text-ah-body">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSING ═══ */}
      <section className="relative overflow-hidden bg-ah-page px-5 pt-28 pb-24 sm:pt-[140px] sm:pb-[120px]">
        <StarPattern id="endStar" className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{background: 'radial-gradient(45% 45% at 50% 35%, var(--l-cone), transparent)'}}
        />
        <div className="relative mx-auto flex max-w-[800px] flex-col items-center gap-8 text-center">
          <Wordmark large />
          <p className="m-0 font-serif text-[1.6rem] leading-[1.6] sm:text-[2rem]">كم نعمةً مرّت بك اليوم؟ ابدأ بواحدة.</p>
          <PrimaryCta />
          <span className="text-sm text-ah-muted">مجّانًا · بالعربية الفصحى · بلا حساب</span>
        </div>
      </section>

      <footer className="border-t border-ah-hairline bg-ah-page px-5 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 text-sm">
          <span className="text-ah-muted">الحمد · نعمةٌ كلَّ يوم · ١٤٤٨ هـ</span>
          <nav aria-label="روابط التذييل" className="flex flex-wrap gap-7">
            <button
              type="button"
              onClick={() => privacyRef.current?.showModal()}
              className="cursor-pointer border-0 bg-transparent p-0 font-sans text-sm text-ah-body transition-colors hover:text-ah-accent"
            >
              سياسة الخصوصية
            </button>
            {SUPPORT_EMAIL && (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-ah-body no-underline transition-colors hover:text-ah-accent"
              >
                تواصل معنا
              </a>
            )}
          </nav>
        </div>
      </footer>

      <PrivacyDialog dialogRef={privacyRef} />
    </div>
  );
}
