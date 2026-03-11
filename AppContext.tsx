import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  AppState,
  StudentData,
  GRID_COLS,
  GRID_ROWS,
  createNewStudent,
} from "./constants";
import { loadAppState, saveAppState, updateStudent } from "./storage";
import { playDingSound, playCompleteSound } from "./sound";

interface AppContextType {
  state: AppState;
  currentStudent: StudentData | null;
  addStudent: (name: string) => void;
  removeStudent: (id: string) => void;
  renameStudent: (id: string, name: string) => void;
  selectStudent: (id: string) => void;
  goToStudentSelect: () => void;
  selectColumn: (col: number) => void;
  toggleEgg: (col: number, row: number) => void;
  fillNextEgg: () => { col: number; row: number } | null;
  getFilledCount: (col: number) => number;
  setDate: (col: number, date: string) => void;
  setGoal: (col: number, goal: number) => void;
  toggleSound: () => void;
  resetColumn: (col: number) => void;
  verifyPin: (pin: string) => boolean;
  changePin: (newPin: string) => void;
  showToast: string | null;
  setShowToast: (msg: string | null) => void;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [showToast, setShowToast] = useState<string | null>(null);
  const stateRef = useRef(state);

  // Persist to localStorage on every state change
  useEffect(() => {
    stateRef.current = state;
    saveAppState(state);
  }, [state]);

  const currentStudent =
    state.students.find((s) => s.id === state.currentStudentId) || null;

  const addStudent = useCallback((name: string) => {
    const newStudent = createNewStudent(name);
    setState((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      currentStudentId: prev.currentStudentId === id ? null : prev.currentStudentId,
    }));
  }, []);

  const renameStudent = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => s.id === id ? { ...s, name } : s),
    }));
  }, []);

  const selectStudent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, currentStudentId: id }));
  }, []);

  const goToStudentSelect = useCallback(() => {
    setState((prev) => ({ ...prev, currentStudentId: null }));
  }, []);

  const selectColumn = useCallback((col: number) => {
    setState((prev) => ({ ...prev, selectedCol: col }));
  }, []);

  const toggleEgg = useCallback((col: number, row: number) => {
    setState((prev) => {
      const student = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!student) return prev;
      const newEggs = student.eggs.map((c, ci) =>
        ci === col ? c.map((r, ri) => (ri === row ? !r : r)) : [...c]
      );
      const nowFilled = !student.eggs[col][row];
      if (nowFilled && student.soundEnabled) playDingSound();
      const updated = { ...student, eggs: newEggs };
      return { ...prev, students: updateStudent(prev.students, updated), selectedCol: col };
    });
  }, []);

  const fillNextEgg = useCallback((): { col: number; row: number } | null => {
    const s = stateRef.current;
    const student = s.students.find((st) => st.id === s.currentStudentId);
    if (!student || s.selectedCol === null) return null;
    const col = s.selectedCol;
    const colEggs = student.eggs[col];
    const filledCount = colEggs.filter(Boolean).length;
    if (filledCount >= GRID_ROWS) {
      setShowToast("오늘은 끝!");
      setTimeout(() => setShowToast(null), 2000);
      return null;
    }
    let targetRow = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      if (!colEggs[r]) { targetRow = r; break; }
    }
    if (targetRow === -1) return null;

    setState((prev) => {
      const st = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!st) return prev;
      const newEggs = st.eggs.map((c, ci) =>
        ci === col ? c.map((r, ri) => (ri === targetRow ? true : r)) : [...c]
      );
      if (st.soundEnabled) {
        const newFilledCount = newEggs[col].filter(Boolean).length;
        if (newFilledCount >= GRID_ROWS) playCompleteSound();
        else playDingSound();
      }
      const newFilledCount = newEggs[col].filter(Boolean).length;
      if (newFilledCount >= GRID_ROWS) {
        setTimeout(() => { setShowToast("오늘은 끝!"); setTimeout(() => setShowToast(null), 2000); }, 300);
      }
      const updated = { ...st, eggs: newEggs };
      return { ...prev, students: updateStudent(prev.students, updated) };
    });
    return { col, row: targetRow };
  }, []);

  const getFilledCount = useCallback(
    (col: number): number => {
      if (!currentStudent) return 0;
      return currentStudent.eggs[col]?.filter(Boolean).length || 0;
    },
    [currentStudent]
  );

  const setDate = useCallback((col: number, date: string) => {
    setState((prev) => {
      const student = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!student) return prev;
      const newDates = [...student.dates];
      newDates[col] = date;
      const updated = { ...student, dates: newDates };
      return { ...prev, students: updateStudent(prev.students, updated) };
    });
  }, []);

  const setGoal = useCallback((col: number, goal: number) => {
    setState((prev) => {
      const student = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!student) return prev;
      const newGoals = [...student.goals];
      newGoals[col] = goal;
      const updated = { ...student, goals: newGoals };
      return { ...prev, students: updateStudent(prev.students, updated) };
    });
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => {
      const student = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!student) return prev;
      const updated = { ...student, soundEnabled: !student.soundEnabled };
      return { ...prev, students: updateStudent(prev.students, updated) };
    });
  }, []);

  const resetColumn = useCallback((col: number) => {
    setState((prev) => {
      const student = prev.students.find((s) => s.id === prev.currentStudentId);
      if (!student) return prev;
      const newEggs = student.eggs.map((c, ci) =>
        ci === col ? Array.from({ length: GRID_ROWS }, () => false) : [...c]
      );
      const updated = { ...student, eggs: newEggs };
      return { ...prev, students: updateStudent(prev.students, updated) };
    });
  }, []);

  const verifyPin = useCallback(
    (pin: string): boolean => pin === state.pin,
    [state.pin]
  );

  const changePin = useCallback((newPin: string) => {
    setState((prev) => ({ ...prev, pin: newPin }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        currentStudent,
        addStudent,
        removeStudent,
        renameStudent,
        selectStudent,
        goToStudentSelect,
        selectColumn,
        toggleEgg,
        fillNextEgg,
        getFilledCount,
        setDate,
        setGoal,
        toggleSound,
        resetColumn,
        verifyPin,
        changePin,
        showToast,
        setShowToast,
        isSyncing: false,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
