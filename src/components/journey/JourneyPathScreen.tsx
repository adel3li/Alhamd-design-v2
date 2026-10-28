import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  SlidersHorizontal,
  HandHeart,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { getBlessingById } from '../../data/loader';
import { useStore, JourneyStage } from '../../lib/store';
import {
  isPremium,
  getDeveloperPremiumSync,
  ENTITLEMENT_CHANGED_EVENT,
  FREE_STATION_LIMIT
} from '../../lib/entitlements';
import {
  hasCompletedJourneyOnboarding,
  getStageContent,
  getStationContent,
  makeStationId,
  hasMissedDaysRecently
} from '../../lib/journeyStore';
import { trackJourneyEvent } from '../../lib/analytics';
import { toArabicNumerals } from '../../lib/arabic';
import { getFormattedHijriDate } from '../../lib/hijri';
import { GlassCard } from '../common/GlassCard';
import { ShareCardModal } from '../common/ShareCardModal';
import { JourneyOnboarding } from './JourneyOnboarding';
import { JourneyStationFlow } from './JourneyStationFlow';
import { JourneyMuhasabaScreen } from './JourneyMuhasabaScreen';
import { PremiumPaywallScreen } from './PremiumPaywallScreen';
import { JourneyWeeklyProgressChart } from './JourneyWeeklyProgressChart';
import { ReflectionCategoryCharts } from '../common/ReflectionCategoryCharts';

interface CurvedPathConnectorProps {
  /** Horizontal offset (px) of the upper node */
  fromOffsetPx: number;
  /** Horizontal offset (px) of the lower node */
  toOffsetPx: number;
  /** Visual state of this path segment (remembering that ascent is from bottom to top) */
  status: 'completed' | 'ascending' | 'upcoming';
  /** Unique id for SVG gradient definitions */
  gradientId: string;
  /** Optional height of the connector in pixels */
  height?: number;
}

/**
 * Delicate cubic-bezier SVG connector between two vertically adjacent stations.
 * Uses dir="ltr" on the SVG container so horizontal coordinates align 1:1 with CSS translateX(px).
 */
