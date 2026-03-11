/*
 * Design: Dino Nest Naturalism
 * - Warm sand-beige background with forest green accents
 * - Jua font for headings, Noto Sans KR for body
 * - Rounded, organic shapes
 * - Student cards in a responsive grid (2 cols on mobile, 3 on tablet+)
 */
import { useApp } from "./AppContext";
import { IMAGES } from "./constants";

export default function StudentSelect() {
  const { state, selectStudent } = useApp();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #F5E6C8 100%)" }}
    >
      {/* Banner area */}
      <div className="w-full max-w-2xl mb-4 md:mb-6">
        <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ height: "clamp(100px, 20vw, 180px)" }}>
          <img
            src={IMAGES.BANNER}
            alt="공룡 둥지"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-white drop-shadow-lg tracking-wide">
              공룡 알 모으기
            </h1>
          </div>
        </div>
      </div>

      {/* Student selection */}
      <div className="w-full max-w-2xl">
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-4 md:p-6 border-2"
          style={{ borderColor: "#A0522D" }}
        >
          <h2
            className="font-display text-lg md:text-2xl text-center mb-4 md:mb-6"
            style={{ color: "#4A7C59" }}
          >
            학생을 선택하세요
          </h2>

          {state.students.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <img src={IMAGES.BABY_DINO} alt="아기 공룡" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 opacity-60" />
              <p className="text-sm md:text-base" style={{ color: "#8B7355" }}>
                아직 등록된 학생이 없습니다.
              </p>
              <p className="text-xs md:text-sm mt-1" style={{ color: "#A09080" }}>
                교사용 설정에서 학생을 추가해주세요.
              </p>
              <p className="text-xs mt-4" style={{ color: "#B0A090" }}>
                우측 상단을 2초 이상 길게 누르면 교사용 설정에 진입합니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-[50vh] overflow-y-auto">
              {state.students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => selectStudent(student.id)}
                  className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 100%)",
                    border: "2px solid #C4A882",
                    boxShadow: "0 2px 8px rgba(139, 107, 20, 0.15)",
                  }}
                >
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#4A7C59", color: "#FFF8E7" }}
                  >
                    <span className="font-display text-sm md:text-lg">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-display text-sm md:text-base truncate" style={{ color: "#5D4037" }}>
                    {student.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs" style={{ color: "#B0A090" }}>
        우측 상단을 길게 누르면 교사용 설정
      </p>
    </div>
  );
}
