/*
 * Design: Dino Nest Naturalism
 * - PIN entry dialog with 4-digit numeric input
 * - Forest green accent buttons
 * - Lockout after 5 failed attempts
 */
import { useState, useEffect, useCallback } from "react";
import { useApp } from "./AppContext";
import { PIN_MAX_ATTEMPTS, PIN_LOCKOUT_SECONDS } from "./constants";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinDialog({ isOpen, onClose, onSuccess }: PinDialogProps) {
  const { verifyPin } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutEnd) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutEnd(null);
          setLockoutRemaining(0);
          setAttempts(0);
          setError("");
        } else {
          setLockoutRemaining(remaining);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [lockoutEnd]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (lockoutEnd) return;
      if (pin.length >= 4) return;

      const newPin = pin + digit;
      setPin(newPin);
      setError("");

      if (newPin.length === 4) {
        setTimeout(() => {
          if (verifyPin(newPin)) {
            setAttempts(0);
            onSuccess();
            setPin("");
          } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= PIN_MAX_ATTEMPTS) {
              setLockoutEnd(Date.now() + PIN_LOCKOUT_SECONDS * 1000);
              setLockoutRemaining(PIN_LOCKOUT_SECONDS);
              setError(`${PIN_LOCKOUT_SECONDS}초 동안 잠금됩니다`);
            } else {
              setError(`PIN이 틀렸습니다 (${newAttempts}/${PIN_MAX_ATTEMPTS})`);
            }
            setPin("");
          }
        }, 150);
      }
    },
    [pin, attempts, lockoutEnd, verifyPin, onSuccess]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-[320px] shadow-2xl"
        style={{ background: "#FFF8E7", border: "3px solid #A0522D" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="font-display text-xl text-center mb-4"
          style={{ color: "#4A7C59" }}
        >
          교사용 설정
        </h3>
        <p className="text-center text-sm mb-4" style={{ color: "#8B7355" }}>
          PIN 4자리를 입력하세요
        </p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full transition-all duration-150"
              style={{
                background: i < pin.length ? "#4A7C59" : "#D4C4A8",
                transform: i < pin.length ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-center text-sm mb-3" style={{ color: "#C0392B" }}>
            {error}
            {lockoutRemaining > 0 && ` (${lockoutRemaining}초)`}
          </p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map(
            (key) => {
              if (key === "") return <div key="empty" />;
              return (
                <button
                  key={key}
                  onClick={() =>
                    key === "←" ? handleDelete() : handleDigit(key)
                  }
                  disabled={!!lockoutEnd && key !== "←"}
                  className="h-14 rounded-xl font-display text-xl transition-all duration-100 active:scale-95 disabled:opacity-40"
                  style={{
                    background: key === "←" ? "#E8D5A8" : "#F5E6C8",
                    color: "#5D4037",
                    border: "1px solid #C4A882",
                  }}
                >
                  {key}
                </button>
              );
            }
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ color: "#A09080" }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
