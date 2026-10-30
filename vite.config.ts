/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base نسبي حتى يعمل الموقع تحت أي مسار في GitHub Pages (مثل /اسم-المستودع/)
// والتوجيه يعتمد على الـ hash (#/...) فلا تظهر صفحة 404 عند فتح رابط مباشر.
export default defineConfig({
  base: './',
  plugins: [react()],
  // المكتبات الثابتة في ملفات مستقلة: تبقى في ذاكرة المتصفح بين التحديثات
  build: { rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'], katex: ['katex'] } } } },
  test: { environment: 'node' },
});
