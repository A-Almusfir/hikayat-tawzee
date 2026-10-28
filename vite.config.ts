/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base نسبي حتى يعمل الموقع تحت أي مسار في GitHub Pages (مثل /اسم-المستودع/)
// والتوجيه يعتمد على الـ hash (#/...) فلا تظهر صفحة 404 عند فتح رابط مباشر.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
