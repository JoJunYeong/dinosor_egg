/*
 * Design: Dino Nest Naturalism
 * - Teacher settings panel with tabs
 * - Student management, date input, goal setting, sound, PIN change
 * - Auto-lock after 120 seconds of inactivity
 * - Responsive: works on mobile and tablet
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "./AppContext";
import {
  MAX_STUDENTS,
  MAX_NAME_LENGTH,
  GRID_COLS,
  GRID_ROWS,
  AUTO_LOCK_SECONDS,
} from "./constants";

interface TeacherSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "students" | "dates" | "goals" | "sound" | "pin" | "reset";

export default function TeacherSettings({ isOpen, onClose }: TeacherSettingsProps) {
  const {
    state,
    currentStudent,
    addStudent,
    removeStudent,
    renameStudent,
    selectStudent,
    goToStudentSelect,
    setDate,
    setGoal,
    toggleSound,
    resetColumn,
    verifyPin,
    changePin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [newStudentName, setNewStudentName] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [dateInputs, setDateInputs] = useState<Record<number, string>>({});
  const [goalInputs, setGoalInputs] = useState<Record<number, string>>({});
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    lastActivityRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > AUTO_LOCK_SECONDS * 1000) {
        onClose();
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, onClose]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      const dates: Record<number, string> = {};
      const goals: Record<number, string> = {};
      for (let i = 0; i < GRID_COLS; i++) {
        dates[i] = currentStudent.dates[i] || "";
        goals[i] = currentStudent.goals[i]?.toString() || "0";
      }
      setDateInputs(dates);
      setGoalInputs(goals);
    }
  }, [currentStudent?.id, isOpen]);

  const handleAddStudent = useCallback(() => {
    const name = newStudentName.trim();
    if (!name || state.students.length >= MAX_STUDENTS) return;
    addStudent(name);
    setNewStudentName("");
    resetTimer();
  }, [newStudentName, state.students.length, addStudent, resetTimer]);

  const handleRenameStudent = useCallback(
    (id: string) => {
      const name = editingName.trim();
      if (!name) return;
      renameStudent(id, name);
      setEditingStudentId(null);
      setEditingName("");
      resetTimer();
    },
    [editingName, renameStudent, resetTimer]
  );

  const handleDeleteStudent = useCallback(
    (id: string, name: string) => {
      if (window.confirm(`"${name}" 학생을 삭제하시겠습니까?`)) {
        removeStudent(id);
        resetTimer();
      }
    },
    [removeStudent, resetTimer]
  );

  const handleDateSave = useCallback(
    (col: number) => {
      setDate(col, dateInputs[col] || "");
      resetTimer();
    },
    [dateInputs, setDate, resetTimer]
  );

  const handleGoalSave = useCallback(
    (col: number) => {
      const val = parseInt(goalInputs[col] || "0", 10);
      const clamped = Math.max(0, Math.min(GRID_ROWS, isNaN(val) ? 0 : val));
      setGoal(col, clamped);
      resetTimer();
    },
    [goalInputs, setGoal, resetTimer]
  );

  const handlePinChange = useCallback(() => {
    setPinError("");
    setPinSuccess("");
    if (!verifyPin(currentPinInput)) {
      setPinError("현재 PIN이 틀렸습니다.");
      return;
    }
    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinError("새 PIN은 숫자 4자리여야 합니다.");
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinError("새 PIN이 일치하지 않습니다.");
      return;
    }
    changePin(newPinInput);
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
    setPinSuccess("PIN이 변경되었습니다.");
    resetTimer();
  }, [currentPinInput, newPinInput, confirmPinInput, verifyPin, changePin, resetTimer]);

  const handleResetColumn = useCallback(() => {
    if (state.selectedCol === null) return;
    resetColumn(state.selectedCol);
    setConfirmReset(false);
    resetTimer();
  }, [state.selectedCol, resetColumn, resetTimer]);

  if (!isOpen) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "students", label: "학생 관리" },
    { key: "dates", label: "날짜 입력" },
    { key: "goals", label: "목표 설정" },
    { key: "sound", label: "효과음" },
    { key: "reset", label: "리셋" },
    { key: "pin", label: "PIN 변경" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      onMouseMove={resetTimer}
      onTouchStart={resetTimer}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden"
        style={{ background: "#FFF8E7", border: "3px solid #A0522D" }}
        onClick={(e) => { e.stopPropagation(); resetTimer(); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#4A7C59", color: "#FFF8E7" }}>
          <h3 className="font-display text-base md:text-lg">교사용 설정</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 px-2 py-1.5" style={{ background: "#F5E6C8", borderBottom: "1px solid #D4C4A8" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); resetTimer(); }}
              className="px-2.5 py-1 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.key ? "#4A7C59" : "transparent",
                color: activeTab === tab.key ? "#FFF8E7" : "#8B7355",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4" style={{ minHeight: 0 }}>
          {activeTab === "students" && (
            <div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                  placeholder="학생 이름 입력"
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037" }}
                />
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudentName.trim() || state.students.length >= MAX_STUDENTS}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ background: "#4A7C59", color: "#FFF8E7" }}
                >
                  추가
                </button>
              </div>
              <p className="text-xs mb-2" style={{ color: "#A09080" }}>{state.students.length}/{MAX_STUDENTS}명</p>

              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
                {state.students.map((student) => (
                  <div key={student.id} className="flex items-center gap-1.5 p-2.5 rounded-lg" style={{ background: student.id === state.currentStudentId ? "rgba(74, 124, 89, 0.1)" : "#FFFDF5", border: "1px solid #D4C4A8" }}>
                    {editingStudentId === student.id ? (
                      <>
                        <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value.slice(0, MAX_NAME_LENGTH))} onKeyDown={(e) => e.key === "Enter" && handleRenameStudent(student.id)} className="flex-1 px-2 py-1 rounded text-sm" style={{ border: "1px solid #C4A882", background: "#FFF" }} autoFocus />
                        <button onClick={() => handleRenameStudent(student.id)} className="text-xs px-2 py-1 rounded" style={{ background: "#4A7C59", color: "#FFF" }}>저장</button>
                        <button onClick={() => setEditingStudentId(null)} className="text-xs px-2 py-1 rounded" style={{ color: "#A09080" }}>취소</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium truncate" style={{ color: "#5D4037" }}>
                          {student.name}
                          {student.id === state.currentStudentId && <span className="ml-1 text-xs" style={{ color: "#4A7C59" }}>(현재)</span>}
                        </span>
                        <button onClick={() => selectStudent(student.id)} className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: "#4A7C59", color: "#FFF" }}>선택</button>
                        <button onClick={() => { setEditingStudentId(student.id); setEditingName(student.name); }} className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: "#E8D5A8", color: "#5D4037" }}>수정</button>
                        <button onClick={() => handleDeleteStudent(student.id, student.name)} className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: "#E74C3C", color: "#FFF" }}>삭제</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => { goToStudentSelect(); onClose(); }} className="w-full mt-3 py-2 rounded-lg text-sm font-medium" style={{ background: "#E8D5A8", color: "#5D4037", border: "1px solid #C4A882" }}>
                학생 선택 화면으로 이동
              </button>
            </div>
          )}

          {activeTab === "dates" && (
            <div>
              <p className="text-sm mb-3" style={{ color: "#8B7355" }}>각 열의 날짜를 M/D 형식으로 입력하세요 (예: 2/24)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[55vh] overflow-y-auto">
                {Array.from({ length: GRID_COLS }, (_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-xs w-7 text-right flex-shrink-0" style={{ color: "#A09080" }}>{i + 1}</span>
                    <input
                      type="text"
                      value={dateInputs[i] || ""}
                      onChange={(e) => setDateInputs((prev) => ({ ...prev, [i]: e.target.value.slice(0, 5) }))}
                      onBlur={() => handleDateSave(i)}
                      placeholder="M/D"
                      className="flex-1 px-2 py-1 rounded text-sm"
                      style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037", maxWidth: "70px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "goals" && (
            <div>
              <p className="text-sm mb-3" style={{ color: "#8B7355" }}>각 열의 목표 개수를 설정하세요 (0~29)</p>
              {!currentStudent ? (
                <p className="text-sm" style={{ color: "#A09080" }}>학생을 먼저 선택해주세요.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[55vh] overflow-y-auto">
                  {Array.from({ length: GRID_COLS }, (_, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-xs w-10 text-right flex-shrink-0" style={{ color: "#A09080" }}>{currentStudent.dates[i] || `${i + 1}열`}</span>
                      <input
                        type="number"
                        min="0"
                        max="29"
                        value={goalInputs[i] || "0"}
                        onChange={(e) => setGoalInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                        onBlur={() => handleGoalSave(i)}
                        className="w-14 px-2 py-1 rounded text-sm text-center"
                        style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sound" && (
            <div>
              <p className="text-sm mb-4" style={{ color: "#8B7355" }}>알이 채워질 때 효과음을 재생합니다.</p>
              {!currentStudent ? (
                <p className="text-sm" style={{ color: "#A09080" }}>학생을 먼저 선택해주세요.</p>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: "#5D4037" }}>효과음</span>
                  <button onClick={() => { toggleSound(); resetTimer(); }} className="px-6 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: currentStudent.soundEnabled ? "#4A7C59" : "#D4C4A8", color: currentStudent.soundEnabled ? "#FFF8E7" : "#8B7355" }}>
                    {currentStudent.soundEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "reset" && (
            <div>
              <p className="text-sm mb-4" style={{ color: "#8B7355" }}>선택한 날짜 열의 알을 모두 초기화합니다.</p>
              {state.selectedCol === null ? (
                <p className="text-sm" style={{ color: "#A09080" }}>먼저 메인 화면에서 날짜 열을 선택해주세요.</p>
              ) : (
                <div>
                  <p className="text-sm mb-3" style={{ color: "#5D4037" }}>
                    선택된 열: {state.selectedCol + 1}열
                    {currentStudent?.dates[state.selectedCol] && ` (${currentStudent.dates[state.selectedCol]})`}
                  </p>
                  {!confirmReset ? (
                    <button onClick={() => setConfirmReset(true)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#E74C3C", color: "#FFF" }}>이 열 초기화</button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium" style={{ color: "#E74C3C" }}>정말 지우시겠습니까?</p>
                      <button onClick={handleResetColumn} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#E74C3C", color: "#FFF" }}>예</button>
                      <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#D4C4A8", color: "#5D4037" }}>아니오</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "pin" && (
            <div className="max-w-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8B7355" }}>현재 PIN</label>
                  <input type="password" maxLength={4} value={currentPinInput} onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-2 rounded-lg text-sm text-center tracking-widest" style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037" }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8B7355" }}>새 PIN</label>
                  <input type="password" maxLength={4} value={newPinInput} onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-2 rounded-lg text-sm text-center tracking-widest" style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037" }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8B7355" }}>새 PIN 확인</label>
                  <input type="password" maxLength={4} value={confirmPinInput} onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-2 rounded-lg text-sm text-center tracking-widest" style={{ border: "1px solid #C4A882", background: "#FFFDF5", color: "#5D4037" }} />
                </div>
                {pinError && <p className="text-sm" style={{ color: "#E74C3C" }}>{pinError}</p>}
                {pinSuccess && <p className="text-sm" style={{ color: "#4A7C59" }}>{pinSuccess}</p>}
                <button onClick={handlePinChange} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "#4A7C59", color: "#FFF8E7" }}>PIN 변경</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
