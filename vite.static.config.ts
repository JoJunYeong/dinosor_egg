import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages 정적 배포용 Vite 설정
// Repository: JoJunYeong/dinosor_egg

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-static",
    emptyOutDir: true,
  },
  base: "/dinosor_egg/",
});
