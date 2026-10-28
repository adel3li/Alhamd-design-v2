import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  UserCheck,
  SkipForward,
  SkipBack,
  Waves,
  Headphones,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toArabicNumerals } from '../../lib/arabic';

export interface ReciterOption {
  id: string;
  name: string;
  styleLabel: string;
  everyAyahFolder: string;
  islamicNetworkEdition: string;
}

export interface DhikrAudioTrack {
  id: string;
  dhikrPreset: string;
  title: string;
  verseText: string;
  surahRef: string;
  surahAyahCode: string; // e.g. '001002'
  globalAyahNumber: number;
}

export const RECITERS: ReciterOption[] = [
  {
    id: 'alafasy',
    name: 'مشاري راشد العفاسي',
    styleLabel: 'تلاوة ندية خاشعة',
    everyAyahFolder: 'Alafasy_128kbps',
    islamicNetworkEdition: 'ar.alafasy'
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    styleLabel: 'ترتيل متأنٍّ وواضح',
    everyAyahFolder: 'Husary_128kbps',
    islamicNetworkEdition: 'ar.husary'
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    styleLabel: 'صوت هادئ مطمئن',
    everyAyahFolder: 'MaherAlMuaiqly128kbps',
    islamicNetworkEdition: 'ar.mahermuaiqly'
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    styleLabel: 'خشوع وسكينة',
    everyAyahFolder: 'Minshawy_Murattal_128kbps',
    islamicNetworkEdition: 'ar.minshawi'
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    styleLabel: 'ترتيل أصيل',
    everyAyahFolder: 'Abdul_Basit_Murattal_192kbps',
    islamicNetworkEdition: 'ar.abdulbasitmurattal'
  }
];

export const DHIKR_AUDIO_TRACKS: DhikrAudioTrack[] = [
  {
    id: 'hamd',
    dhikrPreset: 'الْحَمْدُ لِلَّهِ',
    title: 'الحمد والثناء على الله',
    verseText: '﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    surahRef: 'سورة الفاتحة · آية ٢',
    surahAyahCode: '001002',
    globalAyahNumber: 2
  },
  {
    id: 'tasbih',
    dhikrPreset: 'سُبْحَانَ اللَّهِ',
    title: 'التسبيح في المساء والصباح',
    verseText: '﴿ فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ ﴾',
    surahRef: 'سورة الروم · آية ١٧',
    surahAyahCode: '030017',
    globalAyahNumber: 3426
  },
  {
    id: 'takbir',
    dhikrPreset: 'اللَّهُ أَكْبَرُ',
    title: 'التكبير والتعظيم لله',
    verseText: '﴿ وَقُلِ الْحَمْدُ لِلَّهِ الَّذِي لَمْ يَتَّخِذْ وَلَدًا ... وَكَبِّرْهُ تَكْبِيرًا ﴾',
    surahRef: 'سورة الإسراء · آية ١١١',
    surahAyahCode: '017111',
    globalAyahNumber: 2140
  },
  {
    id: 'tahlil',
    dhikrPreset: 'لا إِلَهَ إِلا اللَّهُ',
    title: 'التوحيد ودعوة ذي النون',
    verseText: '﴿ لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ ﴾',
    surahRef: 'سورة الأنبياء · آية ٨٧',
    surahAyahCode: '021087',
    globalAyahNumber: 2570
  },
  {
    id: 'istighfar',
    dhikrPreset: 'أَسْتَغْفِرُ اللَّهَ',
    title: 'الاستغفار والإنابة',
    verseText: '﴿ فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ﴾',
    surahRef: 'سورة نوح · آية ١٠',
    surahAyahCode: '071010',
    globalAyahNumber: 5429
  },
  {
    id: 'hawqala',
    dhikrPreset: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ',
    title: 'التوكل والتفويض لله',
    verseText: '﴿ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ ﴾',
    surahRef: 'سورة الكهف · آية ٣٩',
    surahAyahCode: '018039',
    globalAyahNumber: 2179
  },
  {
    id: 'salawat',
    dhikrPreset: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    title: 'الصلاة والسلام على النبي ﷺ',
    verseText: '﴿ إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا ﴾',
    surahRef: 'سورة الأحزاب · آية ٥٦',
    surahAyahCode: '033056',
    globalAyahNumber: 3589
  },
  {
    id: 'kursi',
    dhikrPreset: 'آية الكرسي',
    title: 'آية الكرسي — حفظ وسكينة',
    verseText: '﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ﴾',
    surahRef: 'سورة البقرة · آية ٢٥٥',
    surahAyahCode: '002255',
    globalAyahNumber: 262
  }
];

