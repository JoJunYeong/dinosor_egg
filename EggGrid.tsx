/*
 * Design: Dino Nest Naturalism
 * - CSS Grid layout for perfectly uniform cells
 * - Rows rendered as separate sub-components to avoid key issues
 * - Left: "목표점수" vertical label + row numbers
 * - Main: 26 cols × 16 rows egg cells
 * - Bottom: "목표달성?" O/X row + "날짜" row
 */
import { useApp } from "./AppContext";
import { GRID_COLS, GRID_ROWS, IMAGES } from "./constants";
import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";

const BORDER = "#8B6914";
const LABEL_BG = "#C4A882";
const CELL_BG = "#FFFDF5";
const INNER_BORDER = "#D4C4A8";

interface EggRowProps {
  rowIdx: number;
  colCount: number;
  cellW: number;
  cellH: number;
  numColW: number;
  selectedCol: number | null;
  eggs: boolean[][];
  animatingCell: string | null;
  eggSize: number;
  numFontSize: number;
  onEggClick: (col: number, row: number, e: React.MouseEvent) => void;
}

const EggRow = memo(({
  rowIdx, colCount, cellW, cellH, numColW, selectedCol, eggs,
  animatingCell, eggSize, numFontSize, onEggClick
}: EggRowProps) => {
  const label = rowIdx + 1;
  return (
    <>
      {/* Row number cell */}
      <div
        style={{
          width: numColW,
          height: cellH,
          background: LABEL_BG,
          borderRight: `2px solid ${BORDER}`,
          borderBottom: `1px solid ${INNER_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: numFontSize,
          fontWeight: 600,
          color: "#5D4037",
          fontFamily: "'Jua', sans-serif",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {label}
      </div>

      {/* Egg cells */}
      {Array.from({ length: colCount }, (_, colIdx) => {
        const isFilled = eggs[colIdx][rowIdx];
        const isSelected = selectedCol === colIdx;
        const key = `${colIdx}-${rowIdx}`;
        const isAnim = animatingCell === key;
        return (
          <div
            key={colIdx}
            data-cell="egg"
            onClick={(e) => onEggClick(colIdx, rowIdx, e)}
            style={{
              width: cellW,
              height: cellH,
              background: isSelected ? "rgba(74,124,89,0.08)" : CELL_BG,
              borderRight: `1px solid ${INNER_BORDER}`,
              borderBottom: `1px solid ${INNER_BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <img
              src={isFilled ? IMAGES.EGG_FILLED : IMAGES.EGG_EMPTY}
              alt=""
              width={eggSize}
              height={eggSize}
              className={isAnim && isFilled ? "animate-egg-fill" : ""}
              style={{
                opacity: isFilled ? 1 : 0.12,
                filter: isAnim && isFilled
                  ? "brightness(1.3) drop-shadow(0 0 3px rgba(255,200,50,0.6))"
                  : "none",
                transition: "opacity 0.2s",
                pointerEvents: "none",
                display: "block",
              }}
              draggable={false}
              loading="lazy"
            />
          </div>
        );
      })}
    </>
  );
});

