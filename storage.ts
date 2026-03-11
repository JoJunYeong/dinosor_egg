import { AppState, StudentData, DEFAULT_PIN } from "./constants";

const STORAGE_KEY = "dino-egg-tracker";

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate structure
      if (parsed && Array.isArray(parsed.students)) {
        return {
          students: parsed.students,
          currentStudentId: parsed.currentStudentId || null,
          selectedCol: parsed.selectedCol ?? null,
          pin: parsed.pin || DEFAULT_PIN,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load state:", e);
  }
  return {
    students: [],
    currentStudentId: null,
    selectedCol: null,
    pin: DEFAULT_PIN,
  };
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export function getStudentById(
  students: StudentData[],
  id: string
): StudentData | undefined {
  return students.find((s) => s.id === id);
}

export function updateStudent(
  students: StudentData[],
  updated: StudentData
): StudentData[] {
  return students.map((s) => (s.id === updated.id ? updated : s));
}