const STORAGE_RECITER_KEY = 'alhamd_tasbih_reciter_v1';
const STORAGE_VOLUME_KEY = 'alhamd_tasbih_volume_v1';

interface TasbihAudioPlayerProps {
  selectedDhikr: string;
  onSelectDhikr?: (dhikr: string) => void;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
}

export const TasbihAudioPlayer: React.FC<TasbihAudioPlayerProps> = ({
  selectedDhikr,
  onSelectDhikr,
  triggerHaptic
}) => {
  const [reciterId, setReciterId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_RECITER_KEY) || RECITERS[0].id;
  });

  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
    return 0.8;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [ambientPadEnabled, setAmbientPadEnabled] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);
  const fallbackSourceAttemptedRef = useRef<boolean>(false);

  // Web Audio API refs for optional serene ambient background pad
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscsRef = useRef<OscillatorNode[]>([]);

  const currentReciter =
    RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const currentTrack =
    DHIKR_AUDIO_TRACKS[activeTrackIndex] || DHIKR_AUDIO_TRACKS[0];

  const effectiveVolume = isMuted ? 0 : volume;

  // Sync track when user selects a Dhikr chip in the parent Tasbih screen
  useEffect(() => {
    const matchIdx = DHIKR_AUDIO_TRACKS.findIndex(
      (t) => t.dhikrPreset === selectedDhikr
    );
    if (matchIdx !== -1 && matchIdx !== activeTrackIndex) {
      setActiveTrackIndex(matchIdx);
    }
  }, [selectedDhikr]);

  // Persist reciter selection
  const handleSelectReciter = (newReciterId: string) => {
    setReciterId(newReciterId);
    try {
      localStorage.setItem(STORAGE_RECITER_KEY, newReciterId);
    } catch {
      // Ignore storage error
    }
    triggerHaptic?.('light');
  };

  // Persist volume changes
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(clamped));
    } catch {
      // Ignore storage error
    }
  };

  // Build primary and fallback stream URLs for the current track & reciter
  const getPrimaryUrl = useCallback(
    (track: DhikrAudioTrack, reciter: ReciterOption) => {
      return `https://everyayah.com/data/${reciter.everyAyahFolder}/${track.surahAyahCode}.mp3`;
    },
    []
  );

  const getFallbackUrl = useCallback(
    (track: DhikrAudioTrack, reciter: ReciterOption) => {
      return `https://cdn.islamic.network/quran/audio/128/${reciter.islamicNetworkEdition}/${track.globalAyahNumber}.mp3`;
    },
    []
  );

  // Offline / last-resort serene chime + Arabic speech synthesis fallback
  const playOfflineFallback = useCallback(
    (track: DhikrAudioTrack) => {
      try {
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = audioCtxRef.current || new AudioCtx();
          audioCtxRef.current = ctx;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(432, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(
            Math.max(0.02, effectiveVolume * 0.18),
            now + 0.25
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.5);
        }

        if ('speechSynthesis' in window && effectiveVolume > 0) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(track.dhikrPreset);
          utter.lang = 'ar-SA';
          utter.rate = 0.82;
          utter.volume = effectiveVolume;
          utter.onend = () => {
            setIsLoading(false);
            if (isLooping) {
              loopTimeoutRef.current = window.setTimeout(() => {
                setIsPlaying(false);
              }, 1800);
            } else {
              setIsPlaying(false);
            }
          };
          window.speechSynthesis.speak(utter);
          return;
        }
      } catch {
        // Ignore fallback audio errors
      }
      setIsLoading(false);
      setIsPlaying(false);
    },
    [effectiveVolume, isLooping]
  );

  // Manage Web Audio API serene harmonic pad ("أثير السكينة")
  useEffect(() => {
    if (!ambientPadEnabled || !isPlaying || effectiveVolume === 0) {
      if (ambientGainRef.current && audioCtxRef.current) {
        try {
          const now = audioCtxRef.current.currentTime;
          ambientGainRef.current.gain.setTargetAtTime(0.0001, now, 0.25);
        } catch {
          // Ignore
        }
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (ambientOscsRef.current.length === 0) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, ctx.currentTime);

        masterGain.connect(filter);
        filter.connect(ctx.destination);

        // Warm fifth harmonic intervals (144Hz + 216Hz) for calm contemplation
        const freqs = [144, 216];
        const oscs = freqs.map((f) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.connect(masterGain);
          osc.start();
          return osc;
        });

        ambientGainRef.current = masterGain;
        ambientOscsRef.current = oscs;
      }

      if (ambientGainRef.current) {
        ambientGainRef.current.gain.setTargetAtTime(
          effectiveVolume * 0.045,
          ctx.currentTime,
          0.4
        );
      }
    } catch {
      // Ignore Web Audio errors
    }
  }, [ambientPadEnabled, isPlaying, effectiveVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (ambientOscsRef.current.length > 0) {
        ambientOscsRef.current.forEach((osc) => {
          try {
            osc.stop();
          } catch {
            // Ignore
          }
        });
        ambientOscsRef.current = [];
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Update HTMLAudioElement volume immediately when volume or mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Load and play whenever track, reciter, or play state changes
  useEffect(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;
    audio.volume = effectiveVolume;

    if (!isPlaying) {
      audio.pause();
      setIsLoading(false);
      return;
    }

    fallbackSourceAttemptedRef.current = false;
    const targetUrl = getPrimaryUrl(currentTrack, currentReciter);
    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
      setProgressPercent(0);
    }

    setIsLoading(true);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          // Try fallback CDN before offline synthesis
          if (!fallbackSourceAttemptedRef.current) {
            fallbackSourceAttemptedRef.current = true;
            audio.src = getFallbackUrl(currentTrack, currentReciter);
            audio
              .play()
              .then(() => setIsLoading(false))
              .catch(() => playOfflineFallback(currentTrack));
          } else {
            playOfflineFallback(currentTrack);
          }
        });
    }
  }, [
    isPlaying,
    activeTrackIndex,
    reciterId,
    currentTrack,
    currentReciter,
    getPrimaryUrl,
    getFallbackUrl,
    playOfflineFallback
  ]);

  // Attach audio event listeners for progress and calm looping
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setProgressPercent(
          Math.min(100, Math.round((audio.currentTime / audio.duration) * 100))
        );
      }
    };

    const handleEnded = () => {
      setProgressPercent(100);
      if (isLooping) {
        // Gentle 2.2-second contemplative pause before repeating the dhikr
        loopTimeoutRef.current = window.setTimeout(() => {
          if (!audioRef.current) return;
          setProgressPercent(0);
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }, 2200);
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      if (!isPlaying) return;
      if (!fallbackSourceAttemptedRef.current) {
        fallbackSourceAttemptedRef.current = true;
        audio.src = getFallbackUrl(currentTrack, currentReciter);
        audio.play().catch(() => playOfflineFallback(currentTrack));
      } else {
        playOfflineFallback(currentTrack);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [
    isLooping,
    isPlaying,
    currentTrack,
    currentReciter,
    getFallbackUrl,
    playOfflineFallback
  ]);

  const togglePlay = () => {
    triggerHaptic?.('light');
    setIsPlaying((prev) => !prev);
  };

  const handleStepTrack = (direction: 'next' | 'prev') => {
    triggerHaptic?.('light');
    const total = DHIKR_AUDIO_TRACKS.length;
    const nextIdx =
      direction === 'next'
        ? (activeTrackIndex + 1) % total
        : (activeTrackIndex - 1 + total) % total;
    setActiveTrackIndex(nextIdx);
    const nextTrack = DHIKR_AUDIO_TRACKS[nextIdx];
    if (nextTrack && onSelectDhikr && nextTrack.dhikrPreset !== 'آية الكرسي') {
      onSelectDhikr(nextTrack.dhikrPreset);
    }
  };

  const VolumeIcon =
    effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className="w-full rounded-2xl border p-4 space-y-3.5 transition-all"
      style={{
        backgroundColor: 'var(--bg-raised)',
        borderColor: isPlaying ? 'rgba(228, 195, 104, 0.45)' : 'var(--border-hairline)'
      }}
      dir="rtl"
    >
      {/* Top Row: Title + Play/Pause Controls + Expand Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'إيقاف مؤقت لتلاوة الذكر' : 'تشغيل تلاوة الذكر الهادئة'}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#E4C368] text-[#15152A] shadow-[0_0_14px_rgba(228,195,104,0.45)]'
                : 'bg-[#6C63FF] hover:bg-[#594DFF] text-white'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="translate-x-[-1px]" />
            )}
          </button>

          <div className="text-right min-w-0">
            <div className="flex items-center gap-1.5">
              <Headphones size={13} className="text-[#E4C368] shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#EDEDF5] truncate">
                تلاوة الأذكار الهادئة
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#E4C368]/15 text-[#E4C368] text-[10px] font-bold">
                  يُتلى الآن
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#AEAECB] truncate">
              بصوت القارئ {currentReciter.name} · {currentTrack.title}
            </p>
          </div>
        </div>

        {/* Track Step & Collapse/Expand Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleStepTrack('prev')}
            title="المقطع السابق"
            aria-label="المقطع السابق"
            className="w-8 h-8 rounded-xl bg-[#15152A]/80 hover:bg-[#252547] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
          >
            <SkipForward size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleStepTrack('next')}
            title="المقطع التالي"
            aria-label="المقطع التالي"
            className="w-8 h-8 rounded-xl bg-[#15152A]/80 hover:bg-[#252547] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
          >
            <SkipBack size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((e) => !e)}
            aria-label={isExpanded ? 'طي إعدادات الصوت والقارئ' : 'فتح إعدادات الصوت والقارئ'}
            className="w-8 h-8 rounded-xl bg-[#15152A]/80 hover:bg-[#252547] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Verse Box & Subtle Progress Bar */}
      <div
        className="rounded-xl p-3 border text-right space-y-2"
        style={{
          backgroundColor: 'var(--bg-sunken)',
          borderColor: 'var(--border-hairline)'
        }}
      >
        <p className="font-serif text-xs sm:text-sm text-[#EDEDF5] leading-relaxed">
          {currentTrack.verseText}
        </p>
        <div className="flex items-center justify-between text-[11px] text-[#AEAECB]">
          <span>{currentTrack.surahRef}</span>
          <span className="text-[#E4C368] font-medium">{currentTrack.dhikrPreset}</span>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 rounded-full bg-[#1E1E38] overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-[#E4C368] to-[#6C63FF] transition-all duration-200"
            style={{ width: `${isPlaying ? Math.max(6, progressPercent) : 0}%` }}
          />
        </div>
      </div>

      {/* Expanded Controls: Reciter Selection, Volume Slider, Loop & Ambient Options */}
      {isExpanded && (
        <div className="space-y-3.5 pt-1 border-t border-[#2E2E4A]/70">
          {/* Reciter Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AEAECB] flex items-center gap-1.5 font-medium">
                <UserCheck size={13} className="text-[#E4C368]" />
                <span>اختيار القارئ:</span>
              </span>
              <span className="text-[11px] text-[#E4C368]">
                {currentReciter.styleLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {RECITERS.map((reciter) => {
                const active = reciter.id === reciterId;
                return (
                  <button
                    key={reciter.id}
                    type="button"
                    onClick={() => handleSelectReciter(reciter.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#6C63FF]/20 border-[#6C63FF] text-[#EDEDF5] font-bold shadow-sm'
                        : 'bg-[#15152A]/80 border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5]'
                    }`}
                  >
                    {reciter.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control Slider + Repeat & Ambient Serenity Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Volume Control */}
            <div
              className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-sunken)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                className="text-[#E4C368] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
              >
                <VolumeIcon size={17} />
              </button>

              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(effectiveVolume * 100)}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                aria-label="مستوى الصوت"
                className="w-full h-1.5 rounded-lg appearance-none bg-[#2E2E4A] accent-[#E4C368] cursor-pointer"
              />

              <span className="text-xs font-bold text-[#EDEDF5] w-10 text-left shrink-0">
                {toArabicNumerals(Math.round(effectiveVolume * 100))}٪
              </span>
            </div>

            {/* Repeat & Calm Ambient Pad Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic?.('light');
                  setIsLooping((l) => !l);
                }}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isLooping
                    ? 'bg-[#E4C368]/15 border-[#E4C368]/45 text-[#E4C368]'
                    : 'bg-[#15152A]/80 border-[#2E2E4A] text-[#AEAECB]'
                }`}
                title="تكرار تلقائي هادئ للذكر"
              >
                <Repeat size={13} />
                <span>تكرار هادئ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic?.('light');
                  setAmbientPadEnabled((a) => !a);
                }}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  ambientPadEnabled
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF]/50 text-[#EDEDF5]'
                    : 'bg-[#15152A]/80 border-[#2E2E4A] text-[#AEAECB]'
                }`}
                title="إضافة خلفية صوتية هادئة أثناء التلاوة"
              >
                <Waves size={13} />
                <span>أثير السكينة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
