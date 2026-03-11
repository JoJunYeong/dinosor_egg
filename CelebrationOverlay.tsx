/**
 * CelebrationOverlay
 * - Triggered when a student reaches their goal for a column
 * - Shows confetti burst + bouncing baby dino + congratulation message
 * - Auto-dismisses after 3 seconds
 */
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { IMAGES } from "./constants";

interface Props {
  show: boolean;
  message: string;
  onDone: () => void;
}

export default function CelebrationOverlay({ show, message, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimOut(false);

      // Fire confetti bursts
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          origin: { y: 0.6 },
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#4A7C59", "#F5E6C8", "#C4A882"] });
      fire(0.2, { spread: 60, colors: ["#FFD700", "#FF6B6B", "#4ECDC4"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#4A7C59", "#8BC34A", "#CDDC39"] });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#FFD700", "#FF9800"] });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ["#E91E63", "#9C27B0", "#3F51B5"] });

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        setAnimOut(true);
        setTimeout(() => {
          setVisible(false);
          onDone();
        }, 400);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        animation: animOut ? "fadeOut 0.4s ease-out forwards" : "fadeIn 0.3s ease-out forwards",
      }}
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.15)" }}
      />

      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-3 px-10 py-8 rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #4A7C59 0%, #5A9C6A 50%, #3D6B4A 100%)",
          border: "3px solid rgba(255,255,255,0.3)",
          animation: animOut
            ? "popOut 0.4s cubic-bezier(0.4,0,0.6,1) forwards"
            : "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
          minWidth: 240,
        }}
      >
        {/* Baby dino bouncing */}
        <img
          src={IMAGES.BABY_DINO}
          alt="아기 공룡"
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            animation: "dinoBounce 0.6s ease-in-out infinite alternate",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        />

        {/* Stars row */}
        <div style={{ fontSize: 24, letterSpacing: 4 }}>⭐⭐⭐</div>

        {/* Message */}
        <p
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: "clamp(18px, 4vw, 26px)",
            color: "#FFF8E7",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            lineHeight: 1.3,
          }}
        >
          {message}
        </p>

        {/* Sub message */}
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 14,
            color: "rgba(255,248,231,0.8)",
            textAlign: "center",
          }}
        >
          목표를 달성했어요! 🎉
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes popIn {
          from { transform: scale(0.3) rotate(-5deg); opacity: 0 }
          to { transform: scale(1) rotate(0deg); opacity: 1 }
        }
        @keyframes popOut {
          from { transform: scale(1) rotate(0deg); opacity: 1 }
          to { transform: scale(0.5) rotate(5deg); opacity: 0 }
        }
        @keyframes dinoBounce {
          from { transform: translateY(0) rotate(-5deg) scale(1) }
          to { transform: translateY(-12px) rotate(5deg) scale(1.05) }
        }
      `}</style>
    </div>
  );
}