export default function EggGrid() {
  const { state, currentStudent, selectColumn, toggleEgg, fillNextEgg, getFilledCount } = useApp();
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cellW: 26, cellH: 26 });

  const selectedCol = state.selectedCol;

  useEffect(() => {
    const img1 = new Image(); img1.src = IMAGES.EGG_FILLED;
    const img2 = new Image(); img2.src = IMAGES.EGG_EMPTY;
  }, []);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;
      const labelW = 22; // "목표점수" vertical text col
      const numW = 26;   // row number col
      const bottomH = 58; // O/X row + date row
      const availW = W - labelW - numW - 4;
      const availH = H - bottomH - 4;
      const byW = Math.floor(availW / GRID_COLS);
      const byH = Math.floor(availH / GRID_ROWS);
      const cell = Math.max(16, Math.min(44, Math.min(byW, byH)));
      setDims({ cellW: cell, cellH: cell });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleBgClick = useCallback((e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-cell]")) return;
    const result = fillNextEgg();
    if (result) {
      setAnimatingCell(`${result.col}-${result.row}`);
      setTimeout(() => setAnimatingCell(null), 600);
    }
  }, [fillNextEgg]);

  const handleEggClick = useCallback((col: number, row: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFilled = currentStudent?.eggs[col][row];
    toggleEgg(col, row);
    if (!wasFilled) {
      setAnimatingCell(`${col}-${row}`);
      setTimeout(() => setAnimatingCell(null), 600);
    }
  }, [toggleEgg, currentStudent]);

  const handleDateClick = useCallback((col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    selectColumn(col);
  }, [selectColumn]);

  const rowIndices = useMemo(
    () => Array.from({ length: GRID_ROWS }, (_, i) => GRID_ROWS - 1 - i),
    []
  );

  if (!currentStudent) return null;

  const { cellW, cellH } = dims;
  const eggSize = Math.max(12, cellW - 6);
  const numFontSize = Math.max(8, Math.min(12, cellH * 0.42));
  const bottomRowH = Math.max(24, Math.round(cellH * 0.82));
  const labelColW = 22;
  const numColW = Math.max(20, Math.round(cellW * 0.82));
  const totalW = labelColW + numColW + cellW * GRID_COLS;

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 overflow-auto"
      onClick={handleBgClick}
      style={{ cursor: "pointer", minHeight: 0 }}
    >
      <div style={{ display: "inline-block", minWidth: totalW }}>

        {/* ── Main grid wrapper ── */}
        <div
          style={{
            border: `2px solid ${BORDER}`,
            borderBottom: "none",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {/* "목표점수" vertical label */}
          <div
            style={{
              width: labelColW,
              minWidth: labelColW,
              background: LABEL_BG,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              writingMode: "vertical-rl",
              textOrientation: "upright",
              fontSize: Math.max(10, numFontSize),
              fontWeight: 700,
              color: "#5D4037",
              letterSpacing: "3px",
              fontFamily: "'Jua', sans-serif",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            목표점수
          </div>

          {/* Grid rows */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {rowIndices.map((rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  height: cellH,
                  flexShrink: 0,
                }}
              >
                <EggRow
                  rowIdx={rowIdx}
                  colCount={GRID_COLS}
                  cellW={cellW}
                  cellH={cellH}
                  numColW={numColW}
                  selectedCol={selectedCol}
                  eggs={currentStudent.eggs}
                  animatingCell={animatingCell}
                  eggSize={eggSize}
                  numFontSize={numFontSize}
                  onEggClick={handleEggClick}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── "목표달성?" row ── */}
        <div
          style={{
            border: `2px solid ${BORDER}`,
            borderBottom: "none",
            display: "flex",
            flexDirection: "row",
            height: bottomRowH,
          }}
        >
          <div
            style={{
              width: labelColW + numColW,
              minWidth: labelColW + numColW,
              background: LABEL_BG,
              borderRight: `2px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: Math.max(8, numFontSize - 1),
              fontWeight: 700,
              color: "#5D4037",
              fontFamily: "'Jua', sans-serif",
              textAlign: "center",
              lineHeight: 1.2,
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            목표<br />달성?
          </div>
          {Array.from({ length: GRID_COLS }, (_, colIdx) => {
            const isSelected = selectedCol === colIdx;
            const goal = currentStudent.goals[colIdx] || 0;
            const filled = getFilledCount(colIdx);
            const achieved = goal > 0 && filled >= goal;
            const hasGoal = goal > 0;
            return (
              <div
                key={colIdx}
                data-cell="ox"
                onClick={(e) => { e.stopPropagation(); selectColumn(colIdx); }}
                style={{
                  width: cellW,
                  minWidth: cellW,
                  background: isSelected ? "rgba(74,124,89,0.12)" : "#F5E6C8",
                  borderRight: `1px solid ${INNER_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.max(10, numFontSize + 2),
                  fontWeight: 700,
                  color: !hasGoal ? "#C4B090" : achieved ? "#2E7D32" : "#C62828",
                  fontFamily: "'Jua', sans-serif",
                  cursor: "pointer",
                  outline: isSelected ? `2px solid #4A7C59` : "none",
                  outlineOffset: "-2px",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                {!hasGoal ? "-" : achieved ? "O" : "X"}
              </div>
            );
          })}
        </div>

        {/* ── Date row ── */}
        <div
          style={{
            border: `2px solid ${BORDER}`,
            display: "flex",
            flexDirection: "row",
            height: bottomRowH,
          }}
        >
          <div
            style={{
              width: labelColW + numColW,
              minWidth: labelColW + numColW,
              background: LABEL_BG,
              borderRight: `2px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: Math.max(8, numFontSize - 1),
              fontWeight: 700,
              color: "#5D4037",
              fontFamily: "'Jua', sans-serif",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            날짜
          </div>
          {Array.from({ length: GRID_COLS }, (_, colIdx) => {
            const isSelected = selectedCol === colIdx;
            const dateStr = currentStudent.dates[colIdx] || "";
            return (
              <div
                key={colIdx}
                data-cell="date"
                onClick={(e) => handleDateClick(colIdx, e)}
                style={{
                  width: cellW,
                  minWidth: cellW,
                  background: isSelected ? "rgba(74,124,89,0.15)" : "#F5E6C8",
                  borderRight: `1px solid ${INNER_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.max(7, numFontSize - 2),
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#2E7D32" : "#8B7355",
                  cursor: "pointer",
                  outline: isSelected ? `2px solid #4A7C59` : "none",
                  outlineOffset: "-2px",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                {dateStr || "/"}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
