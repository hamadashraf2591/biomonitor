import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],   // 👈 YEH LINE React ki 2 copies ka masla khatam karti hai
  },
  optimizeDeps: {
    include: ['recharts'],            // 👈 Recharts ko pehle se bundle karta hai
  },
})