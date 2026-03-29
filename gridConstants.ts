export const GRID_COLS = 29;
export const GRID_ROWS = 29;

export function createEmptyEggs(): boolean[][] {
  return Array.from({ length: GRID_COLS }, () =>
    Array.from({ length: GRID_ROWS }, () => false)
  );
}

export function createEmptyDates(): string[] {
  return Array.from({ length: GRID_COLS }, () => "");
}

export function createEmptyGoals(): number[] {
  return Array.from({ length: GRID_COLS }, () => 0);
}
