/*
 * Design: Dino Nest Naturalism
 * - Main page: student select or egg grid
 * - Hidden teacher settings (long press top-right corner)
 * - Warm sand-beige background
 * - Responsive for iPad landscape and mobile
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useApp } from "./AppContext";
import StudentSelect from "./StudentSelect";
import EggGrid from "./EggGrid";
import PinDialog from "./PinDialog";
import TeacherSettings from "./TeacherSettings";
import CelebrationOverlay from "./CelebrationOverlay";
import { IMAGES, LONG_PRESS_MS } from "./constants";

export default function Home() {
  const { state, currentStudent, showToast, getFilledCount, isSyncing } = useApp();
  const [pinOpen, setPinOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // Long press detection for teacher settings
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleTeacherAreaStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setPinOpen(true);
    }, LONG_PRESS_MS);
  }, []);

  const handleTeacherAreaEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handlePinSuccess = useCallback(() => {
    setPinOpen(false);
    setSettingsOpen(true);
  }, []);

  // Get current goal info
  const selectedCol = state.selectedCol;
  const goal =
    currentStudent && selectedCol !== null
      ? currentStudent.goals[selectedCol]
      : 0;
  const filledCount =
    currentStudent && selectedCol !== null ? getFilledCount(selectedCol) : 0;

  // Track previous filledCount to detect goal achievement
  const prevFilledRef = useRef<number>(0);
  const prevGoalRef = useRef<number>(0);
  const celebrationShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentStudent || selectedCol === null) return;
    const prevFilled = prevFilledRef.current;
    const prevGoal = prevGoalRef.current;
    prevFilledRef.current = filledCount;
    prevGoalRef.current = goal;

    const celebKey = `${currentStudent.id}-${selectedCol}-${goal}`;

    // Trigger celebration when goal is just reached (not already shown)
    if (
      goal > 0 &&
      filledCount >= goal &&
      prevFilled < goal &&
      !celebrationShownRef.current.has(celebKey)
    ) {
      celebrationShownRef.current.add(celebKey);
      setTimeout(() => {
        setCelebration({
          show: true,
          message: `${currentStudent.name}! 목표 달성!`,
        });
      }, 400);
    }
  }, [filledCount, goal, currentStudent, selectedCol]);

  // Reset celebration tracking when student changes
  useEffect(() => {
    celebrationShownRef.current = new Set();
    prevFilledRef.current = 0;
    prevGoalRef.current = 0;
  }, [state.currentStudentId]);

  // Teacher area props (shared between screens)
  const teacherAreaProps = {
    onMouseDown: handleTeacherAreaStart,
    onMouseUp: handleTeacherAreaEnd,
    onMouseLeave: handleTeacherAreaEnd,
    onTouchStart: handleTeacherAreaStart,
    onTouchEnd: handleTeacherAreaEnd,
    onTouchCancel: handleTeacherAreaEnd,
  };

  // Show student select if no student selected
  if (!state.currentStudentId) {
    return (
      <div className="relative min-h-screen">
        <StudentSelect />
        <div className="fixed top-0 right-0 w-16 h-16 z-40" {...teacherAreaProps} />
        <PinDialog isOpen={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSuccess} />
        <TeacherSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #FFFDF5 50%, #F5E6C8 100%)" }}
    >
      {/* Header - compact */}
      <header className="relative px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <img src={IMAGES.BABY_DINO} alt="" className="w-7 h-7 object-contain" />
            <span className="font-display text-sm" style={{ color: "#4A7C59" }}>
              현재 학생: <strong style={{ color: "#5D4037" }}>{currentStudent?.name}</strong>
            </span>
            {/* Sync indicator */}
            {isSyncing && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#E8F5E9", color: "#4A7C59", border: "1px solid #A5D6A7" }}
              >
                저장 중…
              </span>
            )}
          </div>
          {goal > 0 && selectedCol !== null && (
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: filledCount >= goal ? "#4A7C59" : "#F5E6C8",
                color: filledCount >= goal ? "#FFF8E7" : "#5D4037",
                border: "1px solid #C4A882",
                transition: "all 0.3s",
              }}
            >
              목표: {goal}회 | 현재: {filledCount}/{goal}회
              {filledCount >= goal && " ✓"}
            </div>
          )}
        </div>

        {/* Instruction banner */}
        <div
          className="rounded-lg px-4 py-1.5 text-center"
          style={{
            background: "linear-gradient(135deg, #4A7C59 0%, #5A8C69 100%)",
            boxShadow: "0 2px 6px rgba(74, 124, 89, 0.25)",
          }}
        >
          <p className="font-display text-sm md:text-base text-white tracking-wide">
            약속을 지켜 얻은 <span className="text-yellow-200">⭕</span> 수만큼 화면을 눌러주세요.
          </p>
        </div>

        {/* Hidden teacher area (top-right) */}
        <div className="absolute top-0 right-0 w-16 h-16 z-40" {...teacherAreaProps} />
      </header>

      {/* Main grid area - fills remaining space */}
      <main className="flex-1 px-1 pb-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
        <EggGrid />
      </main>

      {/* Simple toast (for "오늘은 끝!" etc.) */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div
            className="px-8 py-4 rounded-2xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #4A7C59 0%, #5A8C69 100%)",
              color: "#FFF8E7",
              animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            }}
          >
            <p className="font-display text-2xl text-center">{showToast}</p>
            <img src={IMAGES.BABY_DINO} alt="축하" className="w-14 h-14 mx-auto mt-2" />
          </div>
        </div>
      )}

      {/* Goal achievement celebration */}
      <CelebrationOverlay
        show={celebration.show}
        message={celebration.message}
        onDone={() => setCelebration({ show: false, message: "" })}
      />

      {/* Dialogs */}
      <PinDialog isOpen={pinOpen} onClose={() => setPinOpen(false)} onSuccess={handlePinSuccess} />
      <TeacherSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