const CurvedPathConnector: React.FC<CurvedPathConnectorProps> = ({
  fromOffsetPx,
  toOffsetPx,
  status,
  gradientId,
  height = 64
}) => {
  const width = 240;
  const centerX = width / 2;
  const x1 = centerX + fromOffsetPx;
  const x2 = centerX + toOffsetPx;
  const y1 = 3;
  const y2 = height - 3;
  const midY = height / 2;
  const midX = (x1 + x2) / 2;

  // Smooth vertical S-curve from upper station (x1, y1) to lower station (x2, y2)
  const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  return (
    <svg
      dir="ltr"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className="overflow-visible pointer-events-none select-none my-0.5 shrink-0"
    >
      {status === 'ascending' && (
        <defs>
          <linearGradient id={gradientId} x1={x2} y1={y2} x2={x1} y2={y1} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9D97FF" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      )}

      {/* Soft ambient under-glow for completed or active ascending segments */}
      {(status === 'completed' || status === 'ascending') && (
        <path
          d={pathD}
          stroke="#6C63FF"
          strokeOpacity={status === 'ascending' ? 0.2 : 0.12}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}

      {/* Primary delicate curved line */}
      {status === 'completed' && (
        <>
          <path
            d={pathD}
            stroke="#6C63FF"
            strokeOpacity={0.55}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
          {/* Quiet mid-curve breath dot */}
          <circle
            cx={midX}
            cy={midY}
            r={2}
            fill="#6C63FF"
            fillOpacity={0.5}
          />
        </>
      )}

      {status === 'ascending' && (
        <>
          <path
            d={pathD}
            stroke={`url(#${gradientId})`}
            strokeWidth={1.85}
            strokeLinecap="round"
          />
          <circle
            cx={x1}
            cy={y1}
            r={2.2}
            fill="#9D97FF"
            fillOpacity={0.85}
          />
          <circle
            cx={x2}
            cy={y2}
            r={2}
            fill="#6C63FF"
            fillOpacity={0.65}
          />
        </>
      )}

      {status === 'upcoming' && (
        <>
          <path
            d={pathD}
            stroke="#2E2E4A"
            strokeWidth={1.5}
            strokeDasharray="3 6"
            strokeLinecap="round"
          />
          {/* Tiny hollow midpoint dot to reinforce quiet continuity */}
          <circle
            cx={midX}
            cy={midY}
            r={1.75}
            fill="#15152A"
            stroke="#2E2E4A"
            strokeWidth={1.2}
          />
        </>
      )}
    </svg>
  );
};

export const JourneyPathScreen: React.FC = () => {
  const {
    journeyState: state,
    completedDays,
    completeJourneyOnboardingState,
    completeJourneyStationState,
    saveJourneyStageMuhasaba,
    notificationTime,
    setNotificationTime,
    setNotificationsEnabled,
    addJournalEntry,
    triggerHaptic
  } = useStore();

  const [premiumStatus, setPremiumStatus] = useState<boolean>(() => getDeveloperPremiumSync());
  const [entitlementLoaded, setEntitlementLoaded] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [paywallContext, setPaywallContext] = useState<{
    reason: 'free_limit_reached' | 'preview';
    targetStationTitle?: string;
  }>({ reason: 'free_limit_reached' });

  const openPaywall = (
    reason: 'free_limit_reached' | 'preview' = 'free_limit_reached',
    targetStationTitle?: string
  ) => {
    setPaywallContext({ reason, targetStationTitle });
    setShowPaywall(true);
  };

  // Active station session
  const [activeSession, setActiveSession] = useState<{
    stageId: string;
    stageTitle: string;
    stationIndex: number;
    stationId: string;
    blessingId: string;
  } | null>(null);

  // Active Muhasaba screen
  const [activeMuhasabaStageId, setActiveMuhasabaStageId] = useState<string | null>(null);

  // Station & blessing detail popup modal
  const [inspectedStation, setInspectedStation] = useState<{
    stageId: string;
    stageTitle: string;
    stationIndex: number;
    stationId: string;
    blessingId: string;
  } | null>(null);
  const [showPopupTadabbur, setShowPopupTadabbur] = useState<boolean>(false);
  const [copiedPopupBlessing, setCopiedPopupBlessing] = useState<boolean>(false);
  const [popupShareModalData, setPopupShareModalData] = useState<{
    open: boolean;
    type: 'ayah' | 'tadabbur';
  }>({ open: false, type: 'ayah' });
  const [journeyTab, setJourneyTab] = useState<'path' | 'stats'>('path');
  const [activeStageIdView, setActiveStageIdView] = useState<string | null>(null);

  // Reset collapsible Tadabbur section when switching inspected station
  useEffect(() => {
    setShowPopupTadabbur(false);
    setCopiedPopupBlessing(false);
  }, [inspectedStation?.stationId]);

  const currentStationRef = useRef<HTMLDivElement | null>(null);

  // Check entitlement and listen for changes
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const prem = await isPremium();
      if (!mounted) return;
      setPremiumStatus(prem);
      setEntitlementLoaded(true);
    };
    check();

    const handleEntitlementChange = () => {
      check();
    };

    window.addEventListener(ENTITLEMENT_CHANGED_EVENT, handleEntitlementChange);
    return () => {
      mounted = false;
      window.removeEventListener(ENTITLEMENT_CHANGED_EVENT, handleEntitlementChange);
    };
  }, []);

  // Determine revealed stages:
  // Free users: first stage only.
  // Premium users: Stage 0 is always revealed; Stage k is revealed once Stage k-1 has all 7 stations completed AND muhasaba[stage_{k-1}.id] is completed.
  const revealedStages = React.useMemo(() => {
    if (!premiumStatus) {
      return state.stages.slice(0, 1);
    }
    const list: JourneyStage[] = [];
    for (let i = 0; i < state.stages.length; i++) {
      const stg = state.stages[i];
      list.push(stg);
      const all7Done = stg.stationBlessingIds.every((_, idx) =>
        Boolean(state.completed[makeStationId(stg.id, idx)])
      );
      const muhasabaDone = Boolean(state.muhasaba[stg.id]);
      if (!all7Done || !muhasabaDone) {
        break;
      }
    }
    return list;
  }, [state.stages, state.completed, state.muhasaba, premiumStatus]);

  // Find current location pointer (first uncompleted station across stages)
  const currentPointer = React.useMemo(() => {
    for (let sIdx = 0; sIdx < state.stages.length; sIdx++) {
      const stg = state.stages[sIdx];
      for (let stIdx = 0; stIdx < stg.stationBlessingIds.length; stIdx++) {
        const stId = makeStationId(stg.id, stIdx);
        if (!state.completed[stId]) {
          return {
            stageIndex: sIdx,
            stage: stg,
            stationIndex: stIdx,
            stationNumber: stIdx + 1,
            stationId: stId,
            blessingId: stg.stationBlessingIds[stIdx],
            allCompleted: false
          };
        }
      }
    }
    // All stages completed
    const lastStage = state.stages[state.stages.length - 1];
    return {
      stageIndex: state.stages.length - 1,
      stage: lastStage,
      stationIndex: 6,
      stationNumber: 7,
      stationId: makeStationId(lastStage.id, 6),
      blessingId: lastStage.stationBlessingIds[6],
      allCompleted: true
    };
  }, [state.stages, state.completed]);

  const totalCompletedCount = Object.keys(state.completed).length;
  const freeTasteLimitReached = !premiumStatus && totalCompletedCount >= FREE_STATION_LIMIT;
  const dailyPaceReached = state.unlockedTodayCount >= state.pace;
  const showGentleReturnBanner = hasMissedDaysRecently(state);

  // Scroll to current station softly on initial render
  useEffect(() => {
    if (entitlementLoaded && !showOnboarding && currentStationRef.current) {
      const timer = setTimeout(() => {
        currentStationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [entitlementLoaded, showOnboarding]);

  const handleOnboardingComplete = (params: {
    focusThemes: string[];
    pace: 1 | 2;
    reminderTime: string | null;
  }) => {
    completeJourneyOnboardingState(params);
    if (params.reminderTime) {
      setNotificationTime(params.reminderTime);
      setNotificationsEnabled(true);
    }
    trackJourneyEvent('journey_onboarded', {
      themes_count: params.focusThemes.length,
      pace: params.pace
    });
    setShowOnboarding(false);
    triggerHaptic('light');
  };

  const handleSelectStation = (
    stage: JourneyStage,
    stationIndex: number
  ) => {
    triggerHaptic('light');
    const stationId = makeStationId(stage.id, stationIndex);
    setInspectedStation({
      stageId: stage.id,
      stageTitle: stage.title,
      stationIndex,
      stationId,
      blessingId: stage.stationBlessingIds[stationIndex]
    });
  };

  const handleStartStation = (
    stage: JourneyStage,
    stationIndex: number
  ) => {
    triggerHaptic('light');
    const stationId = makeStationId(stage.id, stationIndex);
    const isCompleted = Boolean(state.completed[stationId]);

    if (isCompleted) {
      setInspectedStation({
        stageId: stage.id,
        stageTitle: stage.title,
        stationIndex,
        stationId,
        blessingId: stage.stationBlessingIds[stationIndex]
      });
      return;
    }

    // Free user gating: only first FREE_STATION_LIMIT stations of stage 0 are free
    if (!premiumStatus && (stationIndex >= FREE_STATION_LIMIT || totalCompletedCount >= FREE_STATION_LIMIT)) {
      const targetBlessing = getBlessingById(stage.stationBlessingIds[stationIndex]);
      openPaywall('free_limit_reached', targetBlessing?.shortTitle || targetBlessing?.title);
      return;
    }

    // Check if this is the current next station and daily pace allows
    const isCurrentNext = currentPointer.stationId === stationId;
    if (!isCurrentNext || dailyPaceReached) {
      setInspectedStation({
        stageId: stage.id,
        stageTitle: stage.title,
        stationIndex,
        stationId,
        blessingId: stage.stationBlessingIds[stationIndex]
      });
      return;
    }

    setActiveSession({
      stageId: stage.id,
      stageTitle: stage.title,
      stationIndex,
      stationId,
      blessingId: stage.stationBlessingIds[stationIndex]
    });
  };

  const persistStationCompletion = (
    session: {
      stageId: string;
      stageTitle: string;
      stationIndex: number;
      stationId: string;
      blessingId: string;
    },
    journalText?: string
  ) => {
    const { stageId, stationIndex, stationId, blessingId } = session;
    const alreadyCompleted = Boolean(state.completed[stationId]);

    const updatedState = completeJourneyStationState({
      stationId,
      journalText
    });

    if (journalText && journalText.trim().length > 0) {
      const blessing = getBlessingById(blessingId);
      addJournalEntry({
        blessingId,
        shortTitle: blessing?.shortTitle || blessing?.title || 'محطة تأمل',
        categoryLabel: blessing?.categoryLabel || 'رحلتي',
        text: journalText.trim()
      });
    }

    if (!alreadyCompleted) {
      trackJourneyEvent('journey_station_completed', {
        stage_id: stageId,
        station_index: stationIndex + 1
      });
    }

    return updatedState;
  };

  /**
   * Computes previous/next navigation availability within the same stage (منزل),
   * strictly adhering to the original path order, daily pacing, and free-tier rules.
   */
  const getIntraStageNavigation = (stageId: string, stationIndex: number) => {
    const stageObj = state.stages.find((s) => s.id === stageId);
    if (!stageObj) {
      return {
        totalStations: 7,
        isCurrentStationCompleted: false,
        canNavigatePrev: false,
        canNavigateNext: false,
        isNextBlockedByFree: false,
        prevStationTitle: undefined as string | undefined,
        nextStationTitle: undefined as string | undefined,
        nextBlockedReason: ''
      };
    }

    const totalStations = stageObj.stationBlessingIds.length;
    const currentStationId = makeStationId(stageObj.id, stationIndex);
    const isCurrentStationCompleted = Boolean(state.completed[currentStationId]);

    // Previous station in the same stage: allowed whenever stationIndex > 0
    // (since the user could only reach stationIndex if all previous stations in the stage were completed in order)
    const canNavigatePrev = stationIndex > 0;
    const prevBlessing = canNavigatePrev
      ? getBlessingById(stageObj.stationBlessingIds[stationIndex - 1])
      : undefined;

    // Next station in the same stage: strictly requires the current station to be completed first,
    // and the next station to be either already completed or the unlocked active station for today.
    const hasNextInStage = stationIndex < totalStations - 1;
    const nextIdx = stationIndex + 1;
    const nextStationId = hasNextInStage ? makeStationId(stageObj.id, nextIdx) : '';
    const isNextCompleted = hasNextInStage ? Boolean(state.completed[nextStationId]) : false;
    const isNextBlockedByFree =
      !premiumStatus && (nextIdx >= FREE_STATION_LIMIT || totalCompletedCount >= FREE_STATION_LIMIT);
    const isNextCurrentUnlocked =
      hasNextInStage &&
      currentPointer.stationId === nextStationId &&
      !dailyPaceReached &&
      !isNextBlockedByFree;

    const canNavigateNext =
      hasNextInStage &&
      isCurrentStationCompleted &&
      (isNextCompleted || isNextCurrentUnlocked);

    const nextBlessing = hasNextInStage
      ? getBlessingById(stageObj.stationBlessingIds[nextIdx])
      : undefined;

    let nextBlockedReason = '';
    if (hasNextInStage && !canNavigateNext) {
      if (!isCurrentStationCompleted) {
        nextBlockedReason = 'أكمل هذه المحطة أولًا للانتقال إلى المحطة التالية بالترتيب';
      } else if (isNextBlockedByFree) {
        nextBlockedReason = 'المحطة التالية متاحة ضمن رحلتك الخاصة';
      } else if (dailyPaceReached && !isNextCompleted) {
        nextBlockedReason = 'أتممت محطة اليوم، نلتقي غدًا بإذن الله';
      } else {
        nextBlockedReason = 'التزم بترتيب المسار للانتقال إلى المحطة التالية';
      }
    }

    return {
      stageObj,
      totalStations,
      isCurrentStationCompleted,
      canNavigatePrev,
      canNavigateNext,
      isNextBlockedByFree,
      prevStationTitle: prevBlessing?.shortTitle || prevBlessing?.title,
      nextStationTitle: nextBlessing?.shortTitle || nextBlessing?.title,
      nextBlockedReason
    };
  };

  const handleNavigateActiveSession = (targetStationIndex: number) => {
    if (!activeSession) return;
    const stageObj = state.stages.find((s) => s.id === activeSession.stageId);
    if (!stageObj) return;
    if (targetStationIndex < 0 || targetStationIndex >= stageObj.stationBlessingIds.length) {
      return;
    }

    const targetStationId = makeStationId(stageObj.id, targetStationIndex);
    setActiveSession({
      stageId: stageObj.id,
      stageTitle: stageObj.title,
      stationIndex: targetStationIndex,
      stationId: targetStationId,
      blessingId: stageObj.stationBlessingIds[targetStationIndex]
    });
  };

  const handleSessionReachClosing = (journalText?: string) => {
    if (!activeSession) return;
    persistStationCompletion(activeSession, journalText);
  };

  const handleSessionComplete = (journalText?: string) => {
    if (!activeSession) return;
    const { stageId, stationIndex } = activeSession;

    const updatedState = persistStationCompletion(activeSession, journalText);

    setActiveSession(null);

    // If station 7 (index 6) of the stage was just completed, open «وقفة محاسبة»
    const stageObj = updatedState.stages.find((s) => s.id === stageId);
    if (stageObj && stationIndex === stageObj.stationBlessingIds.length - 1) {
      setActiveMuhasabaStageId(stageId);
    } else if (!premiumStatus && Object.keys(updatedState.completed).length >= FREE_STATION_LIMIT) {
      // Free user just finished their 2nd free station -> gently show paywall when they return
      setTimeout(() => {
        openPaywall('free_limit_reached');
      }, 450);
    }
  };

  const handleSaveMuhasaba = (q1: string, q2: string) => {
    if (!activeMuhasabaStageId) return;
    saveJourneyStageMuhasaba(activeMuhasabaStageId, q1, q2);
    trackJourneyEvent('journey_stage_completed', {
      stage_id: activeMuhasabaStageId
    });
    setActiveMuhasabaStageId(null);
    triggerHaptic('light');
  };

  if (!entitlementLoaded) {
    return null;
  }

  if (showOnboarding) {
    return (
      <JourneyOnboarding
        initialThemes={state.focusThemes}
        initialPace={state.pace}
        initialReminderTime={state.reminderTime || notificationTime}
        isEditing={hasCompletedJourneyOnboarding()}
        onComplete={handleOnboardingComplete}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  // Gentle RTL horizontal winding offsets (in px) for compact stations 1..7 (indices 0..6).
  const getWindingOffsetPx = (index: number): number => {
    const pattern = [0, 22, 34, 10, -20, -32, -10];
    return pattern[index % pattern.length];
  };

  const themeLabelsMap: Record<string, string> = {
    din: 'العبادات',
    afiyah: 'البدن',
    nasl: 'الأهل والمودة',
    rizq: 'الرزق والسكينة'
  };
  const activeThemesSummary = state.focusThemes
    .map((t) => themeLabelsMap[t] || t)
    .join('، ');

  const displayedStage =
    revealedStages.find((s) => s.id === activeStageIdView) ||
    currentPointer.stage ||
    revealedStages[revealedStages.length - 1];

  return (
    <div
      className="w-full pb-20 pt-2 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-3.5 animate-fade-in"
      dir="rtl"
    >
      {/* Compact Top Bar: Location + View Switcher (المسار / الإحصائيات) + Customize Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-[#1E1E38]/90 border border-[#2E2E4A] rounded-2xl px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-[#EDEDF5] truncate">
            المحطة {toArabicNumerals(currentPointer.stationNumber)} من {toArabicNumerals(7)} · {currentPointer.stage.title}
          </span>
          <span className="hidden sm:inline text-[11px] text-[#AEAECB]">
            ({activeThemesSummary})
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Segmented View Toggle: المسار vs الإحصائيات (eliminates vertical chart scrolling) */}
          <div className="flex items-center bg-[#15152A] p-0.5 rounded-xl border border-[#2E2E4A]">
            <button
              type="button"
              onClick={() => setJourneyTab('path')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                journeyTab === 'path'
                  ? 'bg-[#6C63FF] text-white'
                  : 'text-[#AEAECB] hover:text-[#EDEDF5]'
              }`}
            >
              مسار الرحلة
            </button>
            <button
              type="button"
              onClick={() => setJourneyTab('stats')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                journeyTab === 'stats'
                  ? 'bg-[#6C63FF] text-white'
                  : 'text-[#AEAECB] hover:text-[#EDEDF5]'
              }`}
            >
              الإحصائيات
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="h-7 px-2.5 rounded-xl bg-[#15152A] hover:bg-[#25232E] border border-[#2E2E4A] text-[#C7C4D8] hover:text-[#EDEDF5] flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
            title="تخصيص محاور الاهتمام ووتيرة التقدم اليومية"
            aria-label="تخصيص الرحلة"
          >
            <SlidersHorizontal size={12} className="text-[#6C63FF]" />
            <span>تخصيص</span>
          </button>
        </div>
      </div>

      {/* Stage Selector Pills (only shown if user has unlocked more than 1 stage) */}
      {journeyTab === 'path' && revealedStages.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {revealedStages.map((stg, idx) => {
            const isSelected = stg.id === displayedStage.id;
            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => setActiveStageIdView(stg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF] text-[#EDEDF5]'
                    : 'bg-[#1E1E38]/70 border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5]'
                }`}
              >
                {toArabicNumerals(idx + 1)}. {stg.title}
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 1: Compact Single-Screen Journey Path */}
      {journeyTab === 'path' && displayedStage && (() => {
        const stage = displayedStage;
        const stageContent = getStageContent(stage.id, stage.theme);
        const intentionText =
          stage.intention ||
          stageContent?.intention.text ||
          'في هذا المنزل نتأمل نِعَم الله التي تحيط بنا في كل حين.';

        const completedInStage = stage.stationBlessingIds.filter((_, idx) =>
          Boolean(state.completed[makeStationId(stage.id, idx)])
        ).length;
        const all7Completed = completedInStage === stage.stationBlessingIds.length;
        const muhasabaSaved = Boolean(state.muhasaba[stage.id]);

        const stationIndicesUpward = [6, 5, 4, 3, 2, 1, 0];
        const topStationOffsetPx = getWindingOffsetPx(6);

        return (
          <GlassCard padding="p-4 sm:p-5" className="space-y-3">
            {/* Compact Stage Header + Quick Open Current Station CTA */}
            <header className="pb-3 border-b border-[#2E2E4A]/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-right min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-[#AEAECB]">
                  <span className="font-semibold text-[#E4C368]">{stage.title}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {toArabicNumerals(completedInStage)} / {toArabicNumerals(7)} مكتملة
                  </span>
                  {dailyPaceReached && !freeTasteLimitReached && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C7C4D8]">أتممت ورد اليوم</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#C7C4D8] truncate mt-0.5">
                  {intentionText}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSelectStation(currentPointer.stage, currentPointer.stationIndex)
                }
                className="px-3.5 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#594DFF] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
              >
                فتح المحطة الحالية
              </button>
            </header>

            {/* Compact End-of-stage «وقفة محاسبة» Summit Node */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!all7Completed}
                onClick={() => {
                  if (all7Completed) {
                    triggerHaptic('light');
                    setActiveMuhasabaStageId(stage.id);
                  }
                }}
                className={`w-full max-w-xs py-2 px-3.5 rounded-xl border text-center transition-all ${
                  muhasabaSaved
                    ? 'bg-[#232342] border-[#6C63FF]/50 text-[#EDEDF5] cursor-pointer'
                    : all7Completed
                    ? 'bg-[#6C63FF]/15 border-[#6C63FF] text-[#EDEDF5] shadow-[0_0_16px_rgba(108,99,255,0.25)] cursor-pointer'
                    : 'bg-[#15152A]/50 border border-dashed border-[#2E2E4A] text-[#AEAECB]/65 cursor-default'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  {muhasabaSaved && <Check size={13} className="text-[#EDEDF5]" />}
                  <span>وقفة محاسبة · {stage.title}</span>
                  <span className="text-[10px] font-normal text-[#AEAECB]">
                    ({muhasabaSaved ? 'مكتملة' : all7Completed ? 'ابدأ الآن' : 'بعد السبع'})
                  </span>
                </div>
              </button>

              <CurvedPathConnector
                fromOffsetPx={0}
                toOffsetPx={topStationOffsetPx}
                status={
                  muhasabaSaved
                    ? 'completed'
                    : all7Completed
                    ? 'ascending'
                    : 'upcoming'
                }
                gradientId={`grad-muhasaba-${stage.id}`}
                height={20}
              />
            </div>

            {/* Compact Winding Path of 7 Stations (Fits in Viewport Without Scrolling) */}
            <div className="relative flex flex-col items-center overflow-hidden">
              {stationIndicesUpward.map((stationIdx, renderPosition) => {
                const stationNumber = stationIdx + 1;
                const stationId = makeStationId(stage.id, stationIdx);
                const blessingId = stage.stationBlessingIds[stationIdx];
                const blessing = getBlessingById(blessingId);
                const isCompleted = Boolean(state.completed[stationId]);

                const isNextUncompleted =
                  !isCompleted &&
                  currentPointer.stationId === stationId &&
                  !currentPointer.allCompleted;
                const isCurrentActive = isNextUncompleted;

                const offsetPx = getWindingOffsetPx(stationIdx);

                const hasLowerStation = renderPosition < stationIndicesUpward.length - 1;
                const lowerStationIdx = stationIdx - 1;
                const lowerStationId = hasLowerStation
                  ? makeStationId(stage.id, lowerStationIdx)
                  : '';
                const isLowerCompleted = hasLowerStation
                  ? Boolean(state.completed[lowerStationId])
                  : false;
                const lowerOffsetPx = hasLowerStation
                  ? getWindingOffsetPx(lowerStationIdx)
                  : 0;

                const connectorStatus: 'completed' | 'ascending' | 'upcoming' =
                  isLowerCompleted && isCompleted
                    ? 'completed'
                    : isLowerCompleted && isNextUncompleted
                    ? 'ascending'
                    : 'upcoming';

                return (
                  <React.Fragment key={stationId}>
                    <div
                      ref={isNextUncompleted ? currentStationRef : undefined}
                      style={{ transform: `translateX(${offsetPx}px)` }}
                      className="relative z-10 flex items-center justify-center transition-transform duration-300"
                    >
                      {/* Horizontal Station Pill Node: Circle + Inline Title & Status (saves 60% vertical height!) */}
                      <button
                        type="button"
                        onClick={() => handleSelectStation(stage, stationIdx)}
                        aria-label={`المحطة ${toArabicNumerals(stationNumber)}: ${blessing?.shortTitle || ''}`}
                        className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition-all select-none cursor-pointer active:scale-95 ${
                          isCompleted
                            ? 'bg-[#232342]/90 border-[#6C63FF]/55 text-[#EDEDF5] hover:border-[#6C63FF]'
                            : isCurrentActive
                            ? 'bg-[#6C63FF]/20 border-2 border-[#6C63FF] text-[#EDEDF5] shadow-[0_0_20px_rgba(108,99,255,0.35)]'
                            : 'bg-[#15152A]/85 border border-dashed border-[#2E2E4A] text-[#AEAECB]/80 hover:border-[#6C63FF]/40 hover:text-[#EDEDF5]'
                        }`}
                      >
                        {/* Station Number / Check Badge */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-[#6C63FF]/25 text-[#E4C368] border border-[#6C63FF]/50'
                              : isCurrentActive
                              ? 'bg-[#6C63FF] text-white shadow-sm'
                              : 'bg-[#1E1E38] text-[#AEAECB] border border-[#2E2E4A]'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={16} className="text-[#E4C368]" strokeWidth={2.4} />
                          ) : (
                            toArabicNumerals(stationNumber)
                          )}
                        </div>

                        {/* Inline Title & Status */}
                        <div className="text-right min-w-[130px] sm:min-w-[155px]">
                          <div className="text-xs sm:text-sm font-bold text-[#EDEDF5] leading-tight">
                            {blessing?.shortTitle || blessing?.title || `المحطة ${toArabicNumerals(stationNumber)}`}
                          </div>
                          <div className="text-[10px] text-[#AEAECB] mt-0.5">
                            {isCompleted
                              ? 'مكتملة · عرض النعمة'
                              : isCurrentActive
                              ? 'المحطة الحالية · ابدأ التدبر'
                              : 'محطة قادمة · معاينة'}
                          </div>
                        </div>
                      </button>
                    </div>

                    {hasLowerStation && (
                      <CurvedPathConnector
                        fromOffsetPx={offsetPx}
                        toOffsetPx={lowerOffsetPx}
                        status={connectorStatus}
                        gradientId={`grad-${stage.id}-${stationIdx}`}
                        height={22}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </GlassCard>
        );
      })()}

      {/* TAB 2: Charts & Self-Awareness Analytics (Only rendered when user switches to الإحصائيات tab) */}
      {journeyTab === 'stats' && (
        <div className="space-y-5 animate-fade-in">
          <JourneyWeeklyProgressChart
            journeyState={state}
            completedDays={completedDays}
          />
          <ReflectionCategoryCharts variant="journey" />
        </div>
      )}

      {/* Active Station Session Modal */}
      {activeSession && (() => {
        const blessing = getBlessingById(activeSession.blessingId);
        if (!blessing) return null;
        const stContent = getStationContent(
          activeSession.stageId,
          activeSession.stationIndex,
          activeSession.blessingId
        );
        const navInfo = getIntraStageNavigation(
          activeSession.stageId,
          activeSession.stationIndex
        );

        return (
          <JourneyStationFlow
            key={activeSession.stationId}
            blessing={blessing}
            stationNumber={activeSession.stationIndex + 1}
            totalStationsInStage={navInfo.totalStations}
            stageTitle={activeSession.stageTitle}
            stationContent={stContent}
            initialJournalText={state.journal[activeSession.stationId] || ''}
            isStationCompleted={navInfo.isCurrentStationCompleted}
            canNavigatePrev={navInfo.canNavigatePrev}
            canNavigateNext={navInfo.canNavigateNext}
            isNextBlockedByFree={navInfo.isNextBlockedByFree}
            prevStationTitle={navInfo.prevStationTitle}
            nextStationTitle={navInfo.nextStationTitle}
            nextBlockedReason={navInfo.nextBlockedReason}
            onNavigatePrev={() =>
              handleNavigateActiveSession(activeSession.stationIndex - 1)
            }
            onNavigateNext={() =>
              handleNavigateActiveSession(activeSession.stationIndex + 1)
            }
            onTriggerPaywall={() => {
              setActiveSession(null);
              openPaywall('free_limit_reached', navInfo.nextStationTitle);
            }}
            onClose={() => setActiveSession(null)}
            onReachClosing={handleSessionReachClosing}
            onComplete={handleSessionComplete}
            triggerHaptic={triggerHaptic}
          />
        );
      })()}

      {/* Active Stage Muhasaba Screen */}
      {activeMuhasabaStageId && (() => {
        const stageObj = state.stages.find((s) => s.id === activeMuhasabaStageId);
        if (!stageObj) return null;
        return (
          <JourneyMuhasabaScreen
            stage={stageObj}
            journalMap={state.journal}
            initialAnswers={state.muhasaba[stageObj.id]}
            onClose={() => setActiveMuhasabaStageId(null)}
            onSave={handleSaveMuhasaba}
          />
        );
      })()}

      {/* Station & Blessing Details Popup Modal — Compact & Fits Viewport Like HomeScreen Card */}
      {inspectedStation && (() => {
        const blessing = getBlessingById(inspectedStation.blessingId);
        const savedJournal = state.journal[inspectedStation.stationId];
        const stageObj = state.stages.find((s) => s.id === inspectedStation.stageId);
        const totalStationsInInspectedStage = stageObj?.stationBlessingIds.length || 7;

        const isInspectCompleted = Boolean(state.completed[inspectedStation.stationId]);
        const isInspectNextUncompleted =
          currentPointer.stationId === inspectedStation.stationId && !currentPointer.allCompleted;
        const isInspectBlockedByFree =
          !premiumStatus && (inspectedStation.stationIndex >= 2 || totalCompletedCount >= 2);

        const stationState: 'completed' | 'current' | 'upcoming' = isInspectCompleted
          ? 'completed'
          : isInspectNextUncompleted
          ? 'current'
          : 'upcoming';

        const canBrowsePrevInModal = inspectedStation.stationIndex > 0;
        const canBrowseNextInModal =
          inspectedStation.stationIndex < totalStationsInInspectedStage - 1;

        const handleNavigateInspected = (targetIdx: number) => {
          if (!stageObj) return;
          if (targetIdx < 0 || targetIdx >= stageObj.stationBlessingIds.length) return;
          const targetStationId = makeStationId(stageObj.id, targetIdx);
          triggerHaptic('light');
          setInspectedStation({
            stageId: stageObj.id,
            stageTitle: stageObj.title,
            stationIndex: targetIdx,
            stationId: targetStationId,
            blessingId: stageObj.stationBlessingIds[targetIdx]
          });
        };

        const showScholarName =
          blessing?.scholarQuote?.scholar &&
          !['مستفاد', 'مأثور', 'إشارة'].some((prefix) =>
            blessing.scholarQuote.scholar.startsWith(prefix)
          );

        const handleCopyPopupBlessingText = async () => {
          if (!blessing) return;
          const formatted = `«${blessing.title}»\n${blessing.openingLine}\n\n﴿${blessing.quran.textUthmani}﴾ [سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}]\n\n— تطبيق «الحمد»`;
          try {
            await navigator.clipboard.writeText(formatted);
            setCopiedPopupBlessing(true);
            setTimeout(() => setCopiedPopupBlessing(false), 2200);
          } catch {
            // Ignore clipboard errors
          }
        };

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`تفاصيل المحطة ${toArabicNumerals(inspectedStation.stationIndex + 1)}: ${blessing?.title || ''}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
            dir="rtl"
            onClick={() => setInspectedStation(null)}
          >
            <div
              className="w-full max-w-lg md:max-w-2xl my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {blessing && (
                <GlassCard
                  padding="p-5 sm:p-6"
                  className="relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
                  borderAccent={true}
                >
                  {/* Integrated Station Context & Prev/Next Bar at Top of Card */}
                  <div className="w-full flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#2E2E4A]/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-[#AEAECB] truncate">
                        {inspectedStation.stageTitle} · المحطة {toArabicNumerals(inspectedStation.stationIndex + 1)} من {toArabicNumerals(totalStationsInInspectedStage)}
                      </span>
                      <span aria-hidden="true" className="text-[#AEAECB]/40">·</span>
                      <span
                        className={`text-xs font-bold shrink-0 ${
                          stationState === 'completed'
                            ? 'text-[#E4C368]'
                            : stationState === 'current'
                            ? 'text-[#6C63FF]'
                            : 'text-[#AEAECB]'
                        }`}
                      >
                        {stationState === 'completed'
                          ? 'مكتملة'
                          : stationState === 'current'
                          ? 'المحطة الحالية'
                          : 'محطة قادمة'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={!canBrowsePrevInModal}
                        onClick={() =>
                          canBrowsePrevInModal &&
                          handleNavigateInspected(inspectedStation.stationIndex - 1)
                        }
                        title="المحطة السابقة"
                        aria-label="المحطة السابقة"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                          canBrowsePrevInModal
                            ? 'bg-[#15152A]/80 hover:bg-[#25232E] border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] cursor-pointer'
                            : 'bg-[#15152A]/30 border-[#2E2E4A]/40 text-[#AEAECB]/30 cursor-not-allowed'
                        }`}
                      >
                        <ChevronRight size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={!canBrowseNextInModal}
                        onClick={() =>
                          canBrowseNextInModal &&
                          handleNavigateInspected(inspectedStation.stationIndex + 1)
                        }
                        title="المحطة التالية"
                        aria-label="المحطة التالية"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                          canBrowseNextInModal
                            ? 'bg-[#15152A]/80 hover:bg-[#25232E] border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] cursor-pointer'
                            : 'bg-[#15152A]/30 border-[#2E2E4A]/40 text-[#AEAECB]/30 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectedStation(null)}
                        aria-label="إغلاق نافذة تفاصيل المحطة"
                        className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Top Bar of Blessing Card: Category Pill on Right + Copy & Share Actions on Left (Matches HomeScreen) */}
                  <div className="w-full flex items-center justify-between mb-3">
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-semibold border shadow-sm"
                      style={{
                        borderColor: 'var(--accent-stroke)',
                        color: 'var(--accent-text)',
                        backgroundColor: 'var(--bg-raised)'
                      }}
                    >
                      {blessing.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyPopupBlessingText}
                        className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                        title="نسخ نص النعمة"
                        aria-label="نسخ نص النعمة"
                      >
                        {copiedPopupBlessing ? (
                          <Check size={14} className="text-[#E4C368]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPopupShareModalData({ open: true, type: 'ayah' })}
                        className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                        title="مشاركة النعمة"
                        aria-label="مشاركة النعمة"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Blessing Title */}
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5] tracking-tight mb-2 leading-[1.4]">
                    {blessing.title}
                  </h2>

                  {/* Opening Line */}
                  <p className="text-xs sm:text-sm text-[#C7C4D8] leading-[1.8] max-w-md mx-auto mb-4">
                    {blessing.openingLine}
                  </p>

                  {/* Sacred Quran Ayah Block */}
                  <div
                    className="w-full rounded-2xl p-4 sm:p-5 mb-4 border"
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      borderColor: 'var(--ayah-border)'
                    }}
                  >
                    <p
                      className="font-quran ayah-text text-lg sm:text-xl leading-[2.0] text-center"
                      style={{ color: 'var(--ayah-color)' }}
                    >
                      ﴿{blessing.quran.textUthmani}﴾
                    </p>
                    <div className="mt-2 text-center">
                      <span className="text-xs text-[#AEAECB]">
                        سورة {blessing.quran.surahName} : {toArabicNumerals(blessing.quran.ayahNumber)}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible «تدبّر النعمة» (Tadabbur section with small arrow, matching HomeScreen) */}
                  <div className="w-full border-t border-[#2E2E4A]/80 pt-2.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowPopupTadabbur(!showPopupTadabbur)}
                      className="w-full flex items-center justify-between py-2 text-sm sm:text-base font-bold text-[#EDEDF5] hover:text-[#E4C368] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#C8A951]" />
                        <span>تدبّر النعمة</span>
                      </div>
                      {showPopupTadabbur ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showPopupTadabbur && (
                      <div className="mt-3 space-y-4 text-right animate-fade-in bg-black/20 p-4 sm:p-5 rounded-2xl border border-[#2E2E4A]/60">
                        {/* Hadith */}
                        {blessing.hadith && blessing.hadith.text && (
                          <div className="space-y-1.5">
                            <span className="text-xs sm:text-sm font-bold text-[#C8A951] block">الحديث الشريف:</span>
                            <p className="font-serif text-base sm:text-lg text-[#EDEDF5] leading-[1.85]">
                              «{blessing.hadith.text}»
                            </p>
                            <span className="text-xs text-[#AEAECB] block">
                              {blessing.hadith.source} {blessing.hadith.grade ? `(${blessing.hadith.grade})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Tadabbur Text */}
                        {blessing.tadabbur && (
                          <div className="space-y-1.5 border-t border-[#2E2E4A]/50 pt-3">
                            <span className="text-xs sm:text-sm font-bold text-[#C8A951] block">وقفات في أثر النعمة:</span>
                            <p className="text-sm sm:text-base text-[#C7C4D8] leading-[1.85]">
                              {blessing.tadabbur}
                            </p>
                          </div>
                        )}

                        {/* Scholar Quote */}
                        {blessing.scholarQuote && blessing.scholarQuote.text && (
                          <div className="space-y-1.5 border-t border-[#2E2E4A]/50 pt-3">
                            <p className="font-serif text-sm sm:text-base text-[#C7C4D8] italic leading-[1.85]">
                              "{blessing.scholarQuote.text}"
                            </p>
                            {showScholarName && (
                              <span className="text-xs font-medium text-[#C8A951] block">
                                — {blessing.scholarQuote.scholar}{' '}
                                {blessing.scholarQuote.work ? `(${blessing.scholarQuote.work})` : ''}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Share Tadabbur Button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setPopupShareModalData({ open: true, type: 'tadabbur' })}
                            className="h-8 px-3 rounded-xl bg-[#15152A]/90 hover:bg-[#25232E] border border-[#2E2E4A] hover:border-[#E4C368]/50 text-[#E4C368] flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                            title="مشاركة التدبّر"
                            aria-label="مشاركة"
                          >
                            <Share2 size={13} />
                            <span>مشاركة</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Saved Local Journal (for completed stations) */}
                  {savedJournal && (
                    <div className="w-full p-3.5 mb-4 rounded-2xl bg-[#15152A] border border-[#6C63FF]/35 space-y-1 text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#C7C4D8]">
                        <BookOpen size={13} className="text-[#6C63FF]" />
                        <span>تدوينتك المحفوظة على جهازك</span>
                      </div>
                      <p className="text-xs text-[#EDEDF5] leading-relaxed">
                        «{savedJournal}»
                      </p>
                    </div>
                  )}

                  {/* Primary CTA Button: «ابدأ التدبر» */}
                  {stationState === 'completed' ? (
                    <div className="w-full flex flex-col items-center gap-1.5">
                      <div className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] text-[#E4C368] font-semibold text-sm sm:text-base">
                        <CheckCircle2 size={18} className="text-[#E4C368]" />
                        <span>حمدتَ اللهَ في هذه المحطة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const target = inspectedStation;
                          setInspectedStation(null);
                          setActiveSession(target);
                        }}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#AEAECB] hover:text-[#EDEDF5] py-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>ابدأ التدبر من جديد</span>
                      </button>
                    </div>
                  ) : stationState === 'current' ? (
                    <div className="w-full space-y-2.5">
                      {dailyPaceReached && !isInspectBlockedByFree && (
                        <div className="p-2.5 rounded-xl bg-[#15152A]/90 border border-[#2E2E4A] text-xs text-[#C7C4D8] leading-relaxed text-center">
                          أتممت محطة اليوم، يمكنك أخذ قسط من السكينة للغد أو بدء التدبر في هذه المحطة الآن بهدوء.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const target = inspectedStation;
                          setInspectedStation(null);
                          setActiveSession(target);
                        }}
                        className="w-full py-3.5 px-8 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-[#6C63FF]/25 transition-all duration-200 cursor-pointer"
                      >
                        ابدأ التدبر
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-2.5">
                      <div className="p-3 rounded-2xl bg-[#15152A]/90 border border-dashed border-[#2E2E4A] text-xs text-[#AEAECB] leading-relaxed text-center">
                        هذه محطة قادمة في المسار. تُفتح المحطات بالتدريج وبالترتيب بعد إتمام المحطات السابقة حفاظاً على سكينة الرحلة.
                      </div>
                      {!premiumStatus && inspectedStation.stationIndex >= FREE_STATION_LIMIT ? (
                        <button
                          type="button"
                          onClick={() => {
                            const targetTitle = blessing?.shortTitle || blessing?.title;
                            setInspectedStation(null);
                            openPaywall('free_limit_reached', targetTitle);
                          }}
                          className="w-full py-3.5 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white text-sm sm:text-base font-bold transition-colors cursor-pointer"
                        >
                          متاح في رحلتي الخاصة
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setInspectedStation({
                              stageId: currentPointer.stage.id,
                              stageTitle: currentPointer.stage.title,
                              stationIndex: currentPointer.stationIndex,
                              stationId: currentPointer.stationId,
                              blessingId: currentPointer.blessingId
                            });
                          }}
                          className="w-full py-3.5 px-6 rounded-2xl bg-[#232342] hover:bg-[#2C2C52] border border-[#6C63FF]/40 text-[#EDEDF5] text-sm sm:text-base font-bold transition-colors cursor-pointer"
                        >
                          الانتقال إلى المحطة الحالية
                        </button>
                      )}
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Share Modal for the inspected station blessing */}
              {blessing && popupShareModalData.open && (
                <ShareCardModal
                  blessing={blessing}
                  type={popupShareModalData.type}
                  onClose={() => setPopupShareModalData({ open: false, type: 'ayah' })}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Respectful Paywall Screen */}
      {showPaywall && (
        <PremiumPaywallScreen
          triggerReason={paywallContext.reason}
          completedFreeCount={Math.min(FREE_STATION_LIMIT, totalCompletedCount)}
          freeStationLimit={FREE_STATION_LIMIT}
          targetStationTitle={paywallContext.targetStationTitle}
          onClose={() => setShowPaywall(false)}
          onUnlocked={() => {
            setPremiumStatus(true);
            if (!hasCompletedJourneyOnboarding()) {
              setShowOnboarding(true);
            }
          }}
        />
      )}
    </div>
  );
};

export default JourneyPathScreen;
